import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Navigation guard — US-02: Role-based access control.
 * Protects routes that require authentication (meta.requiresAuth === true).
 *
 * Runs before every navigation. If the destination requires auth
 * and no user is signed in, redirects to /login.
 *
 * Note: useAuthStore().init() must have been called before router.isReady()
 * so that `auth.user` is populated from the Firebase Auth session on page load.
 */
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta['requiresAuth'] === true && auth.user === null) {
    return '/login'
  }
})

export default router
