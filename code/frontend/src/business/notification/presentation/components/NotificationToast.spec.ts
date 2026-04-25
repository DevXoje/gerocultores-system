/**
 * NotificationToast.spec.ts — Component tests for NotificationToast.vue
 *
 * US-08: Recibir notificaciones de alertas críticas
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationToast from './NotificationToast.vue'

function makeNotif(overrides = {}) {
  return {
    id: 'n-1',
    usuarioId: 'u-1',
    tipo: 'sistema' as const,
    titulo: 'Alerta',
    mensaje: 'Mensaje de alerta',
    leida: false,
    referenciaId: null,
    referenciaModelo: null,
    creadaEn: new Date('2026-04-25T10:00:00Z'),
    ...overrides,
  }
}

describe('NotificationToast', () => {
  it('renders the notification title', () => {
    const wrapper = mount(NotificationToast, {
      props: { notification: makeNotif({ titulo: 'Incidencia grave' }) },
    })
    expect(wrapper.find('.notification-toast__title').text()).toBe('Incidencia grave')
  })

  it('renders the notification message', () => {
    const wrapper = mount(NotificationToast, {
      props: { notification: makeNotif({ mensaje: 'Residente requiere atención.' }) },
    })
    expect(wrapper.find('.notification-toast__message').text()).toBe('Residente requiere atención.')
  })

  it('applies tipo modifier class for incidencia_critica', () => {
    const wrapper = mount(NotificationToast, {
      props: { notification: makeNotif({ tipo: 'incidencia_critica' as const }) },
    })
    expect(wrapper.find('.notification-toast--incidencia_critica').exists()).toBe(true)
  })

  it('applies tipo modifier class for sistema', () => {
    const wrapper = mount(NotificationToast, {
      props: { notification: makeNotif({ tipo: 'sistema' as const }) },
    })
    expect(wrapper.find('.notification-toast--sistema').exists()).toBe(true)
  })

  it('emits dismiss with notification id when close button is clicked', async () => {
    const notif = makeNotif({ id: 'toast-42' })
    const wrapper = mount(NotificationToast, { props: { notification: notif } })

    await wrapper.find('.notification-toast__close').trigger('click')

    expect(wrapper.emitted('dismiss')).toEqual([['toast-42']])
  })

  it('has role=alert for accessibility', () => {
    const wrapper = mount(NotificationToast, {
      props: { notification: makeNotif() },
    })
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
