/**
 * turnoApi.spec.ts — Tests for turnoApi infrastructure layer.
 *
 * US-11: Resumen de fin de turno
 *
 * TDD: verifies correct routes and payload shapes per API contract (G04 fix).
 * Contracts:
 *   POST /api/turnos  body: { tipoTurno }  → 201 { turno }
 *   PATCH /api/turnos/:id/cierre  body: { resumenTraspaso }  → 200 { turno }
 *   GET  /api/turnos/activo  → 200 { turno | null }
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('@/infrastructure/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  isServerHealthy: vi.fn(),
}))

import { turnoApi } from './turnoApi'
import { apiClient } from '@/infrastructure/apiClient'

// ── Helpers ───────────────────────────────────────────────────────────────
function makeRawTurnoResponse(overrides = {}) {
  return {
    turno: {
      id: 'turno-1',
      usuarioId: 'user-42',
      fecha: '2026-04-25T00:00:00.000Z',
      tipoTurno: 'manyana',
      inicio: '2026-04-25T08:00:00.000Z',
      fin: null,
      resumenTraspaso: null,
      creadoEn: '2026-04-25T08:00:00.000Z',
      ...overrides,
    },
  }
}

describe('turnoApi', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.patch).mockReset()
  })

  // ── iniciarTurno ──────────────────────────────────────────────────────
  describe('iniciarTurno', () => {
    it('calls POST /turnos with tipoTurno in body', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: makeRawTurnoResponse() })

      await turnoApi.iniciarTurno('manyana')

      expect(apiClient.post).toHaveBeenCalledWith('/turnos', { tipoTurno: 'manyana' })
    })

    it('calls POST /turnos with tarde tipoTurno', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: makeRawTurnoResponse({ tipoTurno: 'tarde' }),
      })

      await turnoApi.iniciarTurno('tarde')

      expect(apiClient.post).toHaveBeenCalledWith('/turnos', { tipoTurno: 'tarde' })
    })

    it('returns parsed Turno with tipoTurno field', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: makeRawTurnoResponse() })

      const result = await turnoApi.iniciarTurno('manyana')

      expect(result.tipoTurno).toBe('manyana')
      expect(result.inicio).toBeInstanceOf(Date)
    })
  })

  // ── finalizarTurno ────────────────────────────────────────────────────
  describe('finalizarTurno', () => {
    it('calls PATCH /turnos/:id/cierre (NOT /finalizar)', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: makeRawTurnoResponse({ resumenTraspaso: 'Todo en orden.' }),
      })

      await turnoApi.finalizarTurno('turno-1', 'Todo en orden.')

      expect(apiClient.patch).toHaveBeenCalledWith('/turnos/turno-1/cierre', {
        resumenTraspaso: 'Todo en orden.',
      })
    })

    it('does NOT call /finalizar route', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: makeRawTurnoResponse({ resumenTraspaso: 'Notas' }),
      })

      await turnoApi.finalizarTurno('turno-2', 'Notas')

      const callArg = vi.mocked(apiClient.patch).mock.calls[0][0] as string
      expect(callArg).not.toContain('finalizar')
      expect(callArg).toContain('cierre')
    })

    it('returns parsed Turno with resumenTraspaso', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: makeRawTurnoResponse({ resumenTraspaso: 'Todo en orden.' }),
      })

      const result = await turnoApi.finalizarTurno('turno-1', 'Todo en orden.')

      expect(result.resumenTraspaso).toBe('Todo en orden.')
    })
  })

  // ── getTurnoActivo ────────────────────────────────────────────────────
  describe('getTurnoActivo', () => {
    it('calls GET /turnos/activo', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: makeRawTurnoResponse() })

      await turnoApi.getTurnoActivo()

      expect(apiClient.get).toHaveBeenCalledWith('/turnos/activo')
    })

    it('returns parsed Turno when active shift exists', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: makeRawTurnoResponse() })

      const result = await turnoApi.getTurnoActivo()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('turno-1')
      expect(result?.tipoTurno).toBe('manyana')
    })

    it('returns null when { turno: null }', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { turno: null } })

      const result = await turnoApi.getTurnoActivo()

      expect(result).toBeNull()
    })
  })
})
