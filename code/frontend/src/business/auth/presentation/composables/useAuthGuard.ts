/**
 * useAuthGuard — Navigation guard factory for the auth domain.
 *
 * Architecture (frontend-specialist.md §3):
 *   - Auth guard logic belongs in the auth domain, not in router/router.ts.
 *   - Uses ROUTES constants — no magic strings.
 *   - Redirects unauthenticated users to login via named route.
 *
 * Usage (router.ts):
 *   import { createAuthGuard } from '@/business/auth/presentation/composables/useAuthGuard'
 *   router.beforeEach(createAuthGuard())
 */
import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { AUTH_ROUTES } from '@/business/auth/route-names'

export function createAuthGuard(): NavigationGuard {
  return (to) => {
    const auth = useAuthStore()

    if (to.meta['requiresAuth'] === true && auth.user === null) {
      return { name: AUTH_ROUTES.LOGIN.name }
    }
  }
}
