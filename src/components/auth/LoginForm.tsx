"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/domain/schemas/Auth";
import { login } from "@/app/iniciar-sesion/Actions";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await login(data);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-panel flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="identificador" className="text-sm font-medium">Usuario o correo</label>
        <input
          id="identificador"
          {...register("identificador")}
          className="mt-1 w-full min-h-11 rounded-lg border border-white/50 bg-cream-50 px-3 py-2"
        />
        {errors.identificador && (
          <p className="mt-1 text-sm text-danger">{errors.identificador.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="mt-1 w-full min-h-11 rounded-lg border border-white/50 bg-cream-50 px-3 py-2"
        />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 min-h-11 rounded-full bg-ink px-6 py-3 font-medium text-cream-50 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}