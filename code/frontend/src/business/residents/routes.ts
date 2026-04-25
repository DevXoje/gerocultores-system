/**
 * residents/routes.ts — Route definitions for the residents module.
 *
 * US-05: Consulta de ficha de residente
 * US-07: Historial de incidencias de un residente
 */
import type { RouteRecordRaw } from 'vue-router'
import { RESIDENTS_ROUTES } from './route-names'
import ResidenteView from './presentation/views/ResidenteView.vue'
import IncidenciasResidenteView from '@/business/incidents/presentation/views/IncidenciasResidenteView.vue'

export const residentsRoutes: RouteRecordRaw[] = [
  {
    path: RESIDENTS_ROUTES.RESIDENTE_DETAIL.path,
    name: RESIDENTS_ROUTES.RESIDENTE_DETAIL.name,
    component: ResidenteView,
    meta: { requiresAuth: true },
  },
  {
    path: RESIDENTS_ROUTES.RESIDENTE_INCIDENCIAS.path,
    name: RESIDENTS_ROUTES.RESIDENTE_INCIDENCIAS.name,
    component: IncidenciasResidenteView,
    meta: { requiresAuth: true },
  },
]
