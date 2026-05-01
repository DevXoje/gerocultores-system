/**
 * residents/presentation/stores/residentesStore.ts
 *
 * Pinia store for residents list state.
 *
 * US-09: Alta y gestión de residentes
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useResidentes composable.
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Residente,
  CreateResidenteDto,
  UpdateResidenteDto,
  ResidenteFilter,
} from '@/business/residents/domain/Residente'
import { listResidentes } from '@/business/residents/domain/ListResidentesUseCase'
import { createResidente as createResidenteUC } from '@/business/residents/domain/CreateResidenteUseCase'
import { updateResidente as updateResidenteUC } from '@/business/residents/domain/UpdateResidenteUseCase'
import { archiveResidente as archiveResidenteUC } from '@/business/residents/domain/ArchiveResidenteUseCase'

export const useResidentesStore = defineStore('residentes', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const residentes = ref<Residente[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ──────────────────────────────────────────────────────────────
  const activeResidentes = computed(() => residentes.value.filter((r) => !r.archivado))

  const archivedResidentes = computed(() => residentes.value.filter((r) => r.archivado))

  // ── Mutations ────────────────────────────────────────────────────────────
  function setResidentes(items: Residente[]): void {
    residentes.value = items
  }

  function addResidente(item: Residente): void {
    residentes.value.push(item)
  }

  function replaceResidente(id: string, updated: Residente): void {
    const idx = residentes.value.findIndex((r) => r.id === id)
    if (idx !== -1) {
      residentes.value[idx] = updated
    }
  }

  function removeResidente(id: string): void {
    residentes.value = residentes.value.filter((r) => r.id !== id)
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  function setError(err: string | null): void {
    error.value = err
  }

  // ── Async actions (delegates to use cases) ──────────────────────────────
  async function fetchResidentes(filter: ResidenteFilter = 'active'): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { residentes: items } = await listResidentes(filter)
      residentes.value = items
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar residentes'
    } finally {
      isLoading.value = false
    }
  }

  async function createResidente(dto: CreateResidenteDto): Promise<Residente> {
    isLoading.value = true
    error.value = null
    try {
      const { residente } = await createResidenteUC(dto)
      addResidente(residente)
      return residente
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al crear residente'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateResidente(id: string, dto: UpdateResidenteDto): Promise<Residente> {
    isLoading.value = true
    error.value = null
    try {
      const { residente } = await updateResidenteUC(id, dto)
      replaceResidente(id, residente)
      return residente
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar residente'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function archiveResidente(id: string): Promise<Residente> {
    isLoading.value = true
    error.value = null
    try {
      const { residente } = await archiveResidenteUC(id)
      replaceResidente(id, residente)
      return residente
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al archivar residente'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    residentes,
    isLoading,
    error,
    // Getters
    activeResidentes,
    archivedResidentes,
    // Mutations
    setResidentes,
    addResidente,
    replaceResidente,
    removeResidente,
    setLoading,
    setError,
    // Async actions
    fetchResidentes,
    createResidente,
    updateResidente,
    archiveResidente,
  }
})
