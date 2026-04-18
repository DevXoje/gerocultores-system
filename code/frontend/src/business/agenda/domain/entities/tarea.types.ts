/**
 * tarea.types.ts — Domain entity types for Tarea (Task).
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * These types are shared between TaskCard component and tareas API service.
 * Field names match SPEC/entities.md exactly (G04).
 */

/** Possible states for a Tarea */
export type TareaEstado = 'pendiente' | 'en_curso' | 'completada' | 'con_incidencia'

/** Possible types for a Tarea */
export type TareaTipo =
  | 'higiene'
  | 'medicacion'
  | 'alimentacion'
  | 'actividad'
  | 'revision'
  | 'otro'

/** Full Tarea response from the API */
export interface TareaResponse {
  id: string
  titulo: string
  tipo: TareaTipo
  fechaHora: string // ISO 8601 string
  estado: TareaEstado
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: string // ISO 8601 string
  actualizadoEn: string // ISO 8601 string
  completadaEn: string | null // ISO 8601 string or null
}
