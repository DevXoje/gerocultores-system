/**
 * residentes.controller.spec.ts — Supertest controller-level tests for /api/residentes.
 *
 * ResidentesService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user.
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
    }),
  },
}))

// Mock ResidentesService — test HTTP layer only.
vi.mock('../services/residentes.service')

// Bypass verifyAuth: inject a fake req.user for all requests.
vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: (
    req: { headers: { authorization?: string; 'x-test-role'?: string; 'x-test-uid'?: string }; user?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: () => void,
  ) => {
    if (!req.headers.authorization) {
      res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
      return
    }
    const role = req.headers['x-test-role'] ?? 'admin'
    const uid = req.headers['x-test-uid'] ?? 'test-admin-uid'
    req.user = { uid, role }
    next()
  },
}))

import { ResidentesService, NotFoundError } from '../services/residentes.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockGetResidenteById = vi.mocked(ResidentesService.prototype.getResidenteById)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleResidente = {
  id: 'res-001',
  nombre: 'María',
  apellidos: 'García López',
  fechaNacimiento: '1940-05-15',
  habitacion: '101A',
  foto: null,
  diagnosticos: 'Alzheimer leve',
  alergias: 'Penicilina',
  medicacion: 'Donepezilo 5mg',
  preferencias: 'Prefiere ducharse por la mañana',
  archivado: false,
  creadoEn: '2026-01-01T00:00:00.000Z',
  actualizadoEn: '2026-04-01T00:00:00.000Z',
}

const AUTH_HEADER = 'Bearer valid-token'

// ─── GET /api/residentes/:id ──────────────────────────────────────────────────

describe('GET /api/residentes/:id — getResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with the residente when found', async () => {
    mockGetResidenteById.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .get('/api/residentes/res-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleResidente })
    expect(mockGetResidenteById).toHaveBeenCalledWith('res-001')
  })

  it('returns 404 when residente does not exist', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new NotFoundError('Residente not found'))

    const res = await request(app)
      .get('/api/residentes/non-existent')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/residentes/res-001')

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockGetResidenteById).not.toHaveBeenCalled()
  })

  it('returns 200 when gerocultor requests a residente', async () => {
    mockGetResidenteById.mockResolvedValueOnce(sampleResidente)

    const res = await request(app)
      .get('/api/residentes/res-001')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .set('x-test-uid', 'uid-gerocultor-1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: sampleResidente })
  })

  it('passes error to errorHandler (returns 500) when service throws unexpectedly', async () => {
    mockGetResidenteById.mockRejectedValueOnce(new Error('Unexpected DB error'))

    const res = await request(app)
      .get('/api/residentes/res-001')
      .set('Authorization', AUTH_HEADER)

    expect(res.status).toBe(500)
  })
})
