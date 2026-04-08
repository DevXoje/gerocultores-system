/**
 * route-names.ts — Single source of truth for all route name constants and paths.
 *
 * Named route-names.ts (not ROUTES.ts) to avoid case-insensitive filesystem
 * collision with routes.ts on macOS/Windows.
 *
 * Usage:
 *   import { ROUTES } from '@/router/route-names'
 *   router.push({ name: ROUTES.AUTH.LOGIN.name })
 *   router.push({ path: ROUTES.DASHBOARD.path })
 *
 * No magic strings for route paths anywhere in the codebase.
 */
export const ROUTES = {
  HOME: {
    name: 'home',
    path: '/',
  },
  AUTH: {
    LOGIN: {
      name: 'login',
      path: '/login',
    },
  },
  DASHBOARD: {
    name: 'dashboard',
    path: '/dashboard',
  },
} as const
