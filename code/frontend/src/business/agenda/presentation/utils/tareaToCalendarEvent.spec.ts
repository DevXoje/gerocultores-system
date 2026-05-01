/**
 * tareaToCalendarEvent.spec.ts
 *
 * Unit tests for the tareaToCalendarEvent utility function.
 * Covers all TareaTipo × TareaEstado combinations.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 */
import { describe, it, expect } from 'vitest'
import type {
  TareaResponse,
  TareaTipo,
  TareaEstado,
} from '@/business/agenda/domain/entities/tarea.types'
import { tareaToCalendarEvent } from './tareaToCalendarEvent'

const add30min = (iso: string) => new Date(new Date(iso).getTime() + 30 * 60000).toISOString()

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TIPOS: TareaTipo[] = [
  'higiene',
  'medicacion',
  'alimentacion',
  'actividad',
  'revision',
  'otro',
]
const ESTADOS: TareaEstado[] = ['pendiente', 'en_curso', 'completada', 'con_incidencia']

function makeTarea(overrides: Partial<TareaResponse> = {}): TareaResponse {
  return {
    id: 'tarea-test-001',
    titulo: 'Tarea de prueba',
    tipo: 'higiene',
    fechaHora: '2026-05-01T08:00:00Z',
    estado: 'pendiente',
    notas: 'Notas de prueba',
    residenteId: 'residente-1',
    usuarioId: 'usuario-1',
    creadoEn: '2026-05-01T00:00:00Z',
    actualizadoEn: '2026-05-01T00:00:00Z',
    completadaEn: null,
    ...overrides,
  }
}

// ── Basic mapping ─────────────────────────────────────────────────────────────

describe('tareaToCalendarEvent — basic mapping', () => {
  it('maps tarea.id to event id', () => {
    const tarea = makeTarea({ id: 'tarea-xyz' })
    const event = tareaToCalendarEvent(tarea)
    expect(event.id).toBe('tarea-xyz')
  })

  it('maps tarea.titulo to event title', () => {
    const tarea = makeTarea({ titulo: 'Administración de medicación' })
    const event = tareaToCalendarEvent(tarea)
    expect(event.title).toBe('Administración de medicación')
  })

  it('maps tarea.fechaHora to event start', () => {
    const tarea = makeTarea({ fechaHora: '2026-06-15T09:30:00Z' })
    const event = tareaToCalendarEvent(tarea)
    expect(event.start).toBe('2026-06-15T09:30:00Z')
  })

  it('sets event end to fechaHora + 30 minutes', () => {
    const tarea = makeTarea({ fechaHora: '2026-05-01T08:00:00Z' })
    const event = tareaToCalendarEvent(tarea)
    const expectedEnd = add30min('2026-05-01T08:00:00Z')
    expect(event.end).toBe(expectedEnd)
  })

  it('stores full tarea in extendedProps.tarea', () => {
    const tarea = makeTarea({ id: 'tarea-full-001' })
    const event = tareaToCalendarEvent(tarea)
    expect(event.extendedProps).toBeDefined()
    const stored = (event.extendedProps as { tarea: TareaResponse }).tarea
    expect(stored.id).toBe('tarea-full-001')
    expect(stored.titulo).toBe('Tarea de prueba')
  })
})

// ── classNames — tipo ─────────────────────────────────────────────────────────

describe('tareaToCalendarEvent — classNames for tipo', () => {
  it.each(TIPOS)('adds class "fc-event--%s" for tipo', (tipo) => {
    const tarea = makeTarea({ tipo })
    const event = tareaToCalendarEvent(tarea)
    expect(event.classNames).toContain(`fc-event--${tipo}`)
  })
})

// ── classNames — estado ────────────────────────────────────────────────────────

describe('tareaToCalendarEvent — classNames for estado', () => {
  it.each(ESTADOS)('adds class "fc-event--%s" for estado', (estado) => {
    const tarea = makeTarea({ estado })
    const event = tareaToCalendarEvent(tarea)
    expect(event.classNames).toContain(`fc-event--${estado}`)
  })
})

// ── classNames — combined ─────────────────────────────────────────────────────

describe('tareaToCalendarEvent — classNames include both tipo and estado', () => {
  it.each(TIPOS)('%s × each estado produces both CSS classes', (tipo) => {
    const tarea = makeTarea({ tipo })
    const event = tareaToCalendarEvent(tarea)
    expect(event.classNames).toContain(`fc-event--${tipo}`)
  })
})

// ── All TareaTipo × TareaEstado combinations ──────────────────────────────────

describe('tareaToCalendarEvent — all TareaTipo × TareaEstado combinations', () => {
  const combinations: Array<{ tipo: TareaTipo; estado: TareaEstado }> = TIPOS.flatMap((tipo) =>
    ESTADOS.map((estado) => ({ tipo, estado }))
  )

  it.each(combinations)('tipo=$tipo, estado=$estado → valid event shape', ({ tipo, estado }) => {
    const tarea = makeTarea({ tipo, estado })
    const event = tareaToCalendarEvent(tarea)

    expect(event.id).toBe(tarea.id)
    expect(event.title).toBe(tarea.titulo)
    expect(event.start).toBe(tarea.fechaHora)
    expect(event.end).toBeDefined()
    expect(event.classNames).toContain(`fc-event--${tipo}`)
    expect(event.classNames).toContain(`fc-event--${estado}`)
    expect(event.extendedProps).toBeDefined()
  })
})

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('tareaToCalendarEvent — edge cases', () => {
  it('handles tarea with null notas', () => {
    const tarea = makeTarea({ notas: null })
    const event = tareaToCalendarEvent(tarea)
    const stored = (event.extendedProps as { tarea: TareaResponse }).tarea
    expect(stored.notas).toBeNull()
  })

  it('handles tarea with ISO date at midnight', () => {
    const tarea = makeTarea({ fechaHora: '2026-05-01T00:00:00Z' })
    const event = tareaToCalendarEvent(tarea)
    const expectedEnd = add30min('2026-05-01T00:00:00Z')
    expect(event.end).toBe(expectedEnd)
  })

  it('handles tarea with late-night ISO date', () => {
    const tarea = makeTarea({ fechaHora: '2026-05-01T23:30:00Z' })
    const event = tareaToCalendarEvent(tarea)
    const expectedEnd = add30min('2026-05-01T23:30:00Z')
    expect(event.end).toBe(expectedEnd)
  })
})
