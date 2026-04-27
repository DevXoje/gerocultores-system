/**
 * auth/route-names.ts — Route name and path constants for the auth module.
 * Owned by the auth module. Do not import from router/route-names.ts for auth paths.
 */
export const AUTH_ROUTES = {
  LOGIN: {
    name: 'login',
    path: '/login',
  },
  REGISTER: {
    name: 'register',
    path: '/register',
  },
} as const
