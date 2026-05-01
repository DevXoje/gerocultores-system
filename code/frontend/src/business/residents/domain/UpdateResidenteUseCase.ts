/**
 * residents/domain/UpdateResidenteUseCase.ts
 *
 * Use case for updating a resident's data.
 * Calls PATCH /api/residentes/:id
 *
 * US-09: Alta y gestión de residentes
 */

import { apiClient } from '@/infrastructure/apiClient'
import type { UpdateResidenteDto, Residente } from './Residente'

export interface UpdateResidenteResult {
  residente: Residente
}

/**
 * Updates a resident's data. Requires admin role (enforced by backend).
 */
export async function updateResidente(
  id: string,
  dto: UpdateResidenteDto
): Promise<UpdateResidenteResult> {
  const response = await apiClient.patch<{ data: Residente }>(`/residentes/${id}`, dto)
  return { residente: response.data.data }
}
