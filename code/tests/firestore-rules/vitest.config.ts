import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['*.test.{js,ts}', '**/*.test.{js,ts}'],
    // CRITICAL: Prevent parallel execution of test files.
    // The Firestore emulator shares state globally for the project ID.
    // If multiple test files run in parallel, documents created by one test
    // can interfere with permission evaluations in another, causing flaky
    // "Null value error" or PERMISSION_DENIED failures in CI.
    fileParallelism: false,
  },
})
