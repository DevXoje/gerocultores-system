/**
 * notificacionApi.ts — Infrastructure layer for Notificacion API calls.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Architecture (frontend-specialist.md §3):
 *   - ONLY layer allowed to call Axios.
 *   - Validates responses at runtime with Zod.
 *   - Field names match SPEC/entities.md exactly (G04).
 */
import { z } from 'zod'
import { apiClient } from '@/services/apiClient'
import { NotificacionSchema, type Notificacion } from '../../domain/entities/Notificacion'
import type { GetNotificacionesParams } from '../../application/use-cases/getNotificaciones'

// ── Response envelopes ─────────────────────────────────────────────────────

const GetNotificacionesResponseSchema = z.object({
  notificaciones: z.array(
    z.object({
      id: z.string(),
      usuarioId: z.string(),
      tipo: z.enum(['incidencia_critica', 'tarea_proxima', 'traspaso_turno', 'sistema']),
      titulo: z.string(),
      mensaje: z.string(),
      leida: z.boolean(),
      referenciaId: z.string().nullable(),
      referenciaModelo: z.string().nullable(),
      // API returns ISO string — convert to Date
      creadaEn: z.string().transform((s) => new Date(s)),
    })
  ),
  total: z.number(),
})

const NotificacionApiResponseSchema = z.object({
  notificacion: z.object({
    id: z.string(),
    usuarioId: z.string(),
    tipo: z.enum(['incidencia_critica', 'tarea_proxima', 'traspaso_turno', 'sistema']),
    titulo: z.string(),
    mensaje: z.string(),
    leida: z.boolean(),
    referenciaId: z.string().nullable(),
    referenciaModelo: z.string().nullable(),
    creadaEn: z.string().transform((s) => new Date(s)),
  }),
})

/**
 * GET /api/notificaciones
 * Fetches notifications for the authenticated user.
 */
async function getNotificaciones(params: GetNotificacionesParams = {}): Promise<Notificacion[]> {
  const query: Record<string, string | number> = {}
  if (params.leida !== undefined) query['leida'] = String(params.leida)
  if (params.limit !== undefined) query['limit'] = params.limit

  const response = await apiClient.get<unknown>('/notificaciones', { params: query })
  const parsed = GetNotificacionesResponseSchema.parse(response.data)
  // Validate each item through the full NotificacionSchema after Date coercion
  return parsed.notificaciones.map((n) => NotificacionSchema.parse(n))
}

/**
 * PATCH /api/notificaciones/:id/leida
 * Marks a notification as read.
 */
async function markAsRead(id: string): Promise<Notificacion> {
  const response = await apiClient.patch<unknown>(`/notificaciones/${id}/leida`)
  const parsed = NotificacionApiResponseSchema.parse(response.data)
  return NotificacionSchema.parse(parsed.notificacion)
}

export const notificacionApi = {
  getNotificaciones,
  markAsRead,
}
