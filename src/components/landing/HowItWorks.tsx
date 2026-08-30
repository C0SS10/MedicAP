const pasos = [
  { number: "01", title: "Elige tus productos", description: "Explora el catálogo y arma tu pedido." },
  { number: "02", title: "Confirma tu pedido", description: "Contra-entrega o sube tu comprobante." },
  { number: "03", title: "Recíbelo en casa", description: "Coordinamos la entrega contigo." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 text-sm sm:px-8 sm:pb-24 sm:grid-cols-3">
      {pasos.map((p) => (
        <div key={p.number} className="flex flex-col gap-1 rounded-lg p-4 text-center">
          <p className="font-display text-2xl text-ink-muted/50 sm:text-3xl">{p.number}</p>
          <p className="mt-1 font-medium">{p.title}</p>
          <p className="text-ink-muted">{p.description}</p>
        </div>
      ))}
    </section>
  );
}