/**
 * useAgendaHoy — application composable for daily agenda.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Architecture rules (frontend-specialist.md §3):
 *   - Lives in application/ — allowed to call infrastructure (tareasApi).
 *   - No Firebase calls directly; uses tareasApi from services/.
 *   - Returns domain types (TareaResponse from domain/entities/tarea.types.ts).
 *   - Composable is consumed by presentation layer (DashboardView).
 */

import { ref, readonly } from 'vue'
import { tareasApi } from '@/services/tareas.api'
import { isServerHealthy } from '@/services/apiClient'
import type { TareaResponse, TareaEstado } from '@/business/agenda/domain/entities/tarea.types'

export function useAgendaHoy() {
  const tareas = ref<TareaResponse[]>([])
  const isLoading = ref(false)
  const isServerReachable = ref(true)
  const error = ref<string | null>(null)

  /**
   * Load tasks for a given date (defaults to today YYYY-MM-DD).
   * First validates server health — if unreachable, shows a friendly message
   * instead of a raw 502/connection error.
   */
  async function cargarTareas(fecha?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    // Health check before attempting the real API call (US-13)
    const healthy = await isServerHealthy()
    if (!healthy) {
      isServerReachable.value = false
      error.value = 'Servidor no disponible. Inténtalo más tarde.'
      isLoading.value = false
      return
    }
    isServerReachable.value = true

    const fechaTarget =
      fecha ?? new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    try {
      const tareasData = await tareasApi.getTareas({ date: fechaTarget })
      tareas.value = tareasData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar las tareas'
    } finally {
      isLoading.value = false
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
    nuevoEstado: TareaEstado,
  ): Promise<{ success: boolean; errorMsg?: string }> {
    const index = tareas.value.findIndex((t) => t.id === id)
    if (index === -1) {
      return { success: false, errorMsg: 'Tarea no encontrada' }
    }

    const estadoPrevio = tareas.value[index].estado

    // Optimistic update — mutate local state immediately (CA-2)
    tareas.value[index] = { ...tareas.value[index], estado: nuevoEstado }

    try {
      const updatedTarea = await tareasApi.updateTareaStatus(id, { estado: nuevoEstado })
      tareas.value[index] = updatedTarea
      return { success: true }
    } catch (err) {
      // Rollback to previous state on error
      tareas.value[index] = { ...tareas.value[index], estado: estadoPrevio }
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar el estado'
      return { success: false, errorMsg }
    }
  }

  /**
   * Toggle-complete helper: cycles pendiente/en_curso → completada, completada → pendiente.
   * Used by the existing TaskCard's toggleComplete emit.
   */
  async function toggleComplete(id: string): Promise<{ success: boolean; errorMsg?: string }> {
    const tarea = tareas.value.find((t) => t.id === id)
    if (!tarea) return { success: false, errorMsg: 'Tarea no encontrada' }

    const nuevoEstado: TareaEstado = tarea.estado === 'completada' ? 'pendiente' : 'completada'
    return actualizarEstado(id, nuevoEstado)
  }

return {
    tareas: readonly(tareas),
    isLoading: readonly(isLoading),
    isServerReachable: readonly(isServerReachable),
    error: readonly(error),
    cargarTareas,
    retry,
    actualizarEstado,
    toggleComplete,
  }
}
