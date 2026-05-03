/**
 * router/route-names.ts — Global route constants aggregator.
 *
 * This file does NOT define any constants.
 * Each module owns its own route-names file.
 * This file only re-exports and assembles them for consumers
 * that need cross-module navigation.
 *
 * Named route-names.ts (not ROUTES.ts) to avoid case-insensitive filesystem
 * collision with routes.ts on macOS/Windows.
 */
export { AUTH_ROUTES } from '@/business/auth/route-names'
export { DASHBOARD_ROUTES } from '@/views/route-names'
export { RESIDENTS_ROUTES } from '@/business/residents/route-names'

import { AUTH_ROUTES as AUTH_ROUTES_LOCAL } from '@/business/auth/route-names'
import { DASHBOARD_ROUTES as DASHBOARD_ROUTES_LOCAL } from '@/views/route-names'
import { RESIDENTS_ROUTES as RESIDENTS_ROUTES_LOCAL } from '@/business/residents/route-names'

// Assembled shape for cross-module navigation — use sparingly.
// Prefer importing the specific module's route-names directly.
export const ROUTES = {
  HOME: {
    name: 'home',
    path: '/',
  },
  AUTH: AUTH_ROUTES_LOCAL,
  DASHBOARD: DASHBOARD_ROUTES_LOCAL,
  RESIDENTS: RESIDENTS_ROUTES_LOCAL,
} as const
