@AGENTS.md

# CLAUDE.md

Contexto del proyecto para Claude Code. Léelo completo antes de generar código: recoge decisiones ya tomadas y el razonamiento detrás de ellas, para no revertirlas sin motivo.

## Qué es este proyecto

Sistema de inventario + tienda para un negocio pequeño que vende productos farmacéuticos/estéticos (tirzepatida, ácidos, y similares). El negocio apenas está empezando y no tiene una carga regulatoria compleja (no se modela receta médica, INVIMA, lotes ni cadena de frío) — el objetivo es digitalizar y centralizar transacciones y trazabilidad, no construir un sistema para una multinacional.

**Principio guía de todo el proyecto: simplicidad deliberada.** Ante cualquier decisión de diseño, preferir la opción más simple que cumpla el requisito real, no la más "correcta" en abstracto. Si en algún punto de la implementación surge una ambigüedad de este tipo, seguir este mismo criterio en vez de agregar complejidad especulativa.

## Stack tecnológico

- **Framework**: Next.js (App Router) + TypeScript
- **Estilos**: Tailwind CSS v4 (config vía `@theme` en CSS, no `tailwind.config.js`)
- **Backend/DB**: Supabase (Postgres + Auth + Storage) — un solo servicio administrado, sin infraestructura propia que mantener
- **Estado de cliente**: Zustand (con middleware `persist` para el carrito anónimo)
- **Validación**: Zod, usado tanto en formularios (`react-hook-form` + `zodResolver`) como revalidado dentro de cada Server Action
- **Gestor de paquetes**: pnpm
- **Testing**: Vitest (unitarias, para `domain/` y `services/`), Playwright (E2E)

Decisión explícita: todo el proyecto se despliega como una sola app Next.js en Vercel. No se introduce un backend separado (ej. Flask) aunque el desarrollador tiene experiencia en Python — se prioriza un único stack y un único despliegue.

## Diseño de interfaz

Estilo **Soft Glassmorphism**, paleta de colores **crema**. Fondos con gradientes suaves crema/beige (no blanco puro, para que `backdrop-filter: blur()` se note). Cuidado con el contraste: datos críticos (stock bajo, vencimiento próximo, estado de una solicitud) deben mostrarse con color sólido, no dentro de paneles glass de baja opacidad, para no sacrificar legibilidad.

## Arquitectura: clean architecture ligera

Sin puertos/adaptadores completos — solo 3 capas, para no sobre-diseñar:

```
src/
  app/                 # rutas, Server Components, Server Actions (capa de entrada)
  domain/              # entidades y reglas de negocio puras (tipos + funciones, sin Supabase)
  services/            # casos de uso: registrarEntrada(), calcularStockActual(), aprobarSolicitud()
  infrastructure/
    supabase/          # cliente Supabase + repositorios (queries reales)
  store/               # Zustand stores (carrito, filtros de UI)
  components/          # UI (glassmorphism)
tests/
  unit/                # Vitest
  e2e/                 # Playwright
```

Regla dura: `domain/` y `services/` no importan nada de Supabase directamente. Reciben datos ya resueltos o un repositorio inyectado, para poder probar la lógica de negocio sin base de datos real.

## Roles

Dos roles únicamente, por ahora: `administrador` y `cliente`.

- **Administrador**: gestiona el CRUD de productos, revisa y aprueba/rechaza solicitudes, registra movimientos de stock manuales, imprime la etiqueta de la solicitud.
- **Cliente**: navega el catálogo, arma su carrito, envía solicitudes de compra, sube evidencia de pago.

No hay más roles ni permisos diferenciados en el MVP.

## Modelo de datos (Supabase / Postgres)

### `profiles`

Extiende `auth.users` 1 a 1. Campos: `id`, `username` (único), `email` (único), `telefono`, `direccion`, `rol` (enum `administrador` | `cliente`), `created_at`.

Login: se admite usuario **o** correo + contraseña. Supabase Auth solo autentica por correo — si el input no tiene forma de correo, se resuelve primero contra `profiles.username` para obtener el email antes de llamar `signInWithPassword`.

### `productos`

Campos: `id`, `nombre`, `descripcion`, `presentacion`, `grupo` (texto, agrupa visualmente presentaciones del mismo producto — ver decisión abajo), `precio`, `stock`, `disponible` (boolean), `activo` (boolean, soft delete), `fecha_vencimiento`, `imagen_url`, `created_at`, `updated_at`.

