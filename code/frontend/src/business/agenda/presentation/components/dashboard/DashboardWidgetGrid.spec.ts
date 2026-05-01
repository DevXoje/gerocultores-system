/**
 * DashboardWidgetGrid.spec.ts — Integration tests for the dashboard widget grid.
 *
 * Phase 5 task 5.5
 * Verifies each widget renders its count/data when composables are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ref, computed } from 'vue'

// ── Mock composables ───────────────────────────────────────────────────────────
vi.mock('@/business/agenda/application/useAgendaHoy', () => ({
  useAgendaHoy: vi.fn(() => ({
    tareas: [
      {
        id: 't-1',
        titulo: 'Aseo matutino',
        estado: 'pendiente',
        fechaHora: '2026-05-01T08:00:00Z',
      },
      {
        id: 't-2',
        titulo: 'Entrega de medicación',
        estado: 'pendiente',
        fechaHora: '2026-05-01T09:00:00Z',
      },
    ],
    isLoading: false,
    cargarTareas: vi.fn(),
  })),
}))

vi.mock('@/business/notification/presentation/composables/useNotificacion', () => ({
  useNotificacion: vi.fn(() => ({
    unreadCount: 3,
    isLoading: false,
    fetchNotificaciones: vi.fn(),
  })),
}))

vi.mock('@/business/residents/application/useResidentes', () => ({
  useResidentes: vi.fn(() => ({
    residentes: ref([
      { id: 'r-1', nombre: 'Rosa Martínez', creadoEn: new Date('2026-05-01') },
      { id: 'r-2', nombre: 'Antonio López', creadoEn: new Date('2026-04-30') },
      { id: 'r-3', nombre: 'Carmen García', creadoEn: new Date('2026-04-29') },
    ]),
    isLoading: false,
    fetchResidentes: vi.fn(),
  })),
}))

// ── Test components ────────────────────────────────────────────────────────────
import DashboardWidgetGrid from './DashboardWidgetGrid.vue'
import TasksSummaryWidget from './TasksSummaryWidget.vue'
import AlertsPreviewWidget from './AlertsPreviewWidget.vue'
import RecentResidentsWidget from './RecentResidentsWidget.vue'

// ── Router setup ─────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/tareas', name: 'tareas', component: { template: '<div />' } },
    { path: '/residentes', name: 'residents-list', component: { template: '<div />' } },
  ],
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardWidgetGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the widget grid section', () => {
    const wrapper = mount(DashboardWidgetGrid, {
      global: { plugins: [router] },
    })
    expect(wrapper.find('.widget-grid').exists()).toBe(true)
  })

  it('renders all three widget children', () => {
    const wrapper = mount(
      {
        components: {
          DashboardWidgetGrid,
          TasksSummaryWidget,
          AlertsPreviewWidget,
          RecentResidentsWidget,
        },
        template: `
          <DashboardWidgetGrid>
            <TasksSummaryWidget />
            <AlertsPreviewWidget />
            <RecentResidentsWidget />
          </DashboardWidgetGrid>
        `,
      },
      {
        global: { plugins: [router] },
      }
    )

    expect(wrapper.find('.tasks-widget').exists()).toBe(true)
    expect(wrapper.find('.alerts-widget').exists()).toBe(true)
    expect(wrapper.find('.residents-widget').exists()).toBe(true)
  })

  it('TasksSummaryWidget shows task count', async () => {
    const wrapper = mount(TasksSummaryWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('.tasks-widget__count-number').text()).toBe('2')
  })

  it('TasksSummaryWidget shows "No hay tareas" when no tasks', async () => {
    const { useAgendaHoy } = vi.mocked(await import('@/business/agenda/application/useAgendaHoy'))
    useAgendaHoy.mockReturnValueOnce({
      tareas: ref([]),
      isLoading: ref(false),
      cargarTareas: vi.fn(),
      isServerReachable: ref(true),
      error: ref(null),
      retry: vi.fn(),
      actualizarEstado: vi.fn(),
      toggleComplete: vi.fn(),
    })

    const wrapper = mount(TasksSummaryWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('.tasks-widget__status--empty').text()).toBe('No hay tareas para hoy')
  })

  it('AlertsPreviewWidget shows critical alert count', async () => {
    const wrapper = mount(AlertsPreviewWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('.alerts-widget__count-number').text()).toBe('3')
  })

  it('AlertsPreviewWidget shows "Sin alertas" when count is 0', async () => {
    const { useNotificacion } = vi.mocked(
      await import('@/business/notification/presentation/composables/useNotificacion')
    )
    useNotificacion.mockReturnValueOnce({
      unreadCount: computed(() => 0),
      isLoading: computed(() => false),
      fetchNotificaciones: vi.fn(),
    })

    const wrapper = mount(AlertsPreviewWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('.alerts-widget__status--empty').text()).toBe('Sin alertas')
  })

  it('RecentResidentsWidget shows 3 resident names', async () => {
    const wrapper = mount(RecentResidentsWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    const items = wrapper.findAll('.residents-widget__resident-btn')
    expect(items).toHaveLength(3)
    expect(items[0].text()).toBe('Rosa Martínez')
  })

  it('RecentResidentsWidget shows "Sin residentes" when empty', async () => {
    const { useResidentes } = vi.mocked(
      await import('@/business/residents/application/useResidentes')
    )
    useResidentes.mockReturnValueOnce({
      residentes: ref([]),
      isLoading: false,
      fetchResidentes: vi.fn(),
    } as unknown as ReturnType<typeof useResidentes>)

    const wrapper = mount(RecentResidentsWidget, {
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('.residents-widget__status--empty').text()).toBe(
      'Sin residentes registrados'
    )
  })
})
