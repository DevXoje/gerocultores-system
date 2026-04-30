import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// --- Firebase Auth mock ---
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signOut: vi.fn(),
  onIdTokenChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}))

import {
  signOut as firebaseSignOut,
  onIdTokenChanged,
  type User,
  type IdTokenResult,
} from 'firebase/auth'
import { useAuthStore } from './useAuthStore'

function makeMockUser(email: string): User {
  const mockIdTokenResult: IdTokenResult = {
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

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ─── Initial state ──────────────────────────────────────────────────────

  it('should have null user and role on initial state', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  // ─── setUser + setRoleFromUser (composition pattern) ───────────────────

  it('should set user via setUser', () => {
    const store = useAuthStore()
    const mockUser = makeMockUser('test@example.com')
    store.setUser(mockUser)
    expect(store.user).not.toBeNull()
    expect(store.user?.email).toBe('test@example.com')
  })

  it('should set role from token claims via setRoleFromUser', async () => {
    const store = useAuthStore()
    const mockUser = makeMockUser('test@example.com')
    store.setUser(mockUser)
    await store.setRoleFromUser(mockUser)
    expect(store.role).toBe('gerocultor')
  })

  it('should set both user and role when composed (signIn flow)', async () => {
    const store = useAuthStore()
    const mockUser = makeMockUser('gerocultor@care.com')
    store.setUser(mockUser)
    await store.setRoleFromUser(mockUser)
    expect(store.user?.email).toBe('gerocultor@care.com')
    expect(store.role).toBe('gerocultor')
  })

  // ─── signOut ────────────────────────────────────────────────────────────

  it('should clear user and role on signOut', async () => {
    const mockUser = makeMockUser('test@example.com')
    vi.mocked(firebaseSignOut).mockResolvedValueOnce()

    const store = useAuthStore()
    store.setUser(mockUser)
    await store.setRoleFromUser(mockUser)
    expect(store.user).not.toBeNull()

    await store.signOut()

    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  // ─── initAuth ───────────────────────────────────────────────────────────

  it('should call onIdTokenChanged during initAuth', async () => {
    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(null)
      return vi.fn()
    })

    const store = useAuthStore()
    await store.initAuth()

    expect(onIdTokenChanged).toHaveBeenCalledOnce()
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  it('should set user and role from onIdTokenChanged when user is authenticated', async () => {
    const mockUser = makeMockUser('test@example.com')

    vi.mocked(onIdTokenChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(mockUser)
      return vi.fn()
    })

    const store = useAuthStore()
    await store.initAuth()

    expect(store.user).not.toBeNull()
    expect(store.role).toBe('gerocultor')
  })
})