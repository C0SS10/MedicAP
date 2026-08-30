# SKILLS.md

Convenciones y patrones concretos a seguir al escribir código en este proyecto. Mientras `CLAUDE.md` explica **qué** se decidió y **por qué**, este archivo explica **cómo** escribir el código día a día de forma consistente con esas decisiones.

## Separación de capas (no negociable)

- `domain/`: solo tipos y funciones puras de TypeScript. Cero imports de Supabase, Next.js o cualquier librería externa. Si una función de dominio necesita datos externos, los recibe como parámetro — no los va a buscar ella misma.
- `services/`: orquesta casos de uso completos (ej. `aprobarSolicitud(solicitudId)`). Puede depender de repositorios de `infrastructure/`, pero no debe contener JSX ni lógica de rutas.
- `infrastructure/supabase/`: aquí y solo aquí viven las queries reales a Supabase.
- `app/`: Server Actions y rutas llaman a `services/`, nunca deberían tener lógica de negocio embebida directamente en el handler.

Si al escribir algo dudas en qué carpeta va, la pregunta guía es: _"¿esto seguiría teniendo sentido si mañana cambiamos Supabase por otra base de datos?"_ Si sí, va en `domain/` o `services/`. Si no, va en `infrastructure/`.

## Validación con Zod

Un schema por entidad de formulario (`ProductoSchema`, `RegistroClienteSchema`, `SolicitudSchema`, etc.), típicamente en `domain/` o en un archivo `schemas.ts` junto a la entidad. Se usa dos veces siempre:

1. En el formulario (cliente), vía `react-hook-form` + `zodResolver`, para feedback inmediato.
2. Revalidado dentro del Server Action correspondiente, antes de tocar Supabase — nunca confiar solo en la validación del cliente.

## Patrones de la base de datos que el código debe respetar

- **Soft delete vía `activo`**: nunca hacer un `delete` real de un producto desde el código de aplicación (además, RLS ya lo bloquea). "Eliminar" un producto = `update productos set activo = false`.
- **`disponible` y `activo` son independientes**: no asumir que un producto no disponible está inactivo, ni viceversa. Un filtro de catálogo público siempre debe chequear ambos.
- **Logs inmutables**: `movimientos_stock` y `solicitud_items` nunca se actualizan ni se borran desde el código. Un movimiento erróneo se corrige con un movimiento compensatorio nuevo (ej. una `entrada` que revierte una `salida` mal registrada), no editando la fila.
- **Precio congelado**: al crear un `solicitud_items`, copiar el `precio` actual del producto a `precio_unitario` en ese momento. Nunca hacer join a `productos.precio` para mostrar el precio histórico de una solicitud ya creada.
- **El `stock` de un producto nunca se actualiza a mano**: no existe ningún `update productos set stock = ...` en el código de la aplicación. El stock cambia únicamente como efecto de un `insert` en `movimientos_stock` (hay un trigger en la base de datos que lo recalcula). Si necesitas ajustar stock manualmente, inserta un `movimientos_stock` de tipo `entrada` o `salida` con el motivo correspondiente — nunca edites `productos.stock` directamente.
- **Aprobar/rechazar solicitud = RPC, nunca `update` directo**: `services/aprobarSolicitud` y `services/rechazarSolicitud` deben llamar a `supabase.rpc('aprobar_solicitud', { p_solicitud_id })` / `rpc('rechazar_solicitud', ...)`. Estas funciones viven en la base de datos y garantizan que el cambio de estado y la generación de movimientos de stock ocurran en una sola transacción atómica — replicar esa lógica con varias llamadas separadas desde `services/` (un `insert` de movimientos + un `update` de estado) puede dejar datos inconsistentes si algo falla a la mitad, así que no se hace así.
- **Descuento de stock solo al aprobar**: la creación de una `solicitud` NO genera movimientos de stock. Solo la RPC `aprobar_solicitud` los genera, y siempre revalida stock disponible en ese momento antes de descontar (dentro de la misma transacción, vía el trigger de stock).
- **Grupos de presentación**: al listar el catálogo público, agrupar productos por `grupo` para la vista de card; al entrar al detalle, mostrar los hermanos del mismo `grupo` como opciones de presentación (no como una tabla de variantes aparte).

## Formato de historias de usuario (Gherkin)

Toda historia de usuario nueva se documenta así, antes de implementarse:

```
Historia: <nombre>
Como <rol>
Quiero <acción>
Para <beneficio>

  Dado <contexto>
  Cuando <acción>
  Entonces <resultado esperado>
```

Este formato no es solo documentación — es la base directa de los tests E2E de Playwright. Cada bloque Dado/Cuando/Entonces debería poder traducirse casi literalmente a un test.

## Testing

- **Vitest** para `domain/` y `services/`: pruebas unitarias sin tocar Supabase (usar mocks/fakes de los repositorios de `infrastructure/`).
- **Playwright** para flujos completos de usuario (E2E), especialmente: registro → login, carrito → checkout → solicitud, aprobación de solicitud → descuento de stock.
- **Casos a cubrir sobre la RPC de aprobación**: aprobar con stock suficiente (descuenta y cambia estado), aprobar cuando el stock ya no alcanza (todo se revierte, la solicitud queda `pendiente`, no quedan movimientos parciales), rechazar (no toca stock).
- **Matriz de pruebas de RLS**: las políticas de seguridad son código crítico y se prueban explícitamente, no se asumen correctas. Antes de dar por cerrada cualquier tabla nueva o política nueva, verificar con usuarios de prueba de ambos roles:
  - Un cliente no puede leer/editar datos de otro cliente (perfiles, solicitudes, items, comprobantes de pago).
  - Un cliente no puede promoverse a sí mismo a `administrador`.
  - Un cliente no puede editar productos, movimientos de stock, ni el estado de una solicitud.
  - Un administrador sí puede hacer todo lo anterior.
  - Un cliente no puede ejecutar las funciones `aprobar_solicitud` / `rechazar_solicitud` con éxito (deben fallar por la verificación de rol dentro de la función).

## Convenciones de nombres

- Tablas y columnas de Supabase: **español**, `snake_case` (ya reflejado en el esquema de `CLAUDE.md`).
- Código TypeScript (variables, funciones, componentes): **inglés**, `camelCase`/`PascalCase`, siguiendo la convención estándar de la comunidad Next.js/TypeScript. Es válido que una función de servicio en inglés (`approveRequest`) llame a una tabla en español (`solicitudes`) — no hay necesidad de traducir el esquema de base de datos.

## Diseño (Soft Glassmorphism, paleta crema)

- Definir los tokens de diseño (colores crema, radios, sombras, niveles de opacidad de los paneles glass) como variables en `@theme` de Tailwind v4, en un solo archivo — no repetir valores hardcodeados en cada componente.
- Los paneles con `backdrop-filter: blur()` van sobre fondos con gradiente suave, nunca sobre blanco puro.
- Información crítica (stock bajo, vencimiento próximo/vencido, estado de una solicitud) se muestra con color sólido y buen contraste, fuera del tratamiento glass de baja opacidad — la legibilidad de estos datos no es negociable por estética.
