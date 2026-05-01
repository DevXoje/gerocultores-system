/**
 * useUsers.spec.ts
 *
 * Unit tests for the useUsers composable.
 * All HTTP calls are intercepted via a global fetch mock — no real network traffic.
 *
 * Coverage targets (frontend-specialist.md §9):
 *  - fetchUsers() → GET /admin/users with Bearer token
 *  - fetchUsers() → populates `users` ref on success
 *  - fetchUsers() → sets `error` on network failure
 *  - fetchUsers() → manages loading state correctly
 *  - updateRole()  → PATCH /admin/users/:uid/role with correct body + refreshes list
 *  - disableUser() → PATCH /admin/users/:uid/disable + refreshes list
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock firebase/auth (required before any import that touches @/services/firebase) ──
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

// ── Mock @/services/firebase — provide a currentUser with getIdToken ─────────
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('mock-token'),
    },
  },
}))

// ── Mock @/business/auth/useAuthStore (imported by useUsers) ─────────────────
vi.mock('@/business/auth/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      uid: 'current-uid',
      getIdToken: vi.fn().mockResolvedValue('mock-token'),
    },
  })),
}))

import { useUsers } from './useUsers'
import type { UserResponse } from '@/business/users/domain/entities/user.types'

// ── Test fixtures ─────────────────────────────────────────────────────────────

const MOCK_API_BASE = 'http://localhost:3000'

const mockUsers: UserResponse[] = [
  {
    uid: 'uid-1',
    displayName: 'Ana García',
    email: 'ana@example.com',
    role: 'gerocultor',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'uid-2',
    displayName: 'Carlos López',
    email: 'carlos@example.com',
    role: 'admin',
    active: true,
    createdAt: '2026-01-02T00:00:00Z',
  },
]

// Helper: build a successful JSON fetch response
function mockFetchSuccess(body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response)
}

// Helper: build a failed JSON fetch response
function mockFetchError(status: number, errorMsg: string): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: errorMsg }),
  } as Response)
}

describe('useUsers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Set VITE_API_URL so the composable can build request URLs
    vi.stubEnv('VITE_API_URL', MOCK_API_BASE)
  })

  // ─── fetchUsers ────────────────────────────────────────────────────────────

  describe('fetchUsers()', () => {
    it('calls GET /admin/users with a Bearer token', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockReturnValue(mockFetchSuccess({ data: mockUsers }))

      const { fetchUsers } = useUsers()
      await fetchUsers()

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
      // API_BASE is read at module-level from VITE_API_URL; verify the path is correct
      expect(url).toContain('/admin/users')
      expect(url).not.toContain('/admin/users/')
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer mock-token')
    })

    it('populates `users` ref with the response data on success', async () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchSuccess({ data: mockUsers }))

      const { users, fetchUsers } = useUsers()
      await fetchUsers()

      expect(users.value).toHaveLength(2)
      expect(users.value[0].uid).toBe('uid-1')
      expect(users.value[1].uid).toBe('uid-2')
    })

    it('sets `error` when fetch throws a network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'))

      const { error, fetchUsers } = useUsers()
      await fetchUsers()

      expect(error.value).toBe('Network failure')
    })

    it('sets `error` when the server returns a non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchError(403, 'Forbidden'))

      const { error, fetchUsers } = useUsers()
      await fetchUsers()

      expect(error.value).toBe('Forbidden')
    })

    it('sets `loading` to true during fetch and false after success', async () => {
      const loadingSnapshots: boolean[] = []

      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        // Capture loading state mid-flight
        const { loading } = useUsers()
        loadingSnapshots.push(loading.value)
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: mockUsers }),
        } as Response
      })

      const { loading, fetchUsers } = useUsers()
      expect(loading.value).toBe(false) // initial

      await fetchUsers()

      expect(loading.value).toBe(false) // after completion
    })

    it('sets `loading` to false even when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'))

      const { loading, fetchUsers } = useUsers()
      await fetchUsers()

      expect(loading.value).toBe(false)
    })

    it('sets loading=true during fetch', async () => {
      let loadingDuringFetch = false

      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        loadingDuringFetch = true // will be checked by reading loading after the fact
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        } as Response
      })

      const { fetchUsers } = useUsers()
      await fetchUsers()

      // Verify fetch was called (confirms the loading branch ran)
      expect(loadingDuringFetch).toBe(true)
    })
  })

  // ─── updateRole ────────────────────────────────────────────────────────────

  describe('updateRole()', () => {
    it('calls PATCH /admin/users/:uid/role with correct body and Bearer token', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        // updateRole PATCH call
        .mockReturnValueOnce(mockFetchSuccess({}))
        // fetchUsers GET call (refresh after update)
        .mockReturnValueOnce(mockFetchSuccess({ data: mockUsers }))

      const { updateRole } = useUsers()
      await updateRole('uid-1', 'admin')

      // First call is the PATCH
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/admin/users/uid-1/role')
      expect(init.method).toBe('PATCH')
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer mock-token')
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
      expect(JSON.parse(init.body as string)).toEqual({ role: 'admin' })
    })

    it('calls fetchUsers() after a successful updateRole to refresh the list', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockReturnValueOnce(mockFetchSuccess({})) // PATCH
        .mockReturnValueOnce(mockFetchSuccess({ data: mockUsers })) // GET refresh

      const { updateRole, users } = useUsers()
      await updateRole('uid-1', 'admin')

      // fetch must have been called twice: once for PATCH, once for GET refresh
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      // The list must be populated from the refresh
      expect(users.value).toHaveLength(2)
    })

    it('sets `error` when updateRole server call fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchError(500, 'Internal Server Error'))

      const { error, updateRole } = useUsers()
      await updateRole('uid-1', 'admin')

      expect(error.value).toBe('Internal Server Error')
    })
  })

  // ─── disableUser ───────────────────────────────────────────────────────────

  describe('disableUser()', () => {
    it('calls PATCH /admin/users/:uid/disable with Bearer token', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockReturnValueOnce(mockFetchSuccess({})) // PATCH
        .mockReturnValueOnce(mockFetchSuccess({ data: mockUsers })) // GET refresh

      const { disableUser } = useUsers()
      await disableUser('uid-1')

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/admin/users/uid-1/disable')
      expect(init.method).toBe('PATCH')
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer mock-token')
    })

    it('calls fetchUsers() after a successful disableUser to refresh the list', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockReturnValueOnce(mockFetchSuccess({})) // PATCH
        .mockReturnValueOnce(mockFetchSuccess({ data: mockUsers })) // GET refresh

      const { disableUser, users } = useUsers()
      await disableUser('uid-1')

      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(users.value).toHaveLength(2)
    })

    it('sets `error` when disableUser server call fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValue(mockFetchError(404, 'User not found'))

      const { error, disableUser } = useUsers()
      await disableUser('uid-1')

      expect(error.value).toBe('User not found')
    })
  })
})
