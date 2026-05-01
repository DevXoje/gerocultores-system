/**
 * incidenciasStore.ts — Pinia store for incidents state.
 *
 * US-06: Registro de incidencia
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useIncidencias composable (application/).
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { IncidenciaResponse } from '@/business/incidents/domain/entities/incidencia.types'

export const useIncidenciasStore = defineStore('incidencias', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const lastCreated = ref<IncidenciaResponse | null>(null)

  // ── Mutations ─────────────────────────────────────────────────────────────
  function setSubmitting(value: boolean): void {
    submitting.value = value
  }

  function setSubmitError(err: string | null): void {
    submitError.value = err
  }

  function setLastCreated(incidencia: IncidenciaResponse | null): void {
    lastCreated.value = incidencia
  }

  function clearSubmitError(): void {
    submitError.value = null
  }

  return {
    // State
    submitting,
    submitError,
    lastCreated,
    // Mutations
    setSubmitting,
    setSubmitError,
    setLastCreated,
    clearSubmitError,
  }
})
