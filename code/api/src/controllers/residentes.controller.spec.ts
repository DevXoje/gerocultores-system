/**
 * residentes.controller.spec.ts — Supertest controller-level tests for /api/residentes.
 *
 * ResidentesService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user; authorization logic tested via service mock.
 *
 * Modelo ownership: todos los métodos de servicio reciben solo requestingUid (sin role).
 *
 * US-05: Consulta de ficha de residente
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
      }),
      where: vi.fn().mockReturnThis(),
    }),
    runTransaction: vi.fn(),
  },
}))

// Mock ResidentesService — we test the HTTP layer only.
vi.mock('../services/residentes.service')

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

import { ResidentesService, NotFoundError, ForbiddenError } from '../services/residentes.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockGetResidenteById = vi.mocked(ResidentesService.prototype.getResidenteById)
const mockCreateResidente = vi.mocked(ResidentesService.prototype.createResidente)
const mockListResidentes = vi.mocked(ResidentesService.prototype.listResidentes)
const mockUpdateResidente = vi.mocked(ResidentesService.prototype.updateResidente)
const mockArchiveResidente = vi.mocked(ResidentesService.prototype.archiveResidente)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleResidente = {
  id: 'res-uuid-001',
  nombre: 'Eleanor',
  apellidos: 'Vance',
  fechaNacimiento: '1940-05-12',
  habitacion: '204',
  foto: null,
  diagnosticos: 'Demencia leve',
  alergias: 'Penicilina',
  medicacion: 'Donepezilo 10mg',
  preferencias: 'Prefiere desayuno temprano',
  archivado: false,
  usuarioId: 'owner-uid-001',
  creadoEn: '2026-01-01T10:00:00Z',
  actualizadoEn: '2026-04-01T10:00:00Z',
}

const AUTH_HEADER = 'Bearer valid-token'
const OWNER_UID = 'owner-uid-001'
const OTHER_UID = 'other-uid-002'

// ─── GET /api/residentes/:id ──────────────────────────────────────────────────

describe('GET /api/residentes/:id — getResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owner requests their residente → 200', async () => {
    mockGetResidenteById.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleResidente })
    expect(mockGetResidenteById).toHaveBeenCalledWith('res-uuid-001', OWNER_UID)
  })

  it('other gerocultor requests a residente they do not own → 403', async () => {
    mockGetResidenteById.mockRejectedValueOnce(
      new ForbiddenError('No tienes acceso a este residente'),
    )

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OTHER_UID)

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 404 when residente does not exist', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new NotFoundError('Residente not found'))

    const res = await request(app)
      .get('/api/residentes/non-existent-id')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/residentes/res-uuid-001')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetResidenteById).not.toHaveBeenCalled()
  })

  it('returns 500 when service throws unexpectedly', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new Error('Unexpected DB error'))

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(500)
  })
})

// ─── POST /api/residentes ─────────────────────────────────────────────────────

describe('POST /api/residentes — createResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gerocultor with valid body → 201 and returns created residente', async () => {
    mockCreateResidente.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .post('/api/residentes')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)
      .send({
        nombre: 'María',
        apellidos: 'García López',
        fechaNacimiento: '1955-03-15',
        habitacion: '201-A',
      })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ id: 'res-uuid-001' })
    expect(mockCreateResidente).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'María', habitacion: '201-A' }),
      OWNER_UID,
    )
  })

  it('invalid body → 400 with VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/residentes')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)
      .send({ nombre: '', apellidos: '', fechaNacimiento: '', habitacion: '' })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

// ─── GET /api/residentes ─────────────────────────────────────────────────────

describe('GET /api/residentes — listResidentes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gerocultor gets 200 with their residents', async () => {
    mockListResidentes.mockResolvedValueOnce([sampleResidente])

    const res = await request(app)
      .get('/api/residentes')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(mockListResidentes).toHaveBeenCalledWith('active', OWNER_UID)
  })

  it('?filter=archived → passes filter to service', async () => {
    mockListResidentes.mockResolvedValueOnce([])

    await request(app)
      .get('/api/residentes?filter=archived')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(mockListResidentes).toHaveBeenCalledWith('archived', OWNER_UID)
  })

  it('?filter=all → passes filter to service', async () => {
    mockListResidentes.mockResolvedValueOnce([sampleResidente])

    await request(app)
      .get('/api/residentes?filter=all')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(mockListResidentes).toHaveBeenCalledWith('all', OWNER_UID)
  })
})

// ─── PATCH /api/residentes/:id ────────────────────────────────────────────────

describe('PATCH /api/residentes/:id — updateResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owner updates their residente → 200', async () => {
    mockUpdateResidente.mockResolvedValueOnce({ ...sampleResidente, nombre: 'Updated' })

    const res = await request(app)
      .patch('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)
      .send({ nombre: 'Updated' })

    expect(res.status).toBe(200)
    expect(res.body.data.nombre).toBe('Updated')
    expect(mockUpdateResidente).toHaveBeenCalledWith(
      'res-uuid-001',
      expect.objectContaining({ nombre: 'Updated' }),
      OWNER_UID,
    )
  })

  it('other gerocultor tries to update → 403 (service rejects)', async () => {
    mockUpdateResidente.mockRejectedValueOnce(
      new ForbiddenError('Solo el creador del residente puede editarlo'),
    )

    const res = await request(app)
      .patch('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OTHER_UID)
      .send({ nombre: 'Hacked' })

    expect(res.status).toBe(403)
  })

  it('not found → 404', async () => {
    mockUpdateResidente.mockRejectedValueOnce(new NotFoundError('Residente not found'))

    const res = await request(app)
      .patch('/api/residentes/non-existent')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)
      .send({ nombre: 'X' })

    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/residentes/:id/archive ─────────────────────────────────────────

describe('PATCH /api/residentes/:id/archive — archiveResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owner archives their residente → 200', async () => {
    mockArchiveResidente.mockResolvedValueOnce({ ...sampleResidente, archivado: true })

    const res = await request(app)
      .patch('/api/residentes/res-uuid-001/archive')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(200)
    expect(res.body.data.archivado).toBe(true)
    expect(mockArchiveResidente).toHaveBeenCalledWith('res-uuid-001', OWNER_UID)
  })

  it('other gerocultor tries to archive → 403', async () => {
    mockArchiveResidente.mockRejectedValueOnce(
      new ForbiddenError('Solo el creador del residente puede archivarlo'),
    )

    const res = await request(app)
      .patch('/api/residentes/res-uuid-001/archive')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OTHER_UID)

    expect(res.status).toBe(403)
  })

  it('not found → 404', async () => {
    mockArchiveResidente.mockRejectedValueOnce(new NotFoundError('Residente not found'))

    const res = await request(app)
      .patch('/api/residentes/non-existent/archive')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', OWNER_UID)

    expect(res.status).toBe(404)
  })
})
