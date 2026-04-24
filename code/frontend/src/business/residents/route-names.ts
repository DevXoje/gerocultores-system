/**
 * residents/route-names.ts — Route name and path constants for the residents module.
 *
 * US-05: Consulta de ficha de residente
 */
export const RESIDENTS_ROUTES = {
  RESIDENTE_DETAIL: {
    name: 'residente-detail',
    path: '/residentes/:id',
  },
} as const
