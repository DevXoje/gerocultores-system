<script setup lang="ts">
/**
 * TareaFilterBar — collapsible filter bar for the TasksView calendar.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Stitch reference: projects/16168255182252500555/screens/c4df0dcfc4114cb29deb834b50647f00
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in presentation/components/
 *   - BEM class names; Tailwind via @apply in <style scoped>
 */
import { ref } from 'vue'
import type { TareaFilters } from '@/business/agenda/presentation/composables/useTareaFilters'
import type { TareaTipo, TareaEstado } from '@/business/agenda/domain/entities/tarea.types'
import { FunnelIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/vue/24/outline'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const modelValue = defineModel<TareaFilters>({
  default: () => ({ dateRange: null, tipo: null, estado: null }),
})

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

// ─── Filter options ────────────────────────────────────────────────────────────

const TIPOS: Array<{ value: TareaTipo; label: string }> = [
  { value: 'higiene', label: 'Higiene' },
  { value: 'medicacion', label: 'Medicación' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'revision', label: 'Revisión' },
  { value: 'otro', label: 'Otro' },
]

const ESTADOS: Array<{ value: TareaEstado; label: string }> = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'completada', label: 'Completada' },
  { value: 'con_incidencia', label: 'Con incidencia' },
]

// ─── Local filter state (synced with v-model) ─────────────────────────────────

const localDateStart = ref<string>('')
const localDateEnd = ref<string>('')

// Sync dateRange to local inputs when modelValue changes externally
function handleDateStartChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  localDateStart.value = value
  emitDateRange()
}

function handleDateEndChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  localDateEnd.value = value
  emitDateRange()
}

function emitDateRange(): void {
  if (localDateStart.value && localDateEnd.value) {
    modelValue.value = {
      ...modelValue.value,
      dateRange: { start: localDateStart.value, end: localDateEnd.value },
    }
  } else {
    modelValue.value = { ...modelValue.value, dateRange: null }
  }
}

function handleTipoChange(e: Event): void {
  const value = (e.target as HTMLSelectElement).value as TareaTipo | ''
  modelValue.value = { ...modelValue.value, tipo: value || null }
}

function handleEstadoChange(e: Event): void {
  const value = (e.target as HTMLSelectElement).value as TareaEstado | ''
  modelValue.value = { ...modelValue.value, estado: value || null }
}

// ─── Event handlers (G11 — named functions, no inline) ────────────────────────

function handleToggleOpen(): void {
  emit('update:open', !props.open)
}

function handleClearFilters(): void {
  localDateStart.value = ''
  localDateEnd.value = ''
  modelValue.value = { dateRange: null, tipo: null, estado: null }
}

function handleRemoveDateRange(): void {
  localDateStart.value = ''
  localDateEnd.value = ''
  modelValue.value = { ...modelValue.value, dateRange: null }
}

function handleRemoveTipo(): void {
  modelValue.value = { ...modelValue.value, tipo: null }
}

function handleRemoveEstado(): void {
  modelValue.value = { ...modelValue.value, estado: null }
}

function hasActiveFilters(): boolean {
  return (
    modelValue.value.dateRange !== null ||
    modelValue.value.tipo !== null ||
    modelValue.value.estado !== null
  )
}
</script>

