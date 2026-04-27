/**
 * vitest.integration.config.ts — Vitest config for Firebase Emulator integration tests.
 *
 * Run with: npx vitest run --config vitest.integration.config.ts
 *
 * Requires the Firebase Emulator to be running:
 *   firebase emulators:start --only auth,firestore --project gero-care
 *
 * Or via emulators:exec:
 *   firebase emulators:exec --only auth,firestore --project gero-care \
 *     "cd code/api && npx vitest run --config vitest.integration.config.ts"
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.integration.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    // setupFiles runs in the worker before any test module is loaded.
    // This ensures FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST
    // are set before firebase-admin initialises the default app.
    setupFiles: ['src/test/integration-setup.ts'],
    // Integration tests hit real network (emulator) — increase timeout
    testTimeout: 15000,
    // Run integration tests sequentially to avoid emulator race conditions
    pool: 'forks',
    singleFork: true,
  },
})
