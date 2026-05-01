import { vi, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

// Mock firebase module BEFORE any imports that depend on it.
// This prevents real Firebase Admin SDK initialization during tests.
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

// Helper: cast adminAuth.verifyIdToken to a vitest mock for easy manipulation
const mockVerifyIdToken = vi.mocked(adminAuth.verifyIdToken)

describe('verifyAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/protected')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: expect.any(String) })
  })

  it('should return 401 when Authorization header has invalid format (no Bearer prefix)', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'InvalidToken abc123')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: expect.any(String) })
  })

  it('should return 401 when Authorization header is "Bearer" with no token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: expect.any(String) })
  })

  it('should return 401 when firebase-admin rejects the token', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('Token expired'))

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token')
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: expect.any(String) })
  })

  it('should call next() and set req.user when token is valid', async () => {
    const fakeDecoded = {
      uid: 'uid-test-01',
      email: 'test@example.com',
      role: 'gerocultor',
    }
    mockVerifyIdToken.mockResolvedValueOnce(fakeDecoded as never)

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer valid-token')
    // The /api/protected route should return 200 when auth passes
    expect(res.status).toBe(200)
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
  })
})
