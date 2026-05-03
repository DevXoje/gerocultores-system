<!--
  ResidenteList.vue — Reusable resident list component.
  US-09: Alta y gestión de residentes

  Refactored from table to card layout per Stitch design:
  - US-05: Resident Directory (refined v2)
  - US-09: Resident Records
-->
<script setup lang="ts">
/**
 * ResidenteList.vue — Displays a grid of resident cards with filter and actions.
 *
 * US-09: Alta y gestión de residentes
 *
 * Props:
 *   - residentes: Residente[] — list to display
 *   - filter: 'active' | 'archived' | 'all'
 *   - showActions: boolean — whether to show edit/archive buttons (default: true)
 *
 * Emits:
 *   - edit(residente: Residente): user clicked edit
 *   - archive(residente: Residente): user clicked archive
 */
import { computed } from 'vue'
import { filterResidentesByState, type Residente } from '@/business/residents/domain/Residente'
import { calcularEdad } from '@/business/residents/domain/ResidenteDate'

const props = withDefaults(
  defineProps<{
    residentes: Residente[]
    filter: 'active' | 'archived' | 'all'
    showActions?: boolean
  }>(),
  {
    showActions: true,
  }
)

const emit = defineEmits<{
  (e: 'edit', residente: Residente): void
  (e: 'archive', residente: Residente): void
}>()

// ── Computed ──────────────────────────────────────────────────────────────

const filteredResidentes = computed<Residente[]>(() => {
  return filterResidentesByState(props.residentes, props.filter)
})

function handleEdit(residente: Residente): void {
  emit('edit', residente)
}

function handleArchive(residente: Residente): void {
  emit('archive', residente)
}

function getInitials(nombre: string, apellidos: string): string {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
}
</script>

<template>
  <div class="residente-list">
    <!-- Empty state -->
    <p v-if="filteredResidentes.length === 0" class="residente-list__empty">
      No hay residentes para mostrar.
    </p>

    <!-- Cards grid -->
    <div v-else class="residente-list__grid">
      <article
        v-for="residente in filteredResidentes"
        :key="residente.id"
        class="residente-list__card"
        :aria-label="`Residente ${residente.nombre} ${residente.apellidos}`"
      >
        <!-- Card body -->
        <div class="residente-list__card-body">
          <!-- Avatar -->
          <div class="residente-list__avatar-wrapper">
            <div v-if="residente.foto" class="residente-list__avatar">
              <img :src="residente.foto" :alt="`Foto de ${residente.nombre}`" />
            </div>
            <div v-else class="residente-list__avatar-placeholder" aria-hidden="true">
              <span>{{ getInitials(residente.nombre, residente.apellidos) }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="residente-list__info">
            <h3 class="residente-list__name">{{ residente.nombre }} {{ residente.apellidos }}</h3>
            <p class="residente-list__detail">
              <span class="residente-list__detail-icon" aria-hidden="true">🏠</span>
              <span>Hab. {{ residente.habitacion }}</span>
            </p>
            <p class="residente-list__detail">
              <span class="residente-list__detail-icon" aria-hidden="true">🎂</span>
              <span>{{ calcularEdad(residente.fechaNacimiento) }} años</span>
            </p>
          </div>

          <!-- Status badge -->
          <div class="residente-list__status">
            <span
              class="residente-list__badge"
              :class="
                residente.archivado
                  ? 'residente-list__badge--archived'
                  : 'residente-list__badge--active'
              "
            >
              {{ residente.archivado ? 'Archivado' : 'Activo' }}
            </span>
          </div>
        </div>

        <!-- Card actions -->
        <div v-if="showActions" class="residente-list__card-actions">
          <button
            type="button"
            class="residente-list__action-btn residente-list__action-btn--edit"
            :aria-label="`Editar ${residente.nombre} ${residente.apellidos}`"
            @click="handleEdit(residente)"
          >
            Editar
          </button>
          <button
            v-if="!residente.archivado"
            type="button"
            class="residente-list__action-btn residente-list__action-btn--archive"
            :aria-label="`Archivar ${residente.nombre} ${residente.apellidos}`"
            @click="handleArchive(residente)"
          >
            Archivar
          </button>
          <button
            v-else
            type="button"
            class="residente-list__action-btn residente-list__action-btn--restore"
            :aria-label="`Restaurar ${residente.nombre} ${residente.apellidos}`"
            @click="handleArchive(residente)"
          >
            Restaurar
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ────────────────────────────────────────────────────────────────── */
.residente-list {
  width: 100%;
}

/* ── Empty ─────────────────────────────────────────────────────────────── */
.residente-list__empty {
  padding: 3rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ── Cards grid ───────────────────────────────────────────────────────── */
.residente-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* ── Card ─────────────────────────────────────────────────────────────── */
.residente-list__card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: #ffffff;
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.residente-list__card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

/* ── Card body ───────────────────────────────────────────────────────── */
.residente-list__card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  gap: 0.75rem;
}

/* ── Avatar ───────────────────────────────────────────────────────────── */
.residente-list__avatar-wrapper {
  margin-bottom: 0.25rem;
}

.residente-list__avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  overflow: hidden;
}

.residente-list__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.residente-list__avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.residente-list__avatar-placeholder span {
  font-size: 1rem;
  font-weight: 700;
  color: #4338ca;
  letter-spacing: 0.05em;
}

/* ── Info ────────────────────────────────────────────────────────────── */
.residente-list__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.residente-list__name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.residente-list__detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.residente-list__detail-icon {
  font-size: 0.875rem;
  line-height: 1;
}

/* ── Status badge ─────────────────────────────────────────────────────── */
.residente-list__status {
  margin-top: 0.25rem;
}

.residente-list__badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.residente-list__badge--active {
  background-color: #d1fae5;
  color: #065f46;
}

.residente-list__badge--archived {
  background-color: #f3f4f6;
  color: #4b5563;
}

/* ── Card actions ─────────────────────────────────────────────────────── */
.residente-list__card-actions {
  display: flex;
  border-top: 1px solid #f3f4f6;
}

.residente-list__action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition:
    background-color 0.15s,
    color 0.15s;
  min-height: 48px;
}

.residente-list__action-btn:not(:last-child) {
  border-right: 1px solid #f3f4f6;
}

.residente-list__action-btn--edit {
  background-color: #ffffff;
  color: #374151;
}

.residente-list__action-btn--edit:hover {
  background-color: #f9fafb;
}

.residente-list__action-btn--archive {
  background-color: #fef2f2;
  color: #991b1b;
}

.residente-list__action-btn--archive:hover {
  background-color: #fee2e2;
}

.residente-list__action-btn--restore {
  background-color: #f0fdf4;
  color: #065f46;
}

.residente-list__action-btn--restore:hover {
  background-color: #d1fae5;
}
</style>
