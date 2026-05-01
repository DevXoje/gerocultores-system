/**
 * register.routes.spec.ts — Supertest integration tests for register routes.
 *
 * US-10 / Registration: POST /api/register/set-claims
 *
 * Strategy: mock firebase + verifyAuth, test HTTP layer only.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Hoisted mock fns (available inside vi.mock factories) ───────────────────

const { mockSetCustomUserClaims } = vi.hoisted(() => ({
  mockSetCustomUserClaims: vi.fn().mockResolvedValue(undefined),
}))

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../services/firebase', () => ({
  adminAuth: { setCustomUserClaims: mockSetCustomUserClaims },
  adminDb: { collection: vi.fn() },
}))

vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: vi.fn((req, _res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      _res.status(401).json({ code: 'UNAUTHORIZED' })
      return
    }
    // Only inject user for valid tokens; invalid ones also get 401 in real middleware
    if (authHeader === 'Bearer invalid-token') {
      _res.status(401).json({ code: 'UNAUTHORIZED' })
      return
    }
    req.user = { uid: 'test-uid', rol: 'gerocultor' }
    next()
  }),
}))

// ─── Test subject ─────────────────────────────────────────────────────────────

import request from 'supertest'
import app from '../app'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/register/set-claims', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when no Authorization header is provided', async () => {
    const response = await request(app)
      .post('/api/register/set-claims')
      .send({})

    expect(response.status).toBe(401)
    expect(response.body.code).toBe('UNAUTHORIZED')
  })

  it('should return 401 when token verification fails', async () => {
    const response = await request(app)
      .post('/api/register/set-claims')
      .set('Authorization', 'Bearer invalid-token')
      .send({})

    expect(response.status).toBe(401)
  })

  it('should set gerocultor claim and return 200 for valid authed request', async () => {
    // verifyAuth is mocked to always inject a valid user,
    // so any valid auth header passes through. We use a dummy one.
    const response = await request(app)
      .post('/api/register/set-claims')
      .set('Authorization', 'Bearer any-valid-token')
      .send({})

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('test-uid', { role: 'gerocultor' })
  })

  it('should ignore role in request body (defense in depth)', async () => {
    const response = await request(app)
      .post('/api/register/set-claims')
      .set('Authorization', 'Bearer any-valid-token')
      .send({ role: 'admin' }) // malicious payload — must be ignored

    expect(response.status).toBe(200)
    // Must set gerocultor regardless of body
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('test-uid', { role: 'gerocultor' })
  })

  it('should return 500 when setCustomUserClaims throws', async () => {
    mockSetCustomUserClaims.mockRejectedValueOnce(new Error('Firebase error'))

    const response = await request(app)
      .post('/api/register/set-claims')
      .set('Authorization', 'Bearer any-valid-token')
      .send({})

    expect(response.status).toBe(500)
    expect(response.body.code).toBe('INTERNAL_ERROR')
  })
})
