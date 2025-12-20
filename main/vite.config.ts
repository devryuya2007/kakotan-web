import react from "@vitejs/plugin-react";
import {URL, fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 依存内でReactが二重に解決されるのを防ぐ
    dedupe: ["react", "react-dom"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true,
    pool: "forks",
    coverage: {
      provider: "v8",
      exclude: ["src/assets/**"],
    },
    typecheck: {
      tsconfig: "./tsconfig.vitest.json",
    },
  },
});
