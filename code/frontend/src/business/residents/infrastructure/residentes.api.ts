/**
 * residents/infrastructure/residentes.api.ts
 *
 * API client for the Residente resource.
 * Uses the centralized Axios instance (apiClient) which attaches the
 * Firebase ID token as Authorization: Bearer <token> automatically.
 *
 * Endpoint: GET /api/residentes/:id
 * US-05: Consulta de ficha de residente
 */

import { apiClient } from '@/services/apiClient'
import type { ResidenteDTO } from '../domain/entities/residente.types'

export interface ApiResponse<T> {
  data: T
}

/**
 * Fetches a single resident by their UUID.
 * Throws an Axios error if the request fails (e.g. 404, 401).
 */
export async function getResidente(id: string): Promise<ResidenteDTO> {
  const response = await apiClient.get<ApiResponse<ResidenteDTO>>(`/residentes/${id}`)
  return response.data.data
}

/**
 * Fetches all active residents.
 * Used to populate the resident selector in IncidenceForm.
 * US-06: Registro de incidencia
 */
export async function getResidentes(): Promise<ResidenteDTO[]> {
  const response = await apiClient.get<ApiResponse<ResidenteDTO[]>>('/residentes')
  return response.data.data
}
