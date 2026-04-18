/**
 * tarea.types.ts — Frontend domain types for the Tarea entity.
 *
 * Field names MUST match SPEC/entities.md exactly (G04).
 * Note: Zod is backend-only. Frontend uses plain TypeScript interfaces.
 *
 * US-03: Consulta de agenda diaria
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TareaEstado = 'pendiente' | 'en_curso' | 'completada' | 'con_incidencia'

export type TareaTipo =
  | 'higiene'
  | 'medicacion'
  | 'alimentacion'
  | 'actividad'
  | 'revision'
  | 'otro'

// ─── Domain entity (mirrors API response) ────────────────────────────────────

export interface TareaResponse {
  id: string
  titulo: string
  tipo: TareaTipo
  /** ISO 8601 datetime string from API */
  fechaHora: string
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  /** ISO 8601 datetime string from API */
  creadoEn: string
  /** ISO 8601 datetime string from API */
  actualizadoEn: string
  /** ISO 8601 datetime string from API, or null */
  completadaEn: string | null
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateTareaDto {
  titulo: string
  tipo: TareaTipo
  /** ISO 8601 datetime string */
  fechaHora: string
  notas?: string | null
  residenteId: string
  usuarioId: string
}

export interface UpdateTareaEstadoDto {
  estado: TareaEstado
}

export interface AddNotaDto {
  notas: string
}

export interface ListTareasQuery {
  /** YYYY-MM-DD */
  fecha?: string
  usuarioId?: string
  residenteId?: string
}
