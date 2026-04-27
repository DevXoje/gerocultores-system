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
 *
 * Pattern adapted from ride-on-workshop-v2: initAuth() is called in the guard
 * (not in main.ts) with a 3-second timeout to prevent blocking navigation.
 */
import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { AUTH_ROUTES } from '@/business/auth/route-names'

// Track whether auth has been initialized for this navigation cycle.
// Initialized once per page load; subsequent navigations use the cached state.
let authInitialized = false

export function createAuthGuard(): NavigationGuard {
  return async (to) => {
    const auth = useAuthStore()

    // Wait for Firebase Auth to initialize (with 3s timeout in initAuth).
    // This avoids blocking navigation indefinitely on slow Firebase responses.
    if (!authInitialized) {
      await auth.initAuth()
      authInitialized = true
    }

    if (to.meta['requiresAuth'] === true && auth.user === null) {
      return { name: AUTH_ROUTES.LOGIN.name }
    }
  }
}
