/**
 * getResumenTurno.ts — Use case: fetch aggregated end-of-shift summary.
 *
 * US-11: Resumen de fin de turno
 *
 * Architecture (frontend-specialist.md §4):
 *   - Application layer — orchestrates infrastructure, no framework deps.
 *   - Calls turnoApi.getResumen(id) and returns the parsed TurnoResumen.
 */
import { turnoApi, type TurnoResumen } from '@/business/turno/infrastructure/api/turnoApi'

/**
 * Fetches the aggregated resumen for a closed turno.
 * @param turnoId — the ID of the finished turno
 * @returns TurnoResumen — stats: tareasCompletadas, tareasPendientes, incidenciasRegistradas, etc.
 */
export async function getResumenTurno(turnoId: string): Promise<TurnoResumen> {
  return turnoApi.getResumen(turnoId)
}
