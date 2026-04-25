/**
 * incidencia.types.ts — Domain entity types for Incidencia.
 *
 * US-06: Registro de incidencia
 *
 * Source of truth: SPEC/entities.md (Incidencia)
 * Field names must match SPEC/entities.md exactly (G04).
 * Must stay in sync with backend: code/api/src/types/incidencia.types.ts
 */
import { z } from 'zod'

// ── Enum types (mirror SPEC/entities.md) ─────────────────────────────────────

export const IncidenciaTipoSchema = z.enum([
  'caida',
  'comportamiento',
  'salud',
  'alimentacion',
  'medicacion',
  'otro',
])
export type IncidenciaTipo = z.infer<typeof IncidenciaTipoSchema>

export const IncidenciaSeveridadSchema = z.enum(['leve', 'moderada', 'critica'])
export type IncidenciaSeveridad = z.infer<typeof IncidenciaSeveridadSchema>

// ── Zod schemas ───────────────────────────────────────────────────────────────

/** Full Incidencia as returned by the API */
export const IncidenciaResponseSchema = z.object({
  id: z.string(),
  tipo: IncidenciaTipoSchema,
  severidad: IncidenciaSeveridadSchema,
  descripcion: z.string(),
  residenteId: z.string(),
  usuarioId: z.string(),
  tareaId: z.string().nullable(),
  registradaEn: z.string(), // ISO 8601 — set server-side
})
export type IncidenciaResponse = z.infer<typeof IncidenciaResponseSchema>

/** Zod schema for the POST /api/incidencias request body (client-side validation) */
export const CreateIncidenciaSchema = z.object({
  tipo: IncidenciaTipoSchema,
  severidad: IncidenciaSeveridadSchema,
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  residenteId: z.string().min(1, 'El residente es obligatorio'),
  tareaId: z.string().nullable().optional(),
})
export type CreateIncidenciaDTO = z.infer<typeof CreateIncidenciaSchema>
