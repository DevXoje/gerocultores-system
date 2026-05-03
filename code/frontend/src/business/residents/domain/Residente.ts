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

export const RESIDENTE_FORM_FIELDS = [
  'nombre',
  'apellidos',
  'fechaNacimiento',
  'habitacion',
  'foto',
] as const

export type ResidenteFormField = (typeof RESIDENTE_FORM_FIELDS)[number]

const HttpUrlSchema = z.string().regex(/^https?:\/\/.+/, 'URL inválida')

const NombreSchema = z
  .string()
  .trim()
  .min(1, 'El nombre es requerido')
  .max(200, 'Máximo 200 caracteres')

const ApellidosSchema = z
  .string()
  .trim()
  .min(1, 'Los apellidos son requeridos')
  .max(200, 'Máximo 200 caracteres')

const FechaNacimientoSchema = z
  .string()
  .min(1, 'La fecha de nacimiento es requerida')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato ISO 8601 (YYYY-MM-DD)')

const HabitacionSchema = z
  .string()
  .trim()
  .min(1, 'La habitación es requerida')
  .max(50, 'Máximo 50 caracteres')

const FotoSchema = HttpUrlSchema.nullable().optional()

const ResidenteFormFieldSchemas: Record<ResidenteFormField, z.ZodType<string>> = {
  nombre: NombreSchema,
  apellidos: ApellidosSchema,
  fechaNacimiento: FechaNacimientoSchema,
  habitacion: HabitacionSchema,
  foto: z.union([z.literal(''), HttpUrlSchema]),
}

export interface ResidenteFormValidationInput {
  nombre: string
  apellidos: string
  fechaNacimiento: string
  habitacion: string
  foto: string
}

export function validateResidenteFormField(field: ResidenteFormField, value: string): string {
  const result = ResidenteFormFieldSchemas[field].safeParse(value)
  if (result.success) return ''
  return result.error.issues[0]?.message ?? 'Valor inválido'
}

export function validateResidenteForm(
  data: ResidenteFormValidationInput
): Partial<Record<ResidenteFormField, string>> {
  const errors: Partial<Record<ResidenteFormField, string>> = {}
  for (const field of RESIDENTE_FORM_FIELDS) {
    const error = validateResidenteFormField(field, data[field])
    if (error) errors[field] = error
  }
  return errors
}

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
  nombre: NombreSchema,
  apellidos: ApellidosSchema,
  fechaNacimiento: FechaNacimientoSchema,
  habitacion: HabitacionSchema,
  foto: FotoSchema,
  diagnosticos: z.string().nullable().optional(),
  alergias: z.string().nullable().optional(),
  medicacion: z.string().nullable().optional(),
  preferencias: z.string().nullable().optional(),
})

export type CreateResidenteDto = z.infer<typeof CreateResidenteDtoSchema>

// ── Update DTO schema ─────────────────────────────────────────────────────

export const UpdateResidenteDtoSchema = z
  .object({
    nombre: NombreSchema.optional(),
    apellidos: ApellidosSchema.optional(),
    fechaNacimiento: FechaNacimientoSchema.optional(),
    habitacion: HabitacionSchema.optional(),
    foto: FotoSchema,
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

export const ResidentFiltersSchema = z.object({
  status: ResidenteFilterSchema,
  search: z.string().default(''),
  habitacion: z.string().default(''),
})

export type ResidentFilters = z.infer<typeof ResidentFiltersSchema>

export const DEFAULT_FILTERS: ResidentFilters = {
  status: 'active',
  search: '',
  habitacion: '',
}

export function filterResidentesByState(
  residentes: Residente[],
  filter: ResidenteFilter
): Residente[] {
  if (filter === 'active') return residentes.filter((residente) => !residente.archivado)
  if (filter === 'archived') return residentes.filter((residente) => residente.archivado)
  return residentes
}

// ── Type guard ────────────────────────────────────────────────────────────

export function assertIsResidente(val: unknown): asserts val is Residente {
  ResidenteSchema.parse(val)
}
