/**
 * useTurno.spec.ts — Tests for the useTurno composable.
 *
 * US-11: Resumen de fin de turno
 *
 * TDD: RED written first — covers error paths, null-turno guards, and edge cases
 * missing from initial ~40% coverage (L38, L46-78).
 *
 * Strict TDD cycle:
 *   RED   → tests written referencing real production code
 *   GREEN → no production code changed (composable already exists)
 *   REFACTOR → N/A (tests only)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock use-cases ────────────────────────────────────────────────────────

vi.mock('../../application/use-cases/getTurnoActivo', () => ({
  getTurnoActivo: vi.fn(),
}))

vi.mock('../../application/use-cases/iniciarTurno', () => ({
  iniciarTurno: vi.fn(),
}))

vi.mock('../../application/use-cases/finalizarTurno', () => ({
  finalizarTurno: vi.fn(),
}))

vi.mock('../../application/use-cases/getResumenTurno', () => ({
  getResumenTurno: vi.fn(),
}))

import { useTurno } from './useTurno'
import { getTurnoActivo } from '../../application/use-cases/getTurnoActivo'
import { iniciarTurno as iniciarTurnoUC } from '../../application/use-cases/iniciarTurno'
import { finalizarTurno as finalizarTurnoUC } from '../../application/use-cases/finalizarTurno'
import { getResumenTurno } from '../../application/use-cases/getResumenTurno'
import type { Turno, TipoTurno } from '../../domain/entities/Turno'
import type { TurnoResumen } from '../../infrastructure/api/turnoApi'

// ── Helpers ───────────────────────────────────────────────────────────────

function makeTurno(overrides: Partial<Turno> = {}): Turno {
  const now = new Date('2026-04-25T08:00:00Z')
  return {
    id: 'turno-001',
    usuarioId: 'user-001',
    fecha: now,
    tipoTurno: 'manyana' as TipoTurno,
    inicio: now,
    fin: null,
    resumenTraspaso: null,
    creadoEn: now,
    ...overrides,
  }
}

function makeTurnoResumen(overrides: Partial<TurnoResumen> = {}): TurnoResumen {
  return {
    tareasCompletadas: 5,
    tareasPendientes: 2,
    incidenciasRegistradas: 1,
    residentesAtendidos: ['res-01', 'res-02'],
    textoResumen: 'Turno sin novedades',
    ...overrides,
  }
}

const mockGetTurnoActivo = vi.mocked(getTurnoActivo)
const mockIniciarTurno = vi.mocked(iniciarTurnoUC)
const mockFinalizarTurno = vi.mocked(finalizarTurnoUC)
const mockGetResumenTurno = vi.mocked(getResumenTurno)

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useTurno', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('turnoActivo is null on mount', () => {
      const { turnoActivo } = useTurno()
      expect(turnoActivo.value).toBeNull()
    })

    it('hasTurnoActivo is false on mount', () => {
      const { hasTurnoActivo } = useTurno()
      expect(hasTurnoActivo.value).toBe(false)
    })

    it('isLoading is false on mount', () => {
      const { isLoading } = useTurno()
      expect(isLoading.value).toBe(false)
    })

    it('error is null on mount', () => {
      const { error } = useTurno()
      expect(error.value).toBeNull()
    })

    it('resumen is null on mount', () => {
      const { resumen } = useTurno()
      expect(resumen.value).toBeNull()
    })
  })

  // ── cargarTurnoActivo — success ──────────────────────────────────────────

  describe('cargarTurnoActivo — success', () => {
    it('sets turnoActivo from use-case result', async () => {
      const turno = makeTurno({ id: 'turno-abc' })
      mockGetTurnoActivo.mockResolvedValueOnce(turno)

      const { cargarTurnoActivo, turnoActivo } = useTurno()
      await cargarTurnoActivo()

      expect(turnoActivo.value?.id).toBe('turno-abc')
    })

    it('sets hasTurnoActivo=true when a turno is returned', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno())

      const { cargarTurnoActivo, hasTurnoActivo } = useTurno()
      await cargarTurnoActivo()

      expect(hasTurnoActivo.value).toBe(true)
    })

    it('sets turnoActivo=null when use-case returns null', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(null)

      const { cargarTurnoActivo, turnoActivo } = useTurno()
      await cargarTurnoActivo()

      expect(turnoActivo.value).toBeNull()
    })

    it('clears error on successful load', async () => {
      // prime with error
      mockGetTurnoActivo.mockRejectedValueOnce(new Error('first error'))
      const { cargarTurnoActivo, error } = useTurno()
      await cargarTurnoActivo()
      expect(error.value).not.toBeNull()

      // now succeed
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno())
      await cargarTurnoActivo()
      expect(error.value).toBeNull()
    })

    it('sets isLoading=false after successful load', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno())
      const { cargarTurnoActivo, isLoading } = useTurno()
      await cargarTurnoActivo()
      expect(isLoading.value).toBe(false)
    })
  })

  // ── cargarTurnoActivo — error path (L38) ─────────────────────────────────

  describe('cargarTurnoActivo — error path', () => {
    it('stores error message when use-case throws an Error', async () => {
      mockGetTurnoActivo.mockRejectedValueOnce(new Error('Server unavailable'))

      const { cargarTurnoActivo, error } = useTurno()
      await cargarTurnoActivo()

      expect(error.value).toBe('Server unavailable')
    })

    it('stores fallback message when use-case throws a non-Error', async () => {
      mockGetTurnoActivo.mockRejectedValueOnce('unexpected rejection')

      const { cargarTurnoActivo, error } = useTurno()
      await cargarTurnoActivo()

      expect(error.value).toBe('Error al cargar el turno')
    })

    it('sets isLoading=false after failed load (finally block)', async () => {
      mockGetTurnoActivo.mockRejectedValueOnce(new Error('fail'))

      const { cargarTurnoActivo, isLoading } = useTurno()
      await cargarTurnoActivo()

      expect(isLoading.value).toBe(false)
    })
  })

  // ── iniciarTurno — success ────────────────────────────────────────────────

  describe('iniciarTurno — success', () => {
    it('sets turnoActivo with the returned turno', async () => {
      const turno = makeTurno({ tipoTurno: 'tarde' })
      mockIniciarTurno.mockResolvedValueOnce(turno)

      const { iniciarTurno, turnoActivo } = useTurno()
      await iniciarTurno('tarde')

      expect(turnoActivo.value?.tipoTurno).toBe('tarde')
    })

    it('uses manyana as default tipoTurno', async () => {
      const turno = makeTurno({ tipoTurno: 'manyana' })
      mockIniciarTurno.mockResolvedValueOnce(turno)

      const { iniciarTurno } = useTurno()
      await iniciarTurno() // no argument → default

      expect(mockIniciarTurno).toHaveBeenCalledWith('manyana')
    })

    it('sets isLoading=false after success', async () => {
      mockIniciarTurno.mockResolvedValueOnce(makeTurno())

      const { iniciarTurno, isLoading } = useTurno()
      await iniciarTurno()

      expect(isLoading.value).toBe(false)
    })
  })

  // ── iniciarTurno — error path (L51-L55) ──────────────────────────────────

  describe('iniciarTurno — error path', () => {
    it('stores error message when use-case throws an Error', async () => {
      mockIniciarTurno.mockRejectedValueOnce(new Error('Cannot start shift'))

      const { iniciarTurno, error } = useTurno()
      await iniciarTurno()

      expect(error.value).toBe('Cannot start shift')
    })

    it('stores fallback message when use-case throws a non-Error', async () => {
      mockIniciarTurno.mockRejectedValueOnce(42)

      const { iniciarTurno, error } = useTurno()
      await iniciarTurno()

      expect(error.value).toBe('Error al iniciar el turno')
    })

    it('sets isLoading=false after failed iniciarTurno', async () => {
      mockIniciarTurno.mockRejectedValueOnce(new Error('fail'))

      const { iniciarTurno, isLoading } = useTurno()
      await iniciarTurno()

      expect(isLoading.value).toBe(false)
    })
  })

  // ── finalizarTurno — guard: no turnoActivo (L60) ─────────────────────────

  describe('finalizarTurno — guard: no active turno', () => {
    it('returns early without calling use-case when turnoActivo is null', async () => {
      const { finalizarTurno } = useTurno()
      await finalizarTurno('some resumen')

      expect(mockFinalizarTurno).not.toHaveBeenCalled()
      expect(mockGetResumenTurno).not.toHaveBeenCalled()
    })

    it('does not set error when returning early due to null turnoActivo', async () => {
      const { finalizarTurno, error } = useTurno()
      await finalizarTurno('some resumen')

      expect(error.value).toBeNull()
    })
  })

  // ── finalizarTurno — success (L61-L68) ───────────────────────────────────

  describe('finalizarTurno — success', () => {
    it('calls finalizarTurno use-case with the active turno id', async () => {
      const activeTurno = makeTurno({ id: 'turno-xyz' })
      mockGetTurnoActivo.mockResolvedValueOnce(activeTurno)

      const closedTurno = makeTurno({ id: 'turno-xyz', fin: new Date() })
      mockFinalizarTurno.mockResolvedValueOnce(closedTurno)
      mockGetResumenTurno.mockResolvedValueOnce(makeTurnoResumen())

      const { cargarTurnoActivo, finalizarTurno } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('Traspaso limpio')

      expect(mockFinalizarTurno).toHaveBeenCalledWith('turno-xyz', 'Traspaso limpio')
    })

    it('fetches resumen after finalizing', async () => {
      const activeTurno = makeTurno({ id: 'turno-r1' })
      mockGetTurnoActivo.mockResolvedValueOnce(activeTurno)

      const closedTurno = makeTurno({ id: 'turno-r1', fin: new Date() })
      mockFinalizarTurno.mockResolvedValueOnce(closedTurno)
      const resumenData = makeTurnoResumen({ tareasCompletadas: 8 })
      mockGetResumenTurno.mockResolvedValueOnce(resumenData)

      const { cargarTurnoActivo, finalizarTurno, resumen } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('resumen text')

      expect(resumen.value?.tareasCompletadas).toBe(8)
      expect(mockGetResumenTurno).toHaveBeenCalledWith('turno-r1')
    })

    it('updates turnoActivo with the finalizado turno', async () => {
      const activeTurno = makeTurno({ id: 'turno-f1', fin: null })
      mockGetTurnoActivo.mockResolvedValueOnce(activeTurno)

      const closedTurno = makeTurno({ id: 'turno-f1', fin: new Date('2026-04-25T16:00:00Z') })
      mockFinalizarTurno.mockResolvedValueOnce(closedTurno)
      mockGetResumenTurno.mockResolvedValueOnce(makeTurnoResumen())

      const { cargarTurnoActivo, finalizarTurno, turnoActivo } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('texto traspaso')

      expect(turnoActivo.value?.fin).not.toBeNull()
    })

    it('sets isLoading=false after successful finalizarTurno', async () => {
      const activeTurno = makeTurno()
      mockGetTurnoActivo.mockResolvedValueOnce(activeTurno)
      mockFinalizarTurno.mockResolvedValueOnce(makeTurno({ fin: new Date() }))
      mockGetResumenTurno.mockResolvedValueOnce(makeTurnoResumen())

      const { cargarTurnoActivo, finalizarTurno, isLoading } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('resumen')

      expect(isLoading.value).toBe(false)
    })
  })

  // ── finalizarTurno — error path (L69-L72) ────────────────────────────────

  describe('finalizarTurno — error path', () => {
    it('stores error message when finalizarTurno use-case throws an Error', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno({ id: 'turno-err' }))
      mockFinalizarTurno.mockRejectedValueOnce(new Error('Shift close failed'))

      const { cargarTurnoActivo, finalizarTurno, error } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('texto')

      expect(error.value).toBe('Shift close failed')
    })

    it('stores fallback message when finalizarTurno throws a non-Error', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno({ id: 'turno-err2' }))
      mockFinalizarTurno.mockRejectedValueOnce({ code: 500 })

      const { cargarTurnoActivo, finalizarTurno, error } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('texto')

      expect(error.value).toBe('Error al finalizar el turno')
    })

    it('sets isLoading=false after finalizarTurno error', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno())
      mockFinalizarTurno.mockRejectedValueOnce(new Error('fail'))

      const { cargarTurnoActivo, finalizarTurno, isLoading } = useTurno()
      await cargarTurnoActivo()
      await finalizarTurno('texto')

      expect(isLoading.value).toBe(false)
    })
  })

  // ── draftResumen ──────────────────────────────────────────────────────────

  describe('draftResumen', () => {
    it('updates the resumenTraspaso in the store when turnoActivo exists', async () => {
      mockGetTurnoActivo.mockResolvedValueOnce(makeTurno({ resumenTraspaso: null }))

      const { cargarTurnoActivo, draftResumen, turnoActivo } = useTurno()
      await cargarTurnoActivo()
      draftResumen('Novedades del turno de mañana')

      expect(turnoActivo.value?.resumenTraspaso).toBe('Novedades del turno de mañana')
    })

    it('does not throw when turnoActivo is null', () => {
      const { draftResumen } = useTurno()
      expect(() => draftResumen('texto')).not.toThrow()
    })
  })
})
