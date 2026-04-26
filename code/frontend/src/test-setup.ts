/**
 * Global Vitest setup file — loaded before any test module is evaluated.
 *
 * Sets VITE_API_URL so apiClient.ts doesn't throw at import time.
 * Using define in vite.config.ts doesn't work for module-level env reads
 * (import.meta.env is evaluated before any test code runs).
 */
process.env.VITE_API_URL = 'http://localhost:3000'
