/**
 * users.controller.spec.ts — Integration tests for UsersController (HTTP layer only).
 *
 * UsersService is fully mocked — no Firestore or Firebase Auth calls happen.
 * Firebase module is also mocked to prevent SDK initialization.
 *
 * US-03: Gestión de usuarios admin
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

import { UsersService } from '../services/users.service'
import app from '../app'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Bypass verifyAuth by injecting req.user directly on every request. */
vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (
    req: { user?: unknown },
    _res: unknown,
    next: () => void,
  ) => {
    req.user = { uid: 'test-admin-uid', role: 'admin' }
    next()
  },
}))

/** Bypass requireRole so we can test the controller layer directly. */
vi.mock('../middleware/requireRole', () => ({
  requireRole:
    (..._roles: string[]) =>
    (_req: unknown, _res: unknown, next: () => void) =>
      next(),
}))

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/admin/users — listUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with data array when service returns users', async () => {
    mockListUsers.mockResolvedValueOnce([sampleUser])

    const res = await request(app).get('/api/admin/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [sampleUser] })
    expect(mockListUsers).toHaveBeenCalledOnce()
  })

  it('returns 200 with empty array when no users exist', async () => {
    mockListUsers.mockResolvedValueOnce([])

    const res = await request(app).get('/api/admin/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [] })
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockListUsers.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app).get('/api/admin/users')

    expect(res.status).toBe(500)
  })
})

describe('POST /api/admin/users — createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created user when body is valid', async () => {
    mockCreateUser.mockResolvedValueOnce(sampleUser)

    const res = await request(app).post('/api/admin/users').send(validCreateBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ data: sampleUser })
    expect(mockCreateUser).toHaveBeenCalledOnce()
    expect(mockCreateUser).toHaveBeenCalledWith(validCreateBody)
  })

  it('returns 400 when email is missing', async () => {
    const { email: _email, ...bodyWithoutEmail } = validCreateBody

    const res = await request(app).post('/api/admin/users').send(bodyWithoutEmail)

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
      .send({ ...validCreateBody, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 400 when role is an invalid value', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .send({ ...validCreateBody, role: 'superadmin' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns 400 when displayName is missing', async () => {
    const { displayName: _dn, ...bodyWithoutName } = validCreateBody

    const res = await request(app).post('/api/admin/users').send(bodyWithoutName)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('Auth service down'))

    const res = await request(app).post('/api/admin/users').send(validCreateBody)

    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/admin/users/:uid/role — updateUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with updated role when body is valid', async () => {
    const updateResponse = { uid: 'uid-001', role: 'gerocultor' as const }
    mockUpdateUserRole.mockResolvedValueOnce(updateResponse)

    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .send({ role: 'gerocultor' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: updateResponse })
    expect(mockUpdateUserRole).toHaveBeenCalledWith('uid-001', { role: 'gerocultor' })
  })

  it('returns 400 when role is invalid', async () => {
    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .send({ role: 'unknown-role' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateUserRole).not.toHaveBeenCalled()
  })

  it('returns 400 when role is missing from body', async () => {
    const res = await request(app).patch('/api/admin/users/uid-001/role').send({})

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateUserRole).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockUpdateUserRole.mockRejectedValueOnce(new Error('Firestore write failed'))

    const res = await request(app)
      .patch('/api/admin/users/uid-001/role')
      .send({ role: 'admin' })

    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/admin/users/:uid/disable — disableUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with uid and active=false when service succeeds', async () => {
    const disableResponse = { uid: 'uid-001', active: false as const }
    mockDisableUser.mockResolvedValueOnce(disableResponse)

    const res = await request(app).patch('/api/admin/users/uid-001/disable')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: disableResponse })
    expect(mockDisableUser).toHaveBeenCalledWith('uid-001')
  })

  it('calls service with the correct uid from params', async () => {
    mockDisableUser.mockResolvedValueOnce({ uid: 'uid-xyz', active: false })

    await request(app).patch('/api/admin/users/uid-xyz/disable')

    expect(mockDisableUser).toHaveBeenCalledWith('uid-xyz')
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockDisableUser.mockRejectedValueOnce(new Error('Auth service error'))

    const res = await request(app).patch('/api/admin/users/uid-001/disable')

    expect(res.status).toBe(500)
  })
})
