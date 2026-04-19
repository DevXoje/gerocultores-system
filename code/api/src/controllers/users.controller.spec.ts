/**
 * users.controller.spec.ts — Supertest controller-level tests for /api/admin/users.
 *
 * UsersService is fully mocked — no Firestore or Firebase Auth calls happen.
 * Firebase module is also mocked to prevent SDK initialization.
 * verifyAuth and requireRole are smart mocks that simulate real behavior.
 *
 * US-10: Gestión de cuentas de usuarios
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

// Mock firebase module BEFORE any imports that depend on it.
vi.mock('../services/firebase', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    createUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
    updateUser: vi.fn(),
  },
  adminDb: {
    collection: vi.fn().mockReturnValue({
      get: vi.fn(),
      doc: vi.fn().mockReturnValue({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      }),
      add: vi.fn(),
    }),
  },
}))

// Mock the entire UsersService — we test the controller HTTP layer only.
vi.mock('../services/users.service')

// ─── Middleware mocks ──────────────────────────────────────────────────────────

/**
 * verifyAuth mock: simulates token validation.
 * - No Authorization header → 401
 * - x-test-role header → injects that role into req.user
 * - Default (with any token) → injects admin user
 */
vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (
    req: {
      headers: { authorization?: string; 'x-test-role'?: string; 'x-test-uid'?: string }
      user?: unknown
    },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: () => void,
  ) => {
    if (!req.headers.authorization) {
      res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
      return
    }
    const role = req.headers['x-test-role'] ?? 'admin'
    const uid = req.headers['x-test-uid'] ?? 'test-admin-uid'
    req.user = { uid, rol: role, role }
    next()
  },
}))

/**
 * requireRole mock: simulates role enforcement.
 * - Gerocultor users are rejected when route requires 'admin'
 * - Admin users pass through
 */
vi.mock('../middleware/requireRole', () => ({
  requireRole:
    (...roles: string[]) =>
    (
      req: { user?: { rol?: string } },
      res: { status: (code: number) => { json: (body: unknown) => void } },
      next: () => void,
    ) => {
      const userRole = req.user?.['rol'] as string | undefined
      if (!userRole || !roles.includes(userRole)) {
        res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
        return
      }
      next()
    },
}))

import { UsersService } from '../services/users.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockListUsers = vi.mocked(UsersService.prototype.listUsers)
const mockCreateUser = vi.mocked(UsersService.prototype.createUser)
const mockUpdateUserRole = vi.mocked(UsersService.prototype.updateUserRole)
const mockDisableUser = vi.mocked(UsersService.prototype.disableUser)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleUser = {
  uid: 'uid-001',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'admin' as const,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

const validCreateBody = {
  email: 'new@example.com',
  password: 'secret123',
  displayName: 'New User',
  role: 'gerocultor',
}

const AUTH_HEADER = 'Bearer valid-token'

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

describe('GET /api/admin/users — listUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with data array when service returns users (admin)', async () => {
    mockListUsers.mockResolvedValueOnce([sampleUser])

    const res = await request(app).get('/api/admin/users').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [sampleUser] })
    expect(mockListUsers).toHaveBeenCalledOnce()
  })

  it('returns 200 with empty array when no users exist', async () => {
    mockListUsers.mockResolvedValueOnce([])

    const res = await request(app).get('/api/admin/users').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [] })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/admin/users')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockListUsers).not.toHaveBeenCalled()
  })

  it('returns 403 when user is gerocultor', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    expect(mockListUsers).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockListUsers.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app).get('/api/admin/users').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})

// ─── POST /api/admin/users ────────────────────────────────────────────────────

describe('POST /api/admin/users — createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created user when body is valid (admin)', async () => {
    mockCreateUser.mockResolvedValueOnce(sampleUser)

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send(validCreateBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ data: sampleUser })
    expect(mockCreateUser).toHaveBeenCalledOnce()
    expect(mockCreateUser).toHaveBeenCalledWith(validCreateBody)
  })

  it('returns 400 when email is missing', async () => {
    const { email: _email, ...bodyWithoutEmail } = validCreateBody

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send(bodyWithoutEmail)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      error: expect.any(String),
    })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validCreateBody, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 400 when role is an invalid value', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validCreateBody, role: 'superadmin' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 400 when displayName is missing', async () => {
    const { displayName: _dn, ...bodyWithoutName } = validCreateBody

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send(bodyWithoutName)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).post('/api/admin/users').send(validCreateBody)

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 403 when user is gerocultor', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .send(validCreateBody)

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('Auth service down'))

    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', AUTH_HEADER)
      .send(validCreateBody)

    expect(res.status).toBe(500)
  })
})

// ─── PATCH /api/admin/users/:uid/role ─────────────────────────────────────────

describe('PATCH /api/admin/users/:uid/role — updateUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with updated role when body is valid (admin)', async () => {
    const updateResponse = { uid: 'uid-001', role: 'gerocultor' as const }
    mockUpdateUserRole.mockResolvedValueOnce(updateResponse)

    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .set('Authorization', AUTH_HEADER)
      .send({ role: 'gerocultor' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: updateResponse })
    expect(mockUpdateUserRole).toHaveBeenCalledWith('uid-001', { role: 'gerocultor' })
  })

  it('returns 400 when role is invalid', async () => {
    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .set('Authorization', AUTH_HEADER)
      .send({ role: 'unknown-role' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateUserRole).not.toHaveBeenCalled()
  })

  it('returns 400 when role is missing from body', async () => {
    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .set('Authorization', AUTH_HEADER)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateUserRole).not.toHaveBeenCalled()
  })

  it('returns 403 when user is gerocultor', async () => {
    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .send({ role: 'admin' })

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    expect(mockUpdateUserRole).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockUpdateUserRole.mockRejectedValueOnce(new Error('Firestore write failed'))

    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .set('Authorization', AUTH_HEADER)
      .send({ role: 'admin' })

    expect(res.status).toBe(500)
  })
})

// ─── PATCH /api/admin/users/:uid/disable ──────────────────────────────────────

describe('PATCH /api/admin/users/:uid/disable — disableUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with uid and active=false when service succeeds (admin)', async () => {
    const disableResponse = { uid: 'uid-001', active: false as const }
    mockDisableUser.mockResolvedValueOnce(disableResponse)

    const res = await request(app)
      .patch('/api/admin/users/uid-001/disable')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: disableResponse })
    expect(mockDisableUser).toHaveBeenCalledWith('uid-001')
  })

  it('calls service with the correct uid from params', async () => {
    mockDisableUser.mockResolvedValueOnce({ uid: 'uid-xyz', active: false })

    await request(app)
      .patch('/api/admin/users/uid-xyz/disable')
      .set('Authorization', AUTH_HEADER)

    expect(mockDisableUser).toHaveBeenCalledWith('uid-xyz')
  })

  it('returns 403 when user is gerocultor', async () => {
    const res = await request(app)
      .patch('/api/admin/users/uid-001/disable')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
    expect(mockDisableUser).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockDisableUser.mockRejectedValueOnce(new Error('Auth service error'))

    const res = await request(app)
      .patch('/api/admin/users/uid-001/disable')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})
