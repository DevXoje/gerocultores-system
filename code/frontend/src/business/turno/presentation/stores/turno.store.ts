/**
 * turno.store.ts — Pinia store for turno (shift) state.
 *
 * US-11: Resumen de fin de turno
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useTurno composable.
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Turno } from '../../domain/entities/Turno'

export const useTurnoStore = defineStore('turno', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const turnoActivo = ref<Turno | null>(null)
  const historial = ref<Turno[]>([])
  const isLoading = ref(false)

  // ── Getters ──────────────────────────────────────────────────────────────
  const hasTurnoActivo = computed(() => turnoActivo.value !== null)

  // ── Mutations ────────────────────────────────────────────────────────────
  function setTurnoActivo(turno: Turno | null): void {
    turnoActivo.value = turno
  }

  function setHistorial(turnos: Turno[]): void {
    historial.value = turnos
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  function updateResumenTraspaso(resumen: string): void {
    if (turnoActivo.value === null) return
    turnoActivo.value = { ...turnoActivo.value, resumenTraspaso: resumen }
  }

  return {
    turnoActivo,
    historial,
    isLoading,
    hasTurnoActivo,
    setTurnoActivo,
    setHistorial,
    setLoading,
    updateResumenTraspaso,
  }
})
