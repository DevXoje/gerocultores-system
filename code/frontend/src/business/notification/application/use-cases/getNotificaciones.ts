/**
 * getNotificaciones.ts — Use case: fetch notifications for the current user.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/use-cases/ — pure logic, no framework deps.
 *   - Delegates HTTP to notificacionApi (infrastructure layer).
 */
import { notificacionApi } from '../../infrastructure/api/notificacionApi'
import type { Notificacion } from '../../domain/entities/Notificacion'

export interface GetNotificacionesParams {
  leida?: boolean
  limit?: number
}

export async function getNotificaciones(
  params: GetNotificacionesParams = {}
): Promise<Notificacion[]> {
  return notificacionApi.getNotificaciones(params)
}
