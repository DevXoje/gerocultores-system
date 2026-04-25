import { test, expect } from '@playwright/test'

/**
 * E2E: Login → Dashboard → Agenda
 *
 * US-01: Inicio de sesión
 * US-03: Consulta de agenda diaria
 *
 * Full flow: the user logs in with valid credentials, is redirected to the
 * dashboard, and sees either a task list or the empty-state message.
 *
 * Credentials are supplied via env vars — never hardcoded in source.
 * Set E2E_USER and E2E_PASS in .env.local or CI secrets.
 *
 * Template note: this is the canonical E2E template for gerocultores-system.
 * All future flows should follow this structure.
 */

const E2E_USER = process.env.E2E_USER ?? ''
const E2E_PASS = process.env.E2E_PASS ?? ''

// Guard: skip the full flow if no credentials are configured.
// Individual smoke tests (page load, invalid-credential error) run without creds.
const hasCredentials = E2E_USER.length > 0 && E2E_PASS.length > 0

test.describe('Login → Dashboard → Agenda', () => {
  test.describe.configure({ mode: 'serial' })

  // ─── Smoke: login page renders ──────────────────────────────────────────────
  test('login page loads and renders the heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
  })

  // ─── Smoke: invalid credentials show error ──────────────────────────────────
  test('shows an error alert with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('nobody@invalid.example')
    await page.getByTestId('password-input').fill('wrong-password-123')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
  })

  // ─── Full flow: login → dashboard → agenda ──────────────────────────────────
  test('logs in and reaches the dashboard with agenda section', async ({ page }) => {
    test.skip(!hasCredentials, 'E2E_USER / E2E_PASS not set — skipping authenticated flow')

    // ── Step 1: go to login
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()

    // ── Step 2: fill credentials and submit
    await page.getByTestId('email-input').fill(E2E_USER)
    await page.getByTestId('password-input').fill(E2E_PASS)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // ── Step 3: wait for redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })

    // ── Step 4: agenda section is present
    const agendaSection = page.getByRole('region', { name: /agenda de hoy/i })
    await expect(agendaSection).toBeVisible({ timeout: 10_000 })

    // ── Step 5: verify either task list or empty/error state is visible (not loading forever)
    await expect(
      page
        .locator('[aria-label="Lista de tareas"]')
        .or(page.locator('.dashboard-page__empty'))
        .or(page.locator('.dashboard-page__error'))
    ).toBeVisible({ timeout: 15_000 })

    // ── Step 6: no error-level console messages
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Re-trigger any in-flight work by waiting a beat
    await page.waitForTimeout(500)

    // Filter out known benign browser/Firebase messages
    const criticalErrors = errors.filter(
      (msg) =>
        !msg.includes('favicon') &&
        !msg.includes('net::ERR_') &&
        !msg.includes('[Violation]') &&
        !msg.includes('firebase') &&
        !msg.includes('Firebase')
    )
    expect(criticalErrors, `Unexpected console errors: ${criticalErrors.join('\n')}`).toHaveLength(
      0
    )
  })

  // ─── Idempotency: running a second login attempt lands on dashboard again ───
  test('re-visiting /login while authenticated redirects to dashboard', async ({ page }) => {
    test.skip(!hasCredentials, 'E2E_USER / E2E_PASS not set — skipping authenticated flow')

    // Login first
    await page.goto('/login')
    await page.getByTestId('email-input').fill(E2E_USER)
    await page.getByTestId('password-input').fill(E2E_PASS)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })

    // Now visit /login again — router guard should redirect back to dashboard
    await page.goto('/login')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  })
})
