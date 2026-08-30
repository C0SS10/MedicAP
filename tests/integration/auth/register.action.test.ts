import { beforeEach, describe, expect, it, vi } from "vitest";

import { redirect } from "next/navigation";

import { registerClient } from "@/app/registro/Actions";
import { createSupabaseServer } from "@/infrastructure/supabase/Server";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/infrastructure/supabase/Server", () => ({
  createSupabaseServer: vi.fn(),
}));

describe("registerClient", () => {
  const signUp = vi.fn();

  const validData = {
    username: "esteban",
    email: "esteban@example.com",
    password: "12345678",
    telefono: "3001234567",
    direccion: "Calle 72 # 10-34",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createSupabaseServer).mockResolvedValue({
      auth: {
        signUp,
      },
    } as never);
  });

  it("rechaza datos inválidos antes de llamar a Supabase", async () => {
    const result = await registerClient({
      ...validData,
      email: "correo-invalido",
    });

    expect(result).toEqual({
      error: "Revisa los datos del formulario.",
    });

    expect(createSupabaseServer).not.toHaveBeenCalled();

    expect(signUp).not.toHaveBeenCalled();
  });

  it("envía correctamente los datos de registro a Supabase", async () => {
    signUp.mockResolvedValue({
      data: {},
      error: null,
    });

    await registerClient(validData);

    expect(signUp).toHaveBeenCalledOnce();

    expect(signUp).toHaveBeenCalledWith({
      email: "esteban@example.com",
      password: "12345678",

      options: {
        data: {
          username: "esteban",
          telefono: "3001234567",
          direccion: "Calle 72 # 10-34",
        },
      },
    });
  });

  it("redirige a /cuenta cuando el registro es exitoso", async () => {
    signUp.mockResolvedValue({
      data: {},
      error: null,
    });

    await registerClient(validData);

    expect(redirect).toHaveBeenCalledWith("/cuenta");
  });

  it("informa cuando el correo ya existe", async () => {
    signUp.mockResolvedValue({
      data: null,
      error: {
        message: "User already registered",
      },
    });

    const result = await registerClient(validData);

    expect(result).toEqual({
      error: "Ese correo ya está registrado.",
    });

    expect(redirect).not.toHaveBeenCalled();
  });

  it("devuelve un error genérico ante errores inesperados de Supabase", async () => {
    signUp.mockResolvedValue({
      data: null,
      error: {
        message: "Internal database error",
      },
    });

    const result = await registerClient(validData);

    expect(result).toEqual({
      error: "No pudimos crear tu cuenta. Intenta de nuevo.",
    });

    expect(redirect).not.toHaveBeenCalled();
  });
});
