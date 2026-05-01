/**
 * residentes.service.spec.ts — Unit tests for ResidentesService.
 *
 * Modelo descentralizado por ownership: cada gerocultor es dueño de los
 * recursos que crea. Todos los métodos reciben solo requestingUid (sin role).
 *
 * US-05: Consulta de ficha de residente
 * US-09: Alta y gestión de residentes
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const docRefCache = new Map<string, ReturnType<typeof makeDocRef>>()

  function makeDocRef() {
    return {
      get: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
    }
  }

  const mockCollectionRef = {
    doc: vi.fn((id: string) => {
      if (!docRefCache.has(id)) docRefCache.set(id, makeDocRef())
      return docRefCache.get(id)!
    }),
    get: vi.fn(),
    where: vi.fn().mockReturnThis(),
  }

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn(() => mockCollectionRef),
      _mockCollectionRef: mockCollectionRef,
      _docRefCache: docRefCache,
    },
  }
})

import { ResidentesService, NotFoundError, ForbiddenError } from './residentes.service'
import { adminDb } from './firebase'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const ownerUid = 'gero-uid-001'
const otherUid = 'gero-uid-002'
const residenteId = 'res-uuid-001'

/** Residente creado por ownerUid — usa usuarioId (ownership) */
const sampleResidenteData = {
  nombre: 'Eleanor',
  apellidos: 'Vance',
  fechaNacimiento: '1940-05-12',
  habitacion: '204',
  foto: null,
  diagnosticos: 'Demencia leve',
  alergias: 'Penicilina',
  medicacion: 'Donepezilo 10mg',
  preferencias: 'Prefiere desayuno temprano',
  archivado: false,
  usuarioId: ownerUid,
  creadoEn: '2026-01-01T10:00:00Z',
  actualizadoEn: '2026-04-01T10:00:00Z',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
    }
    _docRefCache: Map<string, ReturnType<typeof ReturnType<typeof vi.fn>>>
  }
  const docRef = db._mockCollectionRef.doc(residenteId)
  return { docRef, collectionRef: db._mockCollectionRef }
}

// ─── getResidenteById ───────────────────────────────────────────────────────

describe('ResidentesService.getResidenteById', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('owner → returns residente', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    const result = await service.getResidenteById(residenteId, ownerUid)

    expect(result.id).toBe(residenteId)
    expect(result.nombre).toBe('Eleanor')
    expect(result.apellidos).toBe('Vance')
    expect(result.diagnosticos).toBe('Demencia leve')
    // usuarioId must be in the response
    expect(result.usuarioId).toBe(ownerUid)
  })

  it('other gerocultor (not owner) → ForbiddenError', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    await expect(
      service.getResidenteById(residenteId, otherUid),
    ).rejects.toThrow(ForbiddenError)
  })

  it('resident does not exist → NotFoundError', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(
      service.getResidenteById('non-existent-id', ownerUid),
    ).rejects.toThrow(NotFoundError)
  })

  it('null optional fields → null in response', async () => {
    const { docRef } = getMocks()
    const minimalData = {
      nombre: 'Ana',
      apellidos: 'García',
      fechaNacimiento: '1945-03-20',
      habitacion: '101',
      foto: null,
      diagnosticos: null,
      alergias: null,
      medicacion: null,
      preferencias: null,
      archivado: false,
      usuarioId: ownerUid,
      creadoEn: '2026-01-01T10:00:00Z',
      actualizadoEn: '2026-04-01T10:00:00Z',
    }

    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: 'res-minimal',
      data: () => minimalData,
    })

    const result = await service.getResidenteById('res-minimal', ownerUid)

    expect(result.foto).toBeNull()
    expect(result.diagnosticos).toBeNull()
    expect(result.alergias).toBeNull()
    expect(result.medicacion).toBeNull()
    expect(result.preferencias).toBeNull()
  })
})

// ─── createResidente ─────────────────────────────────────────────────────────

describe('ResidentesService.createResidente', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('gerocultor crea residente con datos válidos → set + retorna respuesta', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // set() succeeds
      undefined,
      // get() returns the written doc
      {
        exists: true,
        id: residenteId,
        data: () => ({
          nombre: 'María',
          apellidos: 'García López',
          fechaNacimiento: '1955-03-15',
          habitacion: '201-A',
          archivado: false,
          foto: null,
          diagnosticos: null,
          alergias: null,
          medicacion: null,
          preferencias: null,
          usuarioId: ownerUid,
          creadoEn: '2026-04-01T10:00:00Z',
          actualizadoEn: '2026-04-01T10:00:00Z',
        }),
      },
    ]
    let callCount = 0
    docRef.set = vi.fn(() => Promise.resolve(callSequence[callCount++]))
    docRef.get = vi.fn(() => Promise.resolve(callSequence[callCount++]))

    const dto = {
      nombre: 'María',
      apellidos: 'García López',
      fechaNacimiento: '1955-03-15',
      habitacion: '201-A',
    }

    const result = await service.createResidente(dto, ownerUid)

    expect(docRef.set).toHaveBeenCalledOnce()
    const setCall = (docRef.set as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(setCall.nombre).toBe('María')
    expect(setCall.habitacion).toBe('201-A')
    expect(setCall.archivado).toBe(false)
    expect(setCall.usuarioId).toBe(ownerUid) // Owner = requestingUid
    expect(setCall.id).toBeDefined()

    expect(result.id).toBe(residenteId)
    expect(result.nombre).toBe('María')
  })

  it('datos inválidos → throw con mensaje de validación', async () => {
    const { docRef } = getMocks()
    docRef.set.mockResolvedValueOnce(undefined)
    docRef.get.mockResolvedValueOnce({ exists: true, id: residenteId, data: () => sampleResidenteData })

    await expect(
      service.createResidente({ nombre: '', apellidos: '', fechaNacimiento: '', habitacion: '' }, ownerUid),
    ).rejects.toThrow(/Validation error/)
  })
})

