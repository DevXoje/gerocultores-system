/**
 * auth/routes.ts — Auth module route definitions.
 *
 * Each domain module owns its own routes (frontend-specialist.md §3).
 * Paths and names are sourced from ROUTES constants — no magic strings.
 */
import type { RouteRecordRaw } from 'vue-router'
import { ROUTES } from '@/router/route-names'
import LoginPage from './presentation/pages/LoginPage.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: ROUTES.AUTH.LOGIN.path,
    name: ROUTES.AUTH.LOGIN.name,
    component: LoginPage,
    meta: { requiresAuth: false },
  },
]
