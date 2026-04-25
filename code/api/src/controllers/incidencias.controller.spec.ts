/**
 * incidencias.controller.spec.ts — Supertest controller-level tests for /api/incidencias.
 *
 * IncidenciasService is fully mocked — no Firestore or Firebase Auth calls happen.
 * verifyAuth is mocked to inject req.user; Firebase module is mocked to prevent init.
 *
 * US-06: Registro de incidencia
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

// Mock IncidenciasService — we test the HTTP layer only.
vi.mock('../services/incidencias.service')

// Bypass verifyAuth: inject a fake req.user for all requests in this suite.
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
    const uid = req.headers['x-test-uid'] ?? 'test-admin-uid'
    const role = req.headers['x-test-role'] ?? 'admin'
    req.user = { uid, role }
    next()
  },
}))

import { IncidenciasService } from '../services/incidencias.service'
import app from '../app'

// ─── Mocked service methods ────────────────────────────────────────────────────

const mockCreateIncidencia = vi.mocked(IncidenciasService.prototype.createIncidencia)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleIncidencia = {
  id: 'inc-001',
  tipo: 'caida' as const,
  severidad: 'leve' as const,
  descripcion: 'El residente se cayó al levantarse',
  residenteId: 'res-001',
  usuarioId: 'test-admin-uid',
  tareaId: null,
  registradaEn: '2026-04-19T10:00:00.000Z',
}

const AUTH_HEADER = 'Bearer valid-token'

const validBody = {
  tipo: 'caida',
  severidad: 'leve',
  descripcion: 'El residente se cayó al levantarse',
  residenteId: 'res-001',
}

// ─── POST /api/incidencias ────────────────────────────────────────────────────

describe('POST /api/incidencias — createIncidencia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created incidencia when body is valid', async () => {
    mockCreateIncidencia.mockResolvedValueOnce(sampleIncidencia)

    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send(validBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ data: sampleIncidencia })
    expect(mockCreateIncidencia).toHaveBeenCalledOnce()
  })

  it('calls service with correct DTO and the authenticated user uid', async () => {
    mockCreateIncidencia.mockResolvedValueOnce(sampleIncidencia)

    await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-uid', 'uid-gerocultor-1')
      .send(validBody)

    expect(mockCreateIncidencia).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'caida',
        severidad: 'leve',
        descripcion: 'El residente se cayó al levantarse',
        residenteId: 'res-001',
      }),
      'uid-gerocultor-1',
    )
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .send(validBody)

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(mockCreateIncidencia).not.toHaveBeenCalled()
  })

  it('returns 400 with VALIDATION_ERROR when tipo is missing', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ severidad: 'leve', descripcion: 'Test', residenteId: 'res-001' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateIncidencia).not.toHaveBeenCalled()
  })

  it('returns 400 with VALIDATION_ERROR when severidad is missing', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ tipo: 'caida', descripcion: 'Test', residenteId: 'res-001' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(mockCreateIncidencia).not.toHaveBeenCalled()
  })

  it('returns 400 with VALIDATION_ERROR when descripcion is missing', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ tipo: 'caida', severidad: 'leve', residenteId: 'res-001' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('returns 400 with VALIDATION_ERROR when residenteId is missing', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ tipo: 'caida', severidad: 'leve', descripcion: 'Test' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('returns 400 when tipo is an invalid enum value', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validBody, tipo: 'accidente' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('returns 400 when severidad is an invalid enum value', async () => {
    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validBody, severidad: 'alta' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('accepts optional tareaId in body', async () => {
    const withTareaId = { ...sampleIncidencia, tareaId: 'tarea-001' }
    mockCreateIncidencia.mockResolvedValueOnce(withTareaId)

    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send({ ...validBody, tareaId: 'tarea-001' })

    expect(res.status).toBe(201)
    expect(res.body.data.tareaId).toBe('tarea-001')
  })

  it('both admin and gerocultor can create incidencia', async () => {
    mockCreateIncidencia.mockResolvedValue(sampleIncidencia)

    const adminRes = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'admin')
      .send(validBody)

    const geroRes = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .set('x-test-role', 'gerocultor')
      .send(validBody)

    expect(adminRes.status).toBe(201)
    expect(geroRes.status).toBe(201)
  })

  it('passes error to errorHandler (returns 500) when service throws', async () => {
    mockCreateIncidencia.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const res = await request(app)
      .post('/api/incidencias')
      .set('Authorization', AUTH_HEADER)
      .send(validBody)

    expect(res.status).toBe(500)
  })
})
