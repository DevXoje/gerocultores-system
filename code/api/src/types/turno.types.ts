import { z } from 'zod'

export const TurnoTipoEnum = z.enum(['manyana', 'tarde', 'noche'])
export type TurnoTipo = z.infer<typeof TurnoTipoEnum>

/** Zod schema for validating raw Firestore TurnoDoc at runtime. */
export const TurnoDocSchema = z.object({
  usuarioId: z.string(),
  fecha: z.string(),
  tipoTurno: TurnoTipoEnum,
  inicio: z.string(),
  fin: z.string().nullable(),
  resumenTraspaso: z.string().nullable(),
  creadoEn: z.string(),
})

/** Shape of a Turno document in Firestore. Field names match SPEC/entities.md exactly (G04). */
export type TurnoDoc = z.infer<typeof TurnoDocSchema>

/** API response shape — includes the document id. */
export interface TurnoResponse extends TurnoDoc {
  id: string
}

export interface TurnoResumen {
  tareasCompletadas: number
  tareasPendientes: number
  incidenciasRegistradas: number
  residentesAtendidos: string[]
  textoResumen: string
}

export const OpenTurnoSchema = z.object({
  tipoTurno: TurnoTipoEnum,
})
export type OpenTurnoDTO = z.infer<typeof OpenTurnoSchema>

export const CloseTurnoSchema = z.object({
  resumenTraspaso: z.string().min(1, 'resumenTraspaso is required'),
})
export type CloseTurnoDTO = z.infer<typeof CloseTurnoSchema>
