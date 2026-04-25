import { test, expect } from '@playwright/test'

/**
 * E2E: Auth — Login flow
 *
 * US-01: Inicio de sesión
 *
 * Credentials are supplied via env vars — never hardcoded in source.
 * Set E2E_USER and E2E_PASS in .env.local or CI secrets.
 */

const E2E_USER = process.env.E2E_USER ?? ''
const E2E_PASS = process.env.E2E_PASS ?? ''

const hasCredentials = E2E_USER.length > 0 && E2E_PASS.length > 0

test.describe('Auth — Login flow', () => {
  test('shows login page on root route', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/correo/i).fill('bad@email.com')
    await page.getByLabel(/contraseña/i).fill('wrongpassword')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 })
  })

  test('redirects to dashboard on valid login', async ({ page }) => {
    test.skip(!hasCredentials, 'E2E_USER / E2E_PASS not set — skipping authenticated flow')
    await page.goto('/')
    await page.getByLabel(/correo/i).fill(E2E_USER)
    await page.getByLabel(/contraseña/i).fill(E2E_PASS)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  })
})
