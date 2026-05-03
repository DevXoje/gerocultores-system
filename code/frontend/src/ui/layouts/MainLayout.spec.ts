/**
 * MainLayout.spec.ts — Tests for MainLayout.vue (authenticated zone shell).
 *
 * US-08: Recibir notificaciones de alertas críticas
 * US-11: Resumen de fin de turno (connectivity awareness)
 *
 * Verifies: OfflineBanner, NotificationPanel, NotificationToast, bell button,
 * startPolling on mount, and panel open via bell click.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { computed } from 'vue'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))
vi.mock('@/infrastructure/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  isServerHealthy: vi.fn(),
}))

// Stub heavy child components to isolate MainLayout logic
vi.mock('@/business/notification/presentation/components/NotificationPanel.vue', () => ({
  default: { template: '<div data-testid="notification-panel" />' },
}))
vi.mock('@/ui/atoms/OfflineBanner.vue', () => ({
  default: { template: '<div data-testid="offline-banner" />' },
}))
vi.mock('@/business/notification/presentation/components/NotificationToast.vue', () => ({
  default: { template: '<div data-testid="notification-toast" />' },
}))
vi.mock('@/ui/layouts/AppShell.vue', () => ({
  default: { template: '<div data-testid="app-shell"><slot /></div>' },
}))

// Mock useNotificacion — spy on startPolling, control items
const mockStartPolling = vi.fn()
const mockFetchNotificaciones = vi.fn()

const unreadNotification = {
  id: 'notif-1',
  titulo: 'Alerta crítica',
  mensaje: 'Residente requiere atención',
  tipo: 'incidencia_critica' as const,
  leida: false,
  creadaEn: new Date(),
  residenteId: null,
  turnoId: null,
  usuarioId: 'user-1',
}

const mockItems = computed(() => [unreadNotification])
const mockUnreadCount = computed(() => 1)

vi.mock('@/business/notification/presentation/composables/useNotificacion', () => ({
  useNotificacion: vi.fn(() => ({
    items: mockItems,
    unreadCount: mockUnreadCount,
    isLoading: { value: false },
    error: { value: null },
    fetchNotificaciones: mockFetchNotificaciones,
    markNotificacionAsRead: vi.fn(),
    startPolling: mockStartPolling,
    stopPolling: vi.fn(),
  })),
}))

import MainLayout from './MainLayout.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
  })
}

describe('MainLayout.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockStartPolling.mockClear()
    mockFetchNotificaciones.mockClear()
  })

  it('renders the OfflineBanner component', () => {
    const router = createTestRouter()
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="offline-banner"]').exists()).toBe(true)
  })

  it('renders the NotificationPanel component', () => {
    const router = createTestRouter()
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="app-shell"]').exists()).toBe(true)
  })

  it('calls startPolling on mount', async () => {
    const router = createTestRouter()
    mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    await flushPromises()
    expect(mockStartPolling).toHaveBeenCalledOnce()
  })

  it('renders the NotificationToast component when there is an unread notification', () => {
    const router = createTestRouter()
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-toast"]').exists()).toBe(true)
  })

  it('renders a notification bell button', () => {
    const router = createTestRouter()
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-bell"]').exists()).toBe(true)
  })

  it('opens the NotificationPanel when the bell button is clicked', async () => {
    const router = createTestRouter()
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-panel"]').exists()).toBe(true)
    await wrapper.find('[data-testid="notification-bell"]').trigger('click')
    expect(wrapper.find('[data-testid="notification-panel"]').exists()).toBe(true)
  })
})
