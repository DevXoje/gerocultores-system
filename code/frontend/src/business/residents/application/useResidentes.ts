/**
 * useResidentes — application composable for resident operations.
 *
 * US-09: Alta y gestión de residentes
 * US-05: Consulta de ficha de residente
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/ — orchestrates use cases + store.
 *   - Delegates state to residentesStore (Pinia) — composable is NEVER the state owner.
 *   - Uses domain use cases for HTTP calls.
 */
import { storeToRefs } from 'pinia'
import { useResidentesStore } from '@/business/residents/presentation/stores/residentesStore'
import { listResidentes } from '@/business/residents/domain/ListResidentesUseCase'
import { createResidente as createResidenteUC } from '@/business/residents/domain/CreateResidenteUseCase'
import { updateResidente as updateResidenteUC } from '@/business/residents/domain/UpdateResidenteUseCase'
import { archiveResidente as archiveResidenteUC } from '@/business/residents/domain/ArchiveResidenteUseCase'
import type { ResidenteFilter } from '@/business/residents/domain/Residente'

export function useResidentes() {
  const store = useResidentesStore()
  const { residentes, activeResidentes, archivedResidentes, isLoading, error } = storeToRefs(store)

  async function fetchResidentes(filter: ResidenteFilter = 'active'): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const { residentes: items } = await listResidentes(filter)
      store.setResidentes(items)
    } catch (e: unknown) {
      store.setError(e instanceof Error ? e.message : 'Error al cargar residentes')
    } finally {
      store.setLoading(false)
    }
  }

  async function createResidente(dto: Parameters<typeof createResidenteUC>[0]): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const { residente } = await createResidenteUC(dto)
      store.addResidente(residente)
    } catch (e: unknown) {
      store.setError(e instanceof Error ? e.message : 'Error al crear residente')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  async function updateResidente(
    id: string,
    dto: Parameters<typeof updateResidenteUC>[1]
  ): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const { residente } = await updateResidenteUC(id, dto)
      store.replaceResidente(id, residente)
    } catch (e: unknown) {
      store.setError(e instanceof Error ? e.message : 'Error al actualizar residente')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  async function archiveResidente(id: string): Promise<void> {
    store.setLoading(true)
    store.setError(null)
    try {
      const { residente } = await archiveResidenteUC(id)
      store.replaceResidente(id, residente)
    } catch (e: unknown) {
      store.setError(e instanceof Error ? e.message : 'Error al archivar residente')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  return {
    // State (from store)
    residentes,
    activeResidentes,
    archivedResidentes,
    isLoading,
    error,
    // Actions
    fetchResidentes,
    createResidente,
    updateResidente,
    archiveResidente,
  }
}
