import { z } from 'zod'

/**
 * residente.types.ts — Domain types and Zod schemas for Residente.
 *
 * Field names match SPEC/entities.md exactly (G04).
 * US-05: Consulta de ficha de residente
 */

/** Shape of a Residente document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export interface ResidenteDoc {
  nombre: string
  apellidos: string
  fechaNacimiento: string // ISO 8601 date string
  habitacion: string
  foto: string | null
  diagnosticos: string | null
  alergias: string | null
  medicacion: string | null
  preferencias: string | null
  archivado: boolean
  gerocultoresAsignados: string[] // array of Usuario UIDs
  creadoEn: string
  actualizadoEn: string
}

/** API response shape — includes the document id. */
export interface ResidenteResponse extends Omit<ResidenteDoc, 'gerocultoresAsignados'> {
  id: string
}

/** Zod schema for validating :id path parameter */
export const ResidenteIdParamSchema = z.object({
  id: z.string().min(1, 'El id del residente es requerido'),
})
export type ResidenteIdParam = z.infer<typeof ResidenteIdParamSchema>
