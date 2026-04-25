import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAuth, getIdToken } from 'firebase/auth'

// US-03: Consulta de agenda diaria
// US-04: Actualizar estado de una tarea
// US-10: Gestión de cuentas de usuarios
// US-13: Health check

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

/**
 * Lightweight health-check function for connectivity validation.
 * Returns true if the server responds with 2xx, false otherwise.
 * Does NOT throw — returns boolean to allow clean branching in callers.
 */
export async function isServerHealthy(): Promise<boolean> {
  try {
    // Backend health endpoint is at /health (mounted at root level, not under /api).
    // The proxy forwards /health → localhost:3000/health correctly.
    const response = await axios.get('/health', { timeout: 3000 })
    return response.status >= 200 && response.status < 300
  } catch {
    return false
  }
}
