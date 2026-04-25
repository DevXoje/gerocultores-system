import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['*.test.{js,ts}', '**/*.test.{js,ts}'],
  },
})