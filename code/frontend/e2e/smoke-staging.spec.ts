import { test, expect } from '@playwright/test'

/**
 * Smoke test — runs against a deployed staging/preview URL.
 *
 * Expected env vars:
 *   PLAYWRIGHT_TEST_BASE_URL   — the deployed preview URL (default: localhost)
 *
 * This test verifies the deployed app is reachable and renders the login page.
 * It does NOT require authentication — it only checks that the page loads
 * without errors and the login UI is visible.
 *
 * Reference: DT-07 smoke test automatizado post-deploy en CI
 */
test.describe('Smoke — Staging Deploy', () => {
  test('login page loads without errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // 1. The app is reachable
    const response = await page.goto('/', { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(400)

    // 2. Login heading is visible
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible({ timeout: 10_000 })

    // 3. No console errors after page load
    const realErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR'),
    )
    expect(realErrors).toHaveLength(0)
  })
})