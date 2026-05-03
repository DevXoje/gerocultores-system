import type { Residente, ResidenteFilter } from '@/business/residents/domain/Residente'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import { useAppModal } from '@/shared/composables/useAppModal'
import { useTabs, type TabOption } from '@/shared/composables/useTabs'

export const RESIDENTS_FILTER_TABS: TabOption<ResidenteFilter>[] = [
  { value: 'active', label: 'Activos' },
  { value: 'archived', label: 'Archivados' },
  { value: 'all', label: 'Todos' },
]

export function useResidentsView() {
  const { residentes, isLoading, error, fetchResidentes, archiveResidente } = useResidents()
  const {
    isOpen: showFormModal,
    context: selectedResidentId,
    openModal,
  } = useAppModal<Residente['id']>()
  const { activeTab, selectTab } = useTabs<ResidenteFilter>('active')

  async function loadResidents(): Promise<void> {
    await fetchResidentes('all')
  }

  async function handleArchive(residente: Residente): Promise<void> {
    if (residente.archivado) return

    try {
      await archiveResidente(residente.id)
    } catch {
      // Error state is managed by the residents store/composable.
    }
  }

  function handleEdit(residente: Residente): void {
    openModal(residente.id)
  }

  function handleCreateNew(): void {
    openModal()
  }

  function handleFormSaved(): void {
    fetchResidentes(activeTab.value).catch(() => {
      // Error state is managed by the residents store/composable.
    })
  }

  function handleTabClick(tab: ResidenteFilter): void {
    selectTab(tab)
  }

  function handleRetry(): void {
    fetchResidentes('all').catch(() => {
      // Error state is managed by the residents store/composable.
    })
  }

  return {
    residentes,
    isLoading,
    error,
    loadResidents,
    showFormModal,
    selectedResidentId,
    activeTab,
    tabs: RESIDENTS_FILTER_TABS,
    handleArchive,
    handleEdit,
    handleCreateNew,
    handleFormSaved,
    handleTabClick,
    handleRetry,
  }
}
