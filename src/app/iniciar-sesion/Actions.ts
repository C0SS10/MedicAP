"use server";

import { redirect } from "next/navigation";
import { LoginSchema, type LoginInput } from "@/domain/schemas/Auth";
import { createSupabaseServer } from "@/infrastructure/supabase/Server";

export async function login(data: LoginInput) {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Ingresa tu usuario o correo y contraseña." };
  }

  const supabase = await createSupabaseServer();
  const { identificador, password } = parsed.data;

  let email = identificador;
  if (!identificador.includes("@")) {
    const { data: resolvedEmail } = await supabase.rpc("email_por_username", {
      p_username: identificador,
    });
    if (!resolvedEmail) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    email = resolvedEmail;
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "No pudimos verificar tu sesión.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      error: "No pudimos obtener tu perfil.",
    };
  }

  redirect(profile.rol === "administrador" ? "/tablero-admin" : "/cuenta");
}
