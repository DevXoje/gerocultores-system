/**
 * residents/presentation/composables/useResidentes.ts
 *
 * Thin composable wrapper around useResidentesStore for component use.
 *
 * US-09: Alta y gestión de residentes
 *
 * Architecture (frontend-specialist.md §4):
 *   - Components import from composables, NEVER from stores directly.
 *   - This composable delegates to the Pinia store.
 */
import { storeToRefs } from 'pinia'
import { useResidentesStore } from '../stores/residentesStore'
import type {
  CreateResidenteDto,
  UpdateResidenteDto,
  ResidenteFilter,
} from '../../domain/Residente'
import type { Residente } from '../../domain/Residente'

export function useResidentes() {
  const store = useResidentesStore()
  const { residentes, isLoading, error } = storeToRefs(store)

  async function fetchResidentes(filter: ResidenteFilter = 'active'): Promise<void> {
    return store.fetchResidentes(filter)
  }

  async function createResidente(dto: CreateResidenteDto): Promise<Residente> {
    return store.createResidente(dto)
  }

  async function updateResidente(id: string, dto: UpdateResidenteDto): Promise<Residente> {
    return store.updateResidente(id, dto)
  }

  async function archiveResidente(id: string): Promise<Residente> {
    return store.archiveResidente(id)
  }

  return {
    residentes,
    isLoading,
    error,
    fetchResidentes,
    createResidente,
    updateResidente,
    archiveResidente,
  }
}
