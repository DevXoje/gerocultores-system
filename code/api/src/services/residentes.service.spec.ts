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
  const mockDocRef = {
    get: vi.fn(),
  }

  const mockCollectionRef = {
    doc: vi.fn(() => mockDocRef),
  }

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn(() => mockCollectionRef),
      _mockDocRef: mockDocRef,
      _mockCollectionRef: mockCollectionRef,
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

function getMocks() {
  const db = adminDb as unknown as {
    _mockDocRef: { get: ReturnType<typeof vi.fn> }
    _mockCollectionRef: { doc: ReturnType<typeof vi.fn> }
  }
  return {
    docRef: db._mockDocRef,
    collectionRef: db._mockCollectionRef,
  }
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
