// vite.config.ts
import react from "file:///home/yamaryu2007/kakotan/kakotan-web/main/node_modules/@vitejs/plugin-react/dist/index.js";
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "file:///home/yamaryu2007/kakotan/kakotan-web/main/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///home/yamaryu2007/kakotan/kakotan-web/main/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    typecheck: {
      tsconfig: "./tsconfig.vitest.json"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS95YW1hcnl1MjAwNy9rYWtvdGFuL2tha290YW4td2ViL21haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3lhbWFyeXUyMDA3L2tha290YW4va2Frb3Rhbi13ZWIvbWFpbi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS95YW1hcnl1MjAwNy9rYWtvdGFuL2tha290YW4td2ViL21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHtVUkwsIGZpbGVVUkxUb1BhdGh9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7dHlwZSBVc2VyQ29uZmlnLCBkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHR5cGUge1VzZXJDb25maWcgYXMgVml0ZXN0VXNlckNvbmZpZ30gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5cbnR5cGUgRXh0ZW5kZWRWaXRlQ29uZmlnID0gVXNlckNvbmZpZyAmIHtcbiAgdGVzdD86IFZpdGVzdFVzZXJDb25maWdbJ3Rlc3QnXTtcbn07XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBpbmNsdWRlOiBbJ3Rlc3RzLyoqLyoudGVzdC57dHMsdHN4fScsICdzcmMvKiovKi50ZXN0Lnt0cyx0c3h9J10sXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvc2V0dXBUZXN0cy50cycsXG4gICAgY3NzOiB0cnVlLFxuICAgIHBvb2w6ICdmb3JrcycsXG4gICAgcG9vbE9wdGlvbnM6IHtcbiAgICAgIGZvcmtzOiB7XG4gICAgICAgIHNpbmdsZUZvcms6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgdHlwZWNoZWNrOiB7XG4gICAgICB0c2NvbmZpZzogJy4vdHNjb25maWcudml0ZXN0Lmpzb24nLFxuICAgIH0sXG4gIH0sXG59IGFzIEV4dGVuZGVkVml0ZUNvbmZpZyk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdULE9BQU8sV0FBVztBQUNsVSxTQUFRLEtBQUsscUJBQW9CO0FBQ2pDLFNBQXlCLG9CQUFtQjtBQUZnSixJQUFNLDJDQUEyQztBQVU3TyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVMsQ0FBQyw0QkFBNEIsd0JBQXdCO0FBQUEsSUFDOUQsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sYUFBYTtBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0wsWUFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVCxVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUF1QjsiLAogICJuYW1lcyI6IFtdCn0K
