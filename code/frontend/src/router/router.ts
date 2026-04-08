import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { createAuthGuard } from '@/business/auth/presentation/composables/useAuthGuard'

/**
 * Application router.
 *
 * Guard logic is delegated to the auth domain (createAuthGuard) —
 * it does not live here (frontend-specialist.md §3, task rules).
 *
 * Note: useAuthStore().init() must be called before router.isReady()
 * so that `auth.user` is populated from the Firebase Auth session on page load.
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(createAuthGuard())

export default router
