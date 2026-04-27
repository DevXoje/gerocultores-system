import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// --- Firebase Auth mock ---
// Must be hoisted before any imports that use firebase/auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

// Mock the firebase service (which calls initializeApp, getAuth, etc.)
vi.mock('@/services/firebase', () => ({
  // auth.currentUser must be null so that initAuth() does NOT short-circuit
  // and instead calls onAuthStateChanged (which is what the tests verify).
  auth: { currentUser: null },
}))

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
  type IdTokenResult,
} from 'firebase/auth'
import { useAuthStore } from './useAuthStore'

// Helper: make a fully-typed mock Firebase User
// Only the fields actually accessed by useAuthStore.ts are given non-trivial values.
// All other required User fields are provided as minimal stubs so the object
// satisfies the full User interface without any type suppression.
function makeMockUser(email: string): User {
  const mockIdTokenResult: IdTokenResult = {
    authTime: '2026-01-01T00:00:00Z',
    expirationTime: '2026-01-01T01:00:00Z',
    issuedAtTime: '2026-01-01T00:00:00Z',
    signInProvider: 'password',
    signInSecondFactor: null,
    token: 'mock-id-token',
    claims: { role: 'gerocultor' },
  }

  return {
    // UserInfo fields
    uid: 'uid-123',
    email,
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
    // User fields
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    // User methods — only getIdTokenResult is called by the store
    getIdTokenResult: vi.fn().mockResolvedValue(mockIdTokenResult),
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    delete: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn().mockReturnValue({}),
  }
}

// Helper: build a fully-typed UserCredential mock.
// The store only accesses `credential.user` — the other fields are required
// by the UserCredential interface and are given their actual string-literal values.
function makeMockCredential(user: User): UserCredential {
  return {
    user,
    providerId: 'password',
    operationType: 'signIn',
  }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ─── TC: Initial state ────────────────────────────────────────────────────

  it('should have null user and role on initial state', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
    expect(store.isLoading).toBe(false)
  })

  // ─── TC: Successful login sets user and role from custom claims ───────────

  it('should set user and role on successful signIn', async () => {
    const mockUser = makeMockUser('test.gerocultor@example.com')
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(makeMockCredential(mockUser))

    const store = useAuthStore()
    await store.signIn('test.gerocultor@example.com', 'Test1234!')

    expect(store.user).not.toBeNull()
    expect(store.user?.email).toBe('test.gerocultor@example.com')
    expect(store.role).toBe('gerocultor')
  })

  // ─── TC: Failed login throws / rejects ───────────────────────────────────

  it('should throw on failed login (wrong password)', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      Object.assign(new Error('auth/wrong-password'), { code: 'auth/wrong-password' })
    )

    const store = useAuthStore()
    await expect(store.signIn('test.gerocultor@example.com', 'wrong!')).rejects.toThrow()

    // User and role remain null after failure
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  it('should throw on failed login (user not found)', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      Object.assign(new Error('auth/user-not-found'), { code: 'auth/user-not-found' })
    )

    const store = useAuthStore()
    await expect(store.signIn('noexiste@example.com', 'anything')).rejects.toThrow()

    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  // ─── TC: signOut clears user and role ────────────────────────────────────

  it('should clear user and role on signOut', async () => {
    const mockUser = makeMockUser('test.gerocultor@example.com')
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(makeMockCredential(mockUser))
    vi.mocked(firebaseSignOut).mockResolvedValueOnce()

    const store = useAuthStore()
    await store.signIn('test.gerocultor@example.com', 'Test1234!')
    expect(store.user).not.toBeNull()

    await store.signOut()

    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  // ─── TC: isLoading is true during signIn, false after ────────────────────

  it('should set isLoading=true during signIn and false after success', async () => {
    const loadingStates: boolean[] = []
    const mockUser = makeMockUser('test.gerocultor@example.com')

    const store = useAuthStore()

    // Mock captures the isLoading state mid-flight (when signIn has set it to true)
    vi.mocked(signInWithEmailAndPassword).mockImplementationOnce(async () => {
      loadingStates.push(store.isLoading)
      return makeMockCredential(mockUser)
    })

    await store.signIn('test.gerocultor@example.com', 'Test1234!')

    // After signIn completes, isLoading must be false
    expect(store.isLoading).toBe(false)
    // During the call, isLoading should have been true
    expect(loadingStates[0]).toBe(true)
  })

  it('should set isLoading=false after failed signIn', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('auth/wrong-password'))

    const store = useAuthStore()
    try {
      await store.signIn('x@x.com', 'bad')
    } catch {
      // expected
    }

    expect(store.isLoading).toBe(false)
  })

  // ─── TC: initAuth() sets up onAuthStateChanged listener ───────────────────

  it('should call onAuthStateChanged during initAuth', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      // Simulate no user (unauthenticated)
      if (typeof callback === 'function') callback(null)
      return vi.fn() // unsubscribe function
    })

    const store = useAuthStore()
    await store.initAuth()

    expect(onAuthStateChanged).toHaveBeenCalledOnce()
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  it('should set user and role from onAuthStateChanged when user is authenticated', async () => {
    const mockUser = makeMockUser('test.gerocultor@example.com')

    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      // mockUser satisfies User fully — no cast needed
      if (typeof callback === 'function') callback(mockUser)
      return vi.fn()
    })

    const store = useAuthStore()
    await store.initAuth()

    expect(store.user).not.toBeNull()
    expect(store.role).toBe('gerocultor')
  })
})