// ─── listResidentes ──────────────────────────────────────────────────────────

describe('ResidentesService.listResidentes', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('gerocultor ve solo sus propios residentes (filter=active)', async () => {
    const { collectionRef } = getMocks()
    const mockGet = vi.fn().mockResolvedValueOnce({
      docs: [
        // Residente creado por ownerUid
        { id: 'res-1', data: () => ({ ...sampleResidenteData, archivado: false }) },
        // Residente creado por otro gerocultor — NO debe aparecer
        { id: 'res-2', data: () => ({ ...sampleResidenteData, usuarioId: otherUid, archivado: false }) },
      ],
    })
    collectionRef.get = mockGet

    const result = await service.listResidentes('active', ownerUid)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('res-1')
  })

  it('gerocultor ve solo sus propios residentes (filter=all)', async () => {
    const { collectionRef } = getMocks()
    const mockGet = vi.fn().mockResolvedValueOnce({
      docs: [
        { id: 'res-1', data: () => ({ ...sampleResidenteData, archivado: false }) },
        { id: 'res-2', data: () => ({ ...sampleResidenteData, archivado: true }) },
        { id: 'res-3', data: () => ({ ...sampleResidenteData, usuarioId: otherUid, archivado: false }) },
      ],
    })
    collectionRef.get = mockGet

    const result = await service.listResidentes('all', ownerUid)

    expect(result).toHaveLength(2) // res-1 y res-2 (ambos de ownerUid)
    expect(result.map((r) => r.id)).toContain('res-1')
    expect(result.map((r) => r.id)).toContain('res-2')
    expect(result.map((r) => r.id)).not.toContain('res-3')
  })
})

// ─── updateResidente ─────────────────────────────────────────────────────────

describe('ResidentesService.updateResidente', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('owner actualiza residente existente → update + retorna con nombre actualizado', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // 1st get: check exists + ownership
      { exists: true, id: residenteId, data: () => sampleResidenteData },
      // 2nd get: fetch updated doc
      { exists: true, id: residenteId, data: () => ({ ...sampleResidenteData, nombre: 'Updated' }) },
    ]
    let callCount = 0
    docRef.get = vi.fn(() => Promise.resolve(callSequence[callCount++]))

    const result = await service.updateResidente(residenteId, { nombre: 'Updated' }, ownerUid)

    expect(docRef.update).toHaveBeenCalledOnce()
    expect((docRef.update as ReturnType<typeof vi.fn>).mock.calls[0][0]).toHaveProperty('actualizadoEn')
    expect(result.nombre).toBe('Updated')
  })

  it('other gerocultor (no owner) → ForbiddenError', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    await expect(
      service.updateResidente(residenteId, { nombre: 'X' }, otherUid),
    ).rejects.toThrow(ForbiddenError)
  })

  it('residente no existe → NotFoundError', async () => {
    const { docRef } = getMocks()
    docRef.get = vi.fn().mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(
      service.updateResidente('non-existent', { nombre: 'X' }, ownerUid),
    ).rejects.toThrow(NotFoundError)
  })
})

// ─── archiveResidente ────────────────────────────────────────────────────────

describe('ResidentesService.archiveResidente', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    const { docRef, collectionRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    service = new ResidentesService()
  })

  it('owner archiva residente → archivado: true', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // 1st get: check exists + ownership
      { exists: true, id: residenteId, data: () => sampleResidenteData },
      // 2nd get: fetch archived doc
      { exists: true, id: residenteId, data: () => ({ ...sampleResidenteData, archivado: true }) },
    ]
    let callCount = 0
    docRef.get = vi.fn(() => Promise.resolve(callSequence[callCount++]))

    const result = await service.archiveResidente(residenteId, ownerUid)

    expect(docRef.update).toHaveBeenCalledOnce()
    const updateCall = (docRef.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateCall.archivado).toBe(true)
    expect(result.archivado).toBe(true)
  })

  it('other gerocultor (no owner) → ForbiddenError', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    await expect(
      service.archiveResidente(residenteId, otherUid),
    ).rejects.toThrow(ForbiddenError)
  })
})
