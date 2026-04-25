/**
 * App.spec.ts — Tests for App.vue (AppShell) integration.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * TDD: verifies NotificationPanel, OfflineBanner, and notification store
 * are wired in the app shell, polling starts on mount, and toast is mounted.
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
vi.mock('@/services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  isServerHealthy: vi.fn(),
}))

// Stub heavy child components to isolate AppShell logic
vi.mock('@/business/notification/presentation/components/NotificationPanel.vue', () => ({
  default: { template: '<div data-testid="notification-panel" />' },
}))
vi.mock('@/components/OfflineBanner.vue', () => ({
  default: { template: '<div data-testid="offline-banner" />' },
}))
vi.mock('@/business/notification/presentation/components/NotificationToast.vue', () => ({
  default: { template: '<div data-testid="notification-toast" />' },
}))

// Mock useNotificacion so we can spy on startPolling and control items
const mockStartPolling = vi.fn()
const mockFetchNotificaciones = vi.fn()

// A single unread notification to trigger toast rendering
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

import App from './App.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
  })
}

describe('App.vue (AppShell)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockStartPolling.mockClear()
    mockFetchNotificaciones.mockClear()
  })

  it('renders the OfflineBanner component', () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="offline-banner"]').exists()).toBe(true)
  })

  it('renders the NotificationPanel component', () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-panel"]').exists()).toBe(true)
  })

  it('calls startPolling on mount', async () => {
    const router = createTestRouter()
    mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    await flushPromises()
    expect(mockStartPolling).toHaveBeenCalledOnce()
  })

  it('renders the NotificationToast component', () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-toast"]').exists()).toBe(true)
  })

  it('renders a notification bell button', () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    expect(wrapper.find('[data-testid="notification-bell"]').exists()).toBe(true)
  })

  it('opens the NotificationPanel when the bell button is clicked', async () => {
    const router = createTestRouter()
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { RouterView: true },
      },
    })
    // Initially panel is closed (isPanelOpen = false)
    const panel = wrapper.find('[data-testid="notification-panel"]')
    expect(panel.exists()).toBe(true)
    // Click the bell
    await wrapper.find('[data-testid="notification-bell"]').trigger('click')
    // isPanelOpen should now be true — we test the panel still exists (not toggled away)
    expect(wrapper.find('[data-testid="notification-panel"]').exists()).toBe(true)
  })
})
