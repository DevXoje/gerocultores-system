import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from './route-names'
import { authRoutes } from '@/business/auth/routes'
import DashboardView from '@/views/DashboardView.vue'

/**
 * Application route definitions.
 *
 * Route paths and names are sourced from ROUTES constants — no magic strings.
 * Each domain module exports its own routes (auth, residents, schedule, incidents).
 *
 * meta.requiresAuth:
 *   - true  → route is protected; auth guard redirects to login if unauthenticated
 *   - false → public route; accessible without authentication
 */
export const routes: RouteRecordRaw[] = [
  {
    path: ROUTES.HOME.path,
    redirect: { name: ROUTES.AUTH.LOGIN.name },
  },
  ...authRoutes,
  {
    path: ROUTES.DASHBOARD.path,
    name: ROUTES.DASHBOARD.name,
    component: DashboardView,
    meta: { requiresAuth: true },
  },
]
