import { createSupabaseServer } from "@/infrastructure/supabase/Server";
import { ShoppingBag, User } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";

export async function Header() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let perfil: { username: string; rol: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, rol")
      .eq("id", user.id)
      .single();
    perfil = data;
  }

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
      <a
        href="/"
        className="font-display bg-linear-to-r from-fuchsia-300 to-green-300 bg-clip-text text-xl font-bold text-transparent sm:text-2xl"
      >
        AngelaP
      </a>
      <nav className="flex items-center gap-3 text-sm sm:gap-6">
        <a href="#destacados" className="hidden hover:opacity-70 sm:inline">Catálogo</a>

        {perfil ? (
          <UserMenu username={perfil.username} rol={perfil.rol} />
        ) : (
          <a
            href="/iniciar-sesion"
            aria-label="Iniciar sesión"
            className="flex min-h-11 items-center gap-1.5 hover:opacity-70"
          >
            <User size={18} />
            <span className="hidden sm:inline">Iniciar sesión</span>
          </a>
        )}
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