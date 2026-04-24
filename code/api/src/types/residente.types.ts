import { z } from 'zod'

/**
 * residente.types.ts — Domain types and Zod schemas for Residente.
 *
 * Field names match SPEC/entities.md exactly (G04).
 * US-05: Consulta de ficha de residente
 */

/** Zod schema for validating raw Firestore ResidenteDoc at runtime. */
export const ResidenteDocSchema = z.object({
  nombre: z.string(),
  apellidos: z.string(),
  fechaNacimiento: z.string(),
  habitacion: z.string(),
  foto: z.string().nullable(),
  diagnosticos: z.string().nullable(),
  alergias: z.string().nullable(),
  medicacion: z.string().nullable(),
  preferencias: z.string().nullable(),
  archivado: z.boolean(),
  gerocultoresAsignados: z.array(z.string()).optional(),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
})

/** Shape of a Residente document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export interface ResidenteDoc extends z.infer<typeof ResidenteDocSchema> {}

/** API response shape — includes the document id. */
export interface ResidenteResponse extends Omit<ResidenteDoc, 'gerocultoresAsignados'> {
  id: string
}

/** Zod schema for validating :id path parameter */
export const ResidenteIdParamSchema = z.object({
  id: z.string().min(1, 'El id del residente es requerido'),
})
export type ResidenteIdParam = z.infer<typeof ResidenteIdParamSchema>
