import { z } from 'zod'

/**
 * Zod schema and TypeScript types for the Residente entity.
 * Field names match SPEC/entities.md exactly (G04).
 */

/** Shape of a Residente document in Firestore. */
export interface ResidenteDoc {
  nombre: string
  apellidos: string
  fechaNacimiento: string // ISO 8601 string stored in Firestore
  habitacion: string
  foto: string | null
  diagnosticos: string | null
  alergias: string | null
  medicacion: string | null
  preferencias: string | null
  archivado: boolean
  creadoEn: string
  actualizadoEn: string
}

/** API response shape — includes the document id. */
export interface ResidenteResponse extends ResidenteDoc {
  id: string
}

/** Zod schema for validating path param :id */
export const ResidenteIdSchema = z.object({
  id: z.string().min(1),
})
