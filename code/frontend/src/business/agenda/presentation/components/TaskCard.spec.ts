/**
 * TaskCard.spec.ts — Component tests for the agenda TaskCard (US-04).
 *
 * US-04: Actualizar estado de una tarea
 * Tools: Vitest 4 + @vue/test-utils 2
 *
 * Strategy:
 *  - actualizarEstado prop is a vi.fn() — no real API calls.
 *  - isUpdating state is exercised by resolving/rejecting the mock.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { TareaDTO, EstadoTarea } from '@/services/tareas.api'

// ── Mock firebase/auth (transitive dep via apiClient) ─────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

import TaskCard from './TaskCard.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTarea(overrides: Partial<TareaDTO> = {}): TareaDTO {
  return {
    id: 'tarea-001',
    titulo: 'Aseo matutino',
    tipo: 'higiene',
    fechaHora: '2026-04-18T08:00:00.000Z',
    estado: 'pendiente',
    notas: 'Revisar hidratación de la piel',
    residenteId: 'res-001',
    usuarioId: 'usr-001',
    creadoEn: '2026-04-17T10:00:00Z',
    actualizadoEn: '2026-04-17T10:00:00Z',
    completadaEn: null,
    ...overrides,
  }
}

function makeActualizarEstado(result: { success: boolean; errorMsg?: string } = { success: true }) {
  return vi.fn().mockResolvedValue(result)
}

function mountCard(
  tareaOverrides: Partial<TareaDTO> = {},
  actualizarEstado = makeActualizarEstado()
) {
  return mount(TaskCard, {
    props: {
      tarea: makeTarea(tareaOverrides),
      actualizarEstado,
    },
  })
}

// ── Render — status badges ─────────────────────────────────────────────────────

describe('TaskCard — status badge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Pendiente" badge for estado=pendiente', () => {
    const wrapper = mountCard({ estado: 'pendiente' })
    const badge = wrapper.find('.task-card__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('Pendiente')
  })

  it('shows "En curso" badge for estado=en_curso', () => {
    const wrapper = mountCard({ estado: 'en_curso' })
    const badge = wrapper.find('.task-card__badge')
    expect(badge.text()).toContain('En curso')
  })

  it('shows "Completada" badge for estado=completada', () => {
    const wrapper = mountCard({ estado: 'completada' })
    const badge = wrapper.find('.task-card__badge')
    expect(badge.text()).toContain('Completada')
  })

  it('shows "Con incidencia" badge for estado=con_incidencia', () => {
    const wrapper = mountCard({ estado: 'con_incidencia' })
    const badge = wrapper.find('.task-card__badge')
    expect(badge.text()).toContain('Con incidencia')
  })

  it('applies badge modifier class for estado=pendiente', () => {
    const wrapper = mountCard({ estado: 'pendiente' })
    expect(wrapper.find('.task-card__badge--pendiente').exists()).toBe(true)
  })

  it('applies badge modifier class for estado=en_curso', () => {
    const wrapper = mountCard({ estado: 'en_curso' })
    expect(wrapper.find('.task-card__badge--en-curso').exists()).toBe(true)
  })

  it('applies badge modifier class for estado=completada', () => {
    const wrapper = mountCard({ estado: 'completada' })
    expect(wrapper.find('.task-card__badge--completada').exists()).toBe(true)
  })

  it('applies badge modifier class for estado=con_incidencia', () => {
    const wrapper = mountCard({ estado: 'con_incidencia' })
    expect(wrapper.find('.task-card__badge--con-incidencia').exists()).toBe(true)
  })
})

// ── Render — card structure ────────────────────────────────────────────────────

describe('TaskCard — render', () => {
  it('renders the task title', () => {
    const wrapper = mountCard()
    expect(wrapper.find('.task-card__titulo').text()).toBe('Aseo matutino')
  })

  it('renders notes when present', () => {
    const wrapper = mountCard({ notas: 'Paciente colaborador' })
    expect(wrapper.find('.task-card__notas').text()).toBe('Paciente colaborador')
  })

  it('does not render notes element when notas is null', () => {
    const wrapper = mountCard({ notas: null })
    expect(wrapper.find('.task-card__notas').exists()).toBe(false)
  })

  it('renders a formatted time from fechaHora', () => {
    const wrapper = mountCard({ fechaHora: '2026-04-18T08:30:00.000Z' })
    expect(wrapper.find('.task-card__hora').text()).toMatch(/\d{1,2}:\d{2}/)
  })

  it('root article has aria-busy="false" when not updating', () => {
    const wrapper = mountCard()
    expect(wrapper.find('article').attributes('aria-busy')).toBe('false')
  })
})

// ── Interactions — status buttons emit events ──────────────────────────────────

describe('TaskCard — status action buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows action buttons for all states except the current state', () => {
    // estado=pendiente → 3 action buttons (en_curso, completada, con_incidencia)
    const wrapper = mountCard({ estado: 'pendiente' })
    const btns = wrapper.findAll('.task-card__action-btn')
    expect(btns).toHaveLength(3)
  })

  it('clicking a status button calls actualizarEstado with correct args', async () => {
    const mockFn = makeActualizarEstado()
    const wrapper = mountCard({ estado: 'pendiente', id: 'tarea-001' }, mockFn)

    // First action button for pendiente task is 'en_curso'
    const enCursoBtn = wrapper.find('.task-card__action-btn--en-curso')
    expect(enCursoBtn.exists()).toBe(true)

    await enCursoBtn.trigger('click')
    await flushPromises()

    expect(mockFn).toHaveBeenCalledOnce()
    expect(mockFn).toHaveBeenCalledWith('tarea-001', 'en_curso')
  })

  it('emits "estado-actualizado" with id and estado after successful status change', async () => {
    const wrapper = mountCard({ estado: 'pendiente', id: 'tarea-001' })

    await wrapper.find('.task-card__action-btn--en-curso').trigger('click')
    await flushPromises()

    const emitted = wrapper.emitted('estado-actualizado') as [string, EstadoTarea][] | undefined
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual(['tarea-001', 'en_curso'])
  })

  it('emits "error" event when actualizarEstado returns success=false', async () => {
    const mockFn = makeActualizarEstado({ success: false, errorMsg: 'Error de red' })
    const wrapper = mountCard({ estado: 'pendiente' }, mockFn)

    await wrapper.find('.task-card__action-btn--en-curso').trigger('click')
    await flushPromises()

    const errors = wrapper.emitted('error') as [string][] | undefined
    expect(errors).toHaveLength(1)
    expect(errors![0]).toEqual(['Error de red'])
  })
})

// ── isUpdating state ───────────────────────────────────────────────────────────

describe('TaskCard — isUpdating state', () => {
  it('shows spinner while update is in progress', async () => {
    let resolveUpdate!: (v: { success: boolean }) => void
    const pendingFn = vi.fn(
      () =>
        new Promise<{ success: boolean }>((res) => {
          resolveUpdate = res
        })
    )

    const wrapper = mountCard({ estado: 'pendiente' }, pendingFn)

    // Trigger click — do NOT await flushPromises yet
    wrapper.find('.task-card__action-btn--en-curso').trigger('click')
    await wrapper.vm.$nextTick()

    // Spinner should be visible, action buttons hidden
    expect(wrapper.find('.task-card__spinner').exists()).toBe(true)
    expect(wrapper.find('.task-card__action-btn').exists()).toBe(false)

    // Resolve and confirm spinner disappears
    resolveUpdate({ success: true })
    await flushPromises()

    expect(wrapper.find('.task-card__spinner').exists()).toBe(false)
    expect(wrapper.find('.task-card__action-btn').exists()).toBe(true)
  })

  it('hides spinner and restores buttons after update resolves', async () => {
    const mockFn = makeActualizarEstado()
    const wrapper = mountCard({ estado: 'pendiente' }, mockFn)

    await wrapper.find('.task-card__action-btn--en-curso').trigger('click')
    await flushPromises()

    expect(wrapper.find('.task-card__spinner').exists()).toBe(false)
    expect(wrapper.findAll('.task-card__action-btn').length).toBeGreaterThan(0)
  })

  it('restores buttons (rollback) even when actualizarEstado returns failure', async () => {
    const failingFn = makeActualizarEstado({ success: false, errorMsg: 'Error de red' })
    const wrapper = mountCard({ estado: 'pendiente' }, failingFn)

    await wrapper.find('.task-card__action-btn--en-curso').trigger('click')
    await flushPromises()

    // Buttons must be restored after error
    expect(wrapper.find('.task-card__spinner').exists()).toBe(false)
    expect(wrapper.findAll('.task-card__action-btn').length).toBeGreaterThan(0)
  })
})
