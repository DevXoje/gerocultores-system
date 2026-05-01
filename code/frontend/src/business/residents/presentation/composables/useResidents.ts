/**
 * useResidents.ts — Presentation composable bridge.
 *
 * US-09: Alta y gestión de residentes
 *
 * Architecture (frontend-specialist.md §3):
 *   - Components import ONLY from composables — not stores directly.
 *   - This composable delegates to useResidentes (application layer).
 *   - Exposes reactive state + async actions for listing, creating,
 *     updating, and archiving residents.
 */
import { useResidentes } from '@/business/residents/application/useResidentes'

export function useResidents() {
  const {
    residentes,
    activeResidentes,
    archivedResidentes,
    isLoading,
    error,
    fetchResidentes,
    createResidente,
    updateResidente,
    archiveResidente,
  } = useResidentes()

  return {
    // State
    residentes,
    activeResidentes,
    archivedResidentes,
    isLoading,
    error,
    // Actions
    fetchResidentes,
    createResidente,
    updateResidente,
    archiveResidente,
  }
}
