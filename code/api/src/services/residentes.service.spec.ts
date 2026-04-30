/**
 * residentes.service.spec.ts — Unit tests for ResidentesService.
 *
 * Firestore is fully mocked — no real Firebase calls happen.
 *
 * US-05: Consulta de ficha de residente
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  // Per-ID docRef cache so repeated calls to doc(id) return the same mock ref.
  const docRefCache = new Map<string, ReturnType<typeof makeDocRef>>()

  function makeDocRef() {
    const fn = vi.fn()
    return {
      get: fn,
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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const geroUid = 'gero-uid-001'
const adminUid = 'admin-uid-001'
const residenteId = 'res-uuid-001'

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
  gerocultoresAsignados: [geroUid],
  creadoEn: '2026-01-01T10:00:00Z',
  actualizadoEn: '2026-04-01T10:00:00Z',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDocRef() {
  return {
    get: vi.fn().mockResolvedValue({ exists: false, data: () => null }),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  }
}

function getMocks() {
  const db = adminDb as unknown as {
    _mockCollectionRef: {
      doc: ReturnType<typeof vi.fn>
      get: ReturnType<typeof vi.fn>
      where: ReturnType<typeof vi.fn>
    }
    _docRefCache: Map<string, ReturnType<typeof makeDocRef>>
  }
  const docRef = db._mockCollectionRef.doc(residenteId)
  return { docRef, collectionRef: db._mockCollectionRef }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ResidentesService.getResidenteById', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()
    const { collectionRef, docRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
  })

  it('returns residente when admin requests any resident', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    const result = await service.getResidenteById(residenteId, adminUid, 'admin')

    expect(result.id).toBe(residenteId)
    expect(result.nombre).toBe('Eleanor')
    expect(result.apellidos).toBe('Vance')
    expect(result.diagnosticos).toBe('Demencia leve')
    // gerocultoresAsignados must NOT be in the response (stripped)
    expect((result as Record<string, unknown>)['gerocultoresAsignados']).toBeUndefined()
  })

  it('returns residente when gerocultor is in gerocultoresAsignados', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    const result = await service.getResidenteById(residenteId, geroUid, 'gerocultor')

    expect(result.id).toBe(residenteId)
    expect(result.nombre).toBe('Eleanor')
  })

  it('throws ForbiddenError when gerocultor is NOT in gerocultoresAsignados', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => sampleResidenteData,
    })

    await expect(
      service.getResidenteById(residenteId, 'other-gero-uid', 'gerocultor'),
    ).rejects.toThrow(ForbiddenError)
  })

  it('throws NotFoundError when resident does not exist', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(
      service.getResidenteById('non-existent-id', adminUid, 'admin'),
    ).rejects.toThrow(NotFoundError)
  })

  it('returns null for optional fields when not present in Firestore doc', async () => {
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
      gerocultoresAsignados: [geroUid],
      creadoEn: '2026-01-01T10:00:00Z',
      actualizadoEn: '2026-04-01T10:00:00Z',
    }

    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: 'res-minimal',
      data: () => minimalData,
    })

    const result = await service.getResidenteById('res-minimal', geroUid, 'gerocultor')

    expect(result.foto).toBeNull()
    expect(result.diagnosticos).toBeNull()
    expect(result.alergias).toBeNull()
    expect(result.medicacion).toBeNull()
    expect(result.preferencias).toBeNull()
  })

  it('gerocultor with empty gerocultoresAsignados array gets ForbiddenError', async () => {
    const { docRef } = getMocks()
    docRef.get.mockResolvedValueOnce({
      exists: true,
      id: residenteId,
      data: () => ({ ...sampleResidenteData, gerocultoresAsignados: [] }),
    })

    await expect(
      service.getResidenteById(residenteId, geroUid, 'gerocultor'),
    ).rejects.toThrow(ForbiddenError)
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

  it('admin creates residente with valid data → calls set and returns 201-like response', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // set() succeeds — no return value needed
      undefined,
      // get() returns the written doc (server timestamps)
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

    const result = await service.createResidente(dto, adminUid, 'admin')

    expect(docRef.set).toHaveBeenCalledOnce()
    const setCall = (docRef.set as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(setCall.nombre).toBe('María')
    expect(setCall.apellidos).toBe('García López')
    expect(setCall.habitacion).toBe('201-A')
    expect(setCall.archivado).toBe(false)
    expect(setCall.id).toBeDefined()

    expect(result.id).toBe(residenteId)
    expect(result.nombre).toBe('María')
  })

  it('gerocultor → ForbiddenError', async () => {
    await expect(
      service.createResidente(
        { nombre: 'X', apellidos: 'Y', fechaNacimiento: '1955-03-15', habitacion: '101' },
        geroUid,
        'gerocultor',
      ),
    ).rejects.toThrow(ForbiddenError)
  })

  it('admin with invalid body → throws Error with validation message', async () => {
    const { docRef } = getMocks()
    docRef.set.mockResolvedValueOnce(undefined)
    docRef.get.mockResolvedValueOnce({ exists: true, id: residenteId, data: () => sampleResidenteData })

    // Missing required fields
    await expect(
      service.createResidente({ nombre: '', apellidos: '', fechaNacimiento: '', habitacion: '' }, adminUid, 'admin'),
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

  it('admin with filter=active → returns only active residents', async () => {
    const { collectionRef, docRef } = getMocks()
    const mockGet = vi.fn().mockResolvedValueOnce({
      docs: [
        { id: 'res-1', data: () => ({ ...sampleResidenteData, archivado: false }) },
        { id: 'res-2', data: () => ({ ...sampleResidenteData, archivado: true }) },
      ],
    })
    collectionRef.get = mockGet

    const result = await service.listResidentes('active', adminUid, 'admin')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('res-1')
  })

  it('gerocultor sees only assigned residents', async () => {
    const { collectionRef } = getMocks()
    const mockGet = vi.fn().mockResolvedValueOnce({
      docs: [
        {
          id: 'res-1',
          data: () => ({ ...sampleResidenteData, archivado: false, gerocultoresAsignados: [geroUid] }),
        },
        {
          id: 'res-2',
          data: () => ({ ...sampleResidenteData, archivado: false, gerocultoresAsignados: ['other-uid'] }),
        },
      ],
    })
    collectionRef.get = mockGet

    const result = await service.listResidentes('active', geroUid, 'gerocultor')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('res-1')
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

  it('admin updates existing residente → 200', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // 1st get: check exists
      { exists: true, id: residenteId, data: () => sampleResidenteData },
      // 2nd get: fetch updated doc
      { exists: true, id: residenteId, data: () => ({ ...sampleResidenteData, nombre: 'Updated' }) },
    ]
    let callCount = 0
    docRef.get = vi.fn(() => Promise.resolve(callSequence[callCount++]))

    const result = await service.updateResidente(residenteId, { nombre: 'Updated' }, adminUid, 'admin')

    expect(docRef.update).toHaveBeenCalledOnce()
    expect((docRef.update as ReturnType<typeof vi.fn>).mock.calls[0][0]).toHaveProperty('actualizadoEn')
    expect(result.nombre).toBe('Updated')
  })

  it('gerocultor → ForbiddenError', async () => {
    await expect(
      service.updateResidente(residenteId, { nombre: 'X' }, geroUid, 'gerocultor'),
    ).rejects.toThrow(ForbiddenError)
  })

  it('not found → NotFoundError', async () => {
    const { docRef } = getMocks()
    // Override get specifically for this test — docToResponse is never reached
    // because service checks snap.exists first
    docRef.get = vi.fn().mockResolvedValueOnce({ exists: false, data: () => null })

    await expect(
      service.updateResidente('non-existent', { nombre: 'X' }, adminUid, 'admin'),
    ).rejects.toThrow(NotFoundError)
  })
})

// ─── archiveResidente ─────────────────────────────────────────────────────────

describe('ResidentesService.archiveResidente', () => {
  let service: ResidentesService

  beforeEach(() => {
    vi.clearAllMocks()
    const { docRef, collectionRef } = getMocks()
    collectionRef.doc.mockReturnValue(docRef)
    service = new ResidentesService()
  })

  it('admin archives existing residente → 200 with archivado: true', async () => {
    const { docRef } = getMocks()
    const callSequence = [
      // 1st get: check exists
      { exists: true, id: residenteId, data: () => sampleResidenteData },
      // 2nd get: fetch archived doc
      { exists: true, id: residenteId, data: () => ({ ...sampleResidenteData, archivado: true }) },
    ]
    let callCount = 0
    docRef.get = vi.fn(() => Promise.resolve(callSequence[callCount++]))

    const result = await service.archiveResidente(residenteId, adminUid, 'admin')

    expect(docRef.update).toHaveBeenCalledOnce()
    const updateCall = (docRef.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateCall.archivado).toBe(true)
    expect(result.archivado).toBe(true)
  })

  it('gerocultor → ForbiddenError', async () => {
    await expect(
      service.archiveResidente(residenteId, geroUid, 'gerocultor'),
    ).rejects.toThrow(ForbiddenError)
  })
})
