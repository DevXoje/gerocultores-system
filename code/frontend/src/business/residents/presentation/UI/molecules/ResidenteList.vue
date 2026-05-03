<!--
  ResidenteList.vue — Reusable resident list component.
  US-09: Alta y gestión de residentes
-->
<script setup lang="ts">
/**
 * ResidenteList.vue — Displays a list of residents with filter tabs and action buttons.
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
import { calcularEdad, formatResidenteDateShort } from '@/business/residents/domain/ResidenteDate'

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
</script>

<template>
  <div class="residente-list">
    <!-- Empty state -->
    <p v-if="filteredResidentes.length === 0" class="residente-list__empty">
      No hay residentes para mostrar.
    </p>

    <!-- Table -->
    <div v-else class="residente-list__table-wrapper">
      <table class="residente-list__table">
        <thead class="residente-list__thead">
          <tr class="residente-list__tr">
            <th class="residente-list__th" scope="col">Nombre</th>
            <th class="residente-list__th" scope="col">Habitación</th>
            <th class="residente-list__th" scope="col">Fecha nacimiento</th>
            <th class="residente-list__th" scope="col">Estado</th>
            <th v-if="showActions" class="residente-list__th" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="residente in filteredResidentes" :key="residente.id">
            <tr class="residente-list__tr">
              <td class="residente-list__td">
                <div class="residente-list__name-cell">
                  <div v-if="residente.foto" class="residente-list__avatar">
                    <img :src="residente.foto" :alt="`Foto de ${residente.nombre}`" />
                  </div>
                  <div v-else class="residente-list__avatar-placeholder" aria-hidden="true">
                    <span>{{ residente.nombre.charAt(0) }}{{ residente.apellidos.charAt(0) }}</span>
                  </div>
                  <div class="residente-list__name-info">
                    <span class="residente-list__full-name">
                      {{ residente.nombre }} {{ residente.apellidos }}
                    </span>
                    <span v-if="residente.archivado" class="residente-list__age-hint">
                      Archivado
                    </span>
                  </div>
                </div>
              </td>
              <td class="residente-list__td">
                <span class="residente-list__habitacion">{{ residente.habitacion }}</span>
              </td>
              <td class="residente-list__td">
                <div class="residente-list__birth-date">
                  <span>{{ formatResidenteDateShort(residente.fechaNacimiento) }}</span>
                  <span class="residente-list__age"
                    >({{ calcularEdad(residente.fechaNacimiento) }} años)</span
                  >
                </div>
              </td>
              <td class="residente-list__td">
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
              </td>
              <td v-if="showActions" class="residente-list__td">
                <div class="residente-list__actions">
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
              </td>
            </tr>
          </template>
        </tbody>
      </table>
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
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ── Table wrapper ──────────────────────────────────────────────────────── */
.residente-list__table-wrapper {
  overflow-x: auto;
}

.residente-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.residente-list__thead {
  border-bottom: 1px solid #e5e7eb;
}

.residente-list__tr {
  border-bottom: 1px solid #f3f4f6;
}

.residente-list__tr:last-child {
  border-bottom: none;
}

.residente-list__th {
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ── Cells ──────────────────────────────────────────────────────────────── */
.residente-list__td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

/* ── Name cell ─────────────────────────────────────────────────────────── */
.residente-list__name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.residente-list__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  overflow: hidden;
  flex-shrink: 0;
}

.residente-list__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.residente-list__avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.residente-list__avatar-placeholder span {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4338ca;
}

.residente-list__name-info {
  display: flex;
  flex-direction: column;
}

.residente-list__full-name {
  font-weight: 500;
  color: #111827;
}

.residente-list__age-hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ── Habitación ────────────────────────────────────────────────────────── */
.residente-list__habitacion {
  font-variant-numeric: tabular-nums;
  color: #374151;
}

/* ── Birth date ────────────────────────────────────────────────────────── */
.residente-list__birth-date {
  display: flex;
  flex-direction: column;
  color: #374151;
}

.residente-list__age {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ── Badge ─────────────────────────────────────────────────────────────── */
.residente-list__badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
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

/* ── Actions ─────────────────────────────────────────────────────────────── */
.residente-list__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.residente-list__action-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  min-height: 32px;
}

.residente-list__action-btn--edit {
  border-color: #d1d5db;
  background-color: #ffffff;
  color: #374151;
}

.residente-list__action-btn--edit:hover {
  background-color: #f3f4f6;
}

.residente-list__action-btn--archive {
  border-color: #fca5a5;
  background-color: #fef2f2;
  color: #991b1b;
}

.residente-list__action-btn--archive:hover {
  background-color: #fee2e2;
}

.residente-list__action-btn--restore {
  border-color: #6ee7b7;
  background-color: #f0fdf4;
  color: #065f46;
}

.residente-list__action-btn--restore:hover {
  background-color: #d1fae5;
}
</style>
