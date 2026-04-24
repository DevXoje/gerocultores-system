/**
 * useResidente.spec.ts
 *
 * Unit tests for the useResidente presentation composable.
 *
 * US-05: Consulta de ficha de residente
 *
 * The infrastructure layer (residentes.api) is mocked — no real HTTP traffic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ResidenteDTO } from '../../domain/entities/residente.types'

// ── Mock firebase/auth (required transitively via apiClient) ─────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

// ── Mock the infrastructure layer ────────────────────────────────────────────
const mockGetResidente = vi.fn()

vi.mock('../../infrastructure/residentes.api', () => ({
  getResidente: (...args: unknown[]) => mockGetResidente(...args),
}))

import { useResidente } from './useResidente'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeResidente(overrides: Partial<ResidenteDTO> = {}): ResidenteDTO {
  return {
    id: 'res-1',
    nombre: 'María',
    apellidos: 'González López',
    fechaNacimiento: '1940-05-12',
    habitacion: '101',
    foto: null,
    diagnosticos: 'Diabetes tipo 2',
    alergias: 'Penicilina',
    medicacion: 'Metformina 500mg',
    preferencias: 'Prefiere comida sin sal',
    archivado: false,
    creadoEn: '2026-01-01T00:00:00Z',
    actualizadoEn: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('useResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchResidente()', () => {
    it('loads the resident and populates residente ref on success', async () => {
      const mockData = makeResidente()
      mockGetResidente.mockResolvedValue(mockData)

      const { residente, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      expect(mockGetResidente).toHaveBeenCalledWith('res-1')
      expect(residente.value).not.toBeNull()
      expect(residente.value?.id).toBe('res-1')
    })

    it('correctly maps all fields from the API response', async () => {
      const mockData = makeResidente()
      mockGetResidente.mockResolvedValue(mockData)

      const { residente, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      const r = residente.value!
      expect(r.nombre).toBe('María')
      expect(r.apellidos).toBe('González López')
      expect(r.fechaNacimiento).toBe('1940-05-12')
      expect(r.habitacion).toBe('101')
      expect(r.diagnosticos).toBe('Diabetes tipo 2')
      expect(r.alergias).toBe('Penicilina')
      expect(r.medicacion).toBe('Metformina 500mg')
      expect(r.archivado).toBe(false)
    })

    it('sets loading to false after successful fetch', async () => {
      mockGetResidente.mockResolvedValue(makeResidente())

      const { loading, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      expect(loading.value).toBe(false)
    })

    it('starts with loading=false before any fetch is called', () => {
      const { loading } = useResidente()
      expect(loading.value).toBe(false)
    })

    it('starts with residente=null before any fetch is called', () => {
      const { residente } = useResidente()
      expect(residente.value).toBeNull()
    })

    it('resets residente to null at the start of a new fetch', async () => {
      // First fetch succeeds
      mockGetResidente.mockResolvedValueOnce(makeResidente({ id: 'res-1' }))
      // Second fetch is pending (we test the interim null state)
      let resolveSecond!: (v: ResidenteDTO) => void
      mockGetResidente.mockReturnValueOnce(
        new Promise<ResidenteDTO>((res) => {
          resolveSecond = res
        }),
      )

      const { residente, fetchResidente } = useResidente()
      await fetchResidente('res-1')
      expect(residente.value?.id).toBe('res-1')

      // Start second fetch — residente should clear immediately
      const secondFetch = fetchResidente('res-2')
      expect(residente.value).toBeNull()

      resolveSecond(makeResidente({ id: 'res-2' }))
      await secondFetch
    })

    it('sets error message when getResidente throws an Error', async () => {
      mockGetResidente.mockRejectedValue(new Error('Not found'))

      const { error, fetchResidente } = useResidente()
      await fetchResidente('non-existent')

      expect(error.value).toBe('Not found')
    })

    it('sets error message when getResidente throws a string', async () => {
      mockGetResidente.mockRejectedValue('Unauthorized')

      const { error, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      expect(error.value).toBe('Unauthorized')
    })

    it('sets a generic error message for unknown error types', async () => {
      mockGetResidente.mockRejectedValue({ code: 404 })

      const { error, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      expect(error.value).toBe('Error desconocido')
    })

    it('sets loading to false even on error', async () => {
      mockGetResidente.mockRejectedValue(new Error('Not found'))

      const { loading, fetchResidente } = useResidente()
      await fetchResidente('res-1')

      expect(loading.value).toBe(false)
    })

    it('clears previous error on a new fetch', async () => {
      // First fetch fails
      mockGetResidente.mockRejectedValueOnce(new Error('Not found'))
      // Second fetch succeeds
      mockGetResidente.mockResolvedValueOnce(makeResidente())

      const { error, fetchResidente } = useResidente()
      await fetchResidente('bad-id')
      expect(error.value).toBe('Not found')

      await fetchResidente('res-1')
      expect(error.value).toBeNull()
    })
  })
})
