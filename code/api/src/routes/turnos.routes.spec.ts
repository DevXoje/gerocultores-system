/**
 * turnos.routes.spec.ts — Supertest integration tests for turnos routes.
 *
 * US-11: Resumen de fin de turno
 *
 * Strategy: mock firebase + verifyAuth + service, test HTTP layer only.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Hoisted mock fns (available inside vi.mock factories) ───────────────────

const { mockOpenTurno, mockCloseTurno, mockGetTurnoActivo, mockGetResumen } = vi.hoisted(() => ({
  mockOpenTurno: vi.fn(),
  mockCloseTurno: vi.fn(),
  mockGetTurnoActivo: vi.fn(),
  mockGetResumen: vi.fn(),
}))

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../services/firebase', () => ({
  adminAuth: { verifyIdToken: vi.fn() },
  adminDb: { collection: vi.fn() },
}))

vi.mock('../middleware/verifyAuth', () => ({
  verifyAuth: vi.fn((req, _res, next) => {
    req.user = { uid: 'gero-uid-001', rol: 'gerocultor' }
    next()
  }),
  requireRole: vi.fn(() => (_req, _res, next) => next()),
}))

vi.mock('../services/turno.service', () => {
  class ConflictError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ConflictError' }
  }
  class NotFoundError extends Error {
    constructor(msg: string) { super(msg); this.name = 'NotFoundError' }
  }
  class ForbiddenError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ForbiddenError' }
  }

  type Self = {
    openTurno: typeof mockOpenTurno
    closeTurno: typeof mockCloseTurno
    getTurnoActivo: typeof mockGetTurnoActivo
    getResumen: typeof mockGetResumen
  }

  function TurnoService(this: unknown) {
    const self = this as Self
    self.openTurno = mockOpenTurno
    self.closeTurno = mockCloseTurno
    self.getTurnoActivo = mockGetTurnoActivo
    self.getResumen = mockGetResumen
  }

  return { ConflictError, NotFoundError, ForbiddenError, TurnoService }
})

import request from 'supertest'
import app from '../app'
import { ConflictError, NotFoundError, ForbiddenError } from '../services/turno.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_TURNO = {
  id: 'turno-001',
  usuarioId: 'gero-uid-001',
  tipoTurno: 'manyana',
  inicio: '2026-04-25T06:00:00Z',
  fin: null,
  resumenTraspaso: null,
}

const MOCK_RESUMEN = {
  turnoId: 'turno-001',
  totalTareas: 5,
  tareasCompletadas: 4,
  incidencias: 1,
  duracionMinutos: 480,
}

// ─── POST /api/turnos ─────────────────────────────────────────────────────────

describe('POST /api/turnos', () => {
  beforeEach(() => {
    mockOpenTurno.mockReset()
  })

  it('returns 201 with the new turno on success', async () => {
    mockOpenTurno.mockResolvedValue(MOCK_TURNO)

    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', 'Bearer fake-token')
      .send({ tipoTurno: 'manyana' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ turno: { id: 'turno-001', tipoTurno: 'manyana' } })
  })

  it('returns 400 when tipoTurno is invalid', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', 'Bearer fake-token')
      .send({ tipoTurno: 'invalido' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 409 when user already has an open turno', async () => {
    mockOpenTurno.mockRejectedValue(new ConflictError('turno abierto'))

    const res = await request(app)
      .post('/api/turnos')
      .set('Authorization', 'Bearer fake-token')
      .send({ tipoTurno: 'tarde' })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ code: 'CONFLICT' })
  })

  it('returns 401 when verifyAuth rejects the token', async () => {
    const { verifyAuth } = await import('../middleware/verifyAuth')
    ;(verifyAuth as ReturnType<typeof vi.fn>).mockImplementationOnce((_req, res) => {
      res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
    })

    const res = await request(app)
      .post('/api/turnos')
      .send({ tipoTurno: 'manyana' })

    expect(res.status).toBe(401)
  })
})

// ─── GET /api/turnos/activo ───────────────────────────────────────────────────

describe('GET /api/turnos/activo', () => {
  beforeEach(() => {
    mockGetTurnoActivo.mockReset()
  })

  it('returns 200 with active turno when one exists', async () => {
    mockGetTurnoActivo.mockResolvedValue(MOCK_TURNO)

    const res = await request(app)
      .get('/api/turnos/activo')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ turno: { id: 'turno-001' } })
  })

  it('returns 200 with null when no active turno', async () => {
    mockGetTurnoActivo.mockResolvedValue(null)

    const res = await request(app)
      .get('/api/turnos/activo')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ turno: null })
  })
})

// ─── PATCH /api/turnos/:id/cierre ─────────────────────────────────────────────

describe('PATCH /api/turnos/:id/cierre', () => {
  beforeEach(() => {
    mockCloseTurno.mockReset()
  })

  it('returns 200 with closed turno on success', async () => {
    const closed = { ...MOCK_TURNO, fin: '2026-04-25T14:00:00Z', resumenTraspaso: 'Todo OK' }
    mockCloseTurno.mockResolvedValue(closed)

    const res = await request(app)
      .patch('/api/turnos/turno-001/cierre')
      .set('Authorization', 'Bearer fake-token')
      .send({ resumenTraspaso: 'Todo OK' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ turno: { fin: '2026-04-25T14:00:00Z' } })
  })

  it('returns 400 when resumenTraspaso is missing', async () => {
    const res = await request(app)
      .patch('/api/turnos/turno-001/cierre')
      .set('Authorization', 'Bearer fake-token')
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 404 when turno not found', async () => {
    mockCloseTurno.mockRejectedValue(new NotFoundError('not found'))

    const res = await request(app)
      .patch('/api/turnos/nonexistent/cierre')
      .set('Authorization', 'Bearer fake-token')
      .send({ resumenTraspaso: 'Todo OK' })

    expect(res.status).toBe(404)
  })

  it('returns 403 when user is not the owner', async () => {
    mockCloseTurno.mockRejectedValue(new ForbiddenError('forbidden'))

    const res = await request(app)
      .patch('/api/turnos/turno-001/cierre')
      .set('Authorization', 'Bearer fake-token')
      .send({ resumenTraspaso: 'Todo OK' })

    expect(res.status).toBe(403)
  })
})

// ─── GET /api/turnos/:id/resumen ──────────────────────────────────────────────

describe('GET /api/turnos/:id/resumen', () => {
  beforeEach(() => {
    mockGetResumen.mockReset()
  })

  it('returns 200 with resumen on success', async () => {
    mockGetResumen.mockResolvedValue(MOCK_RESUMEN)

    const res = await request(app)
      .get('/api/turnos/turno-001/resumen')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ resumen: { turnoId: 'turno-001' } })
  })

  it('returns 404 when turno not found', async () => {
    mockGetResumen.mockRejectedValue(new NotFoundError('not found'))

    const res = await request(app)
      .get('/api/turnos/nonexistent/resumen')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(404)
  })

  it('returns 403 when user is not the owner', async () => {
    mockGetResumen.mockRejectedValue(new ForbiddenError('forbidden'))

    const res = await request(app)
      .get('/api/turnos/turno-001/resumen')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(403)
  })
})
