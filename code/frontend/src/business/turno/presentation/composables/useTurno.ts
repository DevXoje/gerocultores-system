/**
 * useTurno.ts — Composable bridge between turno state and components.
 *
 * US-11: Resumen de fin de turno
 *
 * Architecture (frontend-specialist.md §7):
 *   - Lives in presentation/composables/ — ONLY layer touching Pinia store.
 *   - Orchestrates use cases (application layer) and updates the store.
 *   - Components import ONLY from this composable — never stores directly.
 */
import { computed, readonly, ref } from 'vue'
import { useTurnoStore } from '../stores/turno.store'
import { getTurnoActivo } from '../../application/use-cases/getTurnoActivo'
import { iniciarTurno as iniciarTurnoUseCase } from '../../application/use-cases/iniciarTurno'
import { finalizarTurno as finalizarTurnoUseCase } from '../../application/use-cases/finalizarTurno'
import { getResumenTurno } from '../../application/use-cases/getResumenTurno'
import type { TipoTurno } from '../../domain/entities/Turno'
import type { TurnoResumen } from '../../infrastructure/api/turnoApi'

export function useTurno() {
  const store = useTurnoStore()
  const error = ref<string | null>(null)
  const resumen = ref<TurnoResumen | null>(null)

  // ── Derived state ────────────────────────────────────────────────────────
  const turnoActivo = computed(() => store.turnoActivo)
  const hasTurnoActivo = computed(() => store.hasTurnoActivo)
  const isLoading = computed(() => store.isLoading)

  // ── Fetch active turno ───────────────────────────────────────────────────
  async function cargarTurnoActivo(): Promise<void> {
    store.setLoading(true)
    error.value = null
    try {
      const turno = await getTurnoActivo()
      store.setTurnoActivo(turno)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar el turno'
    } finally {
      store.setLoading(false)
    }
  }

  // ── Iniciar turno ────────────────────────────────────────────────────────
  async function iniciarTurno(tipoTurno: TipoTurno = 'manyana'): Promise<void> {
    store.setLoading(true)
    error.value = null
    try {
      const turno = await iniciarTurnoUseCase(tipoTurno)
      store.setTurnoActivo(turno)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al iniciar el turno'
    } finally {
      store.setLoading(false)
    }
  }

  // ── Finalizar turno ──────────────────────────────────────────────────────
  async function finalizarTurno(resumenTraspaso: string): Promise<void> {
    if (!store.turnoActivo) return
    const turnoId = store.turnoActivo.id
    store.setLoading(true)
    error.value = null
    try {
      const turnoFinalizado = await finalizarTurnoUseCase(turnoId, resumenTraspaso)
      store.setTurnoActivo(turnoFinalizado)
      // Fetch the aggregated resumen from GET /api/turnos/:id/resumen
      resumen.value = await getResumenTurno(turnoId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al finalizar el turno'
    } finally {
      store.setLoading(false)
    }
  }

  // ── Update resumen locally (draft) ───────────────────────────────────────
  function draftResumen(texto: string): void {
    store.updateResumenTraspaso(texto)
  }

  return {
    turnoActivo,
    hasTurnoActivo,
    isLoading,
    error: readonly(error),
    resumen: readonly(resumen),
    cargarTurnoActivo,
    iniciarTurno,
    finalizarTurno,
    draftResumen,
  }
}
