<!--
  Stitch: projects/16168255182252500555 — Resident Records (US-09)
  Export: OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png
-->
<script setup lang="ts">
/**
 * ResidentsView.vue — Gerocultor resident management view.
 *
 * US-09: Alta y gestión de residentes
 *
 * Displays a filterable list of residents owned by the logged-in gerocultor:
 * - Filter dropdown: status, search by name, habitacion
 * - "Alta nuevo residente" button → navigates to creation form
 * - Card grid of residents with edit/archive actions
 *
 * View state/orchestration is delegated to useResidentsView().
 */
import { ref } from 'vue'
import { useResidentsView } from '@/business/residents/presentation/composables/useResidentsView'
import { type ResidenteFilter } from '@/business/residents/domain/Residente'
import { onMounted } from 'vue'
import ResidenteList from '@/business/residents/presentation/UI/molecules/ResidenteList.vue'
import ResidenteFormModal from '@/business/residents/presentation/UI/molecules/dialogs/ResidenteFormModal.vue'

const {
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
} = useResidentsView()

const showFilters = ref(false)

function handleStatusBtnClick(status: ResidenteFilter): void {
  handleStatusFilter(status)
}

function toggleFilters(): void {
  showFilters.value = !showFilters.value
}

function handleSearchInput(event: Event): void {
  const target = event.target as HTMLInputElement
  handleSearchChange(target.value)
}

function handleHabitacionInput(event: Event): void {
  const target = event.target as HTMLInputElement
  handleHabitacionChange(target.value)
}

function getStatusLabel(status: ResidenteFilter): string {
  switch (status) {
    case 'active':
      return 'Activos'
    case 'archived':
      return 'Archivados'
    case 'all':
      return 'Todos'
  }
}

onMounted(async () => {
  await loadResidents()
})
</script>

<template>
  <div class="residents-view">
    <!-- Header -->
    <header class="residents-view__header">
      <div class="residents-view__header-text">
        <h1 class="residents-view__title">Gestión de residentes</h1>
        <p class="residents-view__subtitle">
          Administra los residentes dados de alta en el sistema.
        </p>
      </div>
      <button
        type="button"
        class="residents-view__create-btn"
        aria-label="Alta nuevo residente"
        @click="handleCreateNew"
      >
        <span class="residents-view__create-btn-icon" aria-hidden="true">+</span>
        Alta nuevo residente
      </button>
    </header>

    <!-- Error state -->
    <div v-if="error" class="residents-view__error" role="alert">
      <span class="residents-view__error-icon" aria-hidden="true">⚠</span>
      <span class="residents-view__error-message">{{ error }}</span>
      <button type="button" class="residents-view__retry-btn" @click="handleRetry">
        Reintentar
      </button>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else-if="isLoading"
      class="residents-view__skeleton"
      aria-busy="true"
      aria-label="Cargando residentes"
    >
      <template v-for="n in 5" :key="n">
        <div class="residents-view__skeleton-card" />
      </template>
    </div>

    <!-- Content -->
    <div v-else class="residents-view__content">
      <!-- Filter bar -->
      <div class="residents-view__filter-bar">
        <!-- Status filter pills -->
        <div class="residents-view__status-filters" role="group" aria-label="Filtrar por estado">
          <button
            v-for="status in ['active', 'archived', 'all'] as ResidenteFilter[]"
            :key="status"
            type="button"
            class="residents-view__status-btn"
            :class="{ 'residents-view__status-btn--active': filtros.status === status }"
            :aria-pressed="filtros.status === status"
            @click="handleStatusBtnClick(status)"
          >
            {{ getStatusLabel(status) }}
          </button>
        </div>

        <!-- Filter toggle -->
        <button
          type="button"
          class="residents-view__filter-toggle"
          :class="{ 'residents-view__filter-toggle--active': showFilters || hasActiveFilters }"
          :aria-expanded="showFilters"
          aria-controls="filters-panel"
          @click="toggleFilters"
        >
          <span aria-hidden="true">⚙</span>
          Filtros
          <span
            v-if="hasActiveFilters"
            class="residents-view__filter-badge"
            aria-label="Filtros activos"
            >.</span
          >
        </button>
      </div>

      <!-- Filters panel -->
      <div
        v-if="showFilters"
        id="filters-panel"
        class="residents-view__filters-panel"
        role="search"
        aria-label="Filtros de búsqueda"
      >
        <div class="residents-view__filter-group">
          <label class="residents-view__filter-label" for="search-input"> Buscar por nombre </label>
          <input
            id="search-input"
            type="search"
            class="residents-view__filter-input"
            placeholder="Nombre o apellidos..."
            :value="filtros.search"
            @input="handleSearchInput"
          />
        </div>

        <div class="residents-view__filter-group">
          <label class="residents-view__filter-label" for="habitacion-input"> Habitación </label>
          <input
            id="habitacion-input"
            type="text"
            class="residents-view__filter-input"
            placeholder="Ej. 101, 2A..."
            :value="filtros.habitacion"
            @input="handleHabitacionInput"
          />
        </div>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="residents-view__clear-filters"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Resident list (cards) -->
      <ResidenteList
        :residentes="filteredResidentes"
        filter="all"
        :show-actions="true"
        @edit="handleEdit"
        @archive="handleArchive"
      />
    </div>

    <!-- Create/Edit Modal -->
    <ResidenteFormModal
      v-if="showFormModal"
      v-model="showFormModal"
      :resident-id="selectedResidentId"
      @saved="handleFormSaved"
    />
  </div>
