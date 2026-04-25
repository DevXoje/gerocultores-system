/**
 * turno.store.spec.ts — RED tests for turno Pinia store.
 *
 * US-11: Resumen de fin de turno
 *
 * TDD RED phase: these tests MUST fail before turno.store.ts is created.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { vi } from 'vitest'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('@/services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  isServerHealthy: vi.fn(),
}))

import { setActivePinia, createPinia } from 'pinia'
import { useTurnoStore } from './turno.store'
import type { Turno } from '../domain/entities/Turno'

function makeTurno(overrides: Partial<Turno> = {}): Turno {
  return {
    id: 'turno-1',
    usuarioId: 'user-42',
    fecha: new Date('2026-04-25T00:00:00Z'),
    tipoTurno: 'manyana',
    inicio: new Date('2026-04-25T08:00:00Z'),
    fin: null,
    resumenTraspaso: null,
    creadoEn: new Date('2026-04-25T08:00:00Z'),
    ...overrides,
  }
}

describe('useTurnoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initialises with null turnoActivo and empty historial', () => {
    const store = useTurnoStore()
    expect(store.turnoActivo).toBeNull()
    expect(store.historial).toEqual([])
    expect(store.isLoading).toBe(false)
  })

  it('setTurnoActivo stores the turno', () => {
    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    expect(store.turnoActivo?.id).toBe('turno-1')
    expect(store.turnoActivo?.tipoTurno).toBe('manyana')
  })

  it('setTurnoActivo accepts null (turno ended)', () => {
    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    store.setTurnoActivo(null)
    expect(store.turnoActivo).toBeNull()
  })

  it('setHistorial replaces historial', () => {
    const store = useTurnoStore()
    store.setHistorial([makeTurno(), makeTurno({ id: 'turno-2' })])
    expect(store.historial).toHaveLength(2)
    store.setHistorial([])
    expect(store.historial).toHaveLength(0)
  })

  it('hasTurnoActivo getter returns true when turnoActivo is set', () => {
    const store = useTurnoStore()
    expect(store.hasTurnoActivo).toBe(false)
    store.setTurnoActivo(makeTurno())
    expect(store.hasTurnoActivo).toBe(true)
  })

  it('setLoading updates isLoading', () => {
    const store = useTurnoStore()
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('updateResumenTraspaso updates resumenTraspaso on turnoActivo', () => {
    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    store.updateResumenTraspaso('Todo en orden.')
    expect(store.turnoActivo?.resumenTraspaso).toBe('Todo en orden.')
  })

  it('updateResumenTraspaso is a no-op when turnoActivo is null', () => {
    const store = useTurnoStore()
    expect(() => store.updateResumenTraspaso('texto')).not.toThrow()
    expect(store.turnoActivo).toBeNull()
  })
})
