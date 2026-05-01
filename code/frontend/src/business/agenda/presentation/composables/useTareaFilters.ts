/**
 * useTareaFilters — presentation composable for task filter state management.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in presentation/composables/ — UI state management.
 *   - Reads from store.allTareas and applies client-side filtering.
 *   - Returns reactive filter state + computed filtered results.
 */
import { ref, computed } from 'vue'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'
import type { TareaTipo, TareaEstado } from '@/business/agenda/domain/entities/tarea.types'

export interface TareaFilters {
  dateRange: { start: string; end: string } | null // ISO date strings (YYYY-MM-DD)
  tipo: TareaTipo | null
  estado: TareaEstado | null
}

export function useTareaFilters() {
  const store = useTareasStore()

  const filters = ref<TareaFilters>({
    dateRange: null,
    tipo: null,
    estado: null,
  })

  /**
   * Returns true if at least one filter is active.
   */
  const hasActiveFilters = computed(() => {
    return (
      filters.value.dateRange !== null ||
      filters.value.tipo !== null ||
      filters.value.estado !== null
    )
  })

  /**
   * Client-side filter over store.allTareas.
   * - dateRange: matches tasks whose fechaHora falls within [start, end]
   * - tipo: exact match on tarea.tipo
   * - estado: exact match on tarea.estado
   */
  const filteredAllTareas = computed(() => {
    return store.allTareas.filter((tarea) => {
      if (filters.value.tipo !== null && tarea.tipo !== filters.value.tipo) {
        return false
      }
      if (filters.value.estado !== null && tarea.estado !== filters.value.estado) {
        return false
      }
      if (filters.value.dateRange !== null) {
        const fecha = tarea.fechaHora.slice(0, 10) // YYYY-MM-DD from ISO8601
        if (fecha < filters.value.dateRange.start || fecha > filters.value.dateRange.end) {
          return false
        }
      }
      return true
    })
  })

  function setFilter(key: keyof TareaFilters, value: TareaFilters[keyof TareaFilters]): void {
    filters.value = { ...filters.value, [key]: value }
  }

  function clearFilters(): void {
    filters.value = { dateRange: null, tipo: null, estado: null }
  }

  return {
    filters,
    filteredAllTareas,
    hasActiveFilters,
    setFilter,
    clearFilters,
  }
}
