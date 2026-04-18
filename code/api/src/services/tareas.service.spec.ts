/**
 * tareas.service.spec.ts — Unit tests for TareasService.
 *
 * Firestore (adminDb) is mocked — no real Firebase calls.
 * Tests cover: listTareas (with/without filters), createTarea, updateTareaEstado, addNota.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase BEFORE any import that depends on it ──────────────────────
// vi.mock is hoisted — factory MUST NOT reference top-level variables.
// We use vi.fn() inline and retrieve them via vi.mocked() after import.

vi.mock('../services/firebase', () => {
  const mockDocGet = vi.fn()
  const mockUpdate = vi.fn()
  const mockAdd = vi.fn()
  const mockGet = vi.fn()
  const mockWhere = vi.fn()
  const mockOrderBy = vi.fn()

  const chainable: Record<string, unknown> = {}
  chainable['where'] = (..._args: unknown[]) => chainable
  chainable['orderBy'] = (..._args: unknown[]) => ({ get: mockGet })
  chainable['get'] = mockGet

  mockWhere.mockReturnValue(chainable)
  mockOrderBy.mockReturnValue({ get: mockGet })

  const mockDocRef = { get: mockDocGet, update: mockUpdate }
  const mockCollectionRef = {
    ...chainable,
    add: mockAdd,
    doc: vi.fn().mockReturnValue(mockDocRef),
    where: mockWhere,
    orderBy: mockOrderBy,
  }

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn().mockReturnValue(mockCollectionRef),
    },
    // expose internals so tests can access mocks
    __mocks: {
      mockGet,
      mockAdd,
      mockUpdate,
      mockDocGet,
      mockWhere,
      mockCollectionRef,
    },
  }
})

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import * as firebaseModule from '../services/firebase'
import { TareasService } from '../services/tareas.service'

// ─── Access the mock internals ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mocks = (firebaseModule as any)['__mocks'] as {
  mockGet: ReturnType<typeof vi.fn>
  mockAdd: ReturnType<typeof vi.fn>
  mockUpdate: ReturnType<typeof vi.fn>
  mockDocGet: ReturnType<typeof vi.fn>
  mockWhere: ReturnType<typeof vi.fn>
  mockCollectionRef: Record<string, ReturnType<typeof vi.fn>>
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockTimestamp = (isoString: string) => ({
  toDate: () => new Date(isoString),
})

const sampleDocData = {
  titulo: 'Higiene matutina',
  tipo: 'higiene',
  fechaHora: mockTimestamp('2026-04-20T08:00:00.000Z'),
  estado: 'pendiente',
  notas: null,
  residenteId: 'res-001',
  usuarioId: 'usr-001',
  creadoEn: mockTimestamp('2026-04-18T10:00:00.000Z'),
  actualizadoEn: mockTimestamp('2026-04-18T10:00:00.000Z'),
  completadaEn: null,
}

const sampleDocSnapshot = {
  id: 'tarea-001',
  data: () => sampleDocData,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TareasService.listTareas', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
  })

  it('returns empty array when collection is empty', async () => {
    mocks.mockGet.mockResolvedValueOnce({ docs: [] })

    const result = await service.listTareas()

    expect(result).toEqual([])
  })

  it('returns mapped TareaResponse array', async () => {
    mocks.mockGet.mockResolvedValueOnce({ docs: [sampleDocSnapshot] })

    const result = await service.listTareas()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'tarea-001',
      titulo: 'Higiene matutina',
      tipo: 'higiene',
      estado: 'pendiente',
      notas: null,
      residenteId: 'res-001',
      usuarioId: 'usr-001',
      completadaEn: null,
    })
    expect(result[0].fechaHora).toBe('2026-04-20T08:00:00.000Z')
  })

  it('passes usuarioId filter to Firestore query', async () => {
    mocks.mockGet.mockResolvedValueOnce({ docs: [] })

    await service.listTareas({ usuarioId: 'usr-001' })

    expect(mocks.mockWhere).toHaveBeenCalledWith('usuarioId', '==', 'usr-001')
  })

  it('passes residenteId filter to Firestore query', async () => {
    mocks.mockGet.mockResolvedValueOnce({ docs: [] })

    await service.listTareas({ residenteId: 'res-001' })

    expect(mocks.mockWhere).toHaveBeenCalledWith('residenteId', '==', 'res-001')
  })
})

describe('TareasService.createTarea', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
  })

  it('adds a document to Firestore and returns TareaResponse', async () => {
    const fakeRef = { id: 'new-tarea-id' }
    mocks.mockAdd.mockResolvedValueOnce(fakeRef)

    const dto = {
      titulo: 'Administrar medicación',
      tipo: 'medicacion' as const,
      fechaHora: '2026-04-20T10:00:00.000Z',
      notas: null,
      residenteId: 'res-002',
      usuarioId: 'usr-003',
    }

    const result = await service.createTarea(dto)

    expect(mocks.mockAdd).toHaveBeenCalledOnce()
    expect(result).toMatchObject({
      id: 'new-tarea-id',
      titulo: 'Administrar medicación',
      tipo: 'medicacion',
      estado: 'pendiente',
      notas: null,
      residenteId: 'res-002',
      usuarioId: 'usr-003',
      completadaEn: null,
    })
  })

  it('sets estado to pendiente regardless of caller intent', async () => {
    mocks.mockAdd.mockResolvedValueOnce({ id: 'tarea-x' })

    const result = await service.createTarea({
      titulo: 'Test',
      tipo: 'otro',
      fechaHora: '2026-04-20T10:00:00.000Z',
      residenteId: 'res-001',
      usuarioId: 'usr-001',
    })

    expect(result.estado).toBe('pendiente')
  })

  it('throws when Firestore add fails', async () => {
    mocks.mockAdd.mockRejectedValueOnce(new Error('Firestore unavailable'))

    await expect(
      service.createTarea({
        titulo: 'Test',
        tipo: 'higiene',
        fechaHora: '2026-04-20T10:00:00.000Z',
        residenteId: 'res-001',
        usuarioId: 'usr-001',
      }),
    ).rejects.toThrow('Firestore unavailable')
  })
})

describe('TareasService.updateTareaEstado', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
  })

  it('updates estado and returns updated TareaResponse', async () => {
    mocks.mockUpdate.mockResolvedValueOnce(undefined)
    const updatedData = { ...sampleDocData, estado: 'completada' }
    mocks.mockDocGet.mockResolvedValueOnce({
      exists: true,
      id: 'tarea-001',
      data: () => updatedData,
    })

    const result = await service.updateTareaEstado('tarea-001', { estado: 'completada' })

    expect(mocks.mockUpdate).toHaveBeenCalledOnce()
    const updateArg = mocks.mockUpdate.mock.calls[0][0] as Record<string, unknown>
    expect(updateArg).toHaveProperty('completadaEn')
    expect(result.estado).toBe('completada')
  })

  it('does NOT set completadaEn when estado is not completada', async () => {
    mocks.mockUpdate.mockResolvedValueOnce(undefined)
    const updatedData = { ...sampleDocData, estado: 'en_curso' }
    mocks.mockDocGet.mockResolvedValueOnce({
      exists: true,
      id: 'tarea-001',
      data: () => updatedData,
    })

    await service.updateTareaEstado('tarea-001', { estado: 'en_curso' })

    const updateArg = mocks.mockUpdate.mock.calls[0][0] as Record<string, unknown>
    expect(updateArg).not.toHaveProperty('completadaEn')
  })

  it('throws when document does not exist after update', async () => {
    mocks.mockUpdate.mockResolvedValueOnce(undefined)
    mocks.mockDocGet.mockResolvedValueOnce({ exists: false })

    await expect(
      service.updateTareaEstado('missing-id', { estado: 'completada' }),
    ).rejects.toThrow('Tarea missing-id not found after update')
  })
})

describe('TareasService.addNota', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
  })

  it('updates notas and returns updated TareaResponse', async () => {
    mocks.mockUpdate.mockResolvedValueOnce(undefined)
    const updatedData = { ...sampleDocData, notas: 'Nueva nota de seguimiento' }
    mocks.mockDocGet.mockResolvedValueOnce({
      exists: true,
      id: 'tarea-001',
      data: () => updatedData,
    })

    const result = await service.addNota('tarea-001', { notas: 'Nueva nota de seguimiento' })

    expect(mocks.mockUpdate).toHaveBeenCalledOnce()
    expect(result.notas).toBe('Nueva nota de seguimiento')
  })

  it('throws when document does not exist after update', async () => {
    mocks.mockUpdate.mockResolvedValueOnce(undefined)
    mocks.mockDocGet.mockResolvedValueOnce({ exists: false })

    await expect(service.addNota('missing-id', { notas: 'test' })).rejects.toThrow(
      'Tarea missing-id not found after update',
    )
  })
})
