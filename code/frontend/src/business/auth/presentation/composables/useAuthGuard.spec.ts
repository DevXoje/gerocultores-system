/**
 * useAuthGuard.spec.ts
 *
 * TDD RED: Describe el comportamiento esperado del auth guard.
 * El guard debe redirigir dinámicamente según el estado de auth:
 *   - Usuario autenticado en / → /app/dashboard
 *   - Usuario NO autenticado en ruta protegida → /login
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import { DASHBOARD_ROUTES } from '@/business/dashboard/route-names'
import { TASKS_ROUTES } from '@/views/route-names'

// --- Firebase Auth mock ---
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signOut: vi.fn(),
  onIdTokenChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('@/infrastructure/firebase/firebase', () => ({
  auth: { currentUser: null },
}))

import { onIdTokenChanged } from 'firebase/auth'

// Import AFTER vi.mock blocks so the module is real
import { createAuthGuard, resetAuthInitialized } from './useAuthGuard'

function makeMockUser(email = 'test@example.com') {
  const mockIdTokenResult = {
    authTime: '2026-01-01T00:00:00Z',
    expirationTime: '2026-01-01T01:00:00Z',
    issuedAtTime: '2026-01-01T00:00:00Z',
    signInProvider: 'google.com',
    signInSecondFactor: null,
    token: 'mock-id-token',
    claims: { role: 'gerocultor' },
  }
  return {
    uid: 'uid-123',
    email,
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'google.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    getIdTokenResult: vi.fn().mockResolvedValue(mockIdTokenResult),
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    delete: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn().mockReturnValue({}),
  }
}

function buildRouter(withRoot = false): Router {
  return createRouter({
    history: createMemoryHistory('/'),
    routes: [
      ...(withRoot ? [{ path: '/', redirect: '/' }] : []),
      {
        path: '/login',
        name: AUTH_ROUTES.LOGIN.name,
        component: { template: '<div>Login</div>' },
        meta: { requiresAuth: false },
      },
      {
        path: '/app/tasks',
        name: TASKS_ROUTES.name,
        component: { template: '<div>Tasks</div>' },
        meta: { requiresAuth: true },
      },
      {
        path: '/app/dashboard',
        name: DASHBOARD_ROUTES.name,
        component: { template: '<div>Dashboard</div>' },
        meta: { requiresAuth: true },
      },
    ],
  })
}

describe('createAuthGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetAuthInitialized()
  })

  // ─── Root path redirect ──────────────────────────────────────────────────

  it('should redirect authenticated user from / to /app/dashboard', async () => {
    const mockUser = makeMockUser()

    // onIdTokenChanged fires immediately with the authenticated user
    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(mockUser)
      return vi.fn()
    })

    const router = buildRouter()
    router.beforeEach(createAuthGuard())
    router.push('/')

    await router.isReady()

    const snapshot = router.currentRoute.value
    expect(snapshot.name).toBe(DASHBOARD_ROUTES.name)
  })

  it('should redirect unauthenticated user from / to /login', async () => {
    // onIdTokenChanged fires with null (no session)
    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(null)
      return vi.fn()
    })

    const router = buildRouter()
    router.beforeEach(createAuthGuard())
    router.push('/')

    await router.isReady()

    const snapshot = router.currentRoute.value
    expect(snapshot.name).toBe(AUTH_ROUTES.LOGIN.name)
  })

  // ─── Protected route redirect ────────────────────────────────────────────

  it('should redirect unauthenticated user from /app/tasks to /login', async () => {
    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(null)
      return vi.fn()
    })

    const router = buildRouter()
    router.beforeEach(createAuthGuard())
    router.push('/app/tasks')

    await router.isReady()

    const snapshot = router.currentRoute.value
    expect(snapshot.name).toBe(AUTH_ROUTES.LOGIN.name)
  })

  it('should allow authenticated user to access /app/tasks', async () => {
    const mockUser = makeMockUser()

    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(mockUser)
      return vi.fn()
    })

    const router = buildRouter()
    router.beforeEach(createAuthGuard())
    router.push('/app/tasks')

    await router.isReady()

    const snapshot = router.currentRoute.value
    expect(snapshot.name).toBe(TASKS_ROUTES.name)
  })
})
