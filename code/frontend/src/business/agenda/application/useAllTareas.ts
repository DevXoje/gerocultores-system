/**
 * useAllTareas — application composable for loading all tasks (no date filter).
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/ — orchestrates infrastructure calls.
 *   - Delegates state to tareasStore (Pinia) — composable is NEVER the state owner.
 *   - No Firebase calls directly; uses tareasApi from infrastructure/.
 *   - Returns domain types (TareaResponse from domain/entities/tarea.types.ts).
 *   - Composable is consumed by presentation layer (TasksView).
 */
import { storeToRefs } from 'pinia'
import { tareasApi } from '@/infrastructure/tareas/tareas.api'
import { isServerHealthy } from '@/infrastructure/apiClient'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'

export function useAllTareas() {
  const store = useTareasStore()
  const { allTareas, isLoading: isLoadingAll, error } = storeToRefs(store)

  /**
   * Load ALL tasks (no date filter) into store.allTareas.
   * Used by the calendar view (TasksView) to display tasks across all dates.
   */
  async function cargarTodas(): Promise<void> {
    store.setLoadingAll(true)
    store.setError(null)

    const healthy = await isServerHealthy()
    if (!healthy) {
      store.setServerReachable(false)
      store.setError('Servidor no disponible. Inténtalo más tarde.')
      store.setLoadingAll(false)
      return
    }
    store.setServerReachable(true)

    try {
      const tareasData = await tareasApi.getTareas({})
      store.setAllTareas(tareasData)
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Error al cargar las tareas')
    } finally {
      store.setLoadingAll(false)
    }
  }

  return {
    allTareas,
    isLoading: isLoadingAll,
    error,
    cargarTodas,
  }
}
