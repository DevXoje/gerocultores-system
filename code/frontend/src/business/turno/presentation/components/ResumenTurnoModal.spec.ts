/**
 * ResumenTurnoModal.spec.ts — Component tests for ResumenTurnoModal.vue
 *
 * US-11: Resumen de fin de turno
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResumenTurnoModal from './ResumenTurnoModal.vue'

describe('ResumenTurnoModal', () => {
  it('does not render when open=false', () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: false, isLoading: false },
    })
    expect(wrapper.find('.resumen-modal__backdrop').exists()).toBe(false)
  })

  it('renders the modal title when open=true', () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false },
    })
    expect(wrapper.find('.resumen-modal__title').text()).toBe('Resumen de fin de turno')
  })

  it('confirm button is disabled when textarea is empty', () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false, initialResumen: '' },
    })
    const btn = wrapper.find('.resumen-modal__btn--primary')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('confirm button is enabled when textarea has text', async () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false, initialResumen: '' },
    })
    await wrapper.find('.resumen-modal__textarea').setValue('Notas del turno')
    const btn = wrapper.find('.resumen-modal__btn--primary')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('emits confirm with trimmed resumen when confirm button clicked', async () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false, initialResumen: '' },
    })
    await wrapper.find('.resumen-modal__textarea').setValue('  Notas importantes  ')
    await wrapper.find('.resumen-modal__btn--primary').trigger('click')
    expect(wrapper.emitted('confirm')).toEqual([['Notas importantes']])
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false },
    })
    await wrapper.find('.resumen-modal__btn--secondary').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables both buttons when isLoading=true', () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: true, initialResumen: 'Notas' },
    })
    const buttons = wrapper.findAll('.resumen-modal__btn')
    buttons.forEach((btn) => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('pre-fills textarea with initialResumen', () => {
    const wrapper = mount(ResumenTurnoModal, {
      props: { open: true, isLoading: false, initialResumen: 'Contenido previo' },
    })
    const textarea = wrapper.find('.resumen-modal__textarea').element as HTMLTextAreaElement
    expect(textarea.value).toBe('Contenido previo')
  })
})
