/**
 * tareas.service.spec.ts — Unit tests for TareasService.
 *
 * Firestore is fully mocked — no real Firebase calls happen.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
// NOTE: vi.mock is hoisted, so the factory must not reference top-level variables.
// We use vi.fn() directly inside the factory to avoid ReferenceError.

vi.mock('../services/firebase', () => {
  const mockTx = {
    get: vi.fn(),
    update: vi.fn(),
  }

  const mockDocRef = {
    get: vi.fn(),
  }

  const mockCollectionRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    get: vi.fn(),
  }
  mockCollectionRef.where.mockReturnValue(mockCollectionRef)

  const mockRunTransaction = vi.fn(async (cb: (tx: typeof mockTx) => Promise<void>) => {
    await cb(mockTx)
  })

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn(() => mockCollectionRef),
      runTransaction: mockRunTransaction,
      _mockTx: mockTx,
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
      _mockRunTransaction: mockRunTransaction,
    },
  }
})

import { TareasService, NotFoundError, ForbiddenError } from './tareas.service'
import { adminDb } from './firebase'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleTareaData = {
  titulo: 'Administrar medicación',
  tipo: 'medicacion',
  fechaHora: '2026-04-18T08:00:00Z',
  estado: 'pendiente',
  notas: null,
  residenteId: 'res-uuid-456',
  usuarioId: 'user-uid-123',
  creadoEn: '2026-04-17T10:00:00Z',
  actualizadoEn: '2026-04-17T10:00:00Z',
  completadaEn: null,
}

const tareaId = 'tarea-uuid-001'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockTx: { get: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }
    _mockDocRef: { get: ReturnType<typeof vi.fn> }
    _mockCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
    }
    _mockRunTransaction: ReturnType<typeof vi.fn>
  }
  return {
    tx: db._mockTx,
    docRef: db._mockDocRef,
    collectionRef: db._mockCollectionRef,
    runTransaction: db._mockRunTransaction,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TareasService.updateEstado', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    collectionRef.where.mockReturnValue(collectionRef)
  })

  it('successfully updates estado when admin calls updateEstado', async () => {
    const { tx, docRef } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: 'user-uid-123' }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    const snapAfter = {
      exists: true,
      id: tareaId,
      data: () => ({ ...sampleTareaData, estado: 'en_curso', actualizadoEn: '2026-04-18T09:00:00Z' }),
    }
    docRef.get.mockResolvedValueOnce(snapAfter)

    const result = await service.updateEstado(tareaId, 'en_curso', 'admin-uid', 'admin')

    expect(getMocks().runTransaction).toHaveBeenCalledOnce()
    expect(tx.update).toHaveBeenCalledOnce()
    expect(result.id).toBe(tareaId)
  })

  it('successfully updates estado when gerocultor updates their own task', async () => {
    const ownUid = 'user-uid-123'
    const { tx, docRef } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: ownUid }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    const snapAfter = {
      exists: true,
      id: tareaId,
      data: () => ({ ...sampleTareaData, estado: 'completada', completadaEn: '2026-04-18T09:00:00Z' }),
    }
    docRef.get.mockResolvedValueOnce(snapAfter)

    const result = await service.updateEstado(tareaId, 'completada', ownUid, 'gerocultor')

    expect(tx.update).toHaveBeenCalledOnce()
    const updateArg = tx.update.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg['completadaEn']).toBeDefined()
    expect(result.id).toBe(tareaId)
  })

  it('throws NotFoundError when task does not exist', async () => {
    const { tx } = getMocks()

    const snapInTx = { exists: false, data: () => null }
    tx.get.mockResolvedValueOnce(snapInTx)

    await expect(
      service.updateEstado(tareaId, 'en_curso', 'any-uid', 'admin'),
    ).rejects.toThrow(NotFoundError)
  })

  it('throws ForbiddenError when gerocultor tries to update another user task', async () => {
    const { tx } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: 'other-uid' }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    await expect(
      service.updateEstado(tareaId, 'en_curso', 'requesting-uid', 'gerocultor'),
    ).rejects.toThrow(ForbiddenError)

    expect(tx.update).not.toHaveBeenCalled()
  })

  it('sets completadaEn only when estado is completada', async () => {
    const ownUid = 'user-uid-123'
    const { tx, docRef } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: ownUid }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    const snapAfter = {
      exists: true,
      id: tareaId,
      data: () => ({ ...sampleTareaData, estado: 'en_curso' }),
    }
    docRef.get.mockResolvedValueOnce(snapAfter)

    await service.updateEstado(tareaId, 'en_curso', ownUid, 'gerocultor')

    const updateArg = tx.update.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg['completadaEn']).toBeUndefined()
    expect(updateArg['estado']).toBe('en_curso')
    expect(updateArg['actualizadoEn']).toBeDefined()
  })
})

describe('TareasService.getTareaById', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('returns tarea when it exists', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: tareaId,
      data: () => sampleTareaData,
    })

    const result = await service.getTareaById(tareaId)
    expect(result.id).toBe(tareaId)
    expect(result.titulo).toBe(sampleTareaData.titulo)
  })

  it('throws NotFoundError when tarea does not exist', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(service.getTareaById('non-existent')).rejects.toThrow(NotFoundError)
  })
})
