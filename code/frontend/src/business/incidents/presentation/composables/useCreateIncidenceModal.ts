/**
 * useCreateIncidenceModal.ts — Shared modal state for incident creation.
 *
 * US-06: Registro de incidencia
 *
 * Encapsulates the open/close state of IncidenceFormModal so any shell
 * (AppShell, MainLayout, etc.) can host the modal without coupling to Dashboard.
 */
import { useAppModal } from '@/shared/composables/useAppModal'

export function useCreateIncidenceModal() {
  const { isOpen, context, openModal, closeModal, resetContext } = useAppModal<{
    preselectedResidenteId?: string
    preselectedTareaId?: string | null
  }>()

  return {
    showCreateIncidentModal: isOpen,
    incidentContext: context,
    openIncidenceModal: openModal,
    closeIncidenceModal: closeModal,
    resetIncidentContext: resetContext,
  }
}
