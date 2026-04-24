/**
 * residents/domain/entities/residente.types.ts
 *
 * Frontend domain types for the Residente entity.
 * Field names MUST match SPEC/entities.md exactly (G04).
 *
 * Note: dates are returned as ISO 8601 strings by the API;
 * the frontend keeps them as strings and formats them in the presentation layer.
 */

// US-05: Consulta de ficha de residente

export interface ResidenteDTO {
  id: string
  nombre: string
  apellidos: string
  fechaNacimiento: string // ISO 8601 string
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
