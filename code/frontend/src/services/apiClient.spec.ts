/**
 * apiClient.spec.ts
 *
 * Unit tests for the centralized Axios instance with Firebase auth interceptor.
 *
 * US-03, US-04, US-10
 *
 * Strategy: mock firebase/auth at module level, then use a mock Axios adapter
 * to capture the final request config (after all interceptors have run).
 * The adapter receives the config AFTER the async request interceptor completes,
 * so Authorization headers set by the interceptor are visible there.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

// ── Mock firebase/auth ────────────────────────────────────────────────────────
// Must be hoisted before any import that touches apiClient.
const mockGetIdTokenFn = vi.fn()
const mockGetAuthReturn = vi.fn()

vi.mock('firebase/auth', () => ({
  getAuth: () => mockGetAuthReturn(),
  getIdToken: (...args: unknown[]) => mockGetIdTokenFn(...args),
}))

// Import under test — interceptor is registered at module load, but reads
// currentUser and calls getIdToken() at request-time (inside the interceptor fn).
import { apiClient } from './apiClient'

/**
 * Install a mock adapter on apiClient that captures the final request config
 * (post-interceptors) and resolves immediately with a 200 response.
 * Returns the captured config.
 */
function withMockAdapter(
  run: () => Promise<unknown>,
): Promise<InternalAxiosRequestConfig> {
  return new Promise((resolve, reject) => {
    const originalAdapter = apiClient.defaults.adapter

    apiClient.defaults.adapter = (config: InternalAxiosRequestConfig) => {
      apiClient.defaults.adapter = originalAdapter // restore
      resolve(config)
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })
    }

    run().catch(reject)
  })
}

describe('apiClient interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('attaches Authorization header when currentUser is authenticated', async () => {
    const mockCurrentUser = { uid: 'user-123' }
    mockGetAuthReturn.mockReturnValue({ currentUser: mockCurrentUser })
    mockGetIdTokenFn.mockResolvedValue('test-firebase-token')

    const config = await withMockAdapter(() => apiClient.get('/test-endpoint'))

    expect(mockGetIdTokenFn).toHaveBeenCalledWith(mockCurrentUser)
    expect(config.headers.get('Authorization')).toBe('Bearer test-firebase-token')
  })

  it('does NOT attach Authorization header when no currentUser', async () => {
    mockGetAuthReturn.mockReturnValue({ currentUser: null })

    const config = await withMockAdapter(() => apiClient.get('/test-endpoint'))

    expect(mockGetIdTokenFn).not.toHaveBeenCalled()
    expect(config.headers.get('Authorization')).toBeUndefined()
  })

  it('sets Content-Type application/json by default', async () => {
    mockGetAuthReturn.mockReturnValue({ currentUser: null })

    const config = await withMockAdapter(() => apiClient.get('/test-endpoint'))

    expect(config.headers.get('Content-Type')).toBe('application/json')
  })
})
