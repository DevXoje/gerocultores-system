/**
 * tareas.service.spec.ts — Unit tests for TareasService.
 *
 * Modelo descentralizado por ownership: un gerocultor solo puede modificar
 * sus propias tareas y crear tareas solo para sí mismo.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 * US-14: Crear tarea
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const mockTx = {
    get: vi.fn(),
    update: vi.fn(),
  }

  const mockDocRef = {
    get: vi.fn(),
    set: vi.fn(),
    collection: vi.fn(() => ({
      doc: vi.fn(() => mockDocRef),
    })),
  }

  const mockSubColRef = {
    doc: vi.fn(() => mockDocRef),
    set: vi.fn(),
  }

  const mockResidenteDocRef = {
    get: vi.fn(),
    collection: vi.fn(() => mockSubColRef),
  }

  const mockCollectionRef = {
    doc: vi.fn(() => mockDocRef),
    where: vi.fn(),
    get: vi.fn(),
  }

  const mockResidenteCollectionRef = {
    doc: vi.fn(() => mockResidenteDocRef),
  }

  mockCollectionRef.where.mockReturnValue(mockCollectionRef)

  const mockRunTransaction = vi.fn(async (cb: (tx: typeof mockTx) => Promise<void>) => {
    await cb(mockTx)
  })

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn((name: string) => {
        if (name === 'residents') return mockResidenteCollectionRef
        return mockCollectionRef
      }),
      runTransaction: mockRunTransaction,
      _mockTx: mockTx,
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
      _mockRunTransaction: mockRunTransaction,
      _mockResidenteDocRef: mockResidenteDocRef,
      _mockSubColRef: mockSubColRef,
    },
  }
})

import { TareasService, NotFoundError, ForbiddenError } from './tareas.service'
import { ValidationError, ResidenteNotFoundError, AccessDeniedError } from './tareas.service'
import { adminDb } from './firebase'
import { CreateTareaSchema } from '../types/tarea.types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ownerUid = 'gero-uid-001'
const otherUid = 'gero-uid-002'

const sampleTareaData = {
  titulo: 'Administrar medicación',
  tipo: 'medicacion',
  fechaHora: '2026-04-18T08:00:00Z',
  estado: 'pendiente',
  notas: null,
  residenteId: 'res-uuid-456',
  usuarioId: ownerUid,
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

  it('owner actualiza estado de su propia tarea → completada', async () => {
    const { tx, docRef } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: ownerUid }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    const snapAfter = {
      exists: true,
      id: tareaId,
      data: () => ({ ...sampleTareaData, estado: 'completada', completadaEn: '2026-04-18T09:00:00Z' }),
    }
    docRef.get.mockResolvedValueOnce(snapAfter)

    const result = await service.updateEstado(tareaId, 'completada', ownerUid)

    expect(getMocks().runTransaction).toHaveBeenCalledOnce()
    expect(tx.update).toHaveBeenCalledOnce()
    const updateArg = tx.update.mock.calls[0][1] as Record<string, unknown>
    expect(updateArg['completadaEn']).toBeDefined()
    expect(result.id).toBe(tareaId)
  })

  it('throw NotFoundError si la tarea no existe', async () => {
    const { tx } = getMocks()
    tx.get.mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(
      service.updateEstado(tareaId, 'en_curso', ownerUid),
    ).rejects.toThrow(NotFoundError)
  })

  it('ForbiddenError cuando intenta actualizar tarea de otro gerocultor', async () => {
    const { tx } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: otherUid }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    await expect(
      service.updateEstado(tareaId, 'en_curso', ownerUid),
    ).rejects.toThrow(ForbiddenError)

    expect(tx.update).not.toHaveBeenCalled()
  })

  it('completadaEn solo se establece cuando estado es completada', async () => {
    const { tx, docRef } = getMocks()

    const snapInTx = { exists: true, data: () => ({ ...sampleTareaData, usuarioId: ownerUid }) }
    tx.get.mockResolvedValueOnce(snapInTx)

    const snapAfter = {
      exists: true,
      id: tareaId,
      data: () => ({ ...sampleTareaData, estado: 'en_curso' }),
    }
    docRef.get.mockResolvedValueOnce(snapAfter)

    await service.updateEstado(tareaId, 'en_curso', ownerUid)

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

  it('retorna tarea cuando existe', async () => {
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

  it('throw NotFoundError cuando no existe', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(service.getTareaById('non-existent')).rejects.toThrow(NotFoundError)
  })
})

// ─── CreateTareaSchema unit tests ────────────────────────────────────────────

describe('CreateTareaSchema', () => {
  const validDto = {
    titulo: 'Baño matutino',
    tipo: 'higiene',
    fechaHora: '2026-04-20T08:00:00Z',
    residenteId: '550e8400-e29b-41d4-a716-446655440001',
    usuarioId: ownerUid,
    notas: 'Evitar agua muy caliente',
  }

  it('parsea un DTO válido', () => {
    const result = CreateTareaSchema.safeParse(validDto)
    expect(result.success).toBe(true)
  })

  it('parsea DTO sin notas (opcional)', () => {
    const { notas: _notas, ...dtoWithoutNotas } = validDto
    const result = CreateTareaSchema.safeParse(dtoWithoutNotas)
    expect(result.success).toBe(true)
  })

  it('rechaza titulo vacío', () => {
    const result = CreateTareaSchema.safeParse({ ...validDto, titulo: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza tipo inválido', () => {
    const result = CreateTareaSchema.safeParse({ ...validDto, tipo: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rechaza fechaHora no ISO8601', () => {
    const result = CreateTareaSchema.safeParse({ ...validDto, fechaHora: 'not-a-date' })
    expect(result.success).toBe(false)
  })

  it('rechaza residenteId que no es UUID', () => {
    const result = CreateTareaSchema.safeParse({ ...validDto, residenteId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rechaza campos requeridos faltantes', () => {
    const result = CreateTareaSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ─── TareasService.createTarea ──────────────────────────────────────────────

describe('TareasService.createTarea', () => {
  let service: TareasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TareasService()
  })

  function getResidenteMocks() {
    const db = adminDb as unknown as {
      _mockResidenteDocRef: { get: ReturnType<typeof vi.fn> }
      _mockDocRef: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }
    }
    return {
      residenteDocRef: db._mockResidenteDocRef,
      tareaDocRef: db._mockDocRef,
    }
  }

  it('gerocultor crea tarea para sí mismo → 201 con estado pendiente', async () => {
    const { residenteDocRef, tareaDocRef } = getResidenteMocks()

    // Residente existe y está activo
    residenteDocRef.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ archivado: false }),
    })
    tareaDocRef.set.mockResolvedValueOnce(undefined)

    const dto = {
      titulo: 'Baño matutino',
      tipo: 'higiene',
      fechaHora: '2026-04-20T08:00:00Z',
      residenteId: '550e8400-e29b-41d4-a716-446655440001',
      usuarioId: ownerUid,
      notas: 'Evitar agua muy caliente',
    }

    const result = await service.createTarea(dto, ownerUid)

    expect(result.estado).toBe('pendiente')
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/) // UUID v4 without collection prefix
    expect(result.titulo).toBe('Baño matutino')
    expect(result.tipo).toBe('higiene')
    expect(result.creadoEn).toBeDefined()
    expect(result.actualizadoEn).toBeDefined()
    expect(result.completadaEn).toBeNull()
    expect(tareaDocRef.set).toHaveBeenCalledOnce()
  })

  it('throw ResidenteNotFoundError si residente no existe', async () => {
    const { residenteDocRef } = getResidenteMocks()
    // UUID válido que pasa schema pero no existe en Firestore
    residenteDocRef.get.mockResolvedValueOnce({ exists: false })

    const dto = {
      titulo: 'Baño',
      tipo: 'higiene',
      fechaHora: '2026-04-20T08:00:00Z',
      residenteId: '550e8400-e29b-41d4-a716-446655440000',
      usuarioId: ownerUid,
    }

    await expect(
      service.createTarea(dto, ownerUid),
    ).rejects.toThrow(ResidenteNotFoundError)
  })

  it('throw ResidenteNotFoundError si residente está archivado', async () => {
    const { residenteDocRef } = getResidenteMocks()
    residenteDocRef.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ archivado: true }),
    })

    const dto = {
      titulo: 'Baño',
      tipo: 'higiene',
      fechaHora: '2026-04-20T08:00:00Z',
      residenteId: '550e8400-e29b-41d4-a716-446655440001',
      usuarioId: ownerUid,
    }

    await expect(
      service.createTarea(dto, ownerUid),
    ).rejects.toThrow(ResidenteNotFoundError)
  })

  it('throw AccessDeniedError si usuarioId !== requestingUid', async () => {
    const { residenteDocRef } = getResidenteMocks()
    // Residente existe y activo — la verificación de ownership falla DESPUÉS
    residenteDocRef.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ archivado: false }),
    })

    const dto = {
      titulo: 'Baño',
      tipo: 'higiene',
      fechaHora: '2026-04-20T08:00:00Z',
      residenteId: '550e8400-e29b-41d4-a716-446655440001',
      usuarioId: otherUid, // Intenta crear para otro gerocultor
    }

    await expect(
      service.createTarea(dto, ownerUid), // pero requester es ownerUid → AccessDeniedError
    ).rejects.toThrow(AccessDeniedError)
  })

  it('throw ValidationError cuando DTO es inválido', async () => {
    const invalidDto = { titulo: '', tipo: 'higiene', fechaHora: '2026-04-20T08:00:00Z', residenteId: '550e8400-e29b-41d4-a716-446655440001', usuarioId: ownerUid }

    await expect(
      service.createTarea(invalidDto, ownerUid),
    ).rejects.toThrow(ValidationError)
  })
})