</template>

<style scoped>
/* ── Root ───────────────────────────────────────────────────────────────── */
.residents-view {
  padding: 1.5rem;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.residents-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.residents-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.residents-view__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* ── Create button ─────────────────────────────────────────────────────── */
.residents-view__create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #2d6a6a;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
  min-height: 44px;
}

.residents-view__create-btn:hover {
  background-color: #1f4d4d;
}

.residents-view__create-btn-icon {
  font-size: 1.25rem;
  line-height: 1;
}

/* ── Error ──────────────────────────────────────────────────────────────── */
.residents-view__error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 0.875rem;
}

.residents-view__error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.residents-view__error-message {
  flex: 1;
}

.residents-view__retry-btn {
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  color: #991b1b;
  font-size: 0.875rem;
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
.residents-view__skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.residents-view__skeleton-card {
  height: 12rem;
  border-radius: 0.75rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Content ─────────────────────────────────────────────────────────────── */
.residents-view__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Filter bar ────────────────────────────────────────────────────────── */
.residents-view__filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.residents-view__status-filters {
  display: flex;
  gap: 0.25rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.residents-view__status-btn {
  padding: 0.375rem 0.875rem;
  border: none;
  border-radius: 0.375rem;
  background: none;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
  min-height: 36px;
}

.residents-view__status-btn:hover {
  color: #374151;
}

.residents-view__status-btn--active {
  background-color: #ffffff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.residents-view__filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  min-height: 40px;
}

.residents-view__filter-toggle:hover {
  background-color: #f9fafb;
}

.residents-view__filter-toggle--active {
  background-color: #f0fdf4;
  border-color: #6ee7b7;
  color: #065f46;
}

.residents-view__filter-badge {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #2d6a6a;
  display: inline-block;
}

/* ── Filters panel ─────────────────────────────────────────────────────── */
.residents-view__filters-panel {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  flex-wrap: wrap;
}

.residents-view__filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 160px;
}

.residents-view__filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.residents-view__filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: #ffffff;
  min-height: 40px;
  transition: border-color 0.15s;
}

.residents-view__filter-input:focus {
  outline: none;
  border-color: #2d6a6a;
}

.residents-view__filter-input::placeholder {
  color: #9ca3af;
}

.residents-view__clear-filters {
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 0.375rem;
  background-color: #fef2f2;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #991b1b;
  cursor: pointer;
  transition: background-color 0.15s;
  min-height: 40px;
}

.residents-view__clear-filters:hover {
  background-color: #fee2e2;
}
</style>
