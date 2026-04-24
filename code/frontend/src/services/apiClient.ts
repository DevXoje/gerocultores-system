import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAuth, getIdToken } from 'firebase/auth'

// US-03: Consulta de agenda diaria
// US-04: Actualizar estado de una tarea
// US-10: Gestión de cuentas de usuarios

/**
 * Centralized Axios instance used by all API modules.
 *
 * Interceptor: attaches the Firebase ID token as `Authorization: Bearer <token>`
 * to every outgoing request. If no user is logged in, the header is omitted
 * and the server will return 401 (expected behavior for unauthenticated calls).
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const currentUser = getAuth().currentUser
  if (currentUser) {
    const token = await getIdToken(currentUser)
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})
