/**
 * residentes.service.spec.ts — Unit tests for ResidentesService.
 *
 * Firestore is fully mocked — no emulator needed.
 * US-05: Consulta de ficha de residente
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock firebase before any service imports
vi.mock('./firebase', () => ({
  adminDb: {
    collection: vi.fn(),
  },
}))

import { adminDb } from './firebase'
import { ResidentesService, NotFoundError } from './residentes.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleData = {
  nombre: 'María',
  apellidos: 'García López',
  fechaNacimiento: '1940-05-15',
  habitacion: '101A',
  foto: null,
  diagnosticos: 'Alzheimer leve',
  alergias: 'Penicilina',
  medicacion: 'Donepezilo 5mg',
  preferencias: 'Prefiere ducharse por la mañana',
  archivado: false,
  creadoEn: '2026-01-01T00:00:00.000Z',
  actualizadoEn: '2026-04-01T00:00:00.000Z',
}

describe('ResidentesService', () => {
  let service: ResidentesService
  let mockDocGet: ReturnType<typeof vi.fn>
  let mockDoc: ReturnType<typeof vi.fn>
  let mockCollection: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ResidentesService()

    mockDocGet = vi.fn()
    mockDoc = vi.fn().mockReturnValue({ get: mockDocGet })
    mockCollection = vi.fn().mockReturnValue({ doc: mockDoc })
    vi.mocked(adminDb.collection).mockImplementation(mockCollection)
  })

  describe('getResidenteById', () => {
    it('returns ResidenteResponse when document exists', async () => {
      mockDocGet.mockResolvedValueOnce({
        exists: true,
        id: 'res-001',
        data: () => sampleData,
      })

      const result = await service.getResidenteById('res-001')

      expect(result.id).toBe('res-001')
      expect(result.nombre).toBe(sampleData.nombre)
      expect(result.apellidos).toBe(sampleData.apellidos)
      expect(result.habitacion).toBe(sampleData.habitacion)
      expect(result.archivado).toBe(false)
      expect(result.foto).toBeNull()
      expect(result.diagnosticos).toBe(sampleData.diagnosticos)
      expect(mockDoc).toHaveBeenCalledWith('res-001')
    })

    it('throws NotFoundError when document does not exist', async () => {
      mockDocGet.mockResolvedValueOnce({ exists: false })

      await expect(service.getResidenteById('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('uses COLLECTIONS.residentes collection name', async () => {
      mockDocGet.mockResolvedValueOnce({
        exists: true,
        id: 'res-001',
        data: () => sampleData,
      })

      await service.getResidenteById('res-001')

      expect(mockCollection).toHaveBeenCalledWith('residents')
    })

    it('maps nullable fields to null when absent from Firestore doc', async () => {
      const minimalData = {
        nombre: 'Juan',
        apellidos: 'Perez',
        fechaNacimiento: '1945-01-01',
        habitacion: '202',
        archivado: false,
        creadoEn: '2026-01-01T00:00:00.000Z',
        actualizadoEn: '2026-01-01T00:00:00.000Z',
        // foto, diagnosticos, alergias, medicacion, preferencias absent
      }

      mockDocGet.mockResolvedValueOnce({
        exists: true,
        id: 'res-002',
        data: () => minimalData,
      })

      const result = await service.getResidenteById('res-002')

      expect(result.foto).toBeNull()
      expect(result.diagnosticos).toBeNull()
      expect(result.alergias).toBeNull()
      expect(result.medicacion).toBeNull()
      expect(result.preferencias).toBeNull()
    })
  })
})
