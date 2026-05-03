/**
 * turno/routes.ts — Route definitions for the turno module.
 *
 * US-11: Resumen de fin de turno
 */
import type { RouteRecordRaw } from 'vue-router'
import { TURNO_ROUTES } from './route-names'
import TurnoView from './presentation/components/TurnoView.vue'

export const turnoRoutes: RouteRecordRaw[] = [
  {
    path: TURNO_ROUTES.DETAIL.path,
    name: TURNO_ROUTES.DETAIL.name,
    component: TurnoView,
    meta: { requiresAuth: true, title: 'Mi Turno' },
  },
]
