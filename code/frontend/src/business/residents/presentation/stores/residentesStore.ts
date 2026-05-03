/**
 * residentesStore.ts — Pinia store for residents state.
 *
 * US-09: Alta y gestión de residentes
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useResidents composable (presentation/composables/).
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Residente } from '@/business/residents/domain/Residente'

export const useResidentesStore = defineStore('residentes', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const residentes = ref<Residente[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ──────────────────────────────────────────────────────────────
  const activeResidentes = computed(() => residentes.value.filter((r) => !r.archivado))

  const archivedResidentes = computed(() => residentes.value.filter((r) => r.archivado))

  // ── Mutations ─────────────────────────────────────────────────────────────
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
  }
})
