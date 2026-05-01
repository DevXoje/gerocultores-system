/**
 * auth/routes.ts — Auth module route definitions.
 *
 * Each domain module owns its own routes (frontend-specialist.md §3).
 * Paths and names are sourced from ROUTES constants — no magic strings.
 */
import type { RouteRecordRaw } from 'vue-router'
import { AUTH_ROUTES } from './route-names'
import LoginPage from './presentation/pages/LoginPage.vue'
import RegisterPage from './presentation/pages/RegisterPage.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: AUTH_ROUTES.LOGIN.path,
    name: AUTH_ROUTES.LOGIN.name,
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: AUTH_ROUTES.REGISTER.path,
    name: AUTH_ROUTES.REGISTER.name,
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
]
