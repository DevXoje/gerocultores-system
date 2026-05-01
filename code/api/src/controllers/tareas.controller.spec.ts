/**
 * tareas.controller.spec.ts — Supertest controller-level tests for /api/tareas.
 *
 * TareasService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user; authorization logic tested via service mock.
 *
 * Modelo ownership: un gerocultor solo puede ver/modificar sus propias tareas.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 * US-14: Crear tarea
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
    const uid = (req as { headers: { 'x-test-uid'?: string } }).headers['x-test-uid'] ?? 'owner-uid-001'
    req.user = { uid }
    next()
  },
}))

import {
  TareasService,
  NotFoundError,
  ForbiddenError,
  ResidenteNotFoundError,
  AccessDeniedError,
} from '../services/tareas.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockGetTareas = vi.mocked(TareasService.prototype.getTareas)
const mockGetTareaById = vi.mocked(TareasService.prototype.getTareaById)
const mockUpdateEstado = vi.mocked(TareasService.prototype.updateEstado)
const mockCreateTarea = vi.mocked(TareasService.prototype.createTarea)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ownerUid = 'gero-uid-001'
const otherUid = 'gero-uid-002'

const sampleTarea = {
  id: 'tarea-001',
  titulo: 'Baño de residente',
  tipo: 'higiene' as const,
  fechaHora: '2026-04-19T08:00:00.000Z',
  estado: 'pendiente' as const,
  notas: null,
  residenteId: 'res-001',
  usuarioId: ownerUid,
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

    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [sampleTarea], meta: { total: 1 } })
    expect(mockGetTareas).toHaveBeenCalledWith(
      expect.objectContaining({ assignedTo: ownerUid }),
    )
  })

  it('returns 200 with empty array when no tasks match', async () => {
    mockGetTareas.mockResolvedValueOnce([])

    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [], meta: { total: 0 } })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/tareas')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetTareas).not.toHaveBeenCalled()
  })

  it('accepts optional query filters (date, status)', async () => {
    mockGetTareas.mockResolvedValueOnce([sampleTarea])

    const res = await request(app)
      .get('/api/tareas?date=2026-04-19&status=pendiente')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(200)
    expect(mockGetTareas).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-04-19', status: 'pendiente', assignedTo: ownerUid }),
    )
  })

  it('returns 400 when query param status is invalid', async () => {
    const res = await request(app)
      .get('/api/tareas?status=invalid_status')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockGetTareas).not.toHaveBeenCalled()
  })

  it('returns 500 when service throws unexpectedly', async () => {
    mockGetTareas.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app)
      .get('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(500)
  })
})

// ─── GET /api/tareas/:id ──────────────────────────────────────────────────────

describe('GET /api/tareas/:id — getTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owner requests their own task → 200', async () => {
    mockGetTareaById.mockResolvedValueOnce(sampleTarea)

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleTarea })
    expect(mockGetTareaById).toHaveBeenCalledWith('tarea-001')
  })

  it('other gerocultor requests a task they do not own → 403', async () => {
    mockGetTareaById.mockResolvedValueOnce(sampleTarea)

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', otherUid)

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 404 when task does not exist', async () => {
    mockGetTareaById.mockRejectedValueOnce(new NotFoundError('Tarea not found'))

    const res = await request(app)
      .get('/api/tareas/does-not-exist')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/tareas/tarea-001')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('returns 500 when service throws unexpectedly', async () => {
    mockGetTareaById.mockRejectedValueOnce(new Error('Unexpected DB error'))

    const res = await request(app)
      .get('/api/tareas/tarea-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)

    expect(res.status).toBe(500)
  })
})

// ─── PATCH /api/tareas/:id/estado ─────────────────────────────────────────────

describe('PATCH /api/tareas/:id/estado — patchEstado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owner updates their task → 200', async () => {
    const updatedTarea = { ...sampleTarea, estado: 'completada' as const }
    mockUpdateEstado.mockResolvedValueOnce(updatedTarea)

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({ estado: 'completada' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: updatedTarea })
    expect(mockUpdateEstado).toHaveBeenCalledWith(
      'tarea-001',
      'completada',
      ownerUid,
    )
  })

  it('returns 400 when estado field is missing', async () => {
    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockUpdateEstado).not.toHaveBeenCalled()
  })

  it('returns 400 when estado value is not valid enum', async () => {
    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
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
  })

  it('returns 403 when service throws ForbiddenError (gerocultor on another\'s task)', async () => {
    mockUpdateEstado.mockRejectedValueOnce(
      new ForbiddenError('No tienes acceso a esta tarea'),
    )

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', otherUid)
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 404 when service throws NotFoundError', async () => {
    mockUpdateEstado.mockRejectedValueOnce(new NotFoundError('Tarea not found'))

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 500 when service throws unexpectedly', async () => {
    mockUpdateEstado.mockRejectedValueOnce(new Error('Unexpected error'))

    const res = await request(app)
      .patch('/api/tareas/tarea-001/estado')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({ estado: 'en_curso' })

    expect(res.status).toBe(500)
  })
})

// ─── POST /api/tareas — createTarea ─────────────────────────────────────────

describe('POST /api/tareas — createTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validBody = {
    titulo: 'Baño matutino',
    tipo: 'higiene',
    fechaHora: '2026-04-20T08:00:00Z',
    residenteId: '550e8400-e29b-41d4-a716-446655440001',
    usuarioId: ownerUid,
    notas: 'Evitar agua muy caliente',
  }

  const createdTarea = {
    id: 'tasks/new-uuid-001',
    titulo: 'Baño matutino',
    tipo: 'higiene',
    fechaHora: '2026-04-20T08:00:00Z',
    estado: 'pendiente',
    notas: 'Evitar agua muy caliente',
    residenteId: '550e8400-e29b-41d4-a716-446655440001',
    usuarioId: ownerUid,
    creadoEn: '2026-04-20T07:00:00Z',
    actualizadEn: '2026-04-20T07:00:00Z',
    completadaEn: null,
  }

  it('returns 201 with the created tarea when body is valid', async () => {
    mockCreateTarea.mockResolvedValueOnce(createdTarea)

    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send(validBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ data: createdTarea })
    expect(mockCreateTarea).toHaveBeenCalledWith(validBody, ownerUid)
  })

  it('returns 400 when titulo is missing', async () => {
    const { titulo: _titulo, ...body } = validBody

    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.field).toBe('titulo')
    expect(mockCreateTarea).not.toHaveBeenCalled()
  })

  it('returns 400 when tipo is invalid enum', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({ ...validBody, tipo: 'invalid' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.field).toBe('tipo')
  })

  it('returns 400 when fechaHora is not ISO8601', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send({ ...validBody, fechaHora: 'not-a-date' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('VALIDATION_ERROR')
    expect(res.body.field).toBe('fechaHora')
  })

  it('returns 400 when service throws ResidenteNotFoundError', async () => {
    mockCreateTarea.mockRejectedValueOnce(new ResidenteNotFoundError())

    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send(validBody)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('RESIDENTE_NOT_FOUND')
  })

  it('returns 400 when service throws AccessDeniedError', async () => {
    mockCreateTarea.mockRejectedValueOnce(new AccessDeniedError())

    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send(validBody)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ACCESS_DENIED')
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/tareas')
      .send(validBody)

    expect(res.status).toBe(401)
    expect(mockCreateTarea).not.toHaveBeenCalled()
  })

  it('returns 500 when service throws unexpectedly', async () => {
    mockCreateTarea.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app)
      .post('/api/tareas')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', ownerUid)
      .send(validBody)

    expect(res.status).toBe(500)
  })
})
