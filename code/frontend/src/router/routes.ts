import type { RouteRecordRaw } from 'vue-router'
import LoginPage from '@/business/auth/presentation/pages/LoginPage.vue'
import DashboardView from '@/views/DashboardView.vue'

/**
 * Application route definitions.
 *
 * meta.requiresAuth:
 *   - true  → route is protected; router guard redirects to /login if user is unauthenticated
 *   - false → public route; accessible without authentication
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
]
