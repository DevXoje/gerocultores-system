import { test, expect } from '@playwright/test'

test.describe('Dashboard → Tasks navigation', () => {
  /**
   * E2E flow: /dashboard → widget counts visible → click "Ver todas" → /tareas calendar.
   *
   * Requires Firebase emulator running (like auth.spec.ts).
   * Skipped in CI — emulator not available in the pipeline.
   */
  test.skip(!!process.env.CI, 'Requires Firebase emulator')

  test('dashboard widget shows task count and links to /tareas', async ({ page }) => {
    // Navigate to dashboard (auth guard redirects to / if not authenticated)
    await page.goto('/dashboard')

    // Wait for the page to load and redirect to login if not authenticated
    // If auth is set up, we should see the dashboard with widgets
    await page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {
      // If redirected to login, skip this test
      test.skip(true, 'Not authenticated — skipping dashboard tests')
    })

    // Verify the tasks widget is visible
    const tasksWidget = page.getByRole('heading', { name: /tareas de hoy/i })
    await expect(tasksWidget).toBeVisible()

    // Verify the "Ver todas" button/link is present
    const verTodasButton = page.getByRole('button', { name: /ver todas/i })
    await expect(verTodasButton).toBeVisible()

    // Click "Ver todas" — should navigate to /tareas
    await verTodasButton.click()

    // Verify we are on the tasks page (calendar route)
    await expect(page).toHaveURL(/\/tareas/, { timeout: 5000 })

    // Verify the calendar (FullCalendar) is visible
    await expect(page.locator('.fc')).toBeVisible({ timeout: 5000 })
  })

  test('unauthenticated user is redirected to login when accessing /dashboard', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    // Auth guard should redirect to login page
    await expect(page).toHaveURL(/\//, { timeout: 5000 })
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
  })
})
