import { z } from 'zod'

/**
 * residente.types.ts — Domain types and Zod schemas for Residente.
 *
 * Field names match SPEC/entities.md exactly (G04).
 * US-05: Consulta de ficha de residente
 */

// ─── Schemas ─────────────────────────────────────────────────────────────────

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
  usuarioId: z.string(), // Gerocultor que creó el residente (owner)
  creadoEn: z.string(),
  actualizadoEn: z.string(),
})

/** Shape of a Residente document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export type ResidenteDoc = z.infer<typeof ResidenteDocSchema>

/** API response shape — includes the document id. */
export interface ResidenteResponse extends Omit<ResidenteDoc, never> {
  id: string
  usuarioId: string
}

/** Zod schema for validating :id path parameter */
export const ResidenteIdParamSchema = z.object({
  id: z.string().min(1, 'El id del residente es requerido'),
})
export type ResidenteIdParam = z.infer<typeof ResidenteIdParamSchema>

// ─── Create ────────────────────────────────────────────────────────────────────

const createBase = {
  nombre: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  apellidos: z.string().min(1, 'Los apellidos son requeridos').max(200, 'Máximo 200 caracteres'),
  /** ISO8601 date string — converted to Firestore Timestamp on write */
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato ISO8601 (YYYY-MM-DD)'),
  habitacion: z.string().min(1, 'La habitación es requerida').max(50, 'Máximo 50 caracteres'),
}

const createOptional = {
  foto: z.string().url('Debe ser una URL válida').nullable().optional(),
  diagnosticos: z.string().nullable().optional(),
  alergias: z.string().nullable().optional(),
  medicacion: z.string().nullable().optional(),
  preferencias: z.string().nullable().optional(),
}

export const CreateResidenteSchema = z.object({ ...createBase, ...createOptional })
export type CreateResidenteDto = z.infer<typeof CreateResidenteSchema>

// ─── Update ───────────────────────────────────────────────────────────────────

/** Partial update — at least one field must be present */
export const UpdateResidenteSchema = z
  .object({
    nombre: z.string().min(1).max(200).optional(),
    apellidos: z.string().min(1).max(200).optional(),
    fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    habitacion: z.string().min(1).max(50).optional(),
    foto: z.string().url().nullable().optional(),
    diagnosticos: z.string().nullable().optional(),
    alergias: z.string().nullable().optional(),
    medicacion: z.string().nullable().optional(),
    preferencias: z.string().nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  })
export type UpdateResidenteDto = z.infer<typeof UpdateResidenteSchema>

// ─── Archive ──────────────────────────────────────────────────────────────────

/** Archive action is route-encoded — empty body */
export const ArchiveResidenteSchema = z.object({}).strict()
export type ArchiveResidenteDto = z.infer<typeof ArchiveResidenteSchema>

// ─── List ─────────────────────────────────────────────────────────────────────

/** Query params for listing residentes */
export const ListResidentesQuerySchema = z.object({
  filter: z.enum(['active', 'archived', 'all']).optional().default('active'),
})
export type ResidenteListParams = z.infer<typeof ListResidentesQuerySchema>
