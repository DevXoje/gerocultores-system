/**
 * useAgendaHoy — application composable for daily agenda.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/ — orchestrates infrastructure calls.
 *   - Delegates state to tareasStore (Pinia) — composable is NEVER the state owner.
 *   - No Firebase calls directly; uses tareasApi from infrastructure/.
 *   - Returns domain types (TareaResponse from domain/entities/tarea.types.ts).
 *   - Composable is consumed by presentation layer (DashboardPage).
 */
import { storeToRefs } from 'pinia'
import { tareasApi } from '@/infrastructure/tareas/tareas.api'
import { isServerHealthy } from '@/infrastructure/apiClient'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'
import type { TareaEstado } from '@/business/agenda/domain/entities/tarea.types'

export function useAgendaHoy() {
  const store = useTareasStore()
  const { tareas, isLoading, isServerReachable, error } = storeToRefs(store)

  /**
   * Load tasks for a given date (defaults to today YYYY-MM-DD).
   * First validates server health — if unreachable, shows a friendly message
   * instead of a raw 502/connection error.
   */
  async function cargarTareas(fecha?: string): Promise<void> {
    store.setLoading(true)
    store.setError(null)

    // Health check before attempting the real API call (US-13)
    const healthy = await isServerHealthy()
    if (!healthy) {
      store.setServerReachable(false)
      store.setError('Servidor no disponible. Inténtalo más tarde.')
      store.setLoading(false)
      return
    }
    store.setServerReachable(true)

    const fechaTarget = fecha ?? new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    try {
      const tareasData = await tareasApi.getTareas({ date: fechaTarget })
      store.setTareas(tareasData)
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Error al cargar las tareas')
    } finally {
      store.setLoading(false)
    }
  }

  /**
   * Retries: re-checks server health then loads tasks.
   * Useful for the "Reintentar" button in the error UI.
   */
  async function retry(): Promise<void> {
    await cargarTareas()
  }

  /**
   * Optimistically updates a task's status.
   * Rolls back to the previous status on API error.
   *
   * US-04 CA-2: state is reflected immediately in the UI.
   */
  async function actualizarEstado(
    id: string,
    nuevoEstado: TareaEstado
  ): Promise<{ success: boolean; errorMsg?: string }> {
    const tarea = store.tareas.find((t) => t.id === id)
    if (!tarea) {
      return { success: false, errorMsg: 'Tarea no encontrada' }
    }

    const estadoPrevio = tarea.estado

    // Optimistic update — mutate store state immediately (CA-2)
    store.updateTareaEstado(id, nuevoEstado)

    try {
      const updatedTarea = await tareasApi.updateTareaStatus(id, { estado: nuevoEstado })
      store.replaceTarea(id, updatedTarea)
      return { success: true }
    } catch (err) {
      // Rollback to previous state on error
      store.updateTareaEstado(id, estadoPrevio)
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar el estado'
      return { success: false, errorMsg }
    }
  }

  /**
   * Toggle-complete helper: cycles pendiente/en_curso → completada, completada → pendiente.
   * Used by the existing TaskCard's toggleComplete emit.
   */
  async function toggleComplete(id: string): Promise<{ success: boolean; errorMsg?: string }> {
    const tarea = store.tareas.find((t) => t.id === id)
    if (!tarea) return { success: false, errorMsg: 'Tarea no encontrada' }

    const nuevoEstado: TareaEstado = tarea.estado === 'completada' ? 'pendiente' : 'completada'
    return actualizarEstado(id, nuevoEstado)
  }

  return {
    // Expose store state directly — presentation layer reads from here
    tareas,
    isLoading,
    isServerReachable,
    error,
    // Actions
    cargarTareas,
    retry,
    actualizarEstado,
    toggleComplete,
  }
}
