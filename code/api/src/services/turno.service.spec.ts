/**
 * turno.service.spec.ts — Unit tests for TurnoService.
 *
 * Firestore is fully mocked — no real Firebase calls happen.
 *
 * US-11: Resumen de fin de turno
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const mockDocRef = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
  }

  const mockTareasCollectionRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    get: vi.fn(),
    add: vi.fn(),
  }
  mockTareasCollectionRef.where.mockReturnValue(mockTareasCollectionRef)
  mockTareasCollectionRef.orderBy.mockReturnValue(mockTareasCollectionRef)
  mockTareasCollectionRef.limit.mockReturnValue(mockTareasCollectionRef)

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

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn((name: string) => {
        if (name === 'tasks' || name === 'tareas') return mockTareasCollectionRef
        if (name === 'incidences' || name === 'incidencias') return mockTareasCollectionRef
        return mockCollectionRef
      }),
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
      _mockTareasCollectionRef: mockTareasCollectionRef,
    },
  }
})

import { TurnoService, ConflictError, NotFoundError, ForbiddenError } from './turno.service'
import { adminDb } from './firebase'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const userId = 'user-uid-123'
const turnoId = 'turno-uuid-001'

const sampleTurnoData = {
  usuarioId: userId,
  fecha: '2026-04-25T00:00:00Z',
  tipoTurno: 'manyana',
  inicio: '2026-04-25T07:00:00Z',
  fin: null,
  resumenTraspaso: null,
  creadoEn: '2026-04-25T06:55:00Z',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockDocRef: {
      get: ReturnType<typeof vi.fn>
      set: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
    }
    _mockCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
      orderBy: ReturnType<typeof vi.fn>
      limit: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
      add: ReturnType<typeof vi.fn>
    }
    _mockTareasCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
      orderBy: ReturnType<typeof vi.fn>
      limit: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
      add: ReturnType<typeof vi.fn>
    }
  }
  return {
    docRef: db._mockDocRef,
    collectionRef: db._mockCollectionRef,
    tareasCollectionRef: db._mockTareasCollectionRef,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TurnoService.openTurno', () => {
  let service: TurnoService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TurnoService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.orderBy.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
  })

  it('creates a new turno when no active shift exists', async () => {
    const { collectionRef, docRef } = getMocks()
    // No active shift found
    collectionRef.get.mockResolvedValueOnce({ docs: [] })
    // add() returns ref to new document
    const newDocRef = { id: turnoId, get: vi.fn() }
    collectionRef.add.mockResolvedValueOnce(newDocRef)
    newDocRef.get.mockResolvedValueOnce({
      exists: true,
      id: turnoId,
      data: () => ({ ...sampleTurnoData }),
    })

    const result = await service.openTurno(userId, 'manyana')

    expect(collectionRef.add).toHaveBeenCalledOnce()
    expect(result.id).toBe(turnoId)
    expect(result.usuarioId).toBe(userId)
    expect(result.tipoTurno).toBe('manyana')
    expect(result.fin).toBeNull()
  })

  it('throws ConflictError (409) when user already has an active shift', async () => {
    const { collectionRef } = getMocks()
    // Active shift exists
    collectionRef.get.mockResolvedValueOnce({
      docs: [{ id: turnoId, data: () => ({ ...sampleTurnoData }) }],
    })

    await expect(service.openTurno(userId, 'tarde')).rejects.toThrow(ConflictError)
    expect(collectionRef.add).not.toHaveBeenCalled()
  })
})

describe('TurnoService.closeTurno', () => {
  let service: TurnoService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TurnoService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.orderBy.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
  })

  it('closes own active shift and sets fin + resumenTraspaso', async () => {
    const { docRef } = getMocks()
    const getSnap = { exists: true, id: turnoId, data: () => ({ ...sampleTurnoData, fin: null }) }
    const closedSnap = {
      exists: true,
      id: turnoId,
      data: () => ({
        ...sampleTurnoData,
        fin: '2026-04-25T15:00:00Z',
        resumenTraspaso: 'Sin novedad',
      }),
    }
    docRef.get.mockResolvedValueOnce(getSnap).mockResolvedValueOnce(closedSnap)

    const result = await service.closeTurno(turnoId, userId, 'Sin novedad')

    expect(docRef.update).toHaveBeenCalledOnce()
    const updateArg = docRef.update.mock.calls[0][0] as Record<string, unknown>
    expect(updateArg['resumenTraspaso']).toBe('Sin novedad')
    expect(updateArg['fin']).toBeDefined()
    expect(result.resumenTraspaso).toBe('Sin novedad')
  })

  it('throws NotFoundError when turno does not exist', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false })

    await expect(service.closeTurno(turnoId, userId, 'Resumen')).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError when user does not own the turno', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: turnoId,
      data: () => ({ ...sampleTurnoData, usuarioId: 'other-uid' }),
    })

    await expect(service.closeTurno(turnoId, userId, 'Resumen')).rejects.toThrow(ForbiddenError)
  })
})

describe('TurnoService.getTurnoActivo', () => {
  let service: TurnoService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TurnoService()
    const { collectionRef } = getMocks()
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
  })

  it('returns null when user has no active turno', async () => {
    const { collectionRef } = getMocks()
    collectionRef.get.mockResolvedValueOnce({ docs: [] })

    const result = await service.getTurnoActivo(userId)
    expect(result).toBeNull()
  })

  it('returns the active turno when one exists', async () => {
    const { collectionRef } = getMocks()
    collectionRef.get.mockResolvedValueOnce({
      docs: [{ id: turnoId, data: () => ({ ...sampleTurnoData }) }],
    })

    const result = await service.getTurnoActivo(userId)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(turnoId)
    expect(result!.fin).toBeNull()
  })
})

describe('TurnoService.getResumen', () => {
  let service: TurnoService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TurnoService()
    const { collectionRef, docRef, tareasCollectionRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
    collectionRef.limit.mockReturnValue(collectionRef)
    tareasCollectionRef.where.mockReturnValue(tareasCollectionRef)
    tareasCollectionRef.limit.mockReturnValue(tareasCollectionRef)
    tareasCollectionRef.orderBy.mockReturnValue(tareasCollectionRef)
    // Re-wire collection routing after clearAllMocks
    const db = adminDb as unknown as { collection: ReturnType<typeof vi.fn> }
    db.collection.mockImplementation((name: string) => {
      if (name === 'tasks' || name === 'tareas' || name === 'incidences' || name === 'incidencias') {
        return tareasCollectionRef
      }
      return collectionRef
    })
  })

  it('returns summary with correct counts for tareasCompletadas and tareasPendientes', async () => {
    const { collectionRef, docRef, tareasCollectionRef } = getMocks()
    const turnoSnap = {
      exists: true,
      id: turnoId,
      data: () => ({
        ...sampleTurnoData,
        inicio: '2026-04-25T07:00:00Z',
        fin: '2026-04-25T15:00:00Z',
        resumenTraspaso: 'Turno normal',
      }),
    }
    docRef.get.mockResolvedValueOnce(turnoSnap)

    // tareas query: 2 completadas, 1 pendiente (all within the turno window)
    tareasCollectionRef.get
      .mockResolvedValueOnce({
        docs: [
          { id: 't1', data: () => ({ estado: 'completada', residenteId: 'res-1', usuarioId: userId, fechaHora: '2026-04-25T09:00:00Z' }) },
          { id: 't2', data: () => ({ estado: 'completada', residenteId: 'res-2', usuarioId: userId, fechaHora: '2026-04-25T11:00:00Z' }) },
          { id: 't3', data: () => ({ estado: 'pendiente', residenteId: 'res-1', usuarioId: userId, fechaHora: '2026-04-25T13:00:00Z' }) },
        ],
      })
      // incidencias query: 1
      .mockResolvedValueOnce({
        docs: [
          { id: 'i1', data: () => ({ residenteId: 'res-1', usuarioId: userId }) },
        ],
      })

    const result = await service.getResumen(turnoId, userId)

    expect(result.tareasCompletadas).toBe(2)
    expect(result.tareasPendientes).toBe(1)
    expect(result.incidenciasRegistradas).toBe(1)
    expect(result.residentesAtendidos).toContain('res-1')
    expect(result.residentesAtendidos).toContain('res-2')
    expect(typeof result.textoResumen).toBe('string')
    expect(result.textoResumen.length).toBeGreaterThan(0)
  })

  it('throws NotFoundError when turno does not exist', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false })

    await expect(service.getResumen(turnoId, userId)).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError when user does not own the turno', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: turnoId,
      data: () => ({ ...sampleTurnoData, usuarioId: 'other-uid' }),
    })

    await expect(service.getResumen(turnoId, userId)).rejects.toThrow(ForbiddenError)
  })
})
