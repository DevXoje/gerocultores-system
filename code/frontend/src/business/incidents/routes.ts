/**
 * incidents/routes.ts — Route definitions for the incidents module.
 *
 * US-06: Registro de incidencia
 */
import type { RouteRecordRaw } from 'vue-router'
import { INCIDENTS_ROUTES } from './route-names'
import IncidentView from './presentation/views/IncidentView.vue'

export const incidentsRoutes: RouteRecordRaw[] = [
  {
    path: INCIDENTS_ROUTES.NUEVA_INCIDENCIA.path,
    name: INCIDENTS_ROUTES.NUEVA_INCIDENCIA.name,
    component: IncidentView,
    meta: { requiresAuth: true },
  },
]
