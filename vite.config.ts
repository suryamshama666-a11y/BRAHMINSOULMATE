import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: { ignored: ['**/supabase/**','**/backend/**','**/database/**'] },
  },
  plugins: [
    react(),
    process.env.LOVABLE_TAGGER === '1' && componentTagger(),
    // Enable Sentry upload only in production and when explicitly requested
    (mode === 'production' && process.env.SENTRY_UPLOAD === '1' && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN) &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
  ].filter(Boolean),
  optimizeDeps: {
    include: ['react','react-dom','react-router-dom','@tanstack/react-query','lucide-react','recharts'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // SECURITY: Only generate sourcemaps in development, never in production
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],

            supabase: ['@supabase/supabase-js']
        }
      },
      plugins: [
        visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true })
      ]
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/types/**',
        'src/data/fixtures/**',
      ],
    },
  },
}));
