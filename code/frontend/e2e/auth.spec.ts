import { test, expect } from '@playwright/test'

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
    // This test requires a real Firebase emulator running
    // Skip in CI unless emulator is available
    test.skip(!!process.env.CI, 'Requires Firebase emulator')
    await page.goto('/')
    await page.getByLabel(/correo/i).fill(process.env.E2E_USER ?? 'test@gerocare.com')
    await page.getByLabel(/contraseña/i).fill(process.env.E2E_PASS ?? 'test1234')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  })
})
