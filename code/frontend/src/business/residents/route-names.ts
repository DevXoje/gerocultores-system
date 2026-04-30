/**
 * residents/route-names.ts — Route name and path constants for the residents module.
 *
 * US-05: Consulta de ficha de residente
 * US-07: Historial de incidencias de un residente
 * US-09: Alta y gestión de residentes
 */
export const RESIDENTS_ROUTES = {
  RESIDENTE_DETAIL: {
    name: 'residente-detail',
    path: '/residentes/:id',
  },
  RESIDENTE_INCIDENCIAS: {
    name: 'residente-incidencias',
    path: '/residentes/:id/incidencias',
  },
  // US-09: Admin resident management
  RESIDENTS_ADMIN: {
    name: 'residents-admin',
    path: '/admin/residents',
  },
  RESIDENTE_NUEVO: {
    name: 'residente-nuevo',
    path: '/admin/residents/nuevo',
  },
  RESIDENTE_EDITAR: {
    name: 'residente-editar',
    path: '/admin/residents/:id/editar',
  },
} as const
