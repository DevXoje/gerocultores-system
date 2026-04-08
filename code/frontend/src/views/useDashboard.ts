/**
 * useDashboard — Temporary composable for DashboardView.
 *
 * DashboardView will be moved to its own DDD module (e.g. business/dashboard/)
 * in a future task. Until then, this composable wraps the auth store so that
 * DashboardView never imports the store directly (frontend-specialist.md §2).
 *
 * Architecture rule: Pages import ONLY from presentation/composables/ — never stores.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { ROUTES } from '@/router/route-names'

export function useDashboard() {
  const store = useAuthStore()
  const router = useRouter()

  const userEmail = computed(() => store.user?.email ?? null)

  async function signOut(): Promise<void> {
    await store.signOut()
    await router.push({ name: ROUTES.AUTH.LOGIN.name })
  }

  return { userEmail, signOut }
}
