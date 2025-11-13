import { fileURLToPath, URL } from "node:url";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { UserConfig as VitestUserConfig } from "vitest/config";

type ExtendedViteConfig = UserConfig & {
  test?: VitestUserConfig["test"];
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    typecheck: {
      tsconfig: "./tsconfig.vitest.json",
    },
  },
} as ExtendedViteConfig);
