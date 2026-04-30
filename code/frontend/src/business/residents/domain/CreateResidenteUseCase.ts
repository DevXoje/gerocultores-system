/**
 * residents/domain/CreateResidenteUseCase.ts
 *
 * Use case for creating a new resident.
 * Calls POST /api/residentes
 *
 * US-09: Alta y gestión de residentes
 */

import { apiClient } from '@/services/apiClient'
import type { CreateResidenteDto, Residente } from './Residente'

export interface CreateResidenteResult {
  residente: Residente
}

/**
 * Creates a new resident. Requires admin role (enforced by backend).
 */
export async function createResidente(dto: CreateResidenteDto): Promise<CreateResidenteResult> {
  const response = await apiClient.post<{ data: Residente }>('/residentes', dto)
  return { residente: response.data.data }
}
