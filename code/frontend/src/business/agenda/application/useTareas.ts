/**
 * useTareas — application composable for Tarea operations.
 *
 * US-14: Crear tarea
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/ — orchestrates infrastructure calls.
 *   - Delegates state to tareasStore (Pinia) — composable is NEVER the state owner.
 *   - Uses tareasApi from infrastructure/.
 */
import { storeToRefs } from 'pinia'
import { tareasApi } from '@/infrastructure/tareas/tareas.api'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'
import type { CreateTareaDTO } from '@/business/agenda/domain/entities/tarea.types'

export function useTareas() {
  const store = useTareasStore()
  const { isLoading, error } = storeToRefs(store)

  async function createTarea(
    data: CreateTareaDTO
  ): Promise<{ success: boolean; errorMsg?: string }> {
    store.setLoading(true)
    store.setError(null)

    try {
      const response = await tareasApi.createTarea(data)
      // Add the created tarea to the store
      store.setTareas([...store.tareas, response.data])
      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear la tarea'
      store.setError(errorMsg)
      return { success: false, errorMsg }
    } finally {
      store.setLoading(false)
    }
  }

  return {
    isCreating: isLoading,
    createError: error,
    createTarea,
  }
}
