/**
 * incidencias.service.spec.ts — Unit tests for IncidenciasService.
 *
 * Firestore is fully mocked — no real Firebase calls happen.
 *
 * US-06: Registro de incidencia
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mock Firebase before any imports ────────────────────────────────────────
vi.mock('../services/firebase', () => {
  const mockDocRef = {
    id: 'generated-doc-id',
  }

  const mockCollectionRef = {
    add: vi.fn(() => Promise.resolve(mockDocRef)),
  }

  return {
    adminAuth: {},
    adminDb: {
      collection: vi.fn(() => mockCollectionRef),
      _mockCollectionRef: mockCollectionRef,
      _mockDocRef: mockDocRef,
    },
  }
})

import { IncidenciasService } from './incidencias.service'
import { adminDb } from './firebase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMocks() {
  const db = adminDb as unknown as {
    _mockCollectionRef: { add: ReturnType<typeof vi.fn> }
    _mockDocRef: { id: string }
  }
  return {
    collectionRef: db._mockCollectionRef,
    docRef: db._mockDocRef,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('IncidenciasService.createIncidencia', () => {
  let service: IncidenciasService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new IncidenciasService()
    const { docRef } = getMocks()
    getMocks().collectionRef.add.mockResolvedValue(docRef)
  })

  it('creates incidencia and returns response with id', async () => {
    const dto = {
      tipo: 'caida' as const,
      severidad: 'leve' as const,
      descripcion: 'El residente se cayó al intentar levantarse',
      residenteId: 'res-uuid-001',
      tareaId: null,
    }
    const creatingUserId = 'user-uid-123'

    const result = await service.createIncidencia(dto, creatingUserId)

    expect(result.id).toBe('generated-doc-id')
    expect(result.tipo).toBe(dto.tipo)
    expect(result.severidad).toBe(dto.severidad)
    expect(result.descripcion).toBe(dto.descripcion)
    expect(result.residenteId).toBe(dto.residenteId)
    expect(result.usuarioId).toBe(creatingUserId)
    expect(result.tareaId).toBeNull()
    expect(typeof result.registradaEn).toBe('string')
  })

  it('sets registradaEn server-side (not from DTO)', async () => {
    const before = new Date().toISOString()

    const dto = {
      tipo: 'salud' as const,
      severidad: 'moderada' as const,
      descripcion: 'Temperatura elevada',
      residenteId: 'res-uuid-002',
      tareaId: undefined,
    }
    const result = await service.createIncidencia(dto, 'user-uid-999')

    const after = new Date().toISOString()
    expect(result.registradaEn >= before).toBe(true)
    expect(result.registradaEn <= after).toBe(true)
  })

  it('sets tareaId to null when not provided', async () => {
    const dto = {
      tipo: 'otro' as const,
      severidad: 'critica' as const,
      descripcion: 'Evento crítico sin tarea asociada',
      residenteId: 'res-uuid-003',
    }
    const result = await service.createIncidencia(dto, 'uid-gero-1')

    expect(result.tareaId).toBeNull()
  })

  it('stores the provided tareaId when given', async () => {
    const dto = {
      tipo: 'medicacion' as const,
      severidad: 'leve' as const,
      descripcion: 'Paciente no tomó medicación',
      residenteId: 'res-uuid-004',
      tareaId: 'tarea-uuid-001',
    }
    const result = await service.createIncidencia(dto, 'uid-gero-2')

    expect(result.tareaId).toBe('tarea-uuid-001')
  })

  it('calls Firestore add with the correct document shape', async () => {
    const { collectionRef } = getMocks()

    const dto = {
      tipo: 'comportamiento' as const,
      severidad: 'moderada' as const,
      descripcion: 'Comportamiento agresivo',
      residenteId: 'res-uuid-005',
      tareaId: null,
    }
    const creatingUserId = 'uid-admin-1'

    await service.createIncidencia(dto, creatingUserId)

    expect(collectionRef.add).toHaveBeenCalledOnce()
    const docArg = collectionRef.add.mock.calls[0][0] as Record<string, unknown>
    expect(docArg['tipo']).toBe(dto.tipo)
    expect(docArg['severidad']).toBe(dto.severidad)
    expect(docArg['descripcion']).toBe(dto.descripcion)
    expect(docArg['residenteId']).toBe(dto.residenteId)
    expect(docArg['usuarioId']).toBe(creatingUserId)
    expect(docArg['tareaId']).toBeNull()
    expect(typeof docArg['registradaEn']).toBe('string')
  })

  it('propagates Firestore errors to the caller', async () => {
    const { collectionRef } = getMocks()
    collectionRef.add.mockRejectedValueOnce(new Error('Firestore unavailable'))

    const dto = {
      tipo: 'alimentacion' as const,
      severidad: 'leve' as const,
      descripcion: 'No quiso comer',
      residenteId: 'res-uuid-006',
    }

    await expect(service.createIncidencia(dto, 'uid-gero-3')).rejects.toThrow('Firestore unavailable')
  })
})
