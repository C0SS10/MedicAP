import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBrowserClient } from "@supabase/ssr";
import { createSupabaseClient } from "@/infrastructure/supabase/Client";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

describe("createSupabaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("crea el cliente utilizando las variables de entorno", () => {
    const expectedClient = {
      auth: {},
    };

    vi.mocked(createBrowserClient).mockReturnValue(
      expectedClient as ReturnType<typeof createBrowserClient>,
    );

    const result = createSupabaseClient();

    expect(createBrowserClient).toHaveBeenCalledOnce();

    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
    );

    expect(result).toBe(expectedClient);
  });
});
