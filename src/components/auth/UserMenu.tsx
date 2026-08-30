"use client";

import { useEffect, useRef, useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { logout } from "@/app/cerrar-sesion/Actions";

const DESTINO_CUENTA: Record<string, string> = {
  cliente: "/cuenta",
  administrador: "/tablero-admin",
};

export function UserMenu({ username, rol }: { username: string; rol: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const destino = DESTINO_CUENTA[rol] ?? "/cuenta";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-1.5 rounded-full px-2 py-2 hover:opacity-70 cursor-pointer"
      >
        <User size={18} />
        <span className="hidden max-w-32 sm:inline">{username}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-full mt-2 w-44 overflow-hidden p-1">
          <a href={destino} className="block rounded-lg px-3 py-2 text-sm hover:bg-cream-100">
            Ir a mi cuenta
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-cream-100 cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}