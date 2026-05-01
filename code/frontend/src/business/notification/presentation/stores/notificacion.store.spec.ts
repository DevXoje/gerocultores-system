/**
 * notificacion.store.spec.ts — RED phase tests for the Notificacion Pinia store.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * TDD: RED — these tests are written BEFORE the implementation.
 * Tests cover state shape, unread badge count (derived), and basic mutations.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificacionStore } from './notificacion.store'
import type { Notificacion } from '@/business/notification/domain/entities/Notificacion'

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

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useNotificacionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Initial state ────────────────────────────────────────────────────────

  it('initializes with empty items array', () => {
    const store = useNotificacionStore()
    expect(store.items).toEqual([])
  })

  it('initializes with unreadCount of zero', () => {
    const store = useNotificacionStore()
    expect(store.unreadCount).toBe(0)
  })

  it('initializes with isLoading false', () => {
    const store = useNotificacionStore()
    expect(store.isLoading).toBe(false)
  })

  // ── setItems mutation ────────────────────────────────────────────────────

  it('sets items when setItems is called', () => {
    const store = useNotificacionStore()
    const items = [makeNotificacion({ id: 'n1' }), makeNotificacion({ id: 'n2' })]

    store.setItems(items)

    expect(store.items).toHaveLength(2)
    expect(store.items[0].id).toBe('n1')
  })

  // ── unreadCount derived from items ───────────────────────────────────────

  it('computes unreadCount as number of non-leida items', () => {
    const store = useNotificacionStore()
    store.setItems([
      makeNotificacion({ id: 'n1', leida: false }),
      makeNotificacion({ id: 'n2', leida: true }),
      makeNotificacion({ id: 'n3', leida: false }),
    ])

    expect(store.unreadCount).toBe(2)
  })

  it('unreadCount is 0 when all notifications are leida', () => {
    const store = useNotificacionStore()
    store.setItems([
      makeNotificacion({ id: 'n1', leida: true }),
      makeNotificacion({ id: 'n2', leida: true }),
    ])

    expect(store.unreadCount).toBe(0)
  })

  // ── markAsRead mutation ──────────────────────────────────────────────────

  it('sets leida=true for the specified notification id', () => {
    const store = useNotificacionStore()
    store.setItems([
      makeNotificacion({ id: 'n1', leida: false }),
      makeNotificacion({ id: 'n2', leida: false }),
    ])

    store.markAsRead('n1')

    expect(store.items.find((i) => i.id === 'n1')?.leida).toBe(true)
    expect(store.items.find((i) => i.id === 'n2')?.leida).toBe(false)
  })

  it('updates unreadCount after markAsRead', () => {
    const store = useNotificacionStore()
    store.setItems([
      makeNotificacion({ id: 'n1', leida: false }),
      makeNotificacion({ id: 'n2', leida: false }),
    ])

    store.markAsRead('n1')

    expect(store.unreadCount).toBe(1)
  })

  // ── setLoading mutation ──────────────────────────────────────────────────

  it('updates isLoading when setLoading is called', () => {
    const store = useNotificacionStore()

    store.setLoading(true)
    expect(store.isLoading).toBe(true)

    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })
})
