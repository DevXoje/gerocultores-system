/**
 * Turno.ts — Domain entity for work shifts.
 *
 * US-11: Resumen de fin de turno
 *
 * Field names match SPEC/entities.md exactly (G04).
 * Zod schema is the single source of truth — TypeScript type is derived.
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in domain/entities/ — pure TypeScript, NO framework deps.
 */
import { z } from 'zod'

// ── Enum schema ────────────────────────────────────────────────────────────

export const TipoTurnoSchema = z.enum(['manyana', 'tarde', 'noche'])

export type TipoTurno = z.infer<typeof TipoTurnoSchema>

// ── Entity schema ──────────────────────────────────────────────────────────

export const TurnoSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  fecha: z.date(),
  tipoTurno: TipoTurnoSchema,
  inicio: z.date(),
  fin: z.date().nullable(),
  resumenTraspaso: z.string().nullable(),
  creadoEn: z.date(),
})

export type Turno = z.infer<typeof TurnoSchema>

// ── Type guard ────────────────────────────────────────────────────────────

export function assertIsTurno(val: unknown): asserts val is Turno {
  TurnoSchema.parse(val)
}