**Decisión sobre presentaciones**: no existe una tabla de variantes. Cada presentación de un mismo producto (ej. Tirzepatida 5mg / 10mg / 15mg) es una fila independiente en `productos`, con su propio stock y precio. El campo `grupo` (ej. `'tirzepatida'`) permite mostrarlas juntas en la página de producto, donde "elegir presentación" es navegar entre productos hermanos del mismo grupo.

**`disponible` vs `activo`**: son cosas distintas. `disponible` es un toggle de negocio ("hoy no se vende este producto" pero sigue existiendo). `activo` es soft-delete real (el admin lo dio de baja del catálogo). No hay política RLS de `delete` sobre esta tabla — el borrado real está bloqueado a nivel de base de datos.

**El campo `stock` nunca se actualiza directamente desde el código de la aplicación** — ver "Funciones de base de datos y triggers" más abajo. Siempre se actualiza como efecto de un `insert` en `movimientos_stock`.

### `movimientos_stock`

Campos: `id`, `producto_id`, `tipo` (enum `entrada` | `salida`), `cantidad`, `motivo`, `usuario_id`, `solicitud_id` (nullable — se llena solo cuando el movimiento viene de una solicitud aprobada), `created_at`.

Log **inmutable**: sin políticas de `update` ni `delete`. Un error se corrige con un movimiento compensatorio nuevo, nunca editando el histórico.

`solicitud_id` permite trazar qué movimientos de stock vinieron de una aprobación de solicitud (con valor) frente a los ajustes manuales del administrador (`null`). Se llena automáticamente por la función `aprobar_solicitud` — nunca se setea a mano desde el código de la aplicación.

### `solicitudes`

Campos: `id`, `cliente_id`, `estado` (enum `pendiente` | `aprobada` | `rechazada` | `entregada`), `metodo_pago` (enum `contra_entrega` | `evidencia_transferencia`), `evidencia_pago_url`, `direccion_entrega`, `total`, `created_at`, `updated_at`.

`direccion_entrega` se precarga con `profiles.direccion` en el formulario, pero es editable por pedido — un cliente puede querer entregar en una dirección distinta a la de su perfil.

Las transiciones de estado `pendiente → aprobada` y `pendiente → rechazada` **no se hacen con un `update` directo desde el cliente** — pasan por las funciones RPC `aprobar_solicitud` / `rechazar_solicitud` (ver abajo), para garantizar que el cambio de estado y el descuento de stock ocurran en una sola transacción atómica. La transición `aprobada → entregada` sí puede ser un `update` directo (no involucra stock).

### `solicitud_items`

Campos: `id`, `solicitud_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`. `precio_unitario` congela el precio al momento de la compra — no es una referencia al precio actual del producto, para que cambios de precio posteriores no afecten solicitudes históricas. Inmutables tras creados (sin `update`/`delete`).

## Flujo de la solicitud (carrito → entrega)

1. **Catálogo y carrito**: el cliente navega productos (sin necesidad de cuenta), agrega al carrito. El carrito vive **solo en el cliente** (Zustand + `persist`/localStorage) — no existe tabla de carrito en la base de datos.
2. **Checkout**: al hacer click en "Pagar", si el cliente no está autenticado, se le pide login o registro antes de continuar. El login/registro es obligatorio recién en este punto, no antes (para no perder usuarios que solo quieren mirar precios).
3. **Formulario de pago**: se piden los datos, dirección de entrega (precargada, editable) y el método: contra-entrega o evidencia de transferencia (sube archivo al bucket `comprobantes-pago`). Se crea la `solicitud` con estado `pendiente` y sus `solicitud_items`. **En este punto se valida stock disponible** (rechaza si la cantidad solicitada supera el stock actual), pero **no se descuenta** todavía.
4. **Revisión del administrador**: el admin ve la solicitud pendiente (incluyendo la evidencia de pago si aplica) y decide:
   - **Aprobar**: llama a la función `aprobar_solicitud(solicitud_id)`. Esta revalida el stock disponible de cada ítem, genera automáticamente los `movimientos_stock` de tipo `salida` (con `solicitud_id` como referencia) y cambia el estado a `aprobada` — todo en una sola transacción. Si el stock ya no alcanza para algún ítem, toda la operación se revierte y la solicitud queda `pendiente`.
   - **Rechazar**: llama a la función `rechazar_solicitud(solicitud_id)`. Estado pasa a `rechazada`, no se toca el stock.
5. **Entrega**: el admin marca la solicitud como `entregada` cuando corresponde (update directo, no involucra stock).
6. **Impresión**: el admin puede imprimir una etiqueta con: dirección, nombre, tipo de pago, número de contacto, **total** y **número/ID de la solicitud**. No incluye el listado de productos — decisión explícita por el tamaño físico de la etiqueta.

