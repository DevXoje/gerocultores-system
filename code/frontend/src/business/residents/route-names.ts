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
  // US-09: Gerocultor crea/gestiona sus propios residentes
  // Filters via query: ?status=active|archived|all, ?search=texto, ?habitacion=texto
  RESIDENTS_LIST: {
    name: 'residents-list',
    path: '/residentes',
    pathWithQuery: '/residentes?status=active',
  },
} as const
