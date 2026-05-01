/**
 * Turno.spec.ts — Tests for Turno domain entity.
 *
 * US-11: Resumen de fin de turno
 *
 * TDD: updated to match SPEC/entities.md fields (G04 fix).
 * Fields: tipoTurno, inicio (Date), fin (Date|null) — NOT horaInicio/horaFin/estado.
 */
import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

// Mocks required by every spec (firebase/auth + apiClient)
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('@/infrastructure/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  isServerHealthy: vi.fn(),
}))

import { TurnoSchema, TipoTurnoSchema } from './Turno'

// ── Helpers ───────────────────────────────────────────────────────────────
function makeValidTurno(overrides = {}) {
  return {
    id: 'turno-1',
    usuarioId: 'user-42',
    fecha: new Date('2026-04-25T00:00:00Z'),
    tipoTurno: 'manyana' as const,
    inicio: new Date('2026-04-25T08:00:00Z'),
    fin: null,
    resumenTraspaso: null,
    creadoEn: new Date('2026-04-25T08:00:00Z'),
    ...overrides,
  }
}

// ── TipoTurno ─────────────────────────────────────────────────────────────
describe('TipoTurnoSchema', () => {
  it('accepts all valid tipoTurno values', () => {
    for (const tipo of ['manyana', 'tarde', 'noche'] as const) {
      expect(() => TipoTurnoSchema.parse(tipo)).not.toThrow()
    }
  })

  it('rejects unknown tipoTurno values', () => {
    expect(() => TipoTurnoSchema.parse('activo')).toThrow()
    expect(() => TipoTurnoSchema.parse('finalizado')).toThrow()
    expect(() => TipoTurnoSchema.parse('pendiente')).toThrow()
  })
})

// ── TurnoSchema — happy paths ─────────────────────────────────────────────
describe('TurnoSchema — valid input', () => {
  it('parses a minimal valid turno (fin=null, resumenTraspaso=null)', () => {
    const result = TurnoSchema.parse(makeValidTurno())
    expect(result.id).toBe('turno-1')
    expect(result.usuarioId).toBe('user-42')
    expect(result.tipoTurno).toBe('manyana')
    expect(result.fin).toBeNull()
    expect(result.resumenTraspaso).toBeNull()
  })

  it('parses a tarde turno', () => {
    const result = TurnoSchema.parse(makeValidTurno({ tipoTurno: 'tarde' }))
    expect(result.tipoTurno).toBe('tarde')
  })

  it('parses a noche turno', () => {
    const result = TurnoSchema.parse(makeValidTurno({ tipoTurno: 'noche' }))
    expect(result.tipoTurno).toBe('noche')
  })

  it('accepts a completed turno with fin and resumenTraspaso', () => {
    const fin = new Date('2026-04-25T16:00:00Z')
    const result = TurnoSchema.parse(
      makeValidTurno({
        fin,
        resumenTraspaso: 'Todo en orden.',
      })
    )
    expect(result.fin).toBeInstanceOf(Date)
    expect(result.resumenTraspaso).toBe('Todo en orden.')
  })

  it('accepts inicio and fin as Date objects', () => {
    const inicio = new Date('2026-04-25T08:00:00Z')
    const fin = new Date('2026-04-25T16:00:00Z')
    const result = TurnoSchema.parse(makeValidTurno({ inicio, fin }))
    expect(result.inicio).toBeInstanceOf(Date)
    expect(result.fin).toBeInstanceOf(Date)
  })

  it('accepts creadoEn as a Date object', () => {
    const date = new Date('2026-04-25T08:00:00Z')
    const result = TurnoSchema.parse(makeValidTurno({ creadoEn: date }))
    expect(result.creadoEn).toBeInstanceOf(Date)
  })
})

// ── TurnoSchema — rejection paths ─────────────────────────────────────────
describe('TurnoSchema — invalid input', () => {
  it('rejects missing id', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = makeValidTurno()
    expect(() => TurnoSchema.parse(rest)).toThrow()
  })

  it('rejects missing usuarioId', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { usuarioId: _uid, ...rest } = makeValidTurno()
    expect(() => TurnoSchema.parse(rest)).toThrow()
  })

  it('rejects invalid tipoTurno', () => {
    expect(() => TurnoSchema.parse(makeValidTurno({ tipoTurno: 'activo' }))).toThrow()
  })

  it('rejects non-date inicio', () => {
    expect(() => TurnoSchema.parse(makeValidTurno({ inicio: 'not-a-date' }))).toThrow()
  })

  it('rejects non-date creadoEn', () => {
    expect(() => TurnoSchema.parse(makeValidTurno({ creadoEn: 'not-a-date' }))).toThrow()
  })

  it('does NOT have horaInicio field (old field removed)', () => {
    const result = TurnoSchema.parse(makeValidTurno())
    expect('horaInicio' in result).toBe(false)
  })

  it('does NOT have horaFin field (old field removed)', () => {
    const result = TurnoSchema.parse(makeValidTurno())
    expect('horaFin' in result).toBe(false)
  })

  it('does NOT have estado field (old field removed)', () => {
    const result = TurnoSchema.parse(makeValidTurno())
    expect('estado' in result).toBe(false)
  })
})