<template>
  <div class="tarea-filter-bar">
    <!-- Toggle button -->
    <button
      type="button"
      class="tarea-filter-bar__toggle"
      :aria-expanded="open"
      aria-controls="filter-bar-content"
      @click="handleToggleOpen"
    >
      <FunnelIcon class="tarea-filter-bar__toggle-icon" aria-hidden="true" />
      <span class="tarea-filter-bar__toggle-label">Filtros</span>
      <component
        :is="open ? ChevronUpIcon : ChevronDownIcon"
        class="tarea-filter-bar__toggle-chevron"
        aria-hidden="true"
      />
    </button>

    <!-- Active filter chips -->
    <div v-if="!open && hasActiveFilters()" class="tarea-filter-bar__chips">
      <span v-if="modelValue.dateRange" class="tarea-filter-bar__chip">
        {{ modelValue.dateRange.start }} — {{ modelValue.dateRange.end }}
        <button
          type="button"
          class="tarea-filter-bar__chip-remove"
          aria-label="Quitar filtro de fecha"
          @click="handleRemoveDateRange"
        >
          <XMarkIcon class="tarea-filter-bar__chip-remove-icon" aria-hidden="true" />
        </button>
      </span>
      <span v-if="modelValue.tipo" class="tarea-filter-bar__chip">
        {{ modelValue.tipo }}
        <button
          type="button"
          class="tarea-filter-bar__chip-remove"
          aria-label="Quitar filtro de tipo"
          @click="handleRemoveTipo"
        >
          <XMarkIcon class="tarea-filter-bar__chip-remove-icon" aria-hidden="true" />
        </button>
      </span>
      <span v-if="modelValue.estado" class="tarea-filter-bar__chip">
        {{ modelValue.estado }}
        <button
          type="button"
          class="tarea-filter-bar__chip-remove"
          aria-label="Quitar filtro de estado"
          @click="handleRemoveEstado"
        >
          <XMarkIcon class="tarea-filter-bar__chip-remove-icon" aria-hidden="true" />
        </button>
      </span>
      <button type="button" class="tarea-filter-bar__clear" @click="handleClearFilters">
        Limpiar
      </button>
    </div>

    <!-- Collapsible filter content -->
    <Transition name="filter-expand">
      <div v-if="open" id="filter-bar-content" class="tarea-filter-bar__content">
        <!-- Date range -->
        <fieldset class="tarea-filter-bar__field">
          <legend class="tarea-filter-bar__field-label">Rango de fechas</legend>
          <div class="tarea-filter-bar__date-range">
            <input
              type="date"
              class="tarea-filter-bar__date-input"
              :value="localDateStart"
              aria-label="Fecha inicio"
              @change="handleDateStartChange"
            />
            <span class="tarea-filter-bar__date-separator">—</span>
            <input
              type="date"
              class="tarea-filter-bar__date-input"
              :value="localDateEnd"
              aria-label="Fecha fin"
              @change="handleDateEndChange"
            />
          </div>
        </fieldset>

        <!-- Tipo -->
        <fieldset class="tarea-filter-bar__field">
          <legend class="tarea-filter-bar__field-label">Tipo de tarea</legend>
          <select
            class="tarea-filter-bar__select"
            :value="modelValue.tipo ?? ''"
            aria-label="Filtrar por tipo"
            @change="handleTipoChange"
          >
            <option value="">Todos los tipos</option>
            <option v-for="opt in TIPOS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </fieldset>

        <!-- Estado -->
        <fieldset class="tarea-filter-bar__field">
          <legend class="tarea-filter-bar__field-label">Estado</legend>
          <select
            class="tarea-filter-bar__select"
            :value="modelValue.estado ?? ''"
            aria-label="Filtrar por estado"
            @change="handleEstadoChange"
          >
            <option value="">Todos los estados</option>
            <option v-for="opt in ESTADOS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </fieldset>

        <!-- Clear all -->
        <div class="tarea-filter-bar__actions">
          <button type="button" class="tarea-filter-bar__clear-btn" @click="handleClearFilters">
            Limpiar filtros
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "#/style.css";

/* ─── Bar shell ─────────────────────────────────────────────────────────────── */
.tarea-filter-bar {
  background: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
  border-radius: 12px;
}

/* ─── Toggle button ────────────────────────────────────────────────────────── */
.tarea-filter-bar__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  border-radius: 8px;
  transition: background-color 0.15s;
  width: 100%;
}

.tarea-filter-bar__toggle:hover {
  background-color: var(--color-surface-container-high);
}

.tarea-filter-bar__toggle-icon {
  width: 16px;
  height: 16px;
}

.tarea-filter-bar__toggle-label {
  flex: 1;
  text-align: left;
}

.tarea-filter-bar__toggle-chevron {
  width: 16px;
  height: 16px;
}

/* ─── Chips (active filter indicators — collapsed) ──────────────────────────── */
.tarea-filter-bar__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 0 16px 10px;
}

.tarea-filter-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
}

.tarea-filter-bar__chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: var(--color-primary);
  opacity: 0.7;
  transition: opacity 0.15s;
}

.tarea-filter-bar__chip-remove:hover {
  opacity: 1;
}

.tarea-filter-bar__chip-remove-icon {
  width: 12px;
  height: 12px;
}

.tarea-filter-bar__clear {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-error);
  padding: 3px 6px;
  border-radius: 4px;
  transition: opacity 0.15s;
}

.tarea-filter-bar__clear:hover {
  opacity: 0.75;
}

/* ─── Collapsible content ────────────────────────────────────────────────────── */
.tarea-filter-bar__content {
  padding: 12px 16px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tarea-filter-bar__field {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tarea-filter-bar__field-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-variant);
}

.tarea-filter-bar__date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tarea-filter-bar__date-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--color-outline);
  border-radius: 6px;
  font-size: 0.8125rem;
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  min-width: 0;
}

.tarea-filter-bar__date-separator {
  color: var(--color-outline);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.tarea-filter-bar__select {
  padding: 6px 8px;
  border: 1px solid var(--color-outline);
  border-radius: 6px;
  font-size: 0.8125rem;
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  cursor: pointer;
  width: 100%;
}

.tarea-filter-bar__select:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ─── Actions ───────────────────────────────────────────────────────────────── */
.tarea-filter-bar__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.tarea-filter-bar__clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-error);
  padding: 4px 8px;
  border-radius: 6px;
  transition: opacity 0.15s;
}

.tarea-filter-bar__clear-btn:hover {
  opacity: 0.75;
}

/* ─── Transition ────────────────────────────────────────────────────────────── */
.filter-expand-enter-active,
.filter-expand-leave-active {
  transition:
    max-height 250ms ease,
    opacity 250ms ease;
  overflow: hidden;
  max-height: 400px;
}

.filter-expand-enter-from,
.filter-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
