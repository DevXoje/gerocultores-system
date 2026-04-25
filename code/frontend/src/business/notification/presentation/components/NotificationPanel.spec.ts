/**
 * NotificationPanel.spec.ts — Component tests for NotificationPanel.vue
 *
 * US-08: Recibir notificaciones de alertas críticas
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('@/services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  isServerHealthy: vi.fn(),
}))
vi.mock('../../application/use-cases/getNotificaciones', () => ({
  getNotificaciones: vi.fn().mockResolvedValue([]),
}))
vi.mock('../../application/use-cases/markAsRead', () => ({
  markAsRead: vi.fn().mockResolvedValue(undefined),
}))

import NotificationPanel from './NotificationPanel.vue'
import { useNotificacionStore } from '../stores/notificacion.store'

function makeNotification(overrides = {}) {
  return {
    id: 'notif-1',
    usuarioId: 'user-1',
    tipo: 'sistema' as const,
    titulo: 'Test Titulo',
    mensaje: 'Test mensaje',
    leida: false,
    referenciaId: null,
    referenciaModelo: null,
    creadaEn: new Date('2026-04-25T08:00:00Z'),
    ...overrides,
  }
}

describe('NotificationPanel', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders the panel title when open', () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.notification-panel__title').text()).toBe('Notificaciones')
  })

  it('does not render panel content when open=false', () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: false },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.notification-panel').exists()).toBe(false)
  })

  it('shows empty state when no notifications', async () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.notification-panel__empty-msg').exists()).toBe(true)
    expect(wrapper.find('.notification-panel__empty-msg').text()).toBe('No tienes notificaciones.')
  })

  it('shows notification item title when store has items', async () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
    })
    // Wait for onMounted async fetch to settle
    await flushPromises()

    const store = useNotificacionStore()
    store.setItems([makeNotification({ titulo: 'Alerta crítica' })])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notification-panel__item-title').text()).toBe('Alerta crítica')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
    })
    await wrapper.find('.notification-panel__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows unread badge count when there are unread notifications', async () => {
    const wrapper = mount(NotificationPanel, {
      props: { open: true },
      global: { plugins: [pinia] },
    })
    await flushPromises()

    const store = useNotificacionStore()
    store.setItems([
      makeNotification({ id: 'n1', leida: false }),
      makeNotification({ id: 'n2', leida: false }),
    ])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.notification-panel__badge').text()).toBe('2')
  })
})
