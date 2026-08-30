import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12 md:grid-cols-2 md:gap-12">
      <div>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          Tu piel, <br /> tu ritmo.
        </h1>
        <p className="mt-4 max-w-md text-base text-ink-muted sm:mt-5 sm:text-lg">
          Productos estéticos y farmacéuticos seleccionados con cuidado. Pide en minutos, paga contra-entrega o con comprobante.
        </p>
        <a
          href="#destacados"
          className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-cream-50 sm:mt-8 sm:inline-flex sm:w-auto"
        >
          Ver catálogo <ArrowRight size={16} />
        </a>
      </div>

      <div className="glass-panel-strong p-5 sm:p-6">
        <div className="h-32 rounded-2xl bg-rose sm:h-40" />
        <p className="mt-4 text-xs uppercase tracking-wide text-ink-muted">Más pedido</p>
        <p className="font-display text-lg sm:text-xl">Tirzepatida 5mg</p>
        <p className="text-ink-muted">$450.000</p>
      </div>
    </section>
  );
}