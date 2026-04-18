/**
 * TaskCard.spec.ts — Unit tests for TaskCard component.
 *
 * US-03: Consulta de agenda diaria
 * Tools: Vitest 4 + @vue/test-utils 2
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from './TaskCard.vue'
import type { TareaResponse } from '@/business/agenda/domain/entities/tarea.types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeTarea(overrides: Partial<TareaResponse> = {}): TareaResponse {
  return {
    id: 'tarea-001',
    titulo: 'Aseo matutino',
    tipo: 'higiene',
    fechaHora: '2026-04-18T08:00:00.000Z',
    estado: 'pendiente',
    notas: 'Revisar hidratación de la piel',
    residenteId: 'residente-001',
    usuarioId: 'usuario-001',
    creadoEn: '2026-04-17T10:00:00.000Z',
    actualizadoEn: '2026-04-17T10:00:00.000Z',
    completadaEn: null,
    ...overrides,
  }
}

// ─── Render tests ─────────────────────────────────────────────────────────────

describe('TaskCard — render', () => {
  it('renders the task title', () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-title-tarea-001"]').text()).toBe('Aseo matutino')
  })

  it('renders a formatted time from fechaHora', () => {
    const tarea = makeTarea({ fechaHora: '2026-04-18T08:30:00.000Z' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    const timeEl = wrapper.get('[data-testid="task-card-time-tarea-001"]')
    // The formatted time should contain digits and colon
    expect(timeEl.text()).toMatch(/\d{1,2}:\d{2}/)
  })

  it('renders the tipo badge with the correct label', () => {
    const tarea = makeTarea({ tipo: 'medicacion' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-tipo-tarea-001"]').text()).toBe('Medicación')
  })

  it('renders notes when present', () => {
    const tarea = makeTarea({ notas: 'Paciente colaborador' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-notes-tarea-001"]').text()).toBe('Paciente colaborador')
  })

  it('does not render notes element when notas is null', () => {
    const tarea = makeTarea({ notas: null })
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.find('[data-testid="task-card-notes-tarea-001"]').exists()).toBe(false)
  })

  it('renders assignedToDisplayName when provided', () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, {
      props: { tarea, assignedToDisplayName: 'María García' },
    })

    expect(wrapper.get('[data-testid="task-card-assignee-tarea-001"]').text()).toContain('María García')
  })

  it('does not render assignee when prop is absent', () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.find('[data-testid="task-card-assignee-tarea-001"]').exists()).toBe(false)
  })

  it('applies line-through class to title when estado is completada', () => {
    const tarea = makeTarea({ estado: 'completada' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-title-tarea-001"]').classes()).toContain('task-card__title--done')
  })

  it('does not apply line-through class when estado is pendiente', () => {
    const tarea = makeTarea({ estado: 'pendiente' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-title-tarea-001"]').classes()).not.toContain('task-card__title--done')
  })

  it('has role="article" on the root element', () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-tarea-001"]').attributes('role')).toBe('article')
  })

  it('root element is keyboard-focusable (tabindex=0)', () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    expect(wrapper.get('[data-testid="task-card-tarea-001"]').attributes('tabindex')).toBe('0')
  })
})

// ─── Interaction tests ────────────────────────────────────────────────────────

describe('TaskCard — interactions', () => {
  it('emits toggleComplete with tarea.id when toggle button is clicked', async () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    await wrapper.get('[data-testid="task-card-toggle-tarea-001"]').trigger('click')

    expect(wrapper.emitted('toggleComplete')).toHaveLength(1)
    expect(wrapper.emitted('toggleComplete')![0]).toEqual(['tarea-001'])
  })

  it('emits openDetail with tarea.id when detail button is clicked', async () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    await wrapper.get('[data-testid="task-card-detail-tarea-001"]').trigger('click')

    expect(wrapper.emitted('openDetail')).toHaveLength(1)
    expect(wrapper.emitted('openDetail')![0]).toEqual(['tarea-001'])
  })

  it('emits openDetail when Enter key is pressed on the card', async () => {
    const tarea = makeTarea()
    const wrapper = mount(TaskCard, { props: { tarea } })

    await wrapper.get('[data-testid="task-card-tarea-001"]').trigger('keyup.enter')

    expect(wrapper.emitted('openDetail')).toHaveLength(1)
    expect(wrapper.emitted('openDetail')![0]).toEqual(['tarea-001'])
  })

  it('toggle button shows "undo" icon when task is completada', () => {
    const tarea = makeTarea({ estado: 'completada' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    const toggleBtn = wrapper.get('[data-testid="task-card-toggle-tarea-001"]')
    expect(toggleBtn.text()).toContain('undo')
  })

  it('toggle button shows "check_circle" icon when task is pendiente', () => {
    const tarea = makeTarea({ estado: 'pendiente' })
    const wrapper = mount(TaskCard, { props: { tarea } })

    const toggleBtn = wrapper.get('[data-testid="task-card-toggle-tarea-001"]')
    expect(toggleBtn.text()).toContain('check_circle')
  })
})
