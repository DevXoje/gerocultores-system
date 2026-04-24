import { z } from 'zod'

/**
 * Zod schema and TypeScript types for the Incidencia entity.
 * Field names match SPEC/entities.md exactly (G04).
 * US-06: Registro de incidencia
 */

export const IncidenciaTipoEnum = z.enum([
  'caida',
  'comportamiento',
  'salud',
  'alimentacion',
  'medicacion',
  'otro',
])
export type IncidenciaTipo = z.infer<typeof IncidenciaTipoEnum>

export const IncidenciaSeveridadEnum = z.enum(['leve', 'moderada', 'critica'])
export type IncidenciaSeveridad = z.infer<typeof IncidenciaSeveridadEnum>

/** Zod schema for validating raw Firestore IncidenciaDoc at runtime. */
export const IncidenciaDocSchema = z.object({
  tipo: IncidenciaTipoEnum,
  severidad: IncidenciaSeveridadEnum,
  descripcion: z.string(),
  residenteId: z.string(),
  usuarioId: z.string(),
  tareaId: z.string().nullable(),
  registradaEn: z.string(),
})

/**
 * Shape of an Incidencia document in Firestore.
 * Field names match SPEC/entities.md exactly (G04).
 * Note: 'foto' is design-only; not stored in this sprint.
 */
export interface IncidenciaDoc extends z.infer<typeof IncidenciaDocSchema> {}

/** API response shape — includes the document id. */
export interface IncidenciaResponse extends IncidenciaDoc {
  id: string
}

/** Zod schema for POST /api/incidencias request body */
export const CreateIncidenciaSchema = z.object({
  tipo: IncidenciaTipoEnum,
  severidad: IncidenciaSeveridadEnum,
  descripcion: z.string().min(1, 'descripcion is required'),
  residenteId: z.string().min(1, 'residenteId is required'),
  tareaId: z.string().nullable().optional(),
})
export type CreateIncidenciaDTO = z.infer<typeof CreateIncidenciaSchema>
