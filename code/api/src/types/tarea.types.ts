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

/** Zod schema for validating raw Firestore TareaDoc at runtime. */
export const TareaDocSchema = z.object({
  titulo: z.string(),
  tipo: TareaTipoEnum,
  fechaHora: z.string(),
  estado: TareaEstadoEnum,
  notas: z.string().nullable(),
  residenteId: z.string(),
  usuarioId: z.string(),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
  completadaEn: z.string().nullable(),
})

/** Shape of a Tarea document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export interface TareaDoc extends z.infer<typeof TareaDocSchema> {}

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
