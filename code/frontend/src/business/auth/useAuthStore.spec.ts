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
  auth: {},
}))

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { useAuthStore } from './useAuthStore'

// Helper: make a mock Firebase User-like object
function makeMockUser(email: string) {
  return {
    uid: 'uid-123',
    email,
    getIdTokenResult: vi.fn().mockResolvedValue({
      claims: { role: 'gerocultor' },
    }),
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
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
      user: mockUser,
    } as ReturnType<typeof signInWithEmailAndPassword> extends Promise<infer T> ? Promise<T> : never)

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
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
      user: mockUser,
    } as ReturnType<typeof signInWithEmailAndPassword> extends Promise<infer T> ? Promise<T> : never)
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
      return { user: mockUser } as ReturnType<typeof signInWithEmailAndPassword> extends Promise<infer T> ? Promise<T> : never
    })

    await store.signIn('test.gerocultor@example.com', 'Test1234!')

    // After signIn completes, isLoading must be false
    expect(store.isLoading).toBe(false)
    // During the call, isLoading should have been true
    expect(loadingStates[0]).toBe(true)
  })

  it('should set isLoading=false after failed signIn', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      new Error('auth/wrong-password')
    )

    const store = useAuthStore()
    try {
      await store.signIn('x@x.com', 'bad')
    } catch {
      // expected
    }

    expect(store.isLoading).toBe(false)
  })

  // ─── TC: init() sets up onAuthStateChanged listener ─────────────────────

  it('should call onAuthStateChanged during init', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      // Simulate no user (unauthenticated)
      if (typeof callback === 'function') callback(null)
      return vi.fn() // unsubscribe function
    })

    const store = useAuthStore()
    await store.init()

    expect(onAuthStateChanged).toHaveBeenCalledOnce()
    expect(store.user).toBeNull()
    expect(store.role).toBeNull()
  })

  it('should set user and role from onAuthStateChanged when user is authenticated', async () => {
    const mockUser = makeMockUser('test.gerocultor@example.com')

    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth, callback) => {
      if (typeof callback === 'function') callback(mockUser as Parameters<typeof callback>[0])
      return vi.fn()
    })

    const store = useAuthStore()
    await store.init()

    expect(store.user).not.toBeNull()
    expect(store.role).toBe('gerocultor')
  })
})
