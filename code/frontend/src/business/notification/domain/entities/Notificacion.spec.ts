/**
 * Notificacion.spec.ts — RED phase tests for the Notificacion domain entity.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * TDD: RED — these tests are written BEFORE the implementation.
 * All imports reference files that do NOT exist yet.
 */
import { describe, it, expect } from 'vitest'
import { NotificacionSchema, type Notificacion } from './Notificacion'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeValidNotificacion(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'notif-001',
    usuarioId: 'user-001',
    tipo: 'incidencia_critica',
    titulo: 'Incidencia crítica',
    mensaje: 'Caída en habitación 12',
    leida: false,
    referenciaId: null,
    referenciaModelo: null,
    creadaEn: new Date('2026-04-25T10:00:00Z'),
    ...overrides,
  }
}

// ── Schema validation — happy path ────────────────────────────────────────

describe('NotificacionSchema', () => {
  it('parses a valid Notificacion with all required fields', () => {
    const data = makeValidNotificacion()
    const result = NotificacionSchema.parse(data)

    expect(result.id).toBe('notif-001')
    expect(result.usuarioId).toBe('user-001')
    expect(result.tipo).toBe('incidencia_critica')
    expect(result.titulo).toBe('Incidencia crítica')
    expect(result.mensaje).toBe('Caída en habitación 12')
    expect(result.leida).toBe(false)
    expect(result.referenciaId).toBeNull()
    expect(result.referenciaModelo).toBeNull()
    expect(result.creadaEn).toBeInstanceOf(Date)
  })

  it('accepts all valid tipo values', () => {
    const tipos: Notificacion['tipo'][] = [
      'incidencia_critica',
      'tarea_proxima',
      'traspaso_turno',
      'sistema',
    ]

    for (const tipo of tipos) {
      const result = NotificacionSchema.parse(makeValidNotificacion({ tipo }))
      expect(result.tipo).toBe(tipo)
    }
  })

  it('rejects an unknown tipo value', () => {
    expect(() =>
      NotificacionSchema.parse(
        makeValidNotificacion({ tipo: 'desconocido' as Notificacion['tipo'] })
      )
    ).toThrow()
  })

  it('rejects when id is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...withoutId } = makeValidNotificacion()
    expect(() => NotificacionSchema.parse(withoutId)).toThrow()
  })

  it('rejects when usuarioId is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { usuarioId: _uid, ...withoutUsuarioId } = makeValidNotificacion()
    expect(() => NotificacionSchema.parse(withoutUsuarioId)).toThrow()
  })

  it('rejects when leida is not a boolean', () => {
    expect(() =>
      NotificacionSchema.parse(makeValidNotificacion({ leida: 'yes' as unknown as boolean }))
    ).toThrow()
  })

  it('accepts a notificacion with referenciaId set (non-null)', () => {
    const result = NotificacionSchema.parse(
      makeValidNotificacion({ referenciaId: 'incidencia-123', referenciaModelo: 'Incidencia' })
    )
    expect(result.referenciaId).toBe('incidencia-123')
    expect(result.referenciaModelo).toBe('Incidencia')
  })

  it('rejects when creadaEn is not a Date', () => {
    expect(() =>
      NotificacionSchema.parse(makeValidNotificacion({ creadaEn: 'not-a-date' as unknown as Date }))
    ).toThrow()
  })
})
