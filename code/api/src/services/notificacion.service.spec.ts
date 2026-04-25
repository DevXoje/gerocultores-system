/**
 * notificacion.service.spec.ts — Unit tests for NotificacionService.
 *
 * Firestore is fully mocked — no real Firebase calls happen.
 *
 * US-08: Recibir notificaciones de alertas críticas
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const mockDocRef = {
    get: vi.fn(),
    update: vi.fn(),
  }

  const mockCollectionRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    get: vi.fn(),
  }
  mockCollectionRef.where.mockReturnValue(mockCollectionRef)
  mockCollectionRef.orderBy.mockReturnValue(mockCollectionRef)
  mockCollectionRef.limit.mockReturnValue(mockCollectionRef)

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn(() => mockCollectionRef),
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
    },
  }
})

import { NotificacionService, NotFoundError, ForbiddenError } from './notificacion.service'
import { adminDb } from './firebase'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleNotifData = {
  usuarioId: 'user-uid-123',
  tipo: 'tarea_proxima',
  titulo: 'Tarea próxima',
  mensaje: 'Administrar medicación en 15 min',
  leida: false,
  referenciaId: 'tarea-uuid-001',
  referenciaModelo: 'tarea',
  creadaEn: '2026-04-25T08:00:00Z',
}

const sampleNotifDataOlder = {
  ...sampleNotifData,
  titulo: 'Notificación anterior',
  creadaEn: '2026-04-24T08:00:00Z',
}

const notifId = 'notif-uuid-001'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockDocRef: { get: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }
    _mockCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
      orderBy: ReturnType<typeof vi.fn>
      limit: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
    }
  }
  return {
    docRef: db._mockDocRef,
    collectionRef: db._mockCollectionRef,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificacionService.getNotificaciones', () => {
  let service: NotificacionService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NotificacionService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.orderBy.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
  })

  it('returns notifications for the given usuarioId sorted by creadaEn descending', async () => {
    const { collectionRef } = getMocks()
    collectionRef.get.mockResolvedValueOnce({
      docs: [
        { id: 'notif-new', data: () => ({ ...sampleNotifData, creadaEn: '2026-04-25T10:00:00Z' }) },
        { id: 'notif-old', data: () => ({ ...sampleNotifDataOlder, creadaEn: '2026-04-24T08:00:00Z' }) },
      ],
    })

    const result = await service.getNotificaciones('user-uid-123')

    expect(result.notificaciones).toHaveLength(2)
    // first is newest
    expect(result.notificaciones[0].id).toBe('notif-new')
    expect(result.notificaciones[1].id).toBe('notif-old')
    expect(result.total).toBe(2)
  })

  it('filters by leida=false when specified', async () => {
    const { collectionRef } = getMocks()
    collectionRef.get.mockResolvedValueOnce({
      docs: [
        { id: 'notif-unread', data: () => ({ ...sampleNotifData, leida: false }) },
      ],
    })

    const result = await service.getNotificaciones('user-uid-123', false)

    // Verify where was called with leida filter
    expect(collectionRef.where).toHaveBeenCalledWith('leida', '==', false)
    expect(result.notificaciones).toHaveLength(1)
    expect(result.notificaciones[0].leida).toBe(false)
  })

  it('returns empty list when user has no notifications', async () => {
    const { collectionRef } = getMocks()
    collectionRef.get.mockResolvedValueOnce({ docs: [] })

    const result = await service.getNotificaciones('user-uid-456')

    expect(result.notificaciones).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})

describe('NotificacionService.markAsRead', () => {
  let service: NotificacionService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NotificacionService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.orderBy.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
  })

  it('marks own notification as read and returns updated notification', async () => {
    const { docRef } = getMocks()
    const getSnap = { exists: true, id: notifId, data: () => ({ ...sampleNotifData, leida: false }) }
    const updatedSnap = { exists: true, id: notifId, data: () => ({ ...sampleNotifData, leida: true }) }
    docRef.get
      .mockResolvedValueOnce(getSnap)  // initial fetch for ownership check
      .mockResolvedValueOnce(updatedSnap) // fetch after update

    const result = await service.markAsRead(notifId, 'user-uid-123')

    expect(docRef.update).toHaveBeenCalledWith({ leida: true })
    expect(result.leida).toBe(true)
    expect(result.id).toBe(notifId)
  })

  it('throws NotFoundError when notification does not exist', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false, id: notifId, data: () => null })

    await expect(service.markAsRead(notifId, 'user-uid-123')).rejects.toThrow(NotFoundError)
    expect(docRef.update).not.toHaveBeenCalled()
  })

  it('throws ForbiddenError when user does not own the notification', async () => {
    const { docRef } = getMocks()
    const getSnap = { exists: true, id: notifId, data: () => ({ ...sampleNotifData, usuarioId: 'other-uid' }) }
    docRef.get.mockResolvedValueOnce(getSnap)

    await expect(service.markAsRead(notifId, 'user-uid-123')).rejects.toThrow(ForbiddenError)
    expect(docRef.update).not.toHaveBeenCalled()
  })

  it('only updates leida field, no other fields mutated', async () => {
    const { docRef } = getMocks()
    const getSnap = { exists: true, id: notifId, data: () => ({ ...sampleNotifData, leida: false }) }
    const updatedSnap = { exists: true, id: notifId, data: () => ({ ...sampleNotifData, leida: true }) }
    docRef.get
      .mockResolvedValueOnce(getSnap)
      .mockResolvedValueOnce(updatedSnap)

    await service.markAsRead(notifId, 'user-uid-123')

    // Only leida should be in the update call
    const updateArg = docRef.update.mock.calls[0][0] as Record<string, unknown>
    expect(Object.keys(updateArg)).toEqual(['leida'])
    expect(updateArg['leida']).toBe(true)
  })
})
