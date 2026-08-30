import { beforeEach, describe, expect, it, vi } from "vitest";

import { redirect } from "next/navigation";

import { login } from "@/app/iniciar-sesion/Actions";
import { createSupabaseServer } from "@/infrastructure/supabase/Server";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/infrastructure/supabase/Server", () => ({
  createSupabaseServer: vi.fn(),
}));

describe("login", () => {
  const rpc = vi.fn();
  const signInWithPassword = vi.fn();
  const getUser = vi.fn();
  const single = vi.fn();
  const eq = vi.fn();
  const select = vi.fn();
  const from = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    single.mockResolvedValue({
      data: {
        rol: "cliente",
      },
      error: null,
    });

    eq.mockReturnValue({
      single,
    });

    select.mockReturnValue({
      eq,
    });

    from.mockReturnValue({
      select,
    });

    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
        },
      },
      error: null,
    });

    signInWithPassword.mockResolvedValue({
      data: {},
      error: null,
    });

    vi.mocked(createSupabaseServer).mockResolvedValue({
      rpc,

      auth: {
        signInWithPassword,
        getUser,
      },

      from,
    } as never);
  });

  it("rechaza datos inválidos antes de consultar Supabase", async () => {
    const result = await login({
      identificador: "ab",
      password: "123",
    });

    expect(result).toEqual({
      error: "Ingresa tu usuario o correo y contraseña.",
    });

    expect(createSupabaseServer).not.toHaveBeenCalled();
  });

  it("autentica directamente cuando el identificador es un email", async () => {
    await login({
      identificador: "esteban@example.com",
      password: "12345678",
    });

    expect(rpc).not.toHaveBeenCalled();

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "esteban@example.com",
      password: "12345678",
    });
  });

  it("resuelve el email mediante RPC cuando se proporciona username", async () => {
    rpc.mockResolvedValue({
      data: "esteban@example.com",
      error: null,
    });

    await login({
      identificador: "esteban",
      password: "12345678",
    });

    expect(rpc).toHaveBeenCalledWith("email_por_username", {
      p_username: "esteban",
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "esteban@example.com",
      password: "12345678",
    });
  });

  it("devuelve error cuando el username no existe", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await login({
      identificador: "desconocido",
      password: "12345678",
    });

    expect(result).toEqual({
      error: "Usuario o contraseña incorrectos.",
    });

    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("devuelve error cuando Supabase rechaza las credenciales", async () => {
    signInWithPassword.mockResolvedValue({
      data: null,
      error: {
        message: "Invalid login credentials",
      },
    });

    const result = await login({
      identificador: "esteban@example.com",
      password: "passwordIncorrecta",
    });

    expect(result).toEqual({
      error: "Usuario o contraseña incorrectos.",
    });

    expect(getUser).not.toHaveBeenCalled();
  });

  it("consulta el perfil del usuario autenticado", async () => {
    await login({
      identificador: "esteban@example.com",
      password: "12345678",
    });

    expect(from).toHaveBeenCalledWith("profiles");

    expect(select).toHaveBeenCalledWith("rol");

    expect(eq).toHaveBeenCalledWith("id", "user-123");

    expect(single).toHaveBeenCalledOnce();
  });

  it("redirige al administrador a /tablero-admin", async () => {
    single.mockResolvedValue({
      data: {
        rol: "administrador",
      },
      error: null,
    });

    await login({
      identificador: "admin@example.com",
      password: "12345678",
    });

    expect(redirect).toHaveBeenCalledWith("/tablero-admin");
  });

  it("redirige al cliente a /cuenta", async () => {
    single.mockResolvedValue({
      data: {
        rol: "cliente",
      },
      error: null,
    });

    await login({
      identificador: "cliente@example.com",
      password: "12345678",
    });

    expect(redirect).toHaveBeenCalledWith("/cuenta");
  });
});
