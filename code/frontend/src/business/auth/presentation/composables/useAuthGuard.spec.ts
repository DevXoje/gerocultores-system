/**
 * DT-01 — useAuthGuard unit tests
 *
 * US-02: Control de acceso por rol
 *
 * Tests the createAuthGuard() navigation guard factory, which protects routes
 * based on meta.requiresAuth and (if present) meta.requiresRole.
 *
 * Architecture note:
 *   - createAuthGuard() is a plain function returning a NavigationGuard.
 *   - It reads state from useAuthStore() — mocked via Pinia.
 *   - No Firebase is touched here; useAuthStore is fully mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Firebase must be mocked before anything that transitively imports it.
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

// ─── Subject under test ───────────────────────────────────────────────────────

import { createAuthGuard } from './useAuthGuard'
import { useAuthStore } from '@/business/auth/useAuthStore'
import type { User } from 'firebase/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal RouteLocationNormalized stub.
 * Only `meta` and `name` are used by the guard.
 */
function makeRoute(
  meta: Record<string, unknown>,
  name = 'some-route',
): RouteLocationNormalized {
  return {
    name,
    path: `/${String(name)}`,
    fullPath: `/${String(name)}`,
    hash: '',
    query: {},
    params: {},
    matched: [],
    redirectedFrom: undefined,
    meta,
  } as unknown as RouteLocationNormalized
}

/**
 * Minimal Firebase User stub — only fields that might be accessed during
 * a guard invocation need real values. All others are stubs.
 */
function makeMockUser(overrides: Partial<User> = {}): User {
  return {
    uid: 'uid-test',
    email: 'test@example.com',
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
    ...overrides,
  } as unknown as User
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('createAuthGuard (DT-01)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Public routes — guard should never block access
  // ──────────────────────────────────────────────────────────────────────────

  describe('public routes (requiresAuth: false)', () => {
    it('allows unauthenticated user to access public route', () => {
      const store = useAuthStore()
      store.user = null

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: false }, 'login')
      const result = guard(to, makeRoute({}), vi.fn())

      expect(result).toBeUndefined()
    })

    it('allows authenticated user to access public route', () => {
      const store = useAuthStore()
      store.user = makeMockUser()

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: false }, 'login')
      const result = guard(to, makeRoute({}), vi.fn())

      expect(result).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Protected routes — unauthenticated user is redirected to login
  // ──────────────────────────────────────────────────────────────────────────

  describe('protected routes (requiresAuth: true)', () => {
    it('redirects unauthenticated user to login when accessing a protected route', () => {
      const store = useAuthStore()
      store.user = null

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: true }, 'dashboard')
      const result = guard(to, makeRoute({}), vi.fn())

      // Guard must return a route location pointing to login
      expect(result).toEqual({ name: 'login' })
    })

    it('allows authenticated user through a protected route', () => {
      const store = useAuthStore()
      store.user = makeMockUser()

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: true }, 'dashboard')
      const result = guard(to, makeRoute({}), vi.fn())

      // No redirect — guard returns undefined (allow navigation)
      expect(result).toBeUndefined()
    })

    it('allows authenticated admin user through a protected route', () => {
      const store = useAuthStore()
      store.user = makeMockUser()
      store.role = 'admin'

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: true }, 'dashboard')
      const result = guard(to, makeRoute({}), vi.fn())

      expect(result).toBeUndefined()
    })

    it('allows authenticated gerocultor user through a protected route', () => {
      const store = useAuthStore()
      store.user = makeMockUser()
      store.role = 'gerocultor'

      const guard = createAuthGuard()
      const to = makeRoute({ requiresAuth: true }, 'dashboard')
      const result = guard(to, makeRoute({}), vi.fn())

      expect(result).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Role-gated routes (requiresRole — future extension)
  //    The guard currently protects by auth only. These tests document the
  //    expected behaviour so that when requiresRole is added they serve as
  //    a RED suite to drive the implementation.
  //
  //    Right now: a gerocultor CAN reach an admin-only route because the guard
  //    doesn't check requiresRole yet. The TODO tests are skipped until the
  //    guard is extended.
  // ──────────────────────────────────────────────────────────────────────────

  describe('role-gated routes (requiresRole)', () => {
    it.todo(
      'blocks gerocultor from accessing an admin-only route (requiresRole: "admin")',
    )

    it.todo(
      'allows admin to access an admin-only route (requiresRole: "admin")',
    )

    it.todo(
      'allows gerocultor to access a gerocultor route (requiresRole: "gerocultor")',
    )
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Routes without explicit meta — guard should allow through
  // ──────────────────────────────────────────────────────────────────────────

  describe('routes without requiresAuth meta', () => {
    it('allows navigation when meta.requiresAuth is undefined (no auth requirement set)', () => {
      const store = useAuthStore()
      store.user = null

      const guard = createAuthGuard()
      // No requiresAuth key in meta — not explicitly protected
      const to = makeRoute({}, 'some-unlisted-route')
      const result = guard(to, makeRoute({}), vi.fn())

      expect(result).toBeUndefined()
    })
  })
})
