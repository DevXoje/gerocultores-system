import type { RouteRecordRaw } from 'vue-router'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import { DASHBOARD_ROUTES } from '@/views/route-names'
import { authRoutes } from '@/business/auth/routes'
import DashboardView from '@/views/DashboardView.vue'

/**
 * Application route definitions.
 *
 * Route paths and names are sourced from module-owned route-names constants — no magic strings.
 * Each domain module exports its own routes (auth, residents, schedule, incidents).
 *
 * meta.requiresAuth:
 *   - true  → route is protected; auth guard redirects to login if unauthenticated
 *   - false → public route; accessible without authentication
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: AUTH_ROUTES.LOGIN.name },
  },
  ...authRoutes,
  {
    path: DASHBOARD_ROUTES.path,
    name: DASHBOARD_ROUTES.name,
    component: DashboardView,
    meta: { requiresAuth: true },
  },
]
