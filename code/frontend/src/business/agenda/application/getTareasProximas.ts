/**
 * getTareasProximas.ts — Use case: get upcoming tasks within a time window.
 *
 * US-08: Recibir notificaciones de alertas críticas
 * US-03: Consulta de agenda diaria
 *
 * "Próximas" = tasks with estado 'pendiente' that start within the next N minutes.
 * Used by the notification polling loop to surface tarea_proxima alerts.
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/ — delegates HTTP to tareasApi.
 *   - Pure logic, no framework deps.
 */
import { tareasApi } from '@/infrastructure/tareas/tareas.api'
import type { TareaResponse } from '@/business/agenda/domain/entities/tarea.types'

export interface GetTareasProximasParams {
  /** How many minutes ahead to look for upcoming tasks (default: 30) */
  ventanaMinutos?: number
}

/**
 * Returns pending tasks that start within the next `ventanaMinutos` minutes
 * relative to the current time (client-side filtering after fetching today's tasks).
 */
export async function getTareasProximas(
  params: GetTareasProximasParams = {}
): Promise<TareaResponse[]> {
  const ventana = params.ventanaMinutos ?? 30
  const fecha = new Date().toISOString().slice(0, 10)

  const tareas = await tareasApi.getTareas({ date: fecha })
  const ahora = Date.now()
  const limiteMs = ventana * 60 * 1000

  return tareas.filter((t) => {
    if (t.estado !== 'pendiente') return false
    const inicio = new Date(t.fechaHora).getTime()
    const diff = inicio - ahora
    return diff >= 0 && diff <= limiteMs
  })
}
