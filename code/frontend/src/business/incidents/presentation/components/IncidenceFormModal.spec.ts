import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { IncidenciaResponse } from '@/business/incidents/domain/entities/incidencia.types'

const mockGetResidentes = vi.fn()

vi.mock('@/business/residents/infrastructure/residentes.api', () => ({
  getResidentes: (...args: unknown[]) => mockGetResidentes(...args),
}))

import IncidenceFormModal from './IncidenceFormModal.vue'

const IncidenceFormStub = {
  name: 'IncidenceForm',
  props: ['residents', 'preselectedResidenteId', 'preselectedTareaId'],
  emits: ['submitted', 'cancelled'],
  template: `
    <div class="incidence-form-stub">
      <button type="button" class="incidence-form-stub__submit" @click="$emit('submitted', fakeIncidencia)">
        submit
      </button>
      <button type="button" class="incidence-form-stub__cancel" @click="$emit('cancelled')">
        cancel
      </button>
    </div>
  `,
  data() {
    return {
      fakeIncidencia: {
        id: 'inc-1',
        tipo: 'caida',
        severidad: 'leve',
        descripcion: 'desc',
        residenteId: 'res-1',
        usuarioId: 'user-1',
        tareaId: null,
        registradaEn: '2026-05-01T08:00:00Z',
      } as IncidenciaResponse,
    }
  },
}

describe('IncidenceFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const AppDialogStub = {
    name: 'AppDialog',
    props: ['modelValue', 'title', 'size'],
    emits: ['update:modelValue', 'close'],
    template: `<div class="app-dialog-stub"><slot /></div>`,
  }

  function mountModal() {
    return mount(IncidenceFormModal, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          IncidenceForm: IncidenceFormStub,
          AppDialog: AppDialogStub,
        },
      },
    })
  }

  it('loads residents on mount and renders the form on success', async () => {
    mockGetResidentes.mockResolvedValue([
      { id: 'res-1', nombre: 'Ana', apellidos: 'Ruiz' },
      { id: 'res-2', nombre: 'Luis', apellidos: 'Perez' },
    ])

    const wrapper = mountModal()
    await flushPromises()

    expect(mockGetResidentes).toHaveBeenCalledOnce()
    expect(wrapper.find('.incidence-form-stub').exists()).toBe(true)
  })

  it('shows error and retries residents fetch', async () => {
    mockGetResidentes.mockRejectedValueOnce(new Error('fallo'))
    mockGetResidentes.mockResolvedValueOnce([{ id: 'res-1', nombre: 'Ana', apellidos: 'Ruiz' }])

    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.find('.incidence-form-modal__error').exists()).toBe(true)

    await wrapper.find('.incidence-form-modal__retry-btn').trigger('click')
    await flushPromises()

    expect(mockGetResidentes).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.incidence-form-stub').exists()).toBe(true)
  })

  it('emits submitted and closes after successful submit', async () => {
    mockGetResidentes.mockResolvedValue([{ id: 'res-1', nombre: 'Ana', apellidos: 'Ruiz' }])

    const wrapper = mountModal()
    await flushPromises()

    await wrapper.find('.incidence-form-stub__submit').trigger('click')

    expect(wrapper.emitted('submitted')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('closes when form emits cancelled', async () => {
    mockGetResidentes.mockResolvedValue([{ id: 'res-1', nombre: 'Ana', apellidos: 'Ruiz' }])

    const wrapper = mountModal()
    await flushPromises()

    await wrapper.find('.incidence-form-stub__cancel').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
