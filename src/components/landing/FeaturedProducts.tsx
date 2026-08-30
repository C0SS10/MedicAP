import { ProductCard, type ProductoDestacado } from "@/components/ui/ProductCard";

const destacados: ProductoDestacado[] = [
  { id: "1", nombre: "Tirzepatida 5mg", precio: "$450.000", tag: "Más pedido", color: "bg-rose" },
  { id: "2", nombre: "Ácido hialurónico", precio: "$180.000", tag: "Nuevo", color: "bg-sky" },
  { id: "3", nombre: "Tirzepatida 10mg", precio: "$620.000", tag: null, color: "bg-sage" },
  { id: "4", nombre: "Peeling facial", precio: "$95.000", tag: null, color: "bg-olive" },
];

export function FeaturedProducts() {
  return (
    <section id="destacados" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
      <div className="mb-5 flex items-baseline justify-between sm:mb-6">
        <h2 className="font-display text-xl sm:text-2xl">Destacados</h2>
        <a href="#" className="text-sm text-ink-muted hover:text-ink">Ver todo →</a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {destacados.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}