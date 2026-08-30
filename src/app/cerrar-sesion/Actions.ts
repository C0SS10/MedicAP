"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/infrastructure/supabase/Server";

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
