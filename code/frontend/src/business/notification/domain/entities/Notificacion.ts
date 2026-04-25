/**
 * Notificacion.ts — Domain entity for in-app notifications.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Field names match SPEC/entities.md exactly (G04).
 * Zod schema is the single source of truth — TypeScript type is derived.
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in domain/entities/ — pure TypeScript, NO framework deps.
 *   - No Firebase, Axios, Vue, or Pinia imports allowed.
 */
import { z } from 'zod'

// ── Enum schema ────────────────────────────────────────────────────────────

export const NotificacionTipoSchema = z.enum([
  'incidencia_critica',
  'tarea_proxima',
  'traspaso_turno',
  'sistema',
])

export type NotificacionTipo = z.infer<typeof NotificacionTipoSchema>

// ── Entity schema ──────────────────────────────────────────────────────────

export const NotificacionSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  tipo: NotificacionTipoSchema,
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  referenciaId: z.string().nullable(),
  referenciaModelo: z.string().nullable(),
  creadaEn: z.date(),
})

export type Notificacion = z.infer<typeof NotificacionSchema>

// ── Type guard ────────────────────────────────────────────────────────────

export function assertIsNotificacion(val: unknown): asserts val is Notificacion {
  NotificacionSchema.parse(val)
}
