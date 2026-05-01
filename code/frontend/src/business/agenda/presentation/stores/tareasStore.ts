/**
 * tareasStore.ts — Pinia store for agenda tareas state.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useAgendaHoy composable (application/).
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TareaResponse, TareaEstado } from '@/business/agenda/domain/entities/tarea.types'

export const useTareasStore = defineStore('tareas', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const tareas = ref<TareaResponse[]>([])
  const isLoading = ref(false)
  const isServerReachable = ref(true)
  const error = ref<string | null>(null)

  // ── State: all tareas (calendar view) ────────────────────────────────────────
  const allTareas = ref<TareaResponse[]>([])
  const isLoadingAll = ref(false)

  // ── Getters ──────────────────────────────────────────────────────────────
  const tareasPendientes = computed(() => tareas.value.filter((t) => t.estado === 'pendiente'))

  const tareasEnCurso = computed(() => tareas.value.filter((t) => t.estado === 'en_curso'))

  const tareasCompletadas = computed(() => tareas.value.filter((t) => t.estado === 'completada'))

  const tareasConIncidencia = computed(() =>
    tareas.value.filter((t) => t.estado === 'con_incidencia')
  )

  // ── Mutations ─────────────────────────────────────────────────────────────
  function setTareas(items: TareaResponse[]): void {
    tareas.value = items
  }

  function replaceTarea(id: string, updated: TareaResponse): void {
    const idx = tareas.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      tareas.value[idx] = updated
    }
  }

  function updateTareaEstado(id: string, estado: TareaEstado): void {
    const idx = tareas.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      tareas.value[idx] = { ...tareas.value[idx], estado }
    }
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  function setServerReachable(reachable: boolean): void {
    isServerReachable.value = reachable
  }

  function setError(err: string | null): void {
    error.value = err
  }

  // ── Mutations: all tareas ─────────────────────────────────────────────────
  function setAllTareas(items: TareaResponse[]): void {
    allTareas.value = items
  }

  function clearAllTareas(): void {
    allTareas.value = []
  }

  function setLoadingAll(loading: boolean): void {
    isLoadingAll.value = loading
  }

  return {
    // State
    tareas,
    isLoading,
    isServerReachable,
    error,
    allTareas,
    isLoadingAll,
    // Getters
    tareasPendientes,
    tareasEnCurso,
    tareasCompletadas,
    tareasConIncidencia,
    // Mutations
    setTareas,
    replaceTarea,
    updateTareaEstado,
    setLoading,
    setServerReachable,
    setError,
    setAllTareas,
    clearAllTareas,
    setLoadingAll,
  }
})
