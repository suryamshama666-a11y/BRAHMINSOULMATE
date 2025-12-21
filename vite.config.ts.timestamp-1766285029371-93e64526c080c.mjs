// vite.config.ts
import { defineConfig } from "file:///D:/brahminsoul/brahminsoul/New%20folder/brahmin-soulmate-connect-main/node_modules/vite/dist/node/index.js";
import react from "file:///D:/brahminsoul/brahminsoul/New%20folder/brahmin-soulmate-connect-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/brahminsoul/brahminsoul/New%20folder/brahmin-soulmate-connect-main/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///D:/brahminsoul/brahminsoul/New%20folder/brahmin-soulmate-connect-main/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { sentryVitePlugin } from "file:///D:/brahminsoul/brahminsoul/New%20folder/brahmin-soulmate-connect-main/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var __vite_injected_original_dirname = "D:\\brahminsoul\\brahminsoul\\New folder\\brahmin-soulmate-connect-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: { ignored: ["**/supabase/**", "**/backend/**", "**/database/**"] }
  },
  plugins: [
    react(),
    process.env.LOVABLE_TAGGER === "1" && componentTagger(),
    // Enable Sentry upload only in production and when explicitly requested
    mode === "production" && process.env.SENTRY_UPLOAD === "1" && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ].filter(Boolean),
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query", "lucide-react", "recharts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router", "react-router-dom"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"]
        }
      },
      plugins: [
        visualizer({ filename: "dist/stats.html", open: false, gzipSize: true, brotliSize: true })
      ]
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["**/node_modules/**", "**/tests/e2e/**"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxicmFobWluc291bFxcXFxicmFobWluc291bFxcXFxOZXcgZm9sZGVyXFxcXGJyYWhtaW4tc291bG1hdGUtY29ubmVjdC1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxicmFobWluc291bFxcXFxicmFobWluc291bFxcXFxOZXcgZm9sZGVyXFxcXGJyYWhtaW4tc291bG1hdGUtY29ubmVjdC1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9icmFobWluc291bC9icmFobWluc291bC9OZXclMjBmb2xkZXIvYnJhaG1pbi1zb3VsbWF0ZS1jb25uZWN0LW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHdhdGNoOiB7IGlnbm9yZWQ6IFsnKiovc3VwYWJhc2UvKionLCcqKi9iYWNrZW5kLyoqJywnKiovZGF0YWJhc2UvKionXSB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBwcm9jZXNzLmVudi5MT1ZBQkxFX1RBR0dFUiA9PT0gJzEnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIC8vIEVuYWJsZSBTZW50cnkgdXBsb2FkIG9ubHkgaW4gcHJvZHVjdGlvbiBhbmQgd2hlbiBleHBsaWNpdGx5IHJlcXVlc3RlZFxuICAgIChtb2RlID09PSAncHJvZHVjdGlvbicgJiYgcHJvY2Vzcy5lbnYuU0VOVFJZX1VQTE9BRCA9PT0gJzEnICYmIHByb2Nlc3MuZW52LlNFTlRSWV9PUkcgJiYgcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QgJiYgcHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU4pICYmXG4gICAgICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICAgICAgb3JnOiBwcm9jZXNzLmVudi5TRU5UUllfT1JHLFxuICAgICAgICBwcm9qZWN0OiBwcm9jZXNzLmVudi5TRU5UUllfUFJPSkVDVCxcbiAgICAgICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgIH0pLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsJ3JlYWN0LWRvbScsJ3JlYWN0LXJvdXRlci1kb20nLCdAdGFuc3RhY2svcmVhY3QtcXVlcnknLCdsdWNpZGUtcmVhY3QnLCdyZWNoYXJ0cyddLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICByZWFjdDogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICByb3V0ZXI6IFsncmVhY3Qtcm91dGVyJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICBxdWVyeTogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcbiAgICAgICAgICBjaGFydHM6IFsncmVjaGFydHMnXSxcblxuICAgICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgdmlzdWFsaXplcih7IGZpbGVuYW1lOiAnZGlzdC9zdGF0cy5odG1sJywgb3BlbjogZmFsc2UsIGd6aXBTaXplOiB0cnVlLCBicm90bGlTaXplOiB0cnVlIH0pXG4gICAgICBdXG4gICAgfVxuICB9LFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvdGVzdC9zZXR1cC50cycsXG4gICAgY3NzOiB0cnVlLFxuICAgIGV4Y2x1ZGU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJywgJyoqL3Rlc3RzL2UyZS8qKiddLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1WSxTQUFTLG9CQUFvQjtBQUNwYSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsd0JBQXdCO0FBTGpDLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTyxFQUFFLFNBQVMsQ0FBQyxrQkFBaUIsaUJBQWdCLGdCQUFnQixFQUFFO0FBQUEsRUFDeEU7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVEsSUFBSSxtQkFBbUIsT0FBTyxnQkFBZ0I7QUFBQTtBQUFBLElBRXJELFNBQVMsZ0JBQWdCLFFBQVEsSUFBSSxrQkFBa0IsT0FBTyxRQUFRLElBQUksY0FBYyxRQUFRLElBQUksa0JBQWtCLFFBQVEsSUFBSSxxQkFDakksaUJBQWlCO0FBQUEsTUFDZixLQUFLLFFBQVEsSUFBSTtBQUFBLE1BQ2pCLFNBQVMsUUFBUSxJQUFJO0FBQUEsTUFDckIsV0FBVyxRQUFRLElBQUk7QUFBQSxJQUN6QixDQUFDO0FBQUEsRUFDTCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFRLGFBQVksb0JBQW1CLHlCQUF3QixnQkFBZSxVQUFVO0FBQUEsRUFDcEc7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLE9BQU8sQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM1QixRQUFRLENBQUMsZ0JBQWdCLGtCQUFrQjtBQUFBLFVBQzNDLE9BQU8sQ0FBQyx1QkFBdUI7QUFBQSxVQUMvQixRQUFRLENBQUMsVUFBVTtBQUFBLFVBRWpCLFVBQVUsQ0FBQyx1QkFBdUI7QUFBQSxRQUN0QztBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLFdBQVcsRUFBRSxVQUFVLG1CQUFtQixNQUFNLE9BQU8sVUFBVSxNQUFNLFlBQVksS0FBSyxDQUFDO0FBQUEsTUFDM0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLElBQ0wsU0FBUyxDQUFDLHNCQUFzQixpQkFBaUI7QUFBQSxFQUNuRDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
