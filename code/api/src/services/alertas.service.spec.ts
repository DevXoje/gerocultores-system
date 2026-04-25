/**
 * alertas.service.spec.ts — Unit tests for AlertasService.
 *
 * Tests the deduplication logic for tarea_proxima notifications.
 * A notification is only created if one for the same tareaId+usuarioId
 * does not already exist within the current window.
 *
 * US-08: Recibir notificaciones de alertas críticas
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase ────────────────────────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const mockDocRef = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
  }

  const mockCollectionRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    get: vi.fn(),
    add: vi.fn(),
  }
  mockCollectionRef.where.mockReturnValue(mockCollectionRef)
  mockCollectionRef.orderBy.mockReturnValue(mockCollectionRef)
  mockCollectionRef.limit.mockReturnValue(mockCollectionRef)

  const mockTareasRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    get: vi.fn(),
    add: vi.fn(),
  }
  mockTareasRef.where.mockReturnValue(mockTareasRef)
  mockTareasRef.orderBy.mockReturnValue(mockTareasRef)
  mockTareasRef.limit.mockReturnValue(mockTareasRef)

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn((name: string) => {
        if (name === 'tasks' || name === 'tareas') return mockTareasRef
        return mockCollectionRef
      }),
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
      _mockTareasRef: mockTareasRef,
    },
  }
})

import { AlertasService } from './alertas.service'
import { adminDb } from './firebase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockDocRef: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }
    _mockCollectionRef: { doc: ReturnType<typeof vi.fn>; where: ReturnType<typeof vi.fn>; limit: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; add: ReturnType<typeof vi.fn> }
    _mockTareasRef: { doc: ReturnType<typeof vi.fn>; where: ReturnType<typeof vi.fn>; limit: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; add: ReturnType<typeof vi.fn> }
  }
  return {
    notifCollectionRef: db._mockCollectionRef,
    tareasCollectionRef: db._mockTareasRef,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AlertasService.generateTareaProximaAlerts', () => {
  let service: AlertasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AlertasService()

    const db = adminDb as unknown as { collection: ReturnType<typeof vi.fn> }
    const { notifCollectionRef, tareasCollectionRef } = getMocks()
    notifCollectionRef.where.mockReturnValue(notifCollectionRef)
    notifCollectionRef.limit.mockReturnValue(notifCollectionRef)
    tareasCollectionRef.where.mockReturnValue(tareasCollectionRef)
    tareasCollectionRef.limit.mockReturnValue(tareasCollectionRef)

    db.collection.mockImplementation((name: string) => {
      if (name === 'tasks' || name === 'tareas') return tareasCollectionRef
      return notifCollectionRef
    })
  })

  it('creates a notification when none exists for the task yet', async () => {
    const { notifCollectionRef, tareasCollectionRef } = getMocks()
    const windowStart = '2026-04-25T07:00:00Z'

    // Tasks due in the next 15 min
    tareasCollectionRef.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'tarea-001',
          data: () => ({
            usuarioId: 'user-001',
            titulo: 'Administrar medicación',
            fechaHora: '2026-04-25T07:10:00Z',
            estado: 'pendiente',
          }),
        },
      ],
    })

    // No existing notification for this tareaId
    notifCollectionRef.get.mockResolvedValueOnce({ docs: [] })

    // add() call
    notifCollectionRef.add.mockResolvedValueOnce({ id: 'notif-new-001' })

    const created = await service.generateTareaProximaAlerts(windowStart)

    expect(notifCollectionRef.add).toHaveBeenCalledOnce()
    expect(created).toBe(1)
  })

  it('does NOT create a duplicate notification when one already exists for the same task', async () => {
    const { notifCollectionRef, tareasCollectionRef } = getMocks()
    const windowStart = '2026-04-25T07:00:00Z'

    // Same task
    tareasCollectionRef.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'tarea-001',
          data: () => ({
            usuarioId: 'user-001',
            titulo: 'Administrar medicación',
            fechaHora: '2026-04-25T07:10:00Z',
            estado: 'pendiente',
          }),
        },
      ],
    })

    // Existing notification for this tareaId already exists
    notifCollectionRef.get.mockResolvedValueOnce({
      docs: [{ id: 'notif-existing-001', data: () => ({ tareaId: 'tarea-001' }) }],
    })

    const created = await service.generateTareaProximaAlerts(windowStart)

    expect(notifCollectionRef.add).not.toHaveBeenCalled()
    expect(created).toBe(0)
  })

  it('creates notifications only for tasks without existing notifications (mixed case)', async () => {
    const { notifCollectionRef, tareasCollectionRef } = getMocks()
    const windowStart = '2026-04-25T07:00:00Z'

    // Two tasks due in the window
    tareasCollectionRef.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'tarea-001',
          data: () => ({
            usuarioId: 'user-001',
            titulo: 'Tarea 1',
            fechaHora: '2026-04-25T07:05:00Z',
            estado: 'pendiente',
          }),
        },
        {
          id: 'tarea-002',
          data: () => ({
            usuarioId: 'user-001',
            titulo: 'Tarea 2',
            fechaHora: '2026-04-25T07:12:00Z',
            estado: 'pendiente',
          }),
        },
      ],
    })

    // tarea-001 already has a notification; tarea-002 does not
    notifCollectionRef.get
      .mockResolvedValueOnce({ docs: [{ id: 'notif-existing' }] }) // for tarea-001
      .mockResolvedValueOnce({ docs: [] })                         // for tarea-002

    notifCollectionRef.add.mockResolvedValueOnce({ id: 'notif-new-002' })

    const created = await service.generateTareaProximaAlerts(windowStart)

    expect(notifCollectionRef.add).toHaveBeenCalledOnce()
    expect(created).toBe(1)
  })

  it('returns 0 when no tasks are due in the window', async () => {
    const { tareasCollectionRef } = getMocks()
    const windowStart = '2026-04-25T07:00:00Z'

    tareasCollectionRef.get.mockResolvedValueOnce({ docs: [] })

    const created = await service.generateTareaProximaAlerts(windowStart)

    expect(created).toBe(0)
  })
})
