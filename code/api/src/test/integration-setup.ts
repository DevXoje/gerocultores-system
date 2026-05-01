/**
 * integration-setup.ts — Global setup for Firebase Emulator integration tests.
 *
 * This file is loaded by vitest BEFORE any test module is imported.
 * It ensures the Firebase emulator environment variables are set before
 * firebase-admin initialises its default app via firebase.ts.
 */

// Default to standard emulator ports. Override via env if needed.
process.env['FIREBASE_PROJECT_ID'] ??= 'gero-care'
process.env['FIRESTORE_EMULATOR_HOST'] ??= 'localhost:8080'
process.env['FIREBASE_AUTH_EMULATOR_HOST'] ??= 'localhost:9099'
