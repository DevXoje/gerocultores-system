/**
 * residents/domain/ListResidentesUseCase.ts
 *
 * Use case for listing residents with optional filter.
 * Calls GET /api/residentes?filter=active|archived|all
 *
 * US-09: Alta y gestión de residentes
 * US-03: Consulta de agenda diaria
 */

import { apiClient } from '@/infrastructure/apiClient'
import type { Residente, ResidenteFilter } from './Residente'

export interface ListResidentesResult {
  residentes: Residente[]
}

/**
 * Lists residents filtered by status.
 * - 'active': non-archived residents
 * - 'archived': archived residents only
 * - 'all': all residents regardless of archive status
 */
export async function listResidentes(
  filter: ResidenteFilter = 'active'
): Promise<ListResidentesResult> {
  const response = await apiClient.get<{ data: Residente[] }>('/residentes', {
    params: { filter },
  })
  return { residentes: response.data.data }
}
