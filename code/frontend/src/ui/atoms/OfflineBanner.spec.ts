/**
 * OfflineBanner.spec.ts — Tests for OfflineBanner.vue
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * TDD: RED phase — tests written before CSS fix is confirmed.
 * Tests verify the component renders with correct content when offline.
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mock useConnectivity composable so we can control isOnline
vi.mock('@/composables/useConnectivity', () => ({
  useConnectivity: vi.fn(),
}))

import { useConnectivity } from '@/composables/useConnectivity'
import OfflineBanner from './OfflineBanner.vue'

describe('OfflineBanner', () => {
  it('does NOT render when online', () => {
    vi.mocked(useConnectivity).mockReturnValue({ isOnline: ref(true) })
    const wrapper = mount(OfflineBanner, {
      global: { stubs: { transition: false } },
    })
    expect(wrapper.find('.offline-banner').exists()).toBe(false)
  })

  it('renders the offline banner when offline', () => {
    vi.mocked(useConnectivity).mockReturnValue({ isOnline: ref(false) })
    const wrapper = mount(OfflineBanner, {
      global: { stubs: { transition: false } },
    })
    const banner = wrapper.find('.offline-banner')
    expect(banner.exists()).toBe(true)
  })

  it('displays the correct offline message', () => {
    vi.mocked(useConnectivity).mockReturnValue({ isOnline: ref(false) })
    const wrapper = mount(OfflineBanner, {
      global: { stubs: { transition: false } },
    })
    expect(wrapper.find('.offline-banner__text').text()).toBe(
      'Sin conexión — las notificaciones están pausadas.'
    )
  })

  it('has role="status" for accessibility', () => {
    vi.mocked(useConnectivity).mockReturnValue({ isOnline: ref(false) })
    const wrapper = mount(OfflineBanner, {
      global: { stubs: { transition: false } },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })
})
