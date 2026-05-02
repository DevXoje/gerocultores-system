/**
 * notificaciones.routes.spec.ts — Supertest integration tests for notificaciones routes.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Strategy: mock firebase + verifyAuth + service, test HTTP layer only.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Hoisted mock fns (available inside vi.mock factories) ───────────────────

const { mockGetNotificaciones, mockMarkAsRead } = vi.hoisted(() => ({
  mockGetNotificaciones: vi.fn(),
  mockMarkAsRead: vi.fn(),
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

vi.mock('../services/notificacion.service', () => {
  class NotFoundError extends Error {
    constructor(msg: string) { super(msg); this.name = 'NotFoundError' }
  }
  class ForbiddenError extends Error {
    constructor(msg: string) { super(msg); this.name = 'ForbiddenError' }
  }

  function NotificacionService(this: unknown) {
    const self = this as { getNotificaciones: typeof mockGetNotificaciones; markAsRead: typeof mockMarkAsRead }
    self.getNotificaciones = mockGetNotificaciones
    self.markAsRead = mockMarkAsRead
  }

  return { NotFoundError, ForbiddenError, NotificacionService }
})

import request from 'supertest'
import app from '../app'
import { NotFoundError, ForbiddenError } from '../services/notificacion.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_NOTIF = {
  id: 'notif-001',
  usuarioId: 'gero-uid-001',
  tipo: 'tarea_proxima',
  titulo: 'Tarea próxima',
  mensaje: 'Medicación en 15 min',
  leida: false,
  creadaEn: '2026-04-25T08:00:00Z',
}

// ─── GET /api/notificaciones ──────────────────────────────────────────────────

describe('GET /api/notificaciones', () => {
  beforeEach(() => {
    mockGetNotificaciones.mockReset()
    mockMarkAsRead.mockReset()
  })

  it('returns 200 with list of notificaciones', async () => {
    mockGetNotificaciones.mockResolvedValue([MOCK_NOTIF])

    const res = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toMatchObject({ id: 'notif-001' })
  })

  it('accepts optional leida=false query param', async () => {
    mockGetNotificaciones.mockResolvedValue([])

    const res = await request(app)
      .get('/api/notificaciones?leida=false')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(mockGetNotificaciones).toHaveBeenCalledWith('gero-uid-001', false, expect.anything())
  })

  it('accepts optional limit query param', async () => {
    mockGetNotificaciones.mockResolvedValue([])

    const res = await request(app)
      .get('/api/notificaciones?limit=5')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(mockGetNotificaciones).toHaveBeenCalledWith('gero-uid-001', undefined, 5)
  })

  it('returns 401 when verifyAuth rejects the token', async () => {
    const { verifyAuth } = await import('../middleware/verifyAuth')
    ;(verifyAuth as ReturnType<typeof vi.fn>).mockImplementationOnce((_req, res) => {
      res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
    })

    const res = await request(app).get('/api/notificaciones')

    expect(res.status).toBe(401)
  })
})

// ─── PATCH /api/notificaciones/:id/leida ──────────────────────────────────────

describe('PATCH /api/notificaciones/:id/leida', () => {
  beforeEach(() => {
    mockGetNotificaciones.mockReset()
    mockMarkAsRead.mockReset()
  })

  it('returns 200 with updated notificacion on success', async () => {
    const updated = { ...MOCK_NOTIF, leida: true }
    mockMarkAsRead.mockResolvedValue(updated)

    const res = await request(app)
      .patch('/api/notificaciones/notif-001/leida')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ notificacion: { id: 'notif-001', leida: true } })
  })

  it('returns 404 when notificacion does not exist', async () => {
    mockMarkAsRead.mockRejectedValue(new NotFoundError('not found'))

    const res = await request(app)
      .patch('/api/notificaciones/nonexistent/leida')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(404)
  })

  it('returns 403 when user is not the owner', async () => {
    mockMarkAsRead.mockRejectedValue(new ForbiddenError('forbidden'))

    const res = await request(app)
      .patch('/api/notificaciones/notif-001/leida')
      .set('Authorization', 'Bearer fake-token')

    expect(res.status).toBe(403)
  })
})
