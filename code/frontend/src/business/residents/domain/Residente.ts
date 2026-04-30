/**
 * residents/domain/Residente.ts
 *
 * Frontend domain entity for Residente.
 * Field names MUST match SPEC/entities.md exactly (G04).
 *
 * US-09: Alta y gestión de residentes
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in domain/ — pure TypeScript, NO framework deps.
 *   - Zod schema is the single source of truth; TypeScript type is derived.
 */

import { z } from 'zod'

// ── Entity schema ──────────────────────────────────────────────────────────

export const ResidenteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellidos: z.string(),
  fechaNacimiento: z.string(), // ISO 8601 date string (YYYY-MM-DD)
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

export type Residente = z.infer<typeof ResidenteSchema>

// ── Create DTO schema ─────────────────────────────────────────────────────

export const CreateResidenteDtoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  apellidos: z.string().min(1, 'Los apellidos son requeridos').max(200),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato ISO8601 (YYYY-MM-DD)'),
  habitacion: z.string().min(1, 'La habitación es requerida').max(50),
  foto: z.string().url().nullable().optional(),
  diagnosticos: z.string().nullable().optional(),
  alergias: z.string().nullable().optional(),
  medicacion: z.string().nullable().optional(),
  preferencias: z.string().nullable().optional(),
})

export type CreateResidenteDto = z.infer<typeof CreateResidenteDtoSchema>

// ── Update DTO schema ─────────────────────────────────────────────────────

export const UpdateResidenteDtoSchema = z
  .object({
    nombre: z.string().min(1).max(200).optional(),
    apellidos: z.string().min(1).max(200).optional(),
    fechaNacimiento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
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

export type UpdateResidenteDto = z.infer<typeof UpdateResidenteDtoSchema>

// ── List filter ────────────────────────────────────────────────────────────

export const ResidenteFilterSchema = z.enum(['active', 'archived', 'all'])

export type ResidenteFilter = z.infer<typeof ResidenteFilterSchema>

// ── Type guard ────────────────────────────────────────────────────────────

export function assertIsResidente(val: unknown): asserts val is Residente {
  ResidenteSchema.parse(val)
}
