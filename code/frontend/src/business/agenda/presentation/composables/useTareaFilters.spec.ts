/**
 * useTareaFilters.spec.ts
 *
 * Unit tests for the useTareaFilters presentation composable.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * All tests use mocked store state — no real API calls.
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

// ── Mock tareasApi (store uses it indirectly through composables) ───────────
vi.mock('@/infrastructure/tareas/tareas.api', () => ({
  tareasApi: {
    getTareas: vi.fn().mockResolvedValue([]),
    updateTareaStatus: vi.fn(),
  },
}))

import { useTareaFilters } from './useTareaFilters'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTarea(overrides: Partial<TareaResponse> = {}): TareaResponse {
  return {
    id: 'tarea-1',
    titulo: 'Administrar medicación',
    tipo: 'medicacion',
    fechaHora: '2026-05-01T08:00:00Z',
    estado: 'pendiente',
    notas: null,
    residenteId: 'residente-1',
    usuarioId: 'usuario-1',
    creadoEn: '2026-05-01T00:00:00Z',
    actualizadoEn: '2026-05-01T00:00:00Z',
    completadaEn: null,
    ...overrides,
  }
}

// ── Test helpers ─────────────────────────────────────────────────────────────

describe('useTareaFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  // ── Initial state ───────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with all filters null', () => {
      const { filters } = useTareaFilters()
      expect(filters.value.dateRange).toBeNull()
      expect(filters.value.tipo).toBeNull()
      expect(filters.value.estado).toBeNull()
    })

    it('starts with no active filters (hasActiveFilters = false)', () => {
      const { hasActiveFilters } = useTareaFilters()
      expect(hasActiveFilters.value).toBe(false)
    })
  })

  // ── empty allTareas ───────────────────────────────────────────────────────────

  describe('when store.allTareas is empty', () => {
    it('returns empty filteredAllTareas', () => {
      const { filteredAllTareas } = useTareaFilters()
      expect(filteredAllTareas.value).toHaveLength(0)
    })
  })

  // ── setFilter ───────────────────────────────────────────────────────────────

  describe('setFilter()', () => {
    it('sets tipo filter', () => {
      const { filters, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')
      expect(filters.value.tipo).toBe('higiene')
    })

    it('sets estado filter', () => {
      const { filters, setFilter } = useTareaFilters()
      setFilter('estado', 'completada')
      expect(filters.value.estado).toBe('completada')
    })

    it('sets dateRange filter', () => {
      const { filters, setFilter } = useTareaFilters()
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-07' })
      expect(filters.value.dateRange).toEqual({ start: '2026-05-01', end: '2026-05-07' })
    })

    it('overwrites previous tipo value', () => {
      const { filters, setFilter } = useTareaFilters()
      setFilter('tipo', 'medicacion')
      setFilter('tipo', 'higiene')
      expect(filters.value.tipo).toBe('higiene')
    })
  })

  // ── filteredAllTareas logic ───────────────────────────────────────────────────

  describe('filteredAllTareas computed', () => {
    it('returns all tareas when no filters are active', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1' }),
        makeTarea({ id: 'tarea-2' }),
        makeTarea({ id: 'tarea-3' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas } = useTareaFilters()
      expect(filteredAllTareas.value).toHaveLength(3)
    })

    it('filters by tipo', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', tipo: 'higiene' }),
        makeTarea({ id: 'tarea-2', tipo: 'medicacion' }),
        makeTarea({ id: 'tarea-3', tipo: 'higiene' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')

      expect(filteredAllTareas.value).toHaveLength(2)
      expect(filteredAllTareas.value.every((t) => t.tipo === 'higiene')).toBe(true)
    })

    it('filters by estado', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', estado: 'pendiente' }),
        makeTarea({ id: 'tarea-2', estado: 'completada' }),
        makeTarea({ id: 'tarea-3', estado: 'pendiente' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('estado', 'pendiente')

      expect(filteredAllTareas.value).toHaveLength(2)
      expect(filteredAllTareas.value.every((t) => t.estado === 'pendiente')).toBe(true)
    })

    it('filters by dateRange — within range', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', fechaHora: '2026-05-01T08:00:00Z' }),
        makeTarea({ id: 'tarea-2', fechaHora: '2026-05-03T08:00:00Z' }),
        makeTarea({ id: 'tarea-3', fechaHora: '2026-05-10T08:00:00Z' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-07' })

      expect(filteredAllTareas.value).toHaveLength(2)
    })

    it('filters by dateRange — task on start boundary is included', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', fechaHora: '2026-05-01T00:00:00Z' }),
        makeTarea({ id: 'tarea-2', fechaHora: '2026-04-30T23:59:59Z' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-01' })

      expect(filteredAllTareas.value).toHaveLength(1)
      expect(filteredAllTareas.value[0].id).toBe('tarea-1')
    })

    it('filters by dateRange — task on end boundary is included', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', fechaHora: '2026-05-01T23:59:59Z' }),
        makeTarea({ id: 'tarea-2', fechaHora: '2026-05-02T00:00:00Z' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-01' })

      expect(filteredAllTareas.value).toHaveLength(1)
      expect(filteredAllTareas.value[0].id).toBe('tarea-1')
    })

    it('combines multiple active filters (AND logic)', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', tipo: 'higiene', estado: 'pendiente' }),
        makeTarea({ id: 'tarea-2', tipo: 'higiene', estado: 'completada' }),
        makeTarea({ id: 'tarea-3', tipo: 'medicacion', estado: 'pendiente' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')
      setFilter('estado', 'pendiente')

      expect(filteredAllTareas.value).toHaveLength(1)
      expect(filteredAllTareas.value[0].id).toBe('tarea-1')
    })

    it('returns all tareas when only dateRange is null but tipo/estado are set', () => {
      const tareas = [
        makeTarea({ id: 'tarea-1', tipo: 'higiene' }),
        makeTarea({ id: 'tarea-2', tipo: 'higiene' }),
      ]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')
      // dateRange is still null — should not filter by date

      expect(filteredAllTareas.value).toHaveLength(2)
    })
  })

  // ── clearFilters ────────────────────────────────────────────────────────────

  describe('clearFilters()', () => {
    it('resets all filters to null', () => {
      const { filters, clearFilters, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')
      setFilter('estado', 'completada')
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-07' })

      clearFilters()

      expect(filters.value.tipo).toBeNull()
      expect(filters.value.estado).toBeNull()
      expect(filters.value.dateRange).toBeNull()
    })

    it('makes hasActiveFilters return false after clearing', () => {
      const { clearFilters, setFilter, hasActiveFilters } = useTareaFilters()
      setFilter('tipo', 'higiene')
      clearFilters()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('after clear, filteredAllTareas returns the full store.allTareas', () => {
      const tareas = [makeTarea({ id: 'tarea-1' }), makeTarea({ id: 'tarea-2' })]
      const store = useTareasStore()
      store.setAllTareas(tareas)

      const { filteredAllTareas, setFilter, clearFilters } = useTareaFilters()
      setFilter('estado', 'completada') // no tarea matches — result is empty
      clearFilters()

      expect(filteredAllTareas.value).toHaveLength(2)
    })
  })

  // ── hasActiveFilters ─────────────────────────────────────────────────────────

  describe('hasActiveFilters computed', () => {
    it('returns false when all filters are null', () => {
      const { hasActiveFilters } = useTareaFilters()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when tipo is set', () => {
      const { hasActiveFilters, setFilter } = useTareaFilters()
      setFilter('tipo', 'higiene')
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when estado is set', () => {
      const { hasActiveFilters, setFilter } = useTareaFilters()
      setFilter('estado', 'pendiente')
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when dateRange is set', () => {
      const { hasActiveFilters, setFilter } = useTareaFilters()
      setFilter('dateRange', { start: '2026-05-01', end: '2026-05-07' })
      expect(hasActiveFilters.value).toBe(true)
    })
  })
})
