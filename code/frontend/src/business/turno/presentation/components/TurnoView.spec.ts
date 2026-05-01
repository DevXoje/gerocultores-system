/**
 * TurnoView.spec.ts — Component tests for TurnoView.vue
 *
 * US-11: Resumen de fin de turno
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
vi.mock('@/business/turno/infrastructure/api/turnoApi', () => ({
  turnoApi: {
    getTurnoActivo: vi.fn().mockResolvedValue(null),
    iniciarTurno: vi.fn().mockResolvedValue({
      id: 'new-turno',
      usuarioId: 'u-1',
      tipoTurno: 'manyana',
      fecha: new Date('2026-04-25'),
      inicio: new Date('2026-04-25T07:00:00Z'),
      fin: null,
      resumenTraspaso: null,
      creadoEn: new Date('2026-04-25T07:00:00Z'),
    }),
    finalizarTurno: vi.fn(),
  },
}))

import TurnoView from './TurnoView.vue'
import { useTurnoStore } from '@/business/turno/presentation/stores/turno.store'

function makeTurno(overrides = {}) {
  return {
    id: 'turno-1',
    usuarioId: 'u-1',
    tipoTurno: 'manyana' as const,
    fecha: new Date('2026-04-25'),
    inicio: new Date('2026-04-25T07:00:00Z'),
    fin: null as Date | null,
    resumenTraspaso: null as string | null,
    creadoEn: new Date('2026-04-25T07:00:00Z'),
    ...overrides,
  }
}

describe('TurnoView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders the page title', () => {
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    expect(wrapper.find('.turno-view__title').text()).toBe('Mi Turno')
  })

  it('shows empty state when no active turno', async () => {
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    await flushPromises()
    expect(wrapper.find('.turno-view__empty-msg').text()).toBe('No tienes un turno activo.')
  })

  it('shows "Iniciar turno" button when no active turno', async () => {
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    await flushPromises()
    expect(wrapper.find('.turno-view__btn--primary').text()).toBe('Iniciar turno')
  })

  it('shows active turno card when store has a turno', async () => {
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    await flushPromises()

    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.turno-view__badge--active').text()).toBe('En curso')
  })

  it('shows "Finalizar turno" button when turno is active', async () => {
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    await flushPromises()

    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.turno-view__btn--danger').text()).toBe('Finalizar turno')
  })

  it('opens the resumen modal when "Finalizar turno" is clicked', async () => {
    const wrapper = mount(TurnoView, {
      global: { plugins: [pinia], stubs: { ResumenTurnoModal: true } },
    })
    await flushPromises()

    const store = useTurnoStore()
    store.setTurnoActivo(makeTurno())
    await wrapper.vm.$nextTick()

    // Verify the "Finalizar turno" button exists
    const btn = wrapper.find('.turno-view__btn--danger')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Finalizar turno')
  })

  it('shows error banner when error is set', async () => {
    // Arrange: make getTurnoActivo reject so the composable sets error
    const { turnoApi } = await import('../../infrastructure/api/turnoApi')
    vi.mocked(turnoApi.getTurnoActivo).mockRejectedValueOnce(new Error('Sin conexión'))

    // Act: mount the component — onMounted calls cargarTurnoActivo which will throw
    const wrapper = mount(TurnoView, { global: { plugins: [pinia] } })
    await flushPromises() // let the rejected promise propagate and update the component

    // Assert: the error banner element is rendered with the error message
    const banner = wrapper.find('.turno-view__error')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toBe('Sin conexión')
  })
})
