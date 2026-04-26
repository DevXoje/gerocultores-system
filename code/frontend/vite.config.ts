/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // Alias '@/' apunta a 'code/frontend/src/' usando una ruta relativa al propio vite.config.ts.
      // Esto permite imports como: import { useAuthStore } from '@/stores/useAuthStore'
      // en lugar de rutas relativas frágiles como '../../stores/useAuthStore'.
      // Ver convención en TECH_GUIDE.md §1.3.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Note: backend mounts routes at root level (see code/api/src/routes/index.ts).
        // /api/* routes are mounted by the Express router — no rewrite needed.
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path, // keep /health as-is
      },
    },
  },
  // Vitest configuration
  // environment: 'jsdom' — required for Vue component tests (window, document, etc.)
  // Unit tests (stores, use cases) also run fine in jsdom.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'e2e/**'],
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/App.vue',
        'src/views/DashboardView.vue',
        'src/views/AdminView.vue',
        'src/views/ResidentsView.vue',
        'src/views/ForbiddenView.vue',
      ],
    },
  },
})
