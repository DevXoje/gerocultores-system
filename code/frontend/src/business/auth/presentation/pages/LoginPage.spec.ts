import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/router/route-names'
import { useAuthStore } from '@/business/auth/useAuthStore'

// Polyfill Temporal API for jsdom test environment (not yet available in Node jsdom)
if (typeof globalThis.Temporal === 'undefined') {
  Object.defineProperty(globalThis, 'Temporal', {
    value: {
      Now: {
        plainDateISO: () => ({ year: new Date().getFullYear() }),
      },
    },
    configurable: true,
  })
}

// Mock firebase/auth before any imports that depend on it
const mockSignInWithEmailAndPassword = vi.fn()
const mockSignInWithRedirect = vi.fn()

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signInWithRedirect: (...args: unknown[]) => mockSignInWithRedirect(...args),
  getRedirectResult: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('@/infrastructure/firebase/firebase', () => ({
  auth: {},
  googleProvider: {},
}))

import LoginPage from './LoginPage.vue'

// Helper: create a test router
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: ROUTES.HOME.path, component: { template: '<div />' } },
      { path: ROUTES.AUTH.LOGIN.path, name: ROUTES.AUTH.LOGIN.name, component: LoginPage },
      {
        path: ROUTES.AUTH.REGISTER.path,
        name: ROUTES.AUTH.REGISTER.name,
        component: { template: '<div>Register</div>' },
      },
      {
        path: ROUTES.DASHBOARD.path,
        name: ROUTES.DASHBOARD.name,
        component: { template: '<div>Dashboard</div>' },
      },
    ],
  })
}

/**
 * Creates a testing pinia and returns the auth store with actions stubbed.
 * setUser and setRoleFromUser are the composable-facing store methods.
 */
function createTestPinia(initialState?: { auth?: { isLoading?: boolean } }) {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState,
  })
  const store = useAuthStore(pinia)
  store.setUser = vi.fn()
  store.setRoleFromUser = vi.fn().mockResolvedValue(undefined)
  return { pinia, store }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── TC: Renders email + password inputs and submit button ────────────────

  it('should render email input, password input and submit button', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const submitButton = wrapper.find('button[type="submit"]')

    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(submitButton.exists()).toBe(true)
  })

  it('should have accessible labels for email and password fields', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const labels = wrapper.findAll('label')
    expect(labels.length).toBeGreaterThanOrEqual(2)
  })

  // ─── TC: Calls signInWithEmailAndPassword and updates store on form submit ─

  it('should call signInWithEmailAndPassword and update store on form submit', async () => {
    const { pinia, store } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: 'test@example.com', uid: 'uid-1' },
    })

    await wrapper.find('input[type="email"]').setValue('test.gerocultor@example.com')
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test.gerocultor@example.com',
      'Test1234!'
    )
    expect(store.setUser).toHaveBeenCalled()
  })

  // ─── TC: Shows error message when login fails ─────────────────────────────

  it('should show generic error message when email+password sign-in fails', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(
      Object.assign(new Error('auth/wrong-password'), { code: 'auth/wrong-password' })
    )
    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const errorEl = wrapper.find('[data-testid="error-message"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toBeTruthy()

    // Error message must NOT reveal which field failed (TC-04, TC-05)
    expect(errorEl.text().toLowerCase()).not.toContain('email')
    expect(errorEl.text().toLowerCase()).not.toContain('contraseña')
    expect(errorEl.text().toLowerCase()).not.toContain('password')
  })

  // ─── TC: Shows loading indicator while isLoading is true ─────────────────

  it('should disable submit button while isLoading is true', () => {
    const { pinia } = createTestPinia({ auth: { isLoading: true } })
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should show a loading indicator while isLoading is true', () => {
    const { pinia } = createTestPinia({ auth: { isLoading: true } })
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const hasSpinner = wrapper.find('[data-testid="loading-spinner"]').exists()
    const hasLoadingText =
      wrapper.text().toLowerCase().includes('cargando') ||
      wrapper.text().toLowerCase().includes('loading')

    expect(hasSpinner || hasLoadingText).toBe(true)
  })

  it('should enable submit button when isLoading is false', () => {
    const { pinia } = createTestPinia({ auth: { isLoading: false } })
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  // ─── TC: Redirects to /dashboard on success ───────────────────────────────

  it('should redirect to /dashboard after successful email+password login', async () => {
    const router = createTestRouter()
    await router.push(ROUTES.AUTH.LOGIN.path)
    await router.isReady()

    const { pinia, store } = createTestPinia()
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: 'test@example.com', uid: 'uid-1' },
    })

    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(store.setUser).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe(ROUTES.DASHBOARD.path)
  })

  // ─── TC: Does not submit when fields are empty ────────────────────────────

  it('should not call signInWithEmailAndPassword when email is empty', async () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    // Only fill password, leave email empty
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled()
  })

  // ─── Google OAuth sign-in ──────────────────────────────────────────────────

  it('should render Google sign-in button', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    const googleBtn = wrapper.find('[data-testid="google-button"]')
    expect(googleBtn.exists()).toBe(true)
  })

  it('should call signInWithRedirect on Google button click', async () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    mockSignInWithRedirect.mockRejectedValueOnce(new Error('AUTH_REDIRECT_INITIATED'))

    await wrapper.find('[data-testid="google-button"]').trigger('click')
    await flushPromises()

    expect(mockSignInWithRedirect).toHaveBeenCalled()
  })

  it('should not redirect immediately after Google redirect is initiated', async () => {
    const router = createTestRouter()
    await router.push(ROUTES.AUTH.LOGIN.path)
    await router.isReady()

    const { pinia } = createTestPinia()
    mockSignInWithRedirect.mockRejectedValueOnce(new Error('AUTH_REDIRECT_INITIATED'))

    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('[data-testid="google-button"]').trigger('click')
    await flushPromises()

    // User stays on login page while redirect is in flight
    expect(router.currentRoute.value.path).toBe(ROUTES.AUTH.LOGIN.path)
  })

  it('should show generic error when Google sign-in fails', async () => {
    mockSignInWithRedirect.mockRejectedValueOnce(
      Object.assign(new Error('auth/popup-closed-by-user'), { code: 'auth/popup-closed-by-user' })
    )

    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('[data-testid="google-button"]').trigger('click')
    await flushPromises()

    const errorEl = wrapper.find('[data-testid="error-message"]')
    expect(errorEl.exists()).toBe(true)
  })
})
