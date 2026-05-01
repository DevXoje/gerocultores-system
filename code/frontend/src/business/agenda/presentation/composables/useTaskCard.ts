/**
 * useTaskCard — presentation composable for a single TaskCard.
 *
 * US-04: Actualizar estado de una tarea
 *
 * Wraps actualizarEstado from useAgendaHoy to provide per-card
 * loading state and emit-safe error reporting.
 */

import { ref } from 'vue'
import type { EstadoTarea } from '@/infrastructure/tareas/tareas.api'

export interface UseTaskCardOptions {
  tareaId: string
  actualizarEstado: (
    id: string,
    estado: EstadoTarea
  ) => Promise<{ success: boolean; errorMsg?: string }>
  onError?: (msg: string) => void
}

export function useTaskCard({ tareaId, actualizarEstado, onError }: UseTaskCardOptions) {
  const isUpdating = ref(false)

  async function cambiarEstado(nuevoEstado: EstadoTarea): Promise<void> {
    if (isUpdating.value) return
    isUpdating.value = true
    try {
      const result = await actualizarEstado(tareaId, nuevoEstado)
      if (!result.success && result.errorMsg) {
        onError?.(result.errorMsg)
      }
    } finally {
      isUpdating.value = false
    }
  }

  return { isUpdating, cambiarEstado }
}
