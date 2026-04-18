/**
 * tarea.types.ts — Backend TypeScript types for the Tarea entity.
 *
 * Field names MUST match SPEC/entities.md exactly (G04).
 * Zod schemas are used for request body validation at the controller layer.
 *
 * US-03: Consulta de agenda diaria
 */
import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TareaEstadoEnum = z.enum(['pendiente', 'en_curso', 'completada', 'con_incidencia'])
export type TareaEstado = z.infer<typeof TareaEstadoEnum>

export const TareaTipoEnum = z.enum([
  'higiene',
  'medicacion',
  'alimentacion',
  'actividad',
  'revision',
  'otro',
])
export type TareaTipo = z.infer<typeof TareaTipoEnum>

// ─── Domain entity (mirrors Firestore document) ───────────────────────────────

export interface Tarea {
  id: string
  titulo: string
  tipo: TareaTipo
  fechaHora: Date
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: Date
  actualizadoEn: Date
  completadaEn: Date | null
}

// ─── API response shape ────────────────────────────────────────────────────────

export interface TareaResponse {
  id: string
  titulo: string
  tipo: TareaTipo
  fechaHora: string
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: string
  actualizadoEn: string
  completadaEn: string | null
}

// ─── Zod schemas for request validation ──────────────────────────────────────

export const CreateTareaSchema = z.object({
  titulo: z.string().min(1, 'titulo is required'),
  tipo: TareaTipoEnum,
  fechaHora: z.string().datetime({ message: 'fechaHora must be ISO 8601 datetime' }),
  notas: z.string().nullable().optional(),
  residenteId: z.string().min(1, 'residenteId is required'),
  usuarioId: z.string().min(1, 'usuarioId is required'),
})
export type CreateTareaDto = z.infer<typeof CreateTareaSchema>

export const UpdateTareaEstadoSchema = z.object({
  estado: TareaEstadoEnum,
})
export type UpdateTareaEstadoDto = z.infer<typeof UpdateTareaEstadoSchema>

export const AddNotaSchema = z.object({
  notas: z.string().min(1, 'notas must not be empty'),
})
export type AddNotaDto = z.infer<typeof AddNotaSchema>

export const ListTareasQuerySchema = z.object({
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha must be YYYY-MM-DD format')
    .optional(),
  usuarioId: z.string().optional(),
  residenteId: z.string().optional(),
})
export type ListTareasQuery = z.infer<typeof ListTareasQuerySchema>
