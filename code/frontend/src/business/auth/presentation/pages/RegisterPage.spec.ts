import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/router/route-names'
import { useAuthStore } from '@/business/auth/useAuthStore'

// Polyfill Temporal API for jsdom test environment
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

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: {},
  googleProvider: {},
}))

// Mock global fetch
vi.stubGlobal('fetch', vi.fn())

import RegisterPage from './RegisterPage.vue'

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: ROUTES.HOME.path, component: { template: '<div />' } },
      {
        path: ROUTES.AUTH.LOGIN.path,
        name: ROUTES.AUTH.LOGIN.name,
        component: { template: '<div>Login</div>' },
      },
      { path: ROUTES.AUTH.REGISTER.path, name: ROUTES.AUTH.REGISTER.name, component: RegisterPage },
      {
        path: ROUTES.DASHBOARD.path,
        name: ROUTES.DASHBOARD.name,
        component: { template: '<div>Dashboard</div>' },
      },
    ],
  })
}

function createTestPinia(initialState?: { auth?: { isLoading?: boolean } }) {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState,
  })
  const store = useAuthStore(pinia)
  store.signIn = vi.fn().mockResolvedValue(undefined)
  store.signOut = vi.fn().mockResolvedValue(undefined)
  return { pinia, store }
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── TC: Renders form elements ─────────────────────────────────────────────

  it('should render email, password, confirm-password inputs and submit button', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="password"]')).toHaveLength(2)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should render Google OAuth button', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.find('[data-testid="google-submit-button"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Continuar con Google')
  })

  // ─── TC: Calls handleEmailPasswordSubmit on form submit ───────────────────

  it('should call firebase createUserWithEmailAndPassword on form submit', async () => {
    const { pinia } = createTestPinia()
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const { fetch: fetchMock } = globalThis

    ;(createUserWithEmailAndPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { uid: 'uid-1', getIdToken: vi.fn().mockResolvedValue('id-token') },
    })
    ;(updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(fetchMock as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) })

    const router = createTestRouter()
    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.findAll('input[type="password"]')[0].setValue('Test1234!')
    await wrapper.findAll('input[type="password"]')[1].setValue('Test1234!')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()

    expect(createUserWithEmailAndPassword).toHaveBeenCalled()
  })

  // ─── TC: Does not submit when fields are empty ───────────────────────────

  it('should not call createUser when any required field is empty', async () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()
    const { createUserWithEmailAndPassword } = await import('firebase/auth')

    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    // Only fill email, leave passwords empty
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')

    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  // ─── TC: Password mismatch shows error ───────────────────────────────────

  it('should show error when passwords do not match', async () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.findAll('input[type="password"]')[0].setValue('Password123!')
    await wrapper.findAll('input[type="password"]')[1].setValue('DifferentPass!')
    await wrapper.find('form').trigger('submit.prevent')

    const errorEl = wrapper.find('[data-testid="error-message"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toMatch(/coinciden/i)
  })

  // ─── TC: Error message displayed when registration fails ─────────────────

  it('should show error message when registration fails', async () => {
    const { pinia } = createTestPinia()
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const authError = Object.assign(new Error('auth/email-already-in-use'), {
      code: 'auth/email-already-in-use',
    })
    ;(createUserWithEmailAndPassword as ReturnType<typeof vi.fn>).mockRejectedValue(authError)

    const router = createTestRouter()
    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('taken@example.com')
    await wrapper.findAll('input[type="password"]')[0].setValue('Password123!')
    await wrapper.findAll('input[type="password"]')[1].setValue('Password123!')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()

    const errorEl = wrapper.find('[data-testid="error-message"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toMatch(/correo/i)
  })

  // ─── TC: Loading state ─────────────────────────────────────────────────────
  // isLoading is derived from composable state (creating|setting-claims|signing-in).

  it('should show loading indicator during registration flow', async () => {
    const { pinia } = createTestPinia()
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const { fetch: fetchMock } = globalThis

    // Never resolve createUser — keeps the composable in 'creating' state
    ;(createUserWithEmailAndPassword as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) as unknown as ReturnType<typeof vi.fn>
    )
    ;(fetchMock as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) as ReturnType<typeof vi.fn>
    )

    const router = createTestRouter()
    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.findAll('input[type="password"]')[0].setValue('Password123!')
    await wrapper.findAll('input[type="password"]')[1].setValue('Password123!')
    wrapper.find('form').trigger('submit.prevent')

    await flushPromises()

    // During 'creating' state, a loading indicator should be visible
    const hasSpinner = wrapper.find('[data-testid="loading-spinner"]').exists()
    const hasLoadingText = wrapper.text().toLowerCase().includes('cargando')

    expect(hasSpinner || hasLoadingText).toBe(true)
  })

  it('should disable form buttons during registration', async () => {
    const { pinia } = createTestPinia()
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const { fetch: fetchMock } = globalThis

    ;(createUserWithEmailAndPassword as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) as unknown as ReturnType<typeof vi.fn>
    )
    ;(fetchMock as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) as ReturnType<typeof vi.fn>
    )

    const router = createTestRouter()
    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.findAll('input[type="password"]')[0].setValue('Password123!')
    await wrapper.findAll('input[type="password"]')[1].setValue('Password123!')
    wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Both buttons should be disabled during registration
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(
      wrapper.find('[data-testid="google-submit-button"]').attributes('disabled')
    ).toBeDefined()
  })

  // ─── TC: Link to login page ─────────────────────────────────────────────

  it('should have a link to the login page', () => {
    const { pinia } = createTestPinia()
    const router = createTestRouter()

    const wrapper = mount(RegisterPage, {
      global: { plugins: [pinia, router] },
    })

    const loginLink = wrapper.find('.register-card__login-link-text')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.element.tagName).toBe('A')
    expect(loginLink.text()).toMatch(/inicia sesión/i)
  })
})
