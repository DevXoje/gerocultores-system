/**
 * residents/domain/ArchiveResidenteUseCase.ts
 *
 * Use case for archiving a resident.
 * Calls PATCH /api/residentes/:id/archive
 *
 * US-09: Alta y gestión de residentes
 */

import { apiClient } from '@/infrastructure/apiClient'
import type { Residente } from './Residente'

export interface ArchiveResidenteResult {
  residente: Residente
}

/**
 * Archives a resident (soft delete). Requires admin role (enforced by backend).
 */
export async function archiveResidente(id: string): Promise<ArchiveResidenteResult> {
  const response = await apiClient.patch<{ data: Residente }>(`/residentes/${id}/archive`)
  return { residente: response.data.data }
}
