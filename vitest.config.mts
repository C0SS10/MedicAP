import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    environment: "jsdom",

    globals: true,

    setupFiles: ["./vitest.setup.ts"],

    include: ["tests/**/*.test.{ts,tsx}"],

    exclude: [
      "node_modules",
      ".next",
      "e2e",
      "playwright-report",
      "test-results",
    ],

    coverage: {
      provider: "v8",

      reporter: ["text", "html", "json"],

      include: ["src/**/*.{ts,tsx}"],

      exclude: ["src/**/*.d.ts", "src/**/page.tsx", "src/**/layout.tsx"],

      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
