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
export type TareaDoc = z.infer<typeof TareaDocSchema>

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

// ─── Create Tarea ─────────────────────────────────────────────────────────────

export const CreateTareaSchema = z.object({
  titulo: z.string().min(1, 'titulo es requerido').max(200).trim(),
  tipo: TareaTipoEnum,
  fechaHora: z.string().datetime({ message: 'fechaHora debe ser ISO8601 válido' }),
  residenteId: z.string().uuid('residenteId debe ser UUID válido'),
  usuarioId: z.string(),
  notas: z.string().max(2000).nullable().optional(),
})
export type CreateTareaDto = z.infer<typeof CreateTareaSchema>
