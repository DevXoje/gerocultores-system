import { z } from 'zod'

export const NotificacionTipoEnum = z.enum([
  'incidencia_critica',
  'tarea_proxima',
  'traspaso_turno',
  'sistema',
])
export type NotificacionTipo = z.infer<typeof NotificacionTipoEnum>

/** Zod schema for validating raw Firestore NotificacionDoc at runtime. */
export const NotificacionDocSchema = z.object({
  usuarioId: z.string(),
  tipo: NotificacionTipoEnum,
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  referenciaId: z.string().nullable(),
  referenciaModelo: z.string().nullable(),
  creadaEn: z.string(),
})

/** Shape of a Notificacion document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export interface NotificacionDoc extends z.infer<typeof NotificacionDocSchema> {}

/** API response shape — includes the document id. */
export interface NotificacionResponse extends NotificacionDoc {
  id: string
}

export interface GetNotificacionesResult {
  notificaciones: NotificacionResponse[]
  total: number
}

export const GetNotificacionesQuerySchema = z.object({
  leida: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  limit: z.string().optional().transform(Number),
})
export type GetNotificacionesQuery = z.infer<typeof GetNotificacionesQuerySchema>
