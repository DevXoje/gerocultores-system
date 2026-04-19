/**
 * residentes.controller.spec.ts — Supertest controller-level tests for /api/residentes.
 *
 * ResidentesService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user; authorization logic tested via service mock.
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
    const roleHeader = (req as { headers: { 'x-test-role'?: string } }).headers['x-test-role']
    const uid = (req as { headers: { 'x-test-uid'?: string } }).headers['x-test-uid'] ?? 'test-admin-uid'
    const role = roleHeader ?? 'admin'
    req.user = { uid, rol: role, role }
    next()
  },
}))

import { ResidentesService, NotFoundError, ForbiddenError } from '../services/residentes.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockGetResidenteById = vi.mocked(ResidentesService.prototype.getResidenteById)

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
  creadoEn: '2026-01-01T10:00:00Z',
  actualizadoEn: '2026-04-01T10:00:00Z',
}

const AUTH_HEADER = 'Bearer valid-token'
const GERO_UID = 'gero-uid-001'

// ─── GET /api/residentes/:id ──────────────────────────────────────────────────

describe('GET /api/residentes/:id — getResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with residente data when admin requests', async () => {
    mockGetResidenteById.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleResidente })
    expect(mockGetResidenteById).toHaveBeenCalledWith('res-uuid-001', 'test-admin-uid', 'admin')
  })

  it('returns 200 when gerocultor requests an assigned resident', async () => {
    mockGetResidenteById.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', GERO_UID)

    expect(res.status).toBe(200)
    expect(mockGetResidenteById).toHaveBeenCalledWith('res-uuid-001', GERO_UID, 'gerocultor')
  })

  it('returns 403 when gerocultor requests a non-assigned resident', async () => {
    mockGetResidenteById.mockRejectedValueOnce(
      new ForbiddenError('No tienes acceso a este residente'),
    )

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'other-gero-uid')

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('returns 404 when residente does not exist', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new NotFoundError('Residente not found'))

    const res = await request(app)
      .get('/api/residentes/non-existent-id')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/residentes/res-uuid-001')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetResidenteById).not.toHaveBeenCalled()
  })

  it('passes error to errorHandler (returns 500) when service throws unexpectedly', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new Error('Unexpected DB error'))

    const res = await request(app)
      .get('/api/residentes/res-uuid-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})
