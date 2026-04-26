import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAuth, getIdToken } from 'firebase/auth'

// US-03: Consulta de agenda diaria
// US-04: Actualizar estado de una tarea
// US-10: Gestión de cuentas de usuarios
// US-13: Health check

/**
 * Centralized Axios instance used by all API modules.
 *
 * VITE_API_URL must be set in all environments (local, staging, production).
 * No silent fallback to '/api' — if missing, the app fails immediately at import time.
 *
 * Interceptor: attaches the Firebase ID token as `Authorization: Bearer <token>`
 * to every outgoing request. If no user is logged in, the header is omitted
 * and the server will return 401 (expected behavior for unauthenticated calls).
 */
const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  throw new Error(
    '[apiClient] VITE_API_URL is not set. Configure it in .env.local (local) or via CI secret (staging/prod).'
  )
}

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
 */
export async function isServerHealthy(): Promise<boolean> {
  try {
    const healthUrl = `${import.meta.env.VITE_API_URL}/health`
    const response = await axios.get(healthUrl, { timeout: 3000 })
    return response.status >= 200 && response.status < 300
  } catch {
    return false
  }
}
