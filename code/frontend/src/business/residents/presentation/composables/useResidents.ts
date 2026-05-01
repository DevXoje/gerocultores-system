/**
 * residents/presentation/composables/useResidents.ts
 *
 * Composable bridge for the residents admin module (US-09).
 * Exposes reactive state + async actions for listing, creating,
 * updating, and archiving residents.
 *
 * Architecture (frontend-specialist.md §3):
 *   - Components import ONLY from composables — not stores directly.
 *   - Delegates all API calls to useResidentesStore.
 */

import { computed } from 'vue'
import { useResidentesStore } from '@/business/residents/presentation/stores/residentesStore'
import type {
  Residente,
  CreateResidenteDto,
  UpdateResidenteDto,
  ResidenteFilter,
} from '@/business/residents/domain/Residente'

export function useResidents() {
  const store = useResidentesStore()

  // ── State ──────────────────────────────────────────────────────────────────
  const residentes = computed<Residente[]>(() => store.residentes)
  const activeResidentes = computed<Residente[]>(() => store.activeResidentes)
  const archivedResidentes = computed<Residente[]>(() => store.archivedResidentes)
  const isLoading = computed<boolean>(() => store.isLoading)
  const error = computed<string | null>(() => store.error)

  // ── Actions ──────────────────────────────────────────────────────────────
  async function fetchResidentes(filter: ResidenteFilter = 'active'): Promise<void> {
    await store.fetchResidentes(filter)
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
    // State
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
