import { beforeEach, describe, expect, it, vi } from "vitest";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { createSupabaseServer } from "@/infrastructure/supabase/Server";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

describe("createSupabaseServer", () => {
  const getAll = vi.fn();
  const set = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    vi.mocked(cookies).mockResolvedValue({
      getAll,
      set,
    } as never);

    vi.mocked(createServerClient).mockReturnValue(
      {} as ReturnType<typeof createServerClient>,
    );
  });

  it("crea un cliente server de Supabase", async () => {
    await createSupabaseServer();

    expect(createServerClient).toHaveBeenCalledOnce();

    expect(createServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });

  it("delega getAll al cookieStore de Next.js", async () => {
    getAll.mockReturnValue([
      {
        name: "session",
        value: "abc123",
      },
    ]);

    await createSupabaseServer();

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];

    const result = options.cookies.getAll();

    expect(getAll).toHaveBeenCalledOnce();

    expect(result).toEqual([
      {
        name: "session",
        value: "abc123",
      },
    ]);
  });

  it("persiste todas las cookies enviadas por Supabase", async () => {
    await createSupabaseServer();

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];

    const setAll = options.cookies.setAll;

    expect(setAll).toBeDefined();

    if (!setAll) {
      throw new Error("setAll no está definido");
    }

    const cookiesToSet = [
      {
        name: "access-token",
        value: "123",
        options: {
          path: "/",
        },
      },
      {
        name: "refresh-token",
        value: "456",
        options: {
          httpOnly: true,
        },
      },
    ];

    setAll(cookiesToSet, {});

    expect(set).toHaveBeenCalledTimes(2);

    expect(set).toHaveBeenNthCalledWith(1, "access-token", "123", {
      path: "/",
    });

    expect(set).toHaveBeenNthCalledWith(2, "refresh-token", "456", {
      httpOnly: true,
    });
  });
});
