import { computed } from 'vue'
import {
  DEFAULT_FILTERS,
  ResidentFiltersSchema,
  type Residente,
  type ResidenteFilter,
} from '@/business/residents/domain/Residente'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import { useAppModal } from '@/shared/composables/useAppModal'
import { useUrlFilters } from '@/shared/composables/useUrlFilters'

export function useResidentsView() {
  const { residentes, isLoading, error, fetchResidentes, archiveResidente } = useResidents()
  const {
    isOpen: showFormModal,
    context: selectedResidentId,
    openModal,
  } = useAppModal<Residente['id']>()

  // ── Filter state from URL query params ──────────────────────────────

  const { filters: filtros, pushFilters } = useUrlFilters(ResidentFiltersSchema, DEFAULT_FILTERS)

  // ── Computed ──────────────────────────────────────────────────────────

  const filteredResidentes = computed<Residente[]>(() => {
    const f = filtros.value
    let result = [...residentes.value]

    // Filter by status
    if (f.status === 'active') {
      result = result.filter((r) => !r.archivado)
    } else if (f.status === 'archived') {
      result = result.filter((r) => r.archivado)
    }

    // Filter by search (name + apellidos)
    const search = f.search.trim().toLowerCase()
    if (search) {
      result = result.filter(
        (r) => r.nombre.toLowerCase().includes(search) || r.apellidos.toLowerCase().includes(search)
      )
    }

    // Filter by habitacion
    const habitacion = f.habitacion.trim().toLowerCase()
    if (habitacion) {
      result = result.filter((r) => r.habitacion.toLowerCase().includes(habitacion))
    }

    return result
  })

  const hasActiveFilters = computed(() => {
    const f = filtros.value
    return (
      f.status !== DEFAULT_FILTERS.status || f.search.trim() !== '' || f.habitacion.trim() !== ''
    )
  })

  // ── Actions ──────────────────────────────────────────────────────────

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
    fetchResidentes('all').catch(() => {
      // Error state is managed by the residents store/composable.
    })
  }

  function handleStatusFilter(status: ResidenteFilter): void {
    const current = filtros.value
    pushFilters({ ...current, status })
  }

  function handleSearchChange(search: string): void {
    const current = filtros.value
    pushFilters({ ...current, search })
  }

  function handleHabitacionChange(habitacion: string): void {
    const current = filtros.value
    pushFilters({ ...current, habitacion })
  }

  function clearFilters(): void {
    pushFilters({ ...DEFAULT_FILTERS })
  }

  function handleRetry(): void {
    fetchResidentes('all').catch(() => {
      // Error state is managed by the residents store/composable.
    })
  }

  return {
    filteredResidentes,
    isLoading,
    error,
    loadResidents,
    showFormModal,
    selectedResidentId,
    filtros,
    hasActiveFilters,
    handleArchive,
    handleEdit,
    handleCreateNew,
    handleFormSaved,
    handleStatusFilter,
    handleSearchChange,
    handleHabitacionChange,
    clearFilters,
    handleRetry,
  }
}
