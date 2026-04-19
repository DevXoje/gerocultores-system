/**
 * tareas.controller.spec.ts — Supertest controller-level tests for /api/tareas.
 *
 * TareasService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user; requireRole is bypassed.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'

// Mock firebase module BEFORE any imports that depend on it.
vi.mock('../services/firebase', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
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
      where: vi.fn().mockReturnThis(),
    }),
    runTransaction: vi.fn(),
  },
}))

// Mock TareasService — we test the HTTP layer only.
vi.mock('../services/tareas.service')

// Bypass verifyAuth: inject a fake req.user for all requests in this suite.
// Auth failure tests use requests without the Authorization header to trigger real 401s
// — but since verifyAuth is mocked here, we simulate 401 by setting req.user to undefined
// based on the Authorization header presence.
vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (
    req: { headers: { authorization?: string }; user?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: () => void,
  ) => {
    if (!req.headers.authorization) {
      res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
      return
    }
    // Default: inject admin user. Tests that need gerocultor set x-test-role header.
    const roleHeader = (req as { headers: { 'x-test-role'?: string } }).headers['x-test-role']
    const uid = (req as { headers: { 'x-test-uid'?: string } }).headers['x-test-uid'] ?? 'test-admin-uid'
    const role = roleHeader ?? 'admin'
    req.user = { uid, rol: role, role }
    next()
  },
}))

import { TareasService, NotFoundError, ForbiddenError } from '../services/tareas.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockGetTareas = vi.mocked(TareasService.prototype.getTareas)
const mockGetTareaById = vi.mocked(TareasService.prototype.getTareaById)
const mockUpdateEstado = vi.mocked(TareasService.prototype.updateEstado)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleTarea = {
  id: 'tarea-001',
  titulo: 'Baño de residente',
  tipo: 'higiene' as const,
  fechaHora: '2026-04-19T08:00:00.000Z',
  estado: 'pendiente' as const,
  notas: null,
  residenteId: 'res-001',
  usuarioId: 'uid-gerocultor-1',
  creadoEn: '2026-04-18T00:00:00.000Z',
  actualizadoEn: '2026-04-18T00:00:00.000Z',
  completadaEn: null,
}

const AUTH_HEADER = 'Bearer valid-token'

// ─── GET /api/tareas ──────────────────────────────────────────────────────────

describe('GET /api/tareas — listTareas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with data array and meta when service returns tasks', async () => {
    mockGetTareas.mockResolvedValueOnce([sampleTarea])

    const res = await request(app).get('/api/tareas').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [sampleTarea], meta: { total: 1 } })
    expect(mockGetTareas).toHaveBeenCalledOnce()
  })

  it('returns 200 with empty array when no tasks match', async () => {
    mockGetTareas.mockResolvedValueOnce([])

    const res = await request(app).get('/api/tareas').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [], meta: { total: 0 } })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/tareas')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetTareas).not.toHaveBeenCalled()
  })

  it('forces assignedTo filter for gerocultor users', async () => {
    mockGetTareas.mockResolvedValueOnce([sampleTarea])

    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'uid-gerocultor-1')

    expect(res.status).toBe(200)
    // Service must be called with assignedTo = the gerocultor's uid
    expect(mockGetTareas).toHaveBeenCalledWith(
      expect.objectContaining({ assignedTo: 'uid-gerocultor-1' }),
    )
  })

  it('accepts optional query filters (date, status)', async () => {
    mockGetTareas.mockResolvedValueOnce([sampleTarea])

    const res = await request(app)
      .get('/api/tareas?date=2026-04-19&status=pendiente')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(mockGetTareas).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-04-19', status: 'pendiente' }),
    )
  })

  it('returns 400 when query param status is invalid', async () => {
    const res = await request(app)
      .get('/api/tareas?status=invalid_status')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockGetTareas).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockGetTareas.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app).get('/api/tareas').set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})

// ─── GET /api/tareas/:id ──────────────────────────────────────────────────────

describe('GET /api/tareas/:id — getTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with the task when found', async () => {
    mockGetTareaById.mockResolvedValueOnce(sampleTarea)

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleTarea })
    expect(mockGetTareaById).toHaveBeenCalledWith('tarea-001')
  })

  it('returns 404 when task does not exist', async () => {
    mockGetTareaById.mockRejectedValueOnce(new NotFoundError('Tarea not found'))

    const res = await request(app)
      .get('/api/tareas/does-not-exist')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/tareas/tarea-001')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetTareaById).not.toHaveBeenCalled()
  })

  it('returns 403 when gerocultor requests a task that belongs to another user', async () => {
    // sampleTarea.usuarioId = 'uid-gerocultor-1'; requesting as 'uid-gerocultor-2'
    mockGetTareaById.mockResolvedValueOnce(sampleTarea)

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'uid-gerocultor-2')

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 200 when gerocultor requests their own task', async () => {
    mockGetTareaById.mockResolvedValueOnce(sampleTarea)

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'uid-gerocultor-1') // matches sampleTarea.usuarioId

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleTarea })
  })

  it('passes error to errorHandler (returns 500) when service throws unexpectedly', async () => {
    mockGetTareaById.mockRejectedValueOnce(new Error('Unexpected DB error'))

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})

// ─── PATCH /api/tareas/:id/estado ─────────────────────────────────────────────

describe('PATCH /api/tareas/:id/estado — patchEstado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with updated task when body is valid', async () => {
    const updatedTarea = { ...sampleTarea, estado: 'completada' as const }
    mockUpdateEstado.mockResolvedValueOnce(updatedTarea)

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'completada' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: updatedTarea })
    expect(mockUpdateEstado).toHaveBeenCalledWith(
      'tarea-001',
      'completada',
      'test-admin-uid',
      'admin',
    )
  })

  it('returns 400 when estado field is missing', async () => {
    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateEstado).not.toHaveBeenCalled()
  })

  it('returns 400 when estado value is not a valid enum value', async () => {
    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'hecho' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateEstado).not.toHaveBeenCalled()
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .send({ estado: 'completada' })

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockUpdateEstado).not.toHaveBeenCalled()
  })

  it('returns 403 when service throws ForbiddenError (gerocultor on another\'s task)', async () => {
    mockUpdateEstado.mockRejectedValueOnce(
      new ForbiddenError("Cannot update another user's task"),
    )

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'uid-gerocultor-2')
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 404 when service throws NotFoundError', async () => {
    mockUpdateEstado.mockRejectedValueOnce(new NotFoundError('Tarea not found'))

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('passes error to errorHandler (returns 500) when service throws unexpectedly', async () => {
    mockUpdateEstado.mockRejectedValueOnce(new Error('Unexpected error'))

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(500)
  })
})
