import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAuth, getIdToken } from 'firebase/auth'

// US-03: Consulta de agenda diaria
// US-04: Actualizar estado de una tarea
// US-10: Gestión de cuentas de usuarios
// US-13: Health check

/**
 * Centralized Axios instance used by all API modules.
 *
 * If VITE_API_BASE_URL is set (staging/production), requests go directly to that URL.
 * If not set (local dev), requests go to '/api' which Vite proxies to localhost:3000.
 *
 * Interceptor: attaches the Firebase ID token as `Authorization: Bearer <token>`
 * to every outgoing request. If no user is logged in, the header is omitted
 * and the server will return 401 (expected behavior for unauthenticated calls).
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL,
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
 *
 * In staging/production (VITE_API_BASE_URL set), calls the absolute health URL.
 * In local dev, uses the Vite proxy to localhost:3000.
 */
export async function isServerHealthy(): Promise<boolean> {
  try {
    // Health endpoint is at /health (mounted at root level, not under /api).
    const healthUrl = import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/health`
      : '/health'
    const response = await axios.get(healthUrl, { timeout: 3000 })
    return response.status >= 200 && response.status < 300
  } catch {
    return false
  }
}
