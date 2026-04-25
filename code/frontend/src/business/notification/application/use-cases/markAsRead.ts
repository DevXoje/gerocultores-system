/**
 * markAsRead.ts — Use case: mark a notification as read.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in application/use-cases/ — pure logic, no framework deps.
 *   - Delegates HTTP to notificacionApi (infrastructure layer).
 */
import { notificacionApi } from '../../infrastructure/api/notificacionApi'
import type { Notificacion } from '../../domain/entities/Notificacion'

export async function markAsRead(id: string): Promise<Notificacion> {
  return notificacionApi.markAsRead(id)
}
