/**
 * admin-residentes.spec.ts — Playwright E2E tests for US-09: Alta y gestión de residentes.
 *
 * TC-01: Admin creates resident with required fields
 * TC-04: Admin archives resident
 * TC-08: Gerocultor cannot access create route
 *
 * Note: TC-01 and TC-04 require Firebase Emulator running (auth + firestore).
 * These tests are skipped in CI unless emulator is available.
 * TC-08 (route guard) runs without emulator.
 *
 * Required env vars for emulator tests:
 *   PLAYWRIGHT_TEST_BASE_URL    — defaults to http://localhost:4173
 *   E2E_ADMIN_EMAIL             — admin test account email
 *   E2E_ADMIN_PASS              — admin test account password
 *   E2E_GERO_EMAIL              — gerocultor test account email
 *   E2E_GERO_PASS               — gerocultor test account password
 *
 * Required for emulator connection (set in playwright.config.ts webServer.env):
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
 *   VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
 *   VITE_USE_EMULATOR="true"
 */
import { test, expect } from '@playwright/test'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Parameters<typeof loginAsAdmin>[0]): Promise<void> {
  await page.goto('/')
  const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@gerocare.com'
  const password = process.env.E2E_ADMIN_PASS ?? 'Test1234!'
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
}

async function loginAsGerocultor(page: Parameters<typeof loginAsGerocultor>[0]): Promise<void> {
  await page.goto('/')
  const email = process.env.E2E_GERO_EMAIL ?? 'gero@gerocare.com'
  const password = process.env.E2E_GERO_PASS ?? 'Test1234!'
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
}

// ─── TC-01 ────────────────────────────────────────────────────────────────────

test.describe('TC-01: Admin creates resident with required fields', () => {
  test.beforeEach(async ({ page }) => {
    // Requires emulator — skip in CI unless VITE_USE_EMULATOR is set
    test.skip(!!process.env.CI && !process.env.VITE_USE_EMULATOR, 'Requires Firebase Emulator')
    await loginAsAdmin(page)
  })

  test('creates residente and redirects to resident list', async ({ page }) => {
    await page.goto('/admin/residentes/nuevo')

    // Fill required fields using form element ids from ResidenteForm.vue
    await page.fill('#rf-nombre', 'María')
    await page.fill('#rf-apellidos', 'García López')
    await page.fill('#rf-fecha', '1955-03-15')
    await page.fill('#rf-habitacion', '201-A')

    // Submit — button is enabled only when form is valid
    const submitBtn = page.locator('.residente-form__submit-btn')
    await expect(submitBtn).toBeEnabled()

    await submitBtn.click()

    // On success → navigates to /admin/residents
    await expect(page).toHaveURL(/\/admin\/residents/, { timeout: 8000 })

    // New resident appears in the list
    await expect(page.getByText('María')).toBeVisible()
    await expect(page.getByText('García López')).toBeVisible()
  })

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/admin/residentes/nuevo')

    // Submit without filling any fields
    await page.locator('.residente-form__submit-btn').click()

    // Validation errors appear
    await expect(page.getByText(/el nombre es requerido/i)).toBeVisible()
    await expect(page.getByText(/los apellidos son requeridos/i)).toBeVisible()
    await expect(page.getByText(/la habitación es requerida/i)).toBeVisible()
  })
})

// ─── TC-04 ────────────────────────────────────────────────────────────────────

test.describe('TC-04: Admin archives residente', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!!process.env.CI && !process.env.VITE_USE_EMULATOR, 'Requires Firebase Emulator')
    await loginAsAdmin(page)
  })

  test('archive button sets archivado: true and shows badge', async ({ page }) => {
    // Navigate to admin resident list (emulator must have seeded data res-001)
    await page.goto('/admin/residents')

    // Wait for list to load
    await expect(page.getByRole('heading', { name: /gestión de residentes/i })).toBeVisible()

    // Click archive on the first resident row
    const firstArchiveBtn = page.locator('.residente-list__archive-btn').first()
    await firstArchiveBtn.click()

    // Confirm in dialog (if confirmation dialog is shown)
    const confirmBtn = page.locator('[data-testid="btn-confirmar-archivar"]')
    if (await confirmBtn.isVisible({ timeout: 500 })) {
      await confirmBtn.click()
    }

    // Verify archived badge appears
    await expect(page.locator('.residente-list__badge--archivado').first()).toBeVisible({
      timeout: 5000,
    })
  })
})

// ─── TC-08 ────────────────────────────────────────────────────────────────────

test.describe('TC-08: Gerocultor cannot access create residente route', () => {
  test('gerocultor redirected to /dashboard or /agenda when navigating to /admin/residentes/nuevo', async ({
    page,
  }) => {
    await loginAsGerocultor(page)

    // Attempt to navigate directly to create route
    await page.goto('/admin/residentes/nuevo')

    // Router guard redirects away — verify NOT on the create form
    await expect(page).not.toHaveURL(/\/admin\/residentes\/nuevo/)

    // Should land on dashboard or agenda
    await expect(page).toHaveURL(/\/(dashboard|agenda)/, { timeout: 5000 })
  })
})

// ─── TC-02 ────────────────────────────────────────────────────────────────────

test.describe('TC-02: Validation — required field missing', () => {
  test('shows error on habitacion when empty and submit attempted', async ({ page }) => {
    test.skip(!!process.env.CI && !process.env.VITE_USE_EMULATOR, 'Requires Firebase Emulator')
    await loginAsAdmin(page)

    await page.goto('/admin/residentes/nuevo')

    // Fill only nombre and try to submit
    await page.fill('#rf-nombre', 'Ana')
    await page.locator('.residente-form__submit-btn').click()

    // The form should still be visible (not submitted)
    await expect(page.locator('#rf-habitacion')).toBeVisible()
    // Error should be shown for empty required fields
    await expect(page.getByText(/la habitación es requerida/i)).toBeVisible()
  })
})
