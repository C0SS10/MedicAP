"use server";

import { redirect } from "next/navigation";
import {
  RegistroClienteSchema,
  type RegistroClienteInput,
} from "@/domain/schemas/Auth";
import { createSupabaseServer } from "@/infrastructure/supabase/Server";

export async function registerClient(data: RegistroClienteInput) {
  const parsed = RegistroClienteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const { username, email, password, telefono, direccion } = parsed.data;
  const supabase = await createSupabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, telefono, direccion } },
  });

  if (error) {
    console.error("Supabase signUp error:", error);

    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Ese correo ya está registrado." };
    }

    return {
      error: "No pudimos crear tu cuenta. Intenta de nuevo.",
    };
  }

  redirect("/cuenta");
}