No existe el estado `en_revisión` como paso independiente — revisar la evidencia de pago es parte de la acción de aprobar/rechazar, no un estado que alguien deba mover manualmente antes.

**Límite aceptado, no resuelto con más complejidad**: entre que un cliente agrega al carrito y el admin aprueba, otro cliente pudo haber comprado el mismo stock. No se implementa un sistema de reserva de stock — se cubre con doble validación en vivo (al crear la solicitud y al aprobarla, esta última dentro de la misma transacción que descuenta), sin caché ni jobs periódicos de por medio.

## Funciones de base de datos (RPC) y triggers

Estas piezas viven en Postgres, no en el código de la aplicación, porque garantizan atomicidad (todo o nada) que múltiples llamadas separadas desde el cliente no pueden garantizar.

### Trigger: actualizar stock automáticamente

Cada `insert` en `movimientos_stock` dispara un trigger que ajusta `productos.stock`. Para movimientos de tipo `salida`, el `update` incluye la condición `stock >= cantidad` en la misma sentencia — valida y descuenta de forma atómica, evitando la condición de carrera de leer el stock y actualizarlo en pasos separados. Si no hay stock suficiente, el trigger lanza una excepción y todo el `insert` (y cualquier transacción que lo contenga) se revierte.

Consecuencia directa para el código de aplicación: **nunca hacer `update productos set stock = ...` a mano**. El stock solo cambia insertando un `movimientos_stock`.

### RPC `aprobar_solicitud(p_solicitud_id uuid)`

- Verifica que quien llama sea administrador y que la solicitud esté en estado `pendiente`.
- Recorre los `solicitud_items` de esa solicitud e inserta un `movimientos_stock` de tipo `salida` por cada uno, con `solicitud_id` seteado.
- Si el trigger de stock lanza excepción en cualquier ítem, toda la función se revierte — no quedan movimientos parciales ni la solicitud aprobada a medias.
- Si todo sale bien, actualiza `solicitudes.estado = 'aprobada'`.
- `SECURITY DEFINER`, con `grant execute` solo a `authenticated` (la verificación de rol admin ocurre dentro de la función).

### RPC `rechazar_solicitud(p_solicitud_id uuid)`

- Verifica que quien llama sea administrador y que la solicitud esté en `pendiente`.
- Actualiza `solicitudes.estado = 'rechazada'`. No toca `movimientos_stock` ni `productos.stock`.

**Regla para el código de la aplicación**: el flujo de aprobar/rechazar debe llamar `supabase.rpc('aprobar_solicitud', { p_solicitud_id })` / `rechazar_solicitud`, nunca un `update` directo a `solicitudes.estado` para esas dos transiciones específicas.

## Row Level Security — resumen de la política de cada tabla

Todas las tablas usan una función `is_admin()` (`SECURITY DEFINER`, evita recursión) que consulta `profiles.rol`.

- **profiles**: cada usuario lee/edita su propio perfil (sin poder cambiar su propio `rol`); admin lee todos.
- **productos**: lectura pública de `disponible = true and activo = true`; admin lee/crea/edita todos; sin política de `delete` (bloqueado).
- **movimientos_stock**: solo admin lee/inserta; sin `update`/`delete` (log inmutable).
- **solicitudes**: el cliente crea y lee las suyas (no las edita); admin lee y actualiza el `estado` de todas — en la práctica, las transiciones `aprobada`/`rechazada` se hacen vía RPC (ver arriba), y la política de `update` queda como vía para `entregada` y correcciones manuales del admin.
- **solicitud_items**: el cliente crea y lee los de sus propias solicitudes; admin lee todos; sin `update`/`delete`.
- **storage `comprobantes-pago`**: el cliente sube/ve solo sus propios archivos (ruta `{user_id}/archivo`); admin ve todos.

## MVP — alcance actual

**Dentro**: registro/login (usuario o correo + contraseña), CRUD de productos por el admin, carrito anónimo, checkout con solicitud (contra-entrega o evidencia de pago), aprobación/rechazo de solicitudes con descuento de stock, impresión de etiqueta, alertas de vencimiento próximo.

**Fuera (decisión explícita, no olvido)**: pasarela de pago real, roles adicionales, multi-bodega, sistema de reserva de stock, lotes/FEFO, categorización regulatoria de productos.

## Historias de usuario

Ver `README.md` para el listado completo en formato Gherkin (Dado/Cuando/Entonces). Cualquier feature nueva debería documentarse con el mismo formato antes de implementarse — están pensadas para poder convertirse en pruebas E2E de Playwright.
