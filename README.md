# Sistema de inventario y tienda — productos farmacéuticos/estéticos

Sistema para digitalizar y centralizar el inventario, las transacciones y la trazabilidad de un negocio pequeño que vende productos como tirzepatida, ácidos y similares. Incluye catálogo público, carrito de compra, solicitudes de compra (sin pasarela de pago) y panel de administración.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage)
- **Zustand** (estado de cliente, carrito persistente)
- **Zod** + **react-hook-form** (validación de formularios)
- **pnpm**
- **Vitest** (unitarias) + **Playwright** (E2E)
  Despliegue: una sola app Next.js en Vercel + Supabase como backend administrado. Sin infraestructura propia que mantener.

## Primeros pasos

```bash
pnpm install
cp .env.example .env.local   # completar con las credenciales de Supabase
pnpm dev
```

Variables de entorno necesarias:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Estructura del proyecto

```
src/
  app/                 # rutas, Server Components, Server Actions
  domain/              # entidades y reglas de negocio puras
  services/            # casos de uso
  infrastructure/
    supabase/          # cliente Supabase + repositorios
  store/               # Zustand stores
  components/          # UI (glassmorphism)
tests/
  unit/                # Vitest
  e2e/                 # Playwright
```

Ver `CLAUDE.md` para el detalle completo de decisiones de arquitectura y modelo de datos, y `SKILLS.md` para las convenciones de código a seguir.

## Roles

- **Administrador**: gestiona productos, revisa y aprueba/rechaza solicitudes, registra movimientos de stock, imprime etiquetas de solicitud.
- **Cliente**: navega el catálogo, arma su carrito, envía solicitudes de compra, sube evidencia de pago.

## Flujo de compra

1. El cliente navega el catálogo y agrega productos al carrito (sin necesidad de cuenta).
2. Al hacer click en "Pagar", si no está autenticado se le pide login o registro.
3. Completa el formulario de entrega y elige método de pago: contra-entrega o evidencia de transferencia.
4. El administrador revisa la solicitud y la aprueba (descuenta stock) o la rechaza.
5. El administrador marca la solicitud como entregada e imprime la etiqueta (dirección, nombre, tipo de pago, contacto, total, ID de solicitud).

## Alcance del MVP

**Incluido**: registro/login, CRUD de productos, carrito, checkout con solicitud, aprobación/rechazo con descuento de stock, impresión de etiqueta, alertas de vencimiento.

**No incluido (por ahora)**: pasarela de pago real, roles adicionales, multi-bodega, reserva de stock, lotes/FEFO.
