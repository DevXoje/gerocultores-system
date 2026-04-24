/**
 * residents/presentation/composables/useResidente.ts
 *
 * Composable for fetching a single resident's detail.
 *
 * Exposes reactive state: residente, loading, error.
 * Delegates all API calls to the infrastructure layer (residentes.api.ts).
 *
 * US-05: Consulta de ficha de residente
 */

import { ref } from 'vue'
import { getResidente } from '../../infrastructure/residentes.api'
import type { ResidenteDTO } from '../../domain/entities/residente.types'

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Error desconocido'
}

export function useResidente() {
  const residente = ref<ResidenteDTO | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchResidente(id: string): Promise<void> {
    loading.value = true
    error.value = null
    residente.value = null
    try {
      residente.value = await getResidente(id)
    } catch (e: unknown) {
      error.value = toErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  return { residente, loading, error, fetchResidente }
}
