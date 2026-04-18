import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // RESOLUTION(merge/2026-04-18): kept seeds/**/*.spec.ts from develop (added with US-03 seed tests).
    // hooks branch had older version without seeds inclusion. develop version is correct.
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'seeds/**/*.spec.ts', 'seeds/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
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
