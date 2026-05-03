import type { RouteRecordRaw } from 'vue-router'
import { DASHBOARD_ROUTES } from '@/business/dashboard/route-names'
import { TASKS_ROUTES } from '@/views/route-names'
import { authRoutes } from '@/business/auth/routes'
import { residentsRoutes } from '@/business/residents/routes'
import { turnoRoutes } from '@/business/turno/routes'
import DashboardPage from '@/business/dashboard/presentation/pages/DashboardPage.vue'
import AuthLayout from '@/ui/layouts/AuthLayout.vue'
import MainLayout from '@/ui/layouts/MainLayout.vue'

/**
 * Application route definitions.
 *
 * Route paths and names are sourced from module-owned route-names constants — no magic strings.
 * Each domain module exports its own routes (auth, residents, schedule, incidents).
 *
 * Layout strategy:
 *   - AuthLayout → unauthenticated routes (login, register). No shell chrome.
 *   - MainLayout → authenticated routes. Wires notifications, polling, offline banner.
 *
 * Note: child paths are absolute (start with "/"), so Vue Router treats them as root paths.
 * This allows layout wrappers without changing any route path constant.
 *
 * meta.requiresAuth:
 *   - true  → route is protected; auth guard redirects to login if unauthenticated
 *   - false → public route; accessible without authentication
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AuthLayout,
    // No static redirect here — auth guard handles dynamic redirect:
    //   authenticated   → /app/dashboard
    //   unauthenticated → /login
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: authRoutes,
  },
  {
    path: '/app',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      ...residentsRoutes,
      ...turnoRoutes,
      {
        path: DASHBOARD_ROUTES.path,
        name: DASHBOARD_ROUTES.name,
        component: DashboardPage,
        meta: { requiresAuth: true, title: 'Inicio' },
      },
      {
        path: TASKS_ROUTES.all,
        name: TASKS_ROUTES.name,
        component: () => import('@/business/agenda/presentation/views/TasksView.vue'),
        meta: { requiresAuth: true, title: 'Agenda' },
      },
    ],
  },
]
