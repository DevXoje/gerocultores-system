import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'seeds/**/*.spec.ts', 'seeds/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**', 'src/**/*.integration.spec.ts', 'src/**/*.integration.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/server.ts',
        'src/types/**',
      ],
    },
  },
})
