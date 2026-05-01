/**
 * ResumenTurnoModal.spec.ts — Component tests for ResumenTurnoModal.vue
 *
 * US-11: Resumen de fin de turno
 *
 * Note: AppDialog uses native <dialog> which is only visible to tests when
 * showModal() is called. We test the component's contract (props → AppDialog props,
 * and emit behaviour) rather than DOM interactions inside the dialog.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResumenTurnoModal from './ResumenTurnoModal.vue'
import AppDialog from '@/ui/molecules/dialogs/AppDialog.vue'

describe('ResumenTurnoModal', () => {
  describe('AppDialog wrapper contract', () => {
    it('passes modelValue=false to AppDialog when closed', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: false, isLoading: false },
      })
      expect(wrapper.findComponent(AppDialog).props('modelValue')).toBe(false)
    })

    it('passes modelValue=true to AppDialog when open', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false },
      })
      expect(wrapper.findComponent(AppDialog).props('modelValue')).toBe(true)
    })

    it('sets title="Resumen de fin de turno" on AppDialog', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false },
      })
      expect(wrapper.findComponent(AppDialog).props('title')).toBe('Resumen de fin de turno')
    })

    it('sets size=md on AppDialog', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false },
      })
      expect(wrapper.findComponent(AppDialog).props('size')).toBe('md')
    })
  })

  describe('emit contract', () => {
    it('emits cancel when user requests close', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false },
      })
      // handleCancel is triggered by AppDialog's @close event
      wrapper.vm.handleCancel()
      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('emits update:modelValue=false when closed', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false },
      })
      wrapper.vm.handleCancel()
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })

    it('emits confirm with trimmed text', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false, initialResumen: '' },
      })
      wrapper.vm.handleConfirm()
      // handleConfirm emits 'confirm' with trimmed resumen
      expect(wrapper.emitted('confirm')).toHaveLength(1)
      const emitPayload = wrapper.emitted('confirm')![0][0]
      expect(emitPayload).toBe('') // empty string trimmed is still ''
    })
  })

  describe('state management', () => {
    it('initializes resumen from initialResumen prop', () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false, initialResumen: 'Contenido previo' },
      })
      expect(wrapper.vm.resumen).toBe('Contenido previo')
    })

    it('watches initialResumen changes', async () => {
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false, initialResumen: 'v1' },
      })
      await wrapper.setProps({ initialResumen: 'v2' })
      expect(wrapper.vm.resumen).toBe('v2')
    })
  })

  describe('resumenData display', () => {
    it('exposes resumenData prop correctly', () => {
      const resumenData = {
        tareasCompletadas: 5,
        tareasPendientes: 2,
        incidenciasRegistradas: 1,
        residentesAtendidos: ['r-1', 'r-2'],
        textoResumen: 'Turno tranquilo.',
      }
      const wrapper = mount(ResumenTurnoModal, {
        props: { modelValue: true, isLoading: false, resumenData },
      })
      const vm = wrapper.vm
      expect(vm.resumenData).toEqual(resumenData)
    })
  })
})
