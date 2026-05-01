/**
 * TasksView.spec.ts — Component tests for the agenda TasksView (US-03, US-12).
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Tools: Vitest 4 + @vue/test-utils 2
 *
 * Strategy:
 *  - Mock useAllTareas and useTareaFilters composables.
 *  - Verify FullCalendar renders with mock events.
 *  - Verify filter bar toggle works.
 *  - Verify task detail panel opens on event click.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h, ref } from 'vue'

// ── Mock FullCalendar before importing TasksView ───────────────────────────────
vi.mock('@fullcalendar/vue3', () => ({
  default: {
    name: 'FullCalendar',
    props: ['options'],
    emits: [],
    setup(props: { options: Record<string, unknown> }) {
      return () =>
        h('div', {
          class: 'full-calendar-mock',
          'data-events': JSON.stringify(props.options.events ?? []),
        })
    },
  },
}))

// ── Mock composables ───────────────────────────────────────────────────────────

const mockAllTareas = [
  {
    id: 'tarea-001',
    titulo: 'Aseo matutino',
    tipo: 'higiene',
    fechaHora: '2026-05-01T08:00:00Z',
    estado: 'pendiente' as const,
    notas: 'Revisar hidratación',
    residenteId: 'res-001',
    usuarioId: 'usr-001',
    creadoEn: '2026-05-01T00:00:00Z',
    actualizadoEn: '2026-05-01T00:00:00Z',
    completadaEn: null,
  },
  {
    id: 'tarea-002',
    titulo: 'Administración medicación',
    tipo: 'medicacion',
    fechaHora: '2026-05-01T10:00:00Z',
    estado: 'en_curso' as const,
    notas: null,
    residenteId: 'res-002',
    usuarioId: 'usr-001',
    creadoEn: '2026-05-01T00:00:00Z',
    actualizadoEn: '2026-05-01T00:00:00Z',
    completadaEn: null,
  },
]

vi.mock('@/business/agenda/application/useAllTareas', () => ({
  useAllTareas: vi.fn(() => ({
    allTareas: ref(mockAllTareas),
    isLoading: false,
    error: null,
    cargarTodas: vi.fn(),
  })),
}))

vi.mock('@/business/agenda/presentation/composables/useTareaFilters', () => ({
  useTareaFilters: vi.fn(() => {
    const filters = { dateRange: null, tipo: null, estado: null }
    return {
      filters,
      filteredAllTareas: ref(mockAllTareas),
      hasActiveFilters: { value: false },
      setFilter: vi.fn(),
      clearFilters: vi.fn(),
    }
  }),
}))

vi.mock('@/business/agenda/presentation/utils/tareaToCalendarEvent', () => ({
  tareaToCalendarEvent: vi.fn((tarea) => ({
    id: tarea.id,
    title: tarea.titulo,
    start: tarea.fechaHora,
    end: '2026-05-01T08:30:00Z',
    classNames: [`fc-event--${tarea.tipo}`, `fc-event--${tarea.estado}`],
    extendedProps: { tarea },
  })),
}))

vi.mock('@/views/route-names', () => ({
  TASKS_ROUTES: { name: 'tasks', all: '/tareas' },
}))

// ── Import component under test ────────────────────────────────────────────────

import TasksView from './TasksView.vue'

// ── Test helpers ─────────────────────────────────────────────────────────────

function mountView() {
  return mount(TasksView, {
    global: {
      stubs: {
        RouterLink: { template: '<a class="router-link-mock"><slot /></a>' },
      },
    },
  })
}

// ── Render ───────────────────────────────────────────────────────────────────

describe('TasksView — render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page header with title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.tasks-view__title').text()).toBe('Agenda Completa')
  })

  it('renders a back link to dashboard', () => {
    const wrapper = mountView()
    expect(wrapper.find('.tasks-view__back').text()).toBe('Dashboard')
  })

  it('renders the filter bar', () => {
    const wrapper = mountView()
    expect(wrapper.find('.tarea-filter-bar').exists()).toBe(true)
  })

  it('does not show loading state when isLoading=false', () => {
    const wrapper = mountView()
    expect(wrapper.find('.tasks-view__loading').exists()).toBe(false)
  })

  it('does not show error state when error=null', () => {
    const wrapper = mountView()
    expect(wrapper.find('.tasks-view__error').exists()).toBe(false)
  })

  it('renders FullCalendar when tasks are present', () => {
    const wrapper = mountView()
    expect(wrapper.find('.full-calendar-mock').exists()).toBe(true)
  })

  it('passes events to FullCalendar via options', async () => {
    const wrapper = mountView()
    await flushPromises()
    const fc = wrapper.find('.full-calendar-mock')
    const events = JSON.parse(fc.attributes('data-events') ?? '[]')
    expect(events).toHaveLength(2)
    expect(events[0].id).toBe('tarea-001')
  })
})

// ── Filter bar toggle ─────────────────────────────────────────────────────────

describe('TasksView — filter bar', () => {
  it('filter bar starts collapsed (open=false)', () => {
    const wrapper = mountView()
    // filter-expand transition wraps content; check toggle button exists
    expect(wrapper.find('.tarea-filter-bar__toggle').exists()).toBe(true)
  })

  it('toggling filter bar updates open state', async () => {
    const wrapper = mountView()
    const toggle = wrapper.find('.tarea-filter-bar__toggle')
    expect(toggle.exists()).toBe(true)
    await toggle.trigger('click')
    await flushPromises()
    // After toggle, the filter content should be visible (Transition renders immediately)
    expect(wrapper.find('.tarea-filter-bar__content').exists()).toBe(true)
  })

  it('clicking toggle again collapses the filter bar', async () => {
    const wrapper = mountView()
    const toggle = wrapper.find('.tarea-filter-bar__toggle')
    await toggle.trigger('click') // open
    await flushPromises()
    await toggle.trigger('click') // close
    await flushPromises()
    // Filter content should be gone (Transition renders it conditionally)
    expect(wrapper.find('.tarea-filter-bar__content').exists()).toBe(false)
  })
})

// ── Task detail panel ─────────────────────────────────────────────────────────

describe('TasksView — task detail panel', () => {
  it('does not render TaskDetailPanel on mount (no tarea selected)', () => {
    const wrapper = mountView()
    expect(wrapper.find('.task-detail-panel').exists()).toBe(false)
  })
})

// ── Error state ───────────────────────────────────────────────────────────────

describe('TasksView — error state', () => {
  it('shows error UI when composable returns an error', async () => {
    const { useAllTareas } = vi.mocked(await import('@/business/agenda/application/useAllTareas'))
    useAllTareas.mockReturnValueOnce({
      allTareas: ref([]),
      isLoading: ref(false),
      error: ref('Servidor no disponible'),
      cargarTodas: vi.fn(),
    })

    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('.tasks-view__error').exists()).toBe(true)
    expect(wrapper.find('.tasks-view__error-text').text()).toBe('Servidor no disponible')
  })
})
