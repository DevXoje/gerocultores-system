/**
 * DT-02 — Router navigation guard integration tests
 *
 * US-02: Control de acceso por rol
 *
 * Tests that the Vue Router instance wires up the auth guard correctly and
 * that end-to-end navigation produces the expected redirects.
 *
 * Strategy:
 *   - We do NOT instantiate the production router (it uses createWebHistory
 *     which requires a real browser environment and real Firebase).
 *   - Instead we build a minimal test router that replicates the guard setup,
 *     then drive navigation with @vue/test-utils RouterLinkStub-free helpers.
 *   - Firebase Auth and useAuthStore are fully mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent } from 'vue'

// ─── Firebase mocks (must precede all @/... imports) ─────────────────────────

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

// ─── Subject-level imports (after mocks) ──────────────────────────────────────

import { createAuthGuard } from '@/business/auth/presentation/composables/useAuthGuard'
import { useAuthStore } from '@/business/auth/useAuthStore'
import type { User } from 'firebase/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Stub = defineComponent({ template: '<div />' })

/** Build a self-contained test router with the same guard wiring as router.ts */
function makeTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/login' },
      {
        path: '/login',
        name: 'login',
        component: Stub,
        meta: { requiresAuth: false },
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Stub,
        meta: { requiresAuth: true },
      },
    ],
  })

  router.beforeEach(createAuthGuard())

  return router
}

/** Minimal mock user — only uid/email needed for store presence check */
function makeMockUser(): User {
  return {
    uid: 'uid-001',
    email: 'worker@example.com',
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    getIdTokenResult: vi.fn(),
    getIdToken: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn().mockReturnValue({}),
  } as unknown as User
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('Router navigation guards (DT-02)', () => {
  let router: ReturnType<typeof makeTestRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    router = makeTestRouter()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Guard is registered on the router
  // ──────────────────────────────────────────────────────────────────────────

  it('registers a beforeEach guard (guard list is non-empty)', () => {
    // Vue Router does not expose the guard list publicly; we validate indirectly
    // by confirming that navigation to a protected route is intercepted.
    // This test drives the router and checks the redirect behaviour.
    const store = useAuthStore()
    store.user = null

    // isReady() resolves once initial navigation completes
    return router.push('/dashboard').then(() => {
      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Unauthenticated → protected route → redirect to /login
  // ──────────────────────────────────────────────────────────────────────────

  describe('unauthenticated user', () => {
    it('is redirected to login when navigating to a protected route', async () => {
      const store = useAuthStore()
      store.user = null

      await router.push('/dashboard')

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('can access the login route directly', async () => {
      const store = useAuthStore()
      store.user = null

      await router.push('/login')

      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Authenticated → protected route → allowed through
  // ──────────────────────────────────────────────────────────────────────────

  describe('authenticated user', () => {
    it('reaches the dashboard when authenticated', async () => {
      const store = useAuthStore()
      store.user = makeMockUser()

      await router.push('/dashboard')

      expect(router.currentRoute.value.name).toBe('dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('can still access the login route when authenticated', async () => {
      const store = useAuthStore()
      store.user = makeMockUser()

      await router.push('/login')

      // The guard does not redirect authenticated users away from login
      // (no "already logged in" redirect implemented yet in createAuthGuard)
      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Guard calls createAuthGuard (structural test)
  // ──────────────────────────────────────────────────────────────────────────

  it('createAuthGuard is the guard factory wired into beforeEach', async () => {
    // Verify the factory returns a function (NavigationGuard)
    const guard = createAuthGuard()
    expect(typeof guard).toBe('function')
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Root / redirect lands on login
  // ──────────────────────────────────────────────────────────────────────────

  it('navigating to / redirects to login for unauthenticated user', async () => {
    const store = useAuthStore()
    store.user = null

    await router.push('/')

    expect(router.currentRoute.value.name).toBe('login')
  })
})
