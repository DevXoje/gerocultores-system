/**
 * incidencias.api.ts — Infrastructure layer for Incidencia API calls.
 *
 * US-06: Registro de incidencia
 *
 * Uses centralized Axios client (apiClient) which attaches the Firebase
 * ID token via interceptor. All field names match SPEC/entities.md (G04).
 */
import { apiClient } from '@/infrastructure/apiClient'
import {
  IncidenciaResponseSchema,
  type CreateIncidenciaDTO,
  type IncidenciaResponse,
} from '@/business/incidents/domain/entities/incidencia.types'

/** API wrapper response envelope */
export interface ApiResponse<T> {
  data: T
}

/**
 * POST /api/incidencias
 * Submits a new incident report and returns the created Incidencia.
 * Response is validated with Zod at runtime.
 */
export async function createIncidencia(dto: CreateIncidenciaDTO): Promise<IncidenciaResponse> {
  const response = await apiClient.post<ApiResponse<IncidenciaResponse>>('/incidencias', dto)
  // Runtime validation — guards against schema drift between frontend and API
  return IncidenciaResponseSchema.parse(response.data.data)
}
