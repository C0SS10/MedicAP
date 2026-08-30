export type ProductoDestacado = {
  id: string;
  nombre: string;
  precio: string;
  tag?: string | null;
  color: string;
};

export function ProductCard({ producto }: { producto: ProductoDestacado }) {
  return (
    <div className="glass-panel p-3 sm:p-4">
      <div className={`h-24 rounded-xl sm:h-28 ${producto.color}`} />
      {producto.tag && (
        <span className="mt-3 mb-1 inline-block rounded-full bg-sage px-2 py-0.5 text-xs">
          {producto.tag}
        </span>
      )}
      <p className="mt-2 text-sm font-medium sm:text-base">{producto.nombre}</p>
      <p className="text-sm text-ink-muted">{producto.precio}</p>
    </div>
  );
}