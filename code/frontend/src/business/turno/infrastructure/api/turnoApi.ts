/**
 * turnoApi.ts — Infrastructure layer for Turno API calls.
 *
 * US-11: Resumen de fin de turno
 *
 * Architecture (frontend-specialist.md §3):
 *   - ONLY layer allowed to call Axios.
 *   - Validates responses at runtime with Zod.
 *   - Field names match SPEC/entities.md exactly (G04).
 *
 * API contracts (from design):
 *   POST /api/turnos  body: { tipoTurno }  → 201 { turno }
 *   PATCH /api/turnos/:id/cierre  body: { resumenTraspaso }  → 200 { turno }
 *   GET  /api/turnos/activo  → 200 { turno | null }
 *   GET  /api/turnos/:id/resumen  → 200 { resumen }
 */
import { z } from 'zod'
import { apiClient } from '@/services/apiClient'
import { TurnoSchema, type Turno, type TipoTurno } from '@/business/turno/domain/entities/Turno'

// ── TurnoResumen — aggregated end-of-shift summary ────────────────────────

export const TurnoResumenSchema = z.object({
  tareasCompletadas: z.number(),
  tareasPendientes: z.number(),
  incidenciasRegistradas: z.number(),
  residentesAtendidos: z.array(z.string()),
  textoResumen: z.string(),
})

export type TurnoResumen = z.infer<typeof TurnoResumenSchema>

// ── Raw API response schema (dates come as ISO strings from server) ────────

const RawTurnoSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  fecha: z.string().transform((s) => new Date(s)),
  tipoTurno: z.enum(['manyana', 'tarde', 'noche']),
  inicio: z.string().transform((s) => new Date(s)),
  fin: z
    .string()
    .nullable()
    .transform((s) => (s ? new Date(s) : null)),
  resumenTraspaso: z.string().nullable(),
  creadoEn: z.string().transform((s) => new Date(s)),
})

function parseRaw(raw: unknown): Turno {
  return TurnoSchema.parse(RawTurnoSchema.parse(raw))
}

const TurnoEnvelopeSchema = z.object({ turno: z.unknown() })

// ── API methods ───────────────────────────────────────────────────────────

/** GET /api/turnos/activo — fetch the active turno for the authenticated user */
async function getTurnoActivo(): Promise<Turno | null> {
  const response = await apiClient.get<unknown>('/turnos/activo')
  const data = response.data
  if (!data || (typeof data === 'object' && (data as Record<string, unknown>)['turno'] === null)) {
    return null
  }
  const { turno } = TurnoEnvelopeSchema.parse(data)
  if (turno === null) return null
  return parseRaw(turno)
}

/** POST /api/turnos — start a new turno with tipoTurno */
async function iniciarTurno(tipoTurno: TipoTurno): Promise<Turno> {
  const response = await apiClient.post<unknown>('/turnos', { tipoTurno })
  const { turno } = TurnoEnvelopeSchema.parse(response.data)
  return parseRaw(turno)
}

/** PATCH /api/turnos/:id/cierre — end the active turno with resumen de traspaso */
async function finalizarTurno(id: string, resumenTraspaso: string): Promise<Turno> {
  const response = await apiClient.patch<unknown>(`/turnos/${id}/cierre`, { resumenTraspaso })
  const { turno } = TurnoEnvelopeSchema.parse(response.data)
  return parseRaw(turno)
}

/** GET /api/turnos/:id/resumen — get aggregated end-of-shift summary */
async function getResumen(id: string): Promise<TurnoResumen> {
  const response = await apiClient.get<unknown>(`/turnos/${id}/resumen`)
  const data = z.object({ resumen: z.unknown() }).parse(response.data)
  return TurnoResumenSchema.parse(data.resumen)
}

export const turnoApi = {
  getTurnoActivo,
  iniciarTurno,
  finalizarTurno,
  getResumen,
}
