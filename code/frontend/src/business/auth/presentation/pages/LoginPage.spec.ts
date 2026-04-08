import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/router/route-names'

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
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: {},
}))

// Mock useAuthStore to control its behavior in component tests
vi.mock('@/business/auth/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/business/auth/useAuthStore'
import LoginPage from './LoginPage.vue'

// Helper: create a test router
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: ROUTES.HOME.path, component: { template: '<div />' } },
      { path: ROUTES.AUTH.LOGIN.path, name: ROUTES.AUTH.LOGIN.name, component: LoginPage },
      { path: ROUTES.DASHBOARD.path, name: ROUTES.DASHBOARD.name, component: { template: '<div>Dashboard</div>' } },
    ],
  })
}

// Helper: create a mock store
function mockAuthStore(overrides: {
  isLoading?: boolean
  user?: { email: string } | null
  role?: string | null
  signIn?: ReturnType<typeof vi.fn>
  signOut?: ReturnType<typeof vi.fn>
}) {
  const defaults = {
    isLoading: false,
    user: null,
    role: null,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  }
  const store = { ...defaults, ...overrides }
  vi.mocked(useAuthStore).mockReturnValue(store as ReturnType<typeof useAuthStore>)
  return store
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ─── TC: Renders email + password inputs and submit button ────────────────

  it('should render email input, password input and submit button', () => {
    mockAuthStore({})
    const router = createTestRouter()

    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const submitButton = wrapper.find('button[type="submit"]')

    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(submitButton.exists()).toBe(true)
  })

  it('should have accessible labels for email and password fields', () => {
    mockAuthStore({})
    const router = createTestRouter()

    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    const labels = wrapper.findAll('label')
    expect(labels.length).toBeGreaterThanOrEqual(2)
  })

  // ─── TC: Calls store.signIn with correct credentials on submit ────────────

  it('should call store.signIn with email and password on form submit', async () => {
    const signInMock = vi.fn().mockResolvedValue(undefined)
    mockAuthStore({ signIn: signInMock })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    await wrapper.find('input[type="email"]').setValue('test.gerocultor@example.com')
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')

    expect(signInMock).toHaveBeenCalledWith('test.gerocultor@example.com', 'Test1234!')
  })

  // ─── TC: Shows error message when login fails ─────────────────────────────

  it('should show generic error message when signIn fails', async () => {
    const signInMock = vi.fn().mockRejectedValue(
      Object.assign(new Error('auth/wrong-password'), { code: 'auth/wrong-password' })
    )
    mockAuthStore({ signIn: signInMock })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for async rejection to be handled
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
    mockAuthStore({ isLoading: true })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should show a loading indicator while isLoading is true', () => {
    mockAuthStore({ isLoading: true })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    // Either a spinner element or loading text must be visible
    const hasSpinner = wrapper.find('[data-testid="loading-spinner"]').exists()
    const hasLoadingText = wrapper.text().toLowerCase().includes('cargando') ||
      wrapper.text().toLowerCase().includes('loading')

    expect(hasSpinner || hasLoadingText).toBe(true)
  })

  it('should enable submit button when isLoading is false', () => {
    mockAuthStore({ isLoading: false })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  // ─── TC: Redirects to /dashboard on success ───────────────────────────────

  it('should redirect to /dashboard on successful login', async () => {
    const router = createTestRouter()
    await router.push(ROUTES.AUTH.LOGIN.path)
    await router.isReady()

    const signInMock = vi.fn().mockResolvedValue(undefined)
    mockAuthStore({ signIn: signInMock })

    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for all pending promises (async signIn + router.push) to resolve
    await flushPromises()

    expect(router.currentRoute.value.path).toBe(ROUTES.DASHBOARD.path)
  })

  // ─── TC: Does not submit when fields are empty ────────────────────────────

  it('should not call store.signIn when email is empty', async () => {
    const signInMock = vi.fn()
    mockAuthStore({ signIn: signInMock })

    const router = createTestRouter()
    const wrapper = mount(LoginPage, {
      global: { plugins: [createPinia(), router] },
    })

    // Only fill password, leave email empty
    await wrapper.find('input[type="password"]').setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(signInMock).not.toHaveBeenCalled()
  })
})
