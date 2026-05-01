/**
 * ResidenteView.spec.ts — Component tests for ResidenteView (US-05).
 *
 * US-05: Consulta de ficha de residente
 * Tools: Vitest 4 + @vue/test-utils 2
 *
 * Strategy:
 *  - useResidente composable is fully mocked — reactive refs controlled per-test.
 *  - vue-router (useRoute, useRouter) is stubbed via global plugins.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { ResidenteDTO } from '@/business/residents/domain/entities/residente.types'

// ── Mock firebase/auth (transitive dep) ───────────────────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

// ── Shared mock state — reset per test ────────────────────────────────────────
let mockResidente = ref<ResidenteDTO | null>(null)
let mockLoading = ref(false)
let mockError = ref<string | null>(null)
let mockFetchResidente = vi.fn()

vi.mock('@/business/residents/presentation/composables/useResidente', () => ({
  useResidente: () => ({
    residente: mockResidente,
    loading: mockLoading,
    error: mockError,
    fetchResidente: mockFetchResidente,
  }),
}))

import ResidenteView from './ResidenteView.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeResidente(overrides: Partial<ResidenteDTO> = {}): ResidenteDTO {
  return {
    id: 'res-1',
    nombre: 'María',
    apellidos: 'González López',
    fechaNacimiento: '1940-05-12',
    habitacion: '101',
    foto: null,
    diagnosticos: 'Diabetes tipo 2',
    alergias: 'Penicilina',
    medicacion: 'Metformina 500mg',
    preferencias: 'Prefiere comida sin sal',
    archivado: false,
    creadoEn: '2026-01-01T00:00:00Z',
    actualizadoEn: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

function resetMocks() {
  mockResidente = ref<ResidenteDTO | null>(null)
  mockLoading = ref(false)
  mockError = ref<string | null>(null)
  mockFetchResidente = vi.fn().mockResolvedValue(undefined)
}

/** Creates a router with a route param id='res-1' */
function makeRouter(id = 'res-1') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/residentes/:id', name: 'residente', component: ResidenteView },
      // Stub route referenced by RouterLink inside ResidenteView
      {
        path: '/residentes/:id/incidencias',
        name: 'residente-incidencias',
        component: { template: '<div />' },
      },
    ],
  })
  // Navigate to the route before mounting so params are available
  router.push(`/residentes/${id}`)
  return router
}

async function mountView(id = 'res-1') {
  const router = makeRouter(id)
  await router.isReady()

  return mount(ResidenteView, {
    global: {
      plugins: [router],
    },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ResidenteView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMocks()
  })

  // ── onMounted ───────────────────────────────────────────────────────────────

  it('calls fetchResidente on mount with the route param id', async () => {
    await mountView('res-1')
    await flushPromises()

    expect(mockFetchResidente).toHaveBeenCalledOnce()
    expect(mockFetchResidente).toHaveBeenCalledWith('res-1')
  })

  // ── Loading state ───────────────────────────────────────────────────────────

  it('renders loading skeleton when loading is true', async () => {
    mockLoading.value = true

    const wrapper = await mountView()
    await flushPromises()

    const skeleton = wrapper.find('[aria-busy="true"]')
    expect(skeleton.exists()).toBe(true)
  })

  it('does not render resident content while loading', async () => {
    mockLoading.value = true

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__content').exists()).toBe(false)
  })

  // ── Error state ─────────────────────────────────────────────────────────────

  it('renders error message with role="alert" when error is set', async () => {
    mockError.value = 'No se encontró el residente'

    const wrapper = await mountView()
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('No se encontró el residente')
  })

  it('renders a retry button in the error state', async () => {
    mockError.value = 'Error de red'

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__retry-btn').exists()).toBe(true)
  })

  it('calls fetchResidente again when retry button is clicked', async () => {
    mockError.value = 'Error de red'

    const wrapper = await mountView('res-1')
    await flushPromises()

    await wrapper.find('.residente-view__retry-btn').trigger('click')

    // Called once on mount + once on retry = 2
    expect(mockFetchResidente).toHaveBeenCalledTimes(2)
  })

  it('does not render resident content when error is set', async () => {
    mockError.value = 'Error de red'

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__content').exists()).toBe(false)
  })

  // ── Data state ──────────────────────────────────────────────────────────────

  it('renders the resident name and surname when data loads', async () => {
    mockResidente.value = makeResidente()

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__name').text()).toContain('María')
    expect(wrapper.find('.residente-view__name').text()).toContain('González López')
  })

  it('renders room number', async () => {
    mockResidente.value = makeResidente({ habitacion: '202' })

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('202')
  })

  it('renders diagnósticos field', async () => {
    mockResidente.value = makeResidente({ diagnosticos: 'Alzheimer moderado' })

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Alzheimer moderado')
  })

  it('renders alergias field', async () => {
    mockResidente.value = makeResidente({ alergias: 'Aspirina' })

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Aspirina')
  })

  it('renders medicación field', async () => {
    mockResidente.value = makeResidente({ medicacion: 'Donepezilo 10mg' })

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Donepezilo 10mg')
  })

  it('renders "Activo" badge when archivado is false', async () => {
    mockResidente.value = makeResidente({ archivado: false })

    const wrapper = await mountView()
    await flushPromises()

    const badge = wrapper.find('.residente-view__badge--activo')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Activo')
  })

  it('renders "Archivado" badge when archivado is true', async () => {
    mockResidente.value = makeResidente({ archivado: true })

    const wrapper = await mountView()
    await flushPromises()

    const badge = wrapper.find('.residente-view__badge--archivado')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Archivado')
  })

  it('renders initials placeholder when foto is null', async () => {
    mockResidente.value = makeResidente({ foto: null })

    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__avatar-placeholder').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders photo <img> when foto is provided', async () => {
    mockResidente.value = makeResidente({ foto: 'https://example.com/foto.jpg' })

    const wrapper = await mountView()
    await flushPromises()

    const img = wrapper.find('.residente-view__avatar')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/foto.jpg')
  })

  // ── Back button ─────────────────────────────────────────────────────────────

  it('renders a back button', async () => {
    const wrapper = await mountView()
    await flushPromises()

    expect(wrapper.find('.residente-view__back-btn').exists()).toBe(true)
  })

  it('calls router.back() when back button is clicked', async () => {
    const router = makeRouter()
    await router.isReady()
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => undefined)

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.find('.residente-view__back-btn').trigger('click')

    expect(backSpy).toHaveBeenCalledOnce()
  })
})
