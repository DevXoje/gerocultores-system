/**
 * useNotificacion.spec.ts — Tests for the useNotificacion composable.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * TDD: RED written first — covers error paths, polling branches, and edge cases
 * missing from initial ~50% coverage (L37, L46-69, L74).
 *
 * Strict TDD cycle:
 *   RED   → tests written referencing real production code
 *   GREEN → no production code changed (composable already exists)
 *   REFACTOR → N/A (tests only)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock use-cases (infrastructure layer — must be mocked in composable tests) ─
vi.mock('../../application/use-cases/getNotificaciones', () => ({
  getNotificaciones: vi.fn(),
}))

vi.mock('../../application/use-cases/markAsRead', () => ({
  markAsRead: vi.fn(),
}))

import { useNotificacion } from './useNotificacion'
import { getNotificaciones } from '../../application/use-cases/getNotificaciones'
import { markAsRead } from '../../application/use-cases/markAsRead'
import type { Notificacion } from '../../domain/entities/Notificacion'

// ── Helpers ───────────────────────────────────────────────────────────────

function makeNotificacion(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'notif-001',
    usuarioId: 'user-001',
    tipo: 'incidencia_critica',
    titulo: 'Alerta crítica',
    mensaje: 'Mensaje de prueba',
    leida: false,
    referenciaId: null,
    referenciaModelo: null,
    creadaEn: new Date('2026-04-25T10:00:00Z'),
    ...overrides,
  }
}

const mockGetNotificaciones = vi.mocked(getNotificaciones)
const mockMarkAsRead = vi.mocked(markAsRead)

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useNotificacion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('exposes empty items array on mount', () => {
      const { items } = useNotificacion()
      expect(items.value).toEqual([])
    })

    it('exposes unreadCount = 0 on mount', () => {
      const { unreadCount } = useNotificacion()
      expect(unreadCount.value).toBe(0)
    })

    it('exposes isLoading = false on mount', () => {
      const { isLoading } = useNotificacion()
      expect(isLoading.value).toBe(false)
    })

    it('exposes error = null on mount', () => {
      const { error } = useNotificacion()
      expect(error.value).toBeNull()
    })
  })

  // ── fetchNotificaciones — happy path ─────────────────────────────────────

  describe('fetchNotificaciones — success', () => {
    it('sets items from use-case result', async () => {
      const notifs = [makeNotificacion({ id: 'n1' }), makeNotificacion({ id: 'n2', leida: true })]
      mockGetNotificaciones.mockResolvedValueOnce(notifs)

      const { fetchNotificaciones, items } = useNotificacion()
      await fetchNotificaciones()

      expect(items.value).toHaveLength(2)
      expect(items.value[0].id).toBe('n1')
    })

    it('clears previous error on a successful fetch', async () => {
      // prime error state with a failed fetch
      mockGetNotificaciones.mockRejectedValueOnce(new Error('red herring'))
      const { fetchNotificaciones, error } = useNotificacion()
      await fetchNotificaciones()
      expect(error.value).not.toBeNull()

      // now succeed — error should clear
      mockGetNotificaciones.mockResolvedValueOnce([makeNotificacion()])
      await fetchNotificaciones()
      expect(error.value).toBeNull()
    })

    it('sets isLoading=false after successful fetch', async () => {
      mockGetNotificaciones.mockResolvedValueOnce([makeNotificacion()])
      const { fetchNotificaciones, isLoading } = useNotificacion()
      await fetchNotificaciones()
      expect(isLoading.value).toBe(false)
    })
  })

  // ── fetchNotificaciones — error path (L37) ───────────────────────────────

  describe('fetchNotificaciones — error path', () => {
    it('stores error message when use-case throws an Error', async () => {
      mockGetNotificaciones.mockRejectedValueOnce(new Error('Network timeout'))

      const { fetchNotificaciones, error } = useNotificacion()
      await fetchNotificaciones()

      expect(error.value).toBe('Network timeout')
    })

    it('stores fallback message when use-case throws a non-Error', async () => {
      mockGetNotificaciones.mockRejectedValueOnce('string-error')

      const { fetchNotificaciones, error } = useNotificacion()
      await fetchNotificaciones()

      expect(error.value).toBe('Error al cargar notificaciones')
    })

    it('sets isLoading=false after failed fetch (finally block)', async () => {
      mockGetNotificaciones.mockRejectedValueOnce(new Error('fail'))

      const { fetchNotificaciones, isLoading } = useNotificacion()
      await fetchNotificaciones()

      expect(isLoading.value).toBe(false)
    })

    it('does not update items when fetch fails', async () => {
      // load some items first
      mockGetNotificaciones.mockResolvedValueOnce([makeNotificacion({ id: 'n1' })])
      const { fetchNotificaciones, items } = useNotificacion()
      await fetchNotificaciones()
      expect(items.value).toHaveLength(1)

      // now fail — items must remain as they were
      mockGetNotificaciones.mockRejectedValueOnce(new Error('fail'))
      await fetchNotificaciones()
      expect(items.value).toHaveLength(1)
    })
  })

  // ── markNotificacionAsRead — happy path ──────────────────────────────────

  describe('markNotificacionAsRead — success', () => {
    it('optimistically marks the notification as read in the store', async () => {
      mockGetNotificaciones.mockResolvedValueOnce([makeNotificacion({ id: 'n1', leida: false })])
      mockMarkAsRead.mockResolvedValueOnce(makeNotificacion({ id: 'n1', leida: true }))

      const { fetchNotificaciones, markNotificacionAsRead, items } = useNotificacion()
      await fetchNotificaciones()
      await markNotificacionAsRead('n1')

      expect(items.value.find((i) => i.id === 'n1')?.leida).toBe(true)
    })

    it('decrements unreadCount after marking read', async () => {
      mockGetNotificaciones.mockResolvedValueOnce([
        makeNotificacion({ id: 'n1', leida: false }),
        makeNotificacion({ id: 'n2', leida: false }),
      ])
      mockMarkAsRead.mockResolvedValueOnce(makeNotificacion({ id: 'n1', leida: true }))

      const { fetchNotificaciones, markNotificacionAsRead, unreadCount } = useNotificacion()
      await fetchNotificaciones()
      expect(unreadCount.value).toBe(2)

      await markNotificacionAsRead('n1')
      expect(unreadCount.value).toBe(1)
    })
  })

  // ── markNotificacionAsRead — error path (L46-L53) ────────────────────────

  describe('markNotificacionAsRead — error path', () => {
    it('re-fetches notifications when markAsRead use-case throws', async () => {
      mockGetNotificaciones.mockResolvedValue([makeNotificacion({ id: 'n1', leida: false })])
      mockMarkAsRead.mockRejectedValueOnce(new Error('API error'))

      const { fetchNotificaciones, markNotificacionAsRead } = useNotificacion()
      await fetchNotificaciones()
      await markNotificacionAsRead('n1')

      // getNotificaciones called twice: once for initial fetch, once for re-sync
      expect(mockGetNotificaciones).toHaveBeenCalledTimes(2)
    })

    it('stores error message when markAsRead throws an Error', async () => {
      mockGetNotificaciones.mockResolvedValue([makeNotificacion({ id: 'n1' })])
      mockMarkAsRead.mockRejectedValueOnce(new Error('Mark failed'))

      const { fetchNotificaciones, markNotificacionAsRead, error } = useNotificacion()
      await fetchNotificaciones()
      await markNotificacionAsRead('n1')

      expect(error.value).toBe('Mark failed')
    })

    it('stores fallback error message when markAsRead throws a non-Error', async () => {
      mockGetNotificaciones.mockResolvedValue([makeNotificacion({ id: 'n1' })])
      mockMarkAsRead.mockRejectedValueOnce('raw string error')

      const { fetchNotificaciones, markNotificacionAsRead, error } = useNotificacion()
      await fetchNotificaciones()
      await markNotificacionAsRead('n1')

      expect(error.value).toBe('Error al marcar como leída')
    })
  })

  // ── startPolling (L57-L64) ────────────────────────────────────────────────

  describe('startPolling', () => {
    it('calls fetchNotificaciones after POLL_INTERVAL_MS when online', async () => {
      mockGetNotificaciones.mockResolvedValue([])

      const { startPolling } = useNotificacion()
      startPolling(() => true)

      // advance timer by 30 seconds
      await vi.advanceTimersByTimeAsync(30_000)

      expect(mockGetNotificaciones).toHaveBeenCalledTimes(1)
    })

    it('does NOT call fetchNotificaciones when isOnline returns false', async () => {
      mockGetNotificaciones.mockResolvedValue([])

      const { startPolling } = useNotificacion()
      startPolling(() => false)

      await vi.advanceTimersByTimeAsync(30_000)

      expect(mockGetNotificaciones).not.toHaveBeenCalled()
    })

    it('does not start a second timer if startPolling is called twice', async () => {
      mockGetNotificaciones.mockResolvedValue([])

      const { startPolling } = useNotificacion()
      startPolling(() => true)
      startPolling(() => true) // second call — should be no-op

      await vi.advanceTimersByTimeAsync(30_000)

      // Only one interval running → only one fetch
      expect(mockGetNotificaciones).toHaveBeenCalledTimes(1)
    })
  })

  // ── stopPolling (L66-L71) ─────────────────────────────────────────────────

  describe('stopPolling', () => {
    it('stops the polling timer so no more fetches occur', async () => {
      mockGetNotificaciones.mockResolvedValue([])

      const { startPolling, stopPolling } = useNotificacion()
      startPolling(() => true)
      stopPolling()

      await vi.advanceTimersByTimeAsync(30_000)

      expect(mockGetNotificaciones).not.toHaveBeenCalled()
    })

    it('calling stopPolling when polling was not started does not throw', () => {
      const { stopPolling } = useNotificacion()
      expect(() => stopPolling()).not.toThrow()
    })
  })
})
