import { ShoppingBag, User } from "lucide-react";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
      <a
        href="/"
        className="font-display bg-linear-to-r from-fuchsia-300 to-green-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl"
      >
        AngelaP
      </a>
      <nav className="flex items-center gap-3 text-sm sm:gap-6">
        <a href="#destacados" className="hidden sm:inline hover:opacity-70 hover:scale-105 transition-all duration-100">
          Catálogo
        </a>
        <button
          aria-label="Iniciar sesión"
          className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 hover:opacity-70 hover:scale-105 transition-all duration-100 cursor-pointer sm:min-h-0 sm:min-w-0"
        >
          <User size={18} />
          <span className="hidden sm:inline">Iniciar sesión</span>
        </button>
        <button
          aria-label="Carrito"
          className="glass-panel flex min-h-11 items-center gap-1.5 px-3 py-2 text-sm sm:px-4"
        >
          <ShoppingBag size={18} />
          <span>0</span>
        </button>
      </nav>
    </header >
  );
}