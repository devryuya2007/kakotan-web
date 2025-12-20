import react from '@vitejs/plugin-react';
import {URL, fileURLToPath} from 'node:url';
import {type UserConfig, defineConfig} from 'vite';
import type {UserConfig as VitestUserConfig} from 'vitest/config';

type ExtendedViteConfig = UserConfig & {
  test?: VitestUserConfig['test'];
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    pool: 'forks',
    forks: {
      singleFork: true,
    },
    coverage: {
      provider: "v8",
      exclude: ["src/assets/**"],
    },
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
} as ExtendedViteConfig);
