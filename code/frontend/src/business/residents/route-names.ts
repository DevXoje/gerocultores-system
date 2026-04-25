/**
 * residents/route-names.ts — Route name and path constants for the residents module.
 *
 * US-05: Consulta de ficha de residente
 * US-07: Historial de incidencias de un residente
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
} as const
