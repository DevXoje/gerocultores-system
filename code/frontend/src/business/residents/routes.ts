/**
 * residents/routes.ts — Route definitions for the residents module.
 *
 * US-05: Consulta de ficha de residente
 * US-07: Historial de incidencias de un residente
 * US-09: Alta y gestión de residentes
 */
import type { RouteRecordRaw } from 'vue-router'
import { RESIDENTS_ROUTES } from './route-names'
import ResidenteView from './presentation/views/ResidenteView.vue'
import IncidenciasResidenteView from '@/business/incidents/presentation/views/IncidenciasResidenteView.vue'
import ResidentsView from './presentation/views/ResidentsView.vue'
import ResidenteFormView from './presentation/views/ResidenteFormView.vue'

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
  // US-09: Gerocultor gestiona sus propios residentes
  {
    path: RESIDENTS_ROUTES.RESIDENTS_LIST.path,
    name: RESIDENTS_ROUTES.RESIDENTS_LIST.name,
    component: ResidentsView,
    meta: { requiresAuth: true },
  },
  {
    path: RESIDENTS_ROUTES.RESIDENTE_NUEVO.path,
    name: RESIDENTS_ROUTES.RESIDENTE_NUEVO.name,
    component: ResidenteFormView,
    meta: { requiresAuth: true },
  },
  {
    path: RESIDENTS_ROUTES.RESIDENTE_EDITAR.path,
    name: RESIDENTS_ROUTES.RESIDENTE_EDITAR.name,
    component: ResidenteFormView,
    meta: { requiresAuth: true },
  },
]
