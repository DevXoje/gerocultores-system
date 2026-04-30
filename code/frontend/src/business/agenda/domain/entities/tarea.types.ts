/**
 * tarea.types.ts — Domain entity types for Tarea.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Source of truth: SPEC/entities.md (Tarea)
 * Must stay in sync with backend: code/api/src/types/tarea.types.ts
 */

export type TareaTipo =
  | 'higiene'
  | 'medicacion'
  | 'alimentacion'
  | 'actividad'
  | 'revision'
  | 'otro'

export type TareaEstado = 'pendiente' | 'en_curso' | 'completada' | 'con_incidencia'

/** Full Tarea as returned by the API (GET /api/tareas, GET /api/tareas/:id) */
export interface TareaResponse {
  id: string
  titulo: string
  tipo: TareaTipo
  fechaHora: string // ISO8601
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: string // ISO8601
  actualizadoEn: string // ISO8601
  completadaEn: string | null // ISO8601 or null
}

/** Payload for PATCH /api/tareas/:id/estado */
export interface UpdateTareaEstadoDTO {
  estado: TareaEstado
}

/** Payload for POST /api/tareas */
export interface CreateTareaDTO {
  titulo: string
  tipo: TareaTipo
  fechaHora: string // ISO8601
  residenteId: string
  usuarioId: string
  notas?: string
}
