<!--
  Stitch: projects/16168255182252500555 — Resident Records (US-09)
  Export: OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png
-->
<script setup lang="ts">
/**
 * ResidentsView.vue — Admin-only resident management view.
 *
 * US-09: Alta y gestión de residentes
 *
 * Displays a filterable list of all residents with admin actions:
 * - Filter tabs: active / archived / all
 * - "Alta nuevo residente" button → navigates to creation form
 * - Per-row edit and archive actions
 *
 * All data-fetching and mutations are delegated to useResidents().
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResidents } from '../composables/useResidents'
import ResidenteList from '../components/ResidenteList.vue'
import type { Residente } from '../../domain/Residente'
import { RESIDENTS_ROUTES } from '../../route-names'

// ── Router & Composable ───────────────────────────────────────────────────
const router = useRouter()
const { residentes, isLoading, error, fetchResidentes, archiveResidente } = useResidents()

// ── Filter state ──────────────────────────────────────────────────────────
type FilterTab = 'active' | 'archived' | 'all'
const activeTab = ref<FilterTab>('active')

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'active', label: 'Activos' },
  { value: 'archived', label: 'Archivados' },
  { value: 'all', label: 'Todos' },
]

// ── Lifecycle ──────────────────────────────────────────────────────────
onMounted(() => {
  fetchResidentes('all')
})

// ── Handlers ───────────────────────────────────────────────────────────

async function handleArchive(residente: Residente): Promise<void> {
  if (residente.archivado) {
    // TODO: implement restore/unarchive if backend supports it
    return
  }
  try {
    await archiveResidente(residente.id)
  } catch {
    // error is managed in store
  }
}

function handleEdit(residente: Residente): void {
  router.push({
    name: RESIDENTS_ROUTES.RESIDENTE_EDITAR.name,
    params: { id: residente.id },
  })
}

function handleCreateNew(): void {
  router.push({ name: RESIDENTS_ROUTES.RESIDENTE_NUEVO.name })
}

function handleTabClick(tab: FilterTab): void {
  activeTab.value = tab
}
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
      <button type="button" class="residents-view__retry-btn" @click="fetchResidentes('all')">
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
        <div class="residents-view__skeleton-row" />
      </template>
    </div>

    <!-- Content -->
    <div v-else class="residents-view__content">
      <!-- Filter tabs -->
      <nav class="residents-view__tabs" aria-label="Filtrar residentes">
        <template v-for="tab in TABS" :key="tab.value">
          <button
            type="button"
            class="residents-view__tab"
            :class="{ 'residents-view__tab--active': activeTab === tab.value }"
            :aria-selected="activeTab === tab.value"
            role="tab"
            @click="handleTabClick(tab.value)"
          >
            {{ tab.label }}
          </button>
        </template>
      </nav>

      <!-- Resident list -->
      <ResidenteList
        :residentes="residentes"
        :filter="activeTab"
        :show-actions="true"
        @edit="handleEdit"
        @archive="handleArchive"
      />
    </div>
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
  color: #dc2626;
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
  color: #dc2626;
  font-size: 0.875rem;
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
.residents-view__skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.residents-view__skeleton-row {
  height: 3.5rem;
  border-radius: 0.5rem;
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

/* ── Filter tabs ────────────────────────────────────────────────────────── */
.residents-view__tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.residents-view__tab {
  padding: 0.5rem 1rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
  margin-bottom: -1px;
  min-height: 40px;
}

.residents-view__tab:hover {
  color: #374151;
}

.residents-view__tab--active {
  color: #2d6a6a;
  border-bottom-color: #2d6a6a;
  font-weight: 600;
}
</style>
