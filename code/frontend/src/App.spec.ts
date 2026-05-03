/**
 * App.spec.ts — Tests for App.vue (minimal root component).
 *
 * App.vue is now just a <RouterView /> wrapper. Shell chrome (notifications,
 * offline banner, polling) lives in MainLayout.vue and is tested in
 * MainLayout.spec.ts.
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

import App from './App.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div data-testid="page">Home</div>' } }],
  })
}

describe('App.vue', () => {
  it('renders the RouterView outlet', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(wrapper.find('[data-testid="page"]').exists()).toBe(true)
  })
})
