/**
 * IncidenceForm.spec.ts — Component tests for IncidenceForm (US-06).
 *
 * US-06: Registro de incidencia
 * Tools: Vitest 4 + @vue/test-utils 2
 *
 * Strategy:
 *  - useIncidencias composable is fully mocked — reactive state controlled per-test.
 *  - No real Firebase or HTTP calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, reactive } from 'vue'
import type { IncidenciaResponse } from '../../domain/entities/incidencia.types'

// ── Mock firebase/auth (transitive dep) ───────────────────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

// ── Shared mock state — reset per-test ────────────────────────────────────────
let mockSubmitIncidencia = vi.fn()
let mockResetForm = vi.fn()

const mockForm = reactive({
  tipo: '' as string,
  severidad: '' as string,
  residenteId: '' as string,
  descripcion: '' as string,
  tareaId: null as string | null,
})
const mockFieldErrors = reactive<Record<string, string | undefined>>({})
const mockSubmitting = ref(false)
const mockSubmitError = ref<string | null>(null)

vi.mock('../composables/useIncidencias', () => ({
  useIncidencias: () => ({
    form: mockForm,
    fieldErrors: mockFieldErrors,
    submitting: mockSubmitting,
    submitError: mockSubmitError,
    submitIncidencia: mockSubmitIncidencia,
    resetForm: mockResetForm,
  }),
}))

import IncidenceForm from './IncidenceForm.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

interface ResidenteOption {
  id: string
  nombre: string
  apellidos: string
}

const SAMPLE_RESIDENTS: ResidenteOption[] = [
  { id: 'res-1', nombre: 'María', apellidos: 'González' },
  { id: 'res-2', nombre: 'José', apellidos: 'Martínez' },
]

function makeIncidenciaResponse(overrides: Partial<IncidenciaResponse> = {}): IncidenciaResponse {
  return {
    id: 'inc-1',
    tipo: 'caida',
    severidad: 'moderada',
    descripcion: 'Paciente se cayó al ir al baño',
    residenteId: 'res-1',
    usuarioId: 'usr-1',
    tareaId: null,
    registradaEn: '2026-04-24T10:00:00Z',
    ...overrides,
  }
}

function resetMocks() {
  mockForm.tipo = ''
  mockForm.severidad = ''
  mockForm.residenteId = ''
  mockForm.descripcion = ''
  mockForm.tareaId = null

  Object.keys(mockFieldErrors).forEach((k) => delete mockFieldErrors[k])

  mockSubmitting.value = false
  mockSubmitError.value = null
  mockSubmitIncidencia = vi.fn().mockResolvedValue(null)
  mockResetForm = vi.fn()
}

function mountForm(residents: ResidenteOption[] = SAMPLE_RESIDENTS) {
  return mount(IncidenceForm, {
    props: { residents },
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IncidenceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMocks()
  })

  // ── Fields render ─────────────────────────────────────────────────────────

  describe('form renders all fields', () => {
    it('renders the resident selector with all options', () => {
      const wrapper = mountForm()

      const select = wrapper.find('#incidence-residente')
      expect(select.exists()).toBe(true)

      const options = wrapper.findAll('#incidence-residente option')
      // 1 placeholder + 2 residents
      expect(options).toHaveLength(3)
      expect(options[1].text()).toContain('María')
      expect(options[2].text()).toContain('José')
    })

    it('renders the tipo selector with all 6 type options', () => {
      const wrapper = mountForm()

      const options = wrapper.findAll('#incidence-tipo option')
      // 1 placeholder + 6 types
      expect(options).toHaveLength(7)
    })

    it('renders the three severity buttons', () => {
      const wrapper = mountForm()

      const severityBtns = wrapper.findAll('.incidence-form__severity-btn')
      expect(severityBtns).toHaveLength(3)

      const labels = severityBtns.map((b) => b.text())
      expect(labels).toContain('Crítica')
      expect(labels).toContain('Moderada')
      expect(labels).toContain('Leve')
    })

    it('renders the description textarea', () => {
      const wrapper = mountForm()
      expect(wrapper.find('#incidence-descripcion').exists()).toBe(true)
    })

    it('renders the submit button', () => {
      const wrapper = mountForm()
      expect(wrapper.find('.incidence-form__submit-btn').exists()).toBe(true)
    })

    it('renders the cancel button', () => {
      const wrapper = mountForm()
      expect(wrapper.find('.incidence-form__cancel-btn').exists()).toBe(true)
    })
  })

  // ── Submit button state ───────────────────────────────────────────────────

  describe('submit button disabled/enabled state', () => {
    it('submit button is disabled when form is empty (formIsValid=false)', () => {
      const wrapper = mountForm()
      const btn = wrapper.find<HTMLButtonElement>('.incidence-form__submit-btn')
      expect(btn.element.disabled).toBe(true)
    })

    it('submit button is enabled when all required fields are filled', async () => {
      // Pre-fill form reactive so the computed formIsValid resolves to true
      mockForm.tipo = 'caida'
      mockForm.severidad = 'moderada'
      mockForm.residenteId = 'res-1'
      mockForm.descripcion = 'Descripción de la incidencia'

      const wrapper = mountForm()
      await flushPromises()

      const btn = wrapper.find<HTMLButtonElement>('.incidence-form__submit-btn')
      expect(btn.element.disabled).toBe(false)
    })

    it('submit button is disabled while submitting', async () => {
      mockSubmitting.value = true
      mockForm.tipo = 'caida'
      mockForm.severidad = 'moderada'
      mockForm.residenteId = 'res-1'
      mockForm.descripcion = 'Descripción'

      const wrapper = mountForm()
      await flushPromises()

      const btn = wrapper.find<HTMLButtonElement>('.incidence-form__submit-btn')
      expect(btn.element.disabled).toBe(true)
    })

    it('cancel button is disabled while submitting', async () => {
      mockSubmitting.value = true

      const wrapper = mountForm()
      await flushPromises()

      const cancelBtn = wrapper.find<HTMLButtonElement>('.incidence-form__cancel-btn')
      expect(cancelBtn.element.disabled).toBe(true)
    })
  })

  // ── Field validation errors ───────────────────────────────────────────────

  describe('field validation errors display', () => {
    it('shows residenteId field error when fieldErrors.residenteId is set', async () => {
      mockFieldErrors.residenteId = 'El residente es obligatorio'

      const wrapper = mountForm()
      await flushPromises()

      expect(wrapper.find('#incidence-residente-err').exists()).toBe(true)
      expect(wrapper.find('#incidence-residente-err').text()).toBe('El residente es obligatorio')
    })

    it('shows tipo field error when fieldErrors.tipo is set', async () => {
      mockFieldErrors.tipo = 'El tipo es obligatorio'

      const wrapper = mountForm()
      await flushPromises()

      expect(wrapper.find('#incidence-tipo-err').exists()).toBe(true)
      expect(wrapper.find('#incidence-tipo-err').text()).toBe('El tipo es obligatorio')
    })

    it('shows descripcion field error when fieldErrors.descripcion is set', async () => {
      mockFieldErrors.descripcion = 'La descripción es obligatoria'

      const wrapper = mountForm()
      await flushPromises()

      expect(wrapper.find('#incidence-descripcion-err').exists()).toBe(true)
      expect(wrapper.find('#incidence-descripcion-err').text()).toBe(
        'La descripción es obligatoria'
      )
    })

    it('shows global submitError when set', async () => {
      mockSubmitError.value = 'Error al conectar con el servidor'

      const wrapper = mountForm()
      await flushPromises()

      const errorEl = wrapper.find('.incidence-form__error')
      expect(errorEl.exists()).toBe(true)
      expect(errorEl.text()).toContain('Error al conectar con el servidor')
    })

    it('does not show field errors when fieldErrors is empty', () => {
      const wrapper = mountForm()

      expect(wrapper.find('#incidence-residente-err').exists()).toBe(false)
      expect(wrapper.find('#incidence-tipo-err').exists()).toBe(false)
      expect(wrapper.find('#incidence-descripcion-err').exists()).toBe(false)
    })
  })

  // ── Submit flow ───────────────────────────────────────────────────────────

  describe('form submit', () => {
    it('calls submitIncidencia when form is submitted', async () => {
      mockSubmitIncidencia = vi.fn().mockResolvedValue(makeIncidenciaResponse())

      const wrapper = mountForm()
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(mockSubmitIncidencia).toHaveBeenCalledOnce()
    })

    it('emits "submitted" with the created incidencia on success', async () => {
      const created = makeIncidenciaResponse()
      mockSubmitIncidencia = vi.fn().mockResolvedValue(created)

      const wrapper = mountForm()
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      const emitted = wrapper.emitted('submitted') as [IncidenciaResponse][] | undefined
      expect(emitted).toHaveLength(1)
      expect(emitted![0][0].id).toBe('inc-1')
    })

    it('does NOT emit "submitted" when submitIncidencia returns null (validation fail)', async () => {
      mockSubmitIncidencia = vi.fn().mockResolvedValue(null)

      const wrapper = mountForm()
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.emitted('submitted')).toBeUndefined()
    })
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  describe('cancel button', () => {
    it('calls resetForm when cancel is clicked', async () => {
      const wrapper = mountForm()
      await wrapper.find('.incidence-form__cancel-btn').trigger('click')

      expect(mockResetForm).toHaveBeenCalledOnce()
    })

    it('emits "cancelled" when cancel is clicked', async () => {
      const wrapper = mountForm()
      await wrapper.find('.incidence-form__cancel-btn').trigger('click')

      expect(wrapper.emitted('cancelled')).toHaveLength(1)
    })
  })

  // ── Severity toggle ───────────────────────────────────────────────────────

  describe('severity buttons', () => {
    it('severity button shows active state when its value matches form.severidad', async () => {
      mockForm.severidad = 'critica'

      const wrapper = mountForm()
      await flushPromises()

      const criticaBtn = wrapper.find('.incidence-form__severity-btn--critica')
      expect(criticaBtn.classes()).toContain('incidence-form__severity-btn--active')
    })

    it('clicking a severity button sets form.severidad to that value', async () => {
      const wrapper = mountForm()

      const moderadaBtn = wrapper.find('.incidence-form__severity-btn--moderada')
      await moderadaBtn.trigger('click')

      expect(mockForm.severidad).toBe('moderada')
    })
  })

  // ── Preselected residente ─────────────────────────────────────────────────

  describe('preselectedResidenteId prop', () => {
    it('sets form.residenteId on mount when preselectedResidenteId is provided', async () => {
      mount(IncidenceForm, {
        props: {
          residents: SAMPLE_RESIDENTS,
          preselectedResidenteId: 'res-2',
        },
      })
      await flushPromises()

      expect(mockForm.residenteId).toBe('res-2')
    })
  })
})
