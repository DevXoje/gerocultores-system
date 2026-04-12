import { defineConfig, devices } from '@playwright/test'

// PLAYWRIGHT_TEST_BASE_URL is the convention used in the official Playwright CI docs.
// See: https://playwright.dev/docs/ci — "On deployment" section.
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:4173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
