/**
 * useTareas — application composable for Tarea operations.
 *
 * US-14: Crear tarea
 *
 * Architecture rules (frontend-specialist.md §3):
 *   - Lives in application/ — allowed to call infrastructure (tareasApi).
 *   - Returns domain types from domain/entities/tarea.types.ts.
 */
import { ref, readonly } from 'vue'
import { tareasApi } from '@/services/tareas.api'
import type { TareaResponse, CreateTareaDTO } from '@/business/agenda/domain/entities/tarea.types'

export function useTareas() {
  const isCreating = ref(false)
  const createError = ref<string | null>(null)

  async function createTarea(
    data: CreateTareaDTO
  ): Promise<{ success: boolean; data?: TareaResponse; errorMsg?: string }> {
    isCreating.value = true
    createError.value = null

    try {
      const response = await tareasApi.createTarea(data)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear la tarea'
      createError.value = errorMsg
      return { success: false, errorMsg }
    } finally {
      isCreating.value = false
    }
  }

  return {
    isCreating: readonly(isCreating),
    createError: readonly(createError),
    createTarea,
  }
}
