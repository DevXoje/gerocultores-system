import { z } from 'zod'

export const TareaTipoEnum = z.enum([
  'higiene',
  'medicacion',
  'alimentacion',
  'actividad',
  'revision',
  'otro',
])
export type TareaTipo = z.infer<typeof TareaTipoEnum>

export const TareaEstadoEnum = z.enum([
  'pendiente',
  'en_curso',
  'completada',
  'con_incidencia',
])
export type TareaEstado = z.infer<typeof TareaEstadoEnum>

/** Shape of a Tarea document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export interface TareaDoc {
  titulo: string
  tipo: TareaTipo
  fechaHora: string
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: string
  actualizadoEn: string
  completadaEn: string | null
}

/** API response shape — includes the document id. */
export interface TareaResponse extends TareaDoc {
  id: string
}

export const UpdateEstadoSchema = z.object({
  estado: TareaEstadoEnum,
})
export type UpdateEstadoDTO = z.infer<typeof UpdateEstadoSchema>

export const ListTareasQuerySchema = z.object({
  date: z.string().optional(),
  assignedTo: z.string().optional(),
  status: TareaEstadoEnum.optional(),
})
export type ListTareasQuery = z.infer<typeof ListTareasQuerySchema>
