/**
 * auth-rbac.integration.spec.ts — Integration tests for Auth + RBAC flow.
 * US-01, US-02: Firebase Auth + verifyAuth + requireRole + Firestore Rules
 *
 * Tests exercise the full Express middleware chain using Supertest:
 *   Authorization header → verifyAuth → req.user → requireRole → route handler
 *
 * Firebase Admin SDK is mocked to avoid real token validation in CI.
 * Firestore Rules integration tests are in code/tests/firestore-rules/.
 *
 * @see code/api/src/middleware/verifyAuth.ts
 * @see code/api/src/middleware/requireRole.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

// Mock firebase BEFORE any app import to prevent real SDK initialization.
vi.mock('../services/firebase', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  adminDb: {
    collection: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ docs: [] }),
    }),
  },
}))

import { adminAuth } from '../services/firebase'
import app from '../app'

const mockVerifyIdToken = vi.mocked(adminAuth.verifyIdToken)

// ─── Helper: build a decoded token with a given role ─────────────────────────

function fakeToken(uid: string, email: string, role: 'admin' | 'gerocultor') {
  return { uid, email, role } as never
}

// ─── Auth Integration: verifyAuth middleware ──────────────────────────────────

describe('Auth Integration — verifyAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Missing or malformed token → 401', () => {
    it('returns 401 when Authorization header is absent', async () => {
      const res = await request(app).get('/api/protected')
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('returns 401 when Authorization header has no Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Token abc123')
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('returns 401 when Authorization is "Bearer" with no trailing token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer')
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })
  })

  describe('Invalid / expired token → 401', () => {
    it('returns 401 when firebase-admin rejects the token (invalid)', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('auth/invalid-id-token'))

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer bad-token')
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('returns 401 when firebase-admin rejects the token (expired)', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('auth/id-token-expired'))

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer expired-token')
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })
  })

  describe('Valid token → req.user populated → 200', () => {
    it('returns 200 and calls verifyIdToken with the extracted token value', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-gc-01', 'gc@example.com', 'gerocultor'),
      )

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token-gc')
      expect(res.status).toBe(200)
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token-gc')
    })

    it('returns 200 for admin user on protected route', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-admin-01', 'admin@example.com', 'admin'),
      )

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token-admin')
      expect(res.status).toBe(200)
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token-admin')
    })
  })
})

// ─── RBAC Integration: requireRole middleware ─────────────────────────────────

describe('RBAC Integration — requireRole middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Admin-only route (/api/admin/users)', () => {
    it('returns 403 when user has role "gerocultor"', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-gc-02', 'gc@example.com', 'gerocultor'),
      )

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer token-gc')
      expect(res.status).toBe(403)
      expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    })

    it('returns 200 when user has role "admin"', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-admin-02', 'admin@example.com', 'admin'),
      )

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer token-admin')
      expect(res.status).toBe(200)
    })

    it('returns 401 (not 403) when no token is provided at all', async () => {
      const res = await request(app).get('/api/admin/users')
      // verifyAuth fires first — no token → 401 before requireRole is reached
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('returns 403 when user has an unrecognised role claim', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        // Cast to never: simulates a token with a non-standard role claim
        { uid: 'uid-x', email: 'x@example.com', role: 'superadmin' } as never,
      )

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer token-x')
      expect(res.status).toBe(403)
      expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    })
  })

  describe('Protected route accessible to all authenticated users (/api/protected)', () => {
    it('returns 200 for gerocultor (no role restriction on this route)', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-gc-03', 'gc3@example.com', 'gerocultor'),
      )

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token-gc3')
      expect(res.status).toBe(200)
    })

    it('returns 200 for admin (no role restriction on this route)', async () => {
      mockVerifyIdToken.mockResolvedValueOnce(
        fakeToken('uid-admin-03', 'admin3@example.com', 'admin'),
      )

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token-admin3')
      expect(res.status).toBe(200)
    })
  })
})

// ─── Auth+RBAC Chain: middleware ordering guarantees ─────────────────────────

describe('Auth+RBAC Chain — middleware ordering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifyAuth fires before requireRole: invalid token → 401 (not 403)', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('auth/invalid-id-token'))

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer bad-token')
    // If requireRole fired first, it could return 403. The 401 proves verifyAuth ran first.
    expect(res.status).toBe(401)
    expect(mockVerifyIdToken).toHaveBeenCalledOnce()
  })

  it('verifyIdToken is NOT called when Authorization header is absent', async () => {
    await request(app).get('/api/admin/users')
    expect(mockVerifyIdToken).not.toHaveBeenCalled()
  })
})
