"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegistroClienteSchema, type RegistroClienteInput } from "@/domain/schemas/Auth";
import { registerClient } from "@/app/registro/Actions";

const fields = [
  { name: "username", label: "Nombre de usuario", placeholder: "Angie_", type: "text" },
  { name: "email", label: "Correo electrónico", placeholder: "nombre@correo.com", type: "email" },
  { name: "telefono", label: "Número de contacto", placeholder: "3001234567", type: "tel" },
  { name: "direccion", label: "Dirección", placeholder: "Calle 10 #20b-30 APTO 101", type: "text" },
] as const;

function PasswordHint() {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="Requisitos de la contraseña"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-sky text-[10px] font-medium"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-44 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs text-cream-50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        Mínimo 8 caracteres.
      </span>
    </span>
  );
}

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroClienteInput>({ resolver: zodResolver(RegistroClienteSchema) });

  const onSubmit = async (data: RegistroClienteInput) => {
    setServerError(null);
    const result = await registerClient(data);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-panel flex flex-col gap-4 p-6">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="text-sm font-medium">{f.label}</label>
          <input
            id={f.name}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            {...register(f.name)}
            className="mt-1 w-full min-h-11 rounded-lg border border-white/50 bg-cream-50 px-3 py-2"
          />
          {errors[f.name] && <p className="mt-1 text-sm text-danger">{errors[f.name]?.message}</p>}
        </div>
      ))}

      <div>
        <div className="flex items-center gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
          <PasswordHint />
        </div>
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
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}