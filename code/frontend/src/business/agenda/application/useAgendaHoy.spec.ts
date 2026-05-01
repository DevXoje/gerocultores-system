/**
 * useAgendaHoy.spec.ts
 *
 * Unit tests for the useAgendaHoy application composable.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * All calls to tareasApi are mocked — no real HTTP traffic.
 * Uses createTestingPinia so the store is real and composable tests
 * exercise the full state flow (store + infrastructure mocks).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { TareaResponse } from '@/business/agenda/domain/entities/tarea.types'

// ── Mock firebase/auth (required because apiClient imports it) ─────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

// ── Mock isServerHealthy (no real HTTP) ─────────────────────────────────────
vi.mock('@/infrastructure/apiClient', () => ({
  isServerHealthy: vi.fn(() => Promise.resolve(true)),
}))

// ── Mock the entire tareasApi ─────────────────────────────────────────────────
const mockGetTareas = vi.fn()
const mockUpdateTareaStatus = vi.fn()

vi.mock('@/infrastructure/tareas/tareas.api', () => ({
  tareasApi: {
    getTareas: (...args: unknown[]) => mockGetTareas(...args),
    updateTareaStatus: (...args: unknown[]) => mockUpdateTareaStatus(...args),
  },
}))

import { useAgendaHoy } from './useAgendaHoy'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTarea(overrides: Partial<TareaResponse> = {}): TareaResponse {
  return {
    id: 'tarea-1',
    titulo: 'Administrar medicación',
    tipo: 'medicacion',
    fechaHora: '2026-04-24T08:00:00Z',
    estado: 'pendiente',
    notas: null,
    residenteId: 'residente-1',
    usuarioId: 'usuario-1',
    creadoEn: '2026-04-24T00:00:00Z',
    actualizadoEn: '2026-04-24T00:00:00Z',
    completadaEn: null,
    ...overrides,
  }
}

describe('useAgendaHoy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  // ── cargarTareas ─────────────────────────────────────────────────────────────

  describe('cargarTareas()', () => {
    it('loads tasks and populates tareas ref on success', async () => {
      const mockTareas = [makeTarea({ id: 'tarea-1' }), makeTarea({ id: 'tarea-2' })]
      mockGetTareas.mockResolvedValue(mockTareas)

      const { tareas, cargarTareas } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      expect(tareas.value).toHaveLength(2)
      expect(tareas.value[0].id).toBe('tarea-1')
    })

    it('calls tareasApi.getTareas with the provided date', async () => {
      mockGetTareas.mockResolvedValue([])

      const { cargarTareas } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      expect(mockGetTareas).toHaveBeenCalledWith({ date: '2026-04-24' })
    })

    it('uses today as default date when no fecha is provided', async () => {
      const today = new Date().toISOString().slice(0, 10)
      mockGetTareas.mockResolvedValue([])

      const { cargarTareas } = useAgendaHoy()
      await cargarTareas()

      expect(mockGetTareas).toHaveBeenCalledWith({ date: today })
    })

    it('sets isLoading to false after successful load', async () => {
      mockGetTareas.mockResolvedValue([])

      const { isLoading, cargarTareas } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      expect(isLoading.value).toBe(false)
    })

    it('sets error when tareasApi throws', async () => {
      mockGetTareas.mockRejectedValue(new Error('Network error'))

      const { error, cargarTareas } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      expect(error.value).toBe('Network error')
    })

    it('sets isLoading to false even on error', async () => {
      mockGetTareas.mockRejectedValue(new Error('Network error'))

      const { isLoading, cargarTareas } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      expect(isLoading.value).toBe(false)
    })
  })

  // ── actualizarEstado ─────────────────────────────────────────────────────────

  describe('actualizarEstado()', () => {
    it('applies optimistic update immediately (before API resolves)', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'pendiente' })
      mockGetTareas.mockResolvedValue([tarea])

      const updatedTarea = { ...tarea, estado: 'completada' as const }
      let resolveUpdate!: (value: TareaResponse) => void
      mockUpdateTareaStatus.mockReturnValue(
        new Promise<TareaResponse>((res) => {
          resolveUpdate = res
        })
      )

      const { tareas, cargarTareas, actualizarEstado } = useAgendaHoy()
      await cargarTareas('2026-04-24')

      // Start the update (don't await yet)
      const updatePromise = actualizarEstado('tarea-1', 'completada')

      // Optimistic state should already be applied
      expect(tareas.value[0].estado).toBe('completada')

      // Now resolve the API call
      resolveUpdate(updatedTarea)
      const result = await updatePromise

      expect(result.success).toBe(true)
    })

    it('syncs with server response after successful API call', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'pendiente' })
      mockGetTareas.mockResolvedValue([tarea])

      const serverTarea: TareaResponse = {
        ...tarea,
        estado: 'completada',
        completadaEn: '2026-04-24T10:00:00Z',
      }
      mockUpdateTareaStatus.mockResolvedValue(serverTarea)

      const { tareas, cargarTareas, actualizarEstado } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      await actualizarEstado('tarea-1', 'completada')

      expect(tareas.value[0].completadaEn).toBe('2026-04-24T10:00:00Z')
    })

    it('rolls back to previous estado on API error', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'pendiente' })
      mockGetTareas.mockResolvedValue([tarea])
      mockUpdateTareaStatus.mockRejectedValue(new Error('Server error'))

      const { tareas, cargarTareas, actualizarEstado } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      const result = await actualizarEstado('tarea-1', 'completada')

      // Should have rolled back
      expect(tareas.value[0].estado).toBe('pendiente')
      expect(result.success).toBe(false)
      expect(result.errorMsg).toBe('Server error')
    })

    it('returns success=false and errorMsg when tarea is not found', async () => {
      mockGetTareas.mockResolvedValue([])

      const { cargarTareas, actualizarEstado } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      const result = await actualizarEstado('non-existent', 'completada')

      expect(result.success).toBe(false)
      expect(result.errorMsg).toBe('Tarea no encontrada')
    })
  })

  // ── toggleComplete ───────────────────────────────────────────────────────────

  describe('toggleComplete()', () => {
    it('sets estado to completada when current estado is pendiente', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'pendiente' })
      mockGetTareas.mockResolvedValue([tarea])
      mockUpdateTareaStatus.mockResolvedValue({
        ...tarea,
        estado: 'completada' as const,
      })

      const { cargarTareas, toggleComplete } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      const result = await toggleComplete('tarea-1')

      expect(mockUpdateTareaStatus).toHaveBeenCalledWith('tarea-1', { estado: 'completada' })
      expect(result.success).toBe(true)
    })

    it('sets estado to completada when current estado is en_curso', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'en_curso' })
      mockGetTareas.mockResolvedValue([tarea])
      mockUpdateTareaStatus.mockResolvedValue({
        ...tarea,
        estado: 'completada' as const,
      })

      const { cargarTareas, toggleComplete } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      await toggleComplete('tarea-1')

      expect(mockUpdateTareaStatus).toHaveBeenCalledWith('tarea-1', { estado: 'completada' })
    })

    it('sets estado to pendiente when current estado is completada', async () => {
      const tarea = makeTarea({ id: 'tarea-1', estado: 'completada' })
      mockGetTareas.mockResolvedValue([tarea])
      mockUpdateTareaStatus.mockResolvedValue({
        ...tarea,
        estado: 'pendiente' as const,
      })

      const { cargarTareas, toggleComplete } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      await toggleComplete('tarea-1')

      expect(mockUpdateTareaStatus).toHaveBeenCalledWith('tarea-1', { estado: 'pendiente' })
    })

    it('returns success=false when tarea is not found', async () => {
      mockGetTareas.mockResolvedValue([])

      const { cargarTareas, toggleComplete } = useAgendaHoy()
      await cargarTareas('2026-04-24')
      const result = await toggleComplete('non-existent')

      expect(result.success).toBe(false)
      expect(result.errorMsg).toBe('Tarea no encontrada')
    })
  })
})
