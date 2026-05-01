<script setup lang="ts">
/**
 * TasksView — full calendar view for all tasks with day/week/month views.
 *
 * US-03: Consulta de agenda diaria
 * US-12: Vista de agenda semanal
 *
 * Stitch reference: projects/16168255182252500555/screens/c4df0dcfc4114cb29deb834b50647f00
 * (Tasks Calendar View)
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in presentation/views/
 *   - Lazy-loaded route (see router/routes.ts)
 *   - Reads state via composables only — no store imports in views
 *   - BEM class names; Tailwind via @apply in <style scoped>
 */
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core'
import type { TareaResponse } from '@/business/agenda/domain/entities/tarea.types'
import { useAllTareas } from '@/business/agenda/application/useAllTareas'
import { useTareaFilters } from '@/business/agenda/presentation/composables/useTareaFilters'
import { tareaToCalendarEvent } from '@/business/agenda/presentation/utils/tareaToCalendarEvent'
import TareaFilterBar from '@/business/agenda/presentation/components/TareaFilterBar.vue'
import TaskDetailPanel from '@/business/agenda/presentation/components/TaskDetailPanel.vue'
import { TASKS_ROUTES } from '@/views/route-names'
import { SparklesIcon } from '@heroicons/vue/24/outline'

// ─── Composable state ─────────────────────────────────────────────────────────

const { isLoading, error, cargarTodas } = useAllTareas()
const { filters, filteredAllTareas } = useTareaFilters()

// ─── Filter bar state ──────────────────────────────────────────────────────────

const filterBarOpen = ref(false)

// ─── Detail panel state ────────────────────────────────────────────────────────

const selectedTarea = ref<TareaResponse | null>(null)
const detailPanelOpen = ref(false)

// ─── Calendar events (derived from filtered tareas) ────────────────────────────

const calendarEvents = computed(() => filteredAllTareas.value.map(tareaToCalendarEvent))

// ─── Calendar options ──────────────────────────────────────────────────────────

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
  },
  events: calendarEvents.value,
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',
  eventClick: handleEventClick,
  eventsSet: () => {
    // No-op — events come from reactive computed
  },
}))

// ─── Event handlers (G11 — named functions) ────────────────────────────────────

function handleEventClick(info: EventClickArg): void {
  const tarea = info.event.extendedProps.tarea as TareaResponse
  selectedTarea.value = tarea
  detailPanelOpen.value = true
}

function handleCloseDetailPanel(): void {
  detailPanelOpen.value = false
  selectedTarea.value = null
}

function handleEstadoChanged(): void {
  // Refetch all tasks to ensure consistency after state change
  cargarTodas()
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

onMounted(() => {
  cargarTodas()
})
</script>

<template>
  <div class="tasks-view">
    <!-- ─── Header ───────────────────────────────────────────────────────── -->
    <header class="tasks-view__header">
      <div class="tasks-view__header-brand">
        <SparklesIcon class="tasks-view__logo-icon" aria-hidden="true" />
        <h1 class="tasks-view__title">Agenda Completa</h1>
      </div>
      <RouterLink
        :to="{ name: TASKS_ROUTES.name }"
        class="tasks-view__back"
        aria-label="Volver al dashboard"
      >
        Dashboard
      </RouterLink>
    </header>

    <!-- ─── Filter bar ────────────────────────────────────────────────────── -->
    <TareaFilterBar v-model="filters" :open="filterBarOpen" @update:open="filterBarOpen = $event" />

    <!-- ─── Loading state ─────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="tasks-view__loading" aria-live="polite" aria-busy="true">
      <div class="tasks-view__spinner" aria-label="Cargando tareas..." />
      <p class="tasks-view__loading-text">Cargando tareas...</p>
    </div>

    <!-- ─── Error state ─────────────────────────────────────────────────── -->
    <div v-else-if="error" class="tasks-view__error" role="alert">
      <p class="tasks-view__error-text">{{ error }}</p>
      <button type="button" class="tasks-view__retry-btn" @click="cargarTodas">Reintentar</button>
    </div>

    <!-- ─── Empty state ─────────────────────────────────────────────────── -->
    <div v-else-if="filteredAllTareas.length === 0" class="tasks-view__empty" aria-live="polite">
      <p class="tasks-view__empty-text">No hay tareas programadas</p>
    </div>

    <!-- ─── Calendar ────────────────────────────────────────────────────── -->
    <main v-else class="tasks-view__calendar-container">
      <FullCalendar :options="calendarOptions" />
    </main>

    <!-- ─── Task Detail Panel ──────────────────────────────────────────── -->
    <TaskDetailPanel
      v-if="selectedTarea"
      :tarea="selectedTarea"
      :open="detailPanelOpen"
      @close="handleCloseDetailPanel"
      @estado-changed="handleEstadoChanged"
    />
  </div>
</template>

<style scoped>
@reference "#/style.css";

/* ─── Page shell ──────────────────────────────────────────────────────────── */
.tasks-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
}

/* ─── Header ────────────────────────────────────────────────────────────── */
.tasks-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: var(--color-surface-container-lowest);
  border-bottom: 1px solid var(--color-outline-variant);
}

.tasks-view__header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tasks-view__logo-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
}

.tasks-view__title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
  margin: 0;
}

.tasks-view__back {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.tasks-view__back:hover {
  background-color: var(--color-surface-container-high);
}

/* ─── Calendar container ────────────────────────────────────────────────── */
.tasks-view__calendar-container {
  flex: 1;
  padding: 16px;
}

/* FullCalendar overrides */
.tasks-view__calendar-container :deep(.fc) {
  font-family: var(--font-body);
}

.tasks-view__calendar-container :deep(.fc-toolbar-title) {
  font-family: var(--font-headline);
  font-size: 1.25rem !important;
  font-weight: 600;
  color: var(--color-on-surface);
}

.tasks-view__calendar-container :deep(.fc-button) {
  background-color: var(--color-surface-container-high) !important;
  border-color: var(--color-outline) !important;
  color: var(--color-on-surface) !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

.tasks-view__calendar-container :deep(.fc-button:hover) {
  background-color: var(--color-surface-container-low) !important;
}

.tasks-view__calendar-container :deep(.fc-button-active),
.tasks-view__calendar-container :deep(.fc-button-primary:not(:disabled).fc-button-active) {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-on-primary) !important;
}

.tasks-view__calendar-container :deep(.fc-today-button) {
  background-color: transparent !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.tasks-view__calendar-container :deep(.fc-daygrid-day-number),
.tasks-view__calendar-container :deep(.fc-col-header-cell-cushion) {
  font-size: 0.8125rem;
  color: var(--color-on-surface);
}

.tasks-view__calendar-container :deep(.fc-event) {
  border-radius: 4px !important;
  border-left-width: 3px !important;
  cursor: pointer;
  font-size: 0.75rem;
}

.tasks-view__calendar-container :deep(.fc-event--pendiente) {
  border-left-color: var(--color-outline) !important;
  background-color: var(--color-surface-container-low) !important;
  color: var(--color-on-surface) !important;
}

.tasks-view__calendar-container :deep(.fc-event--en-curso) {
  border-left-color: var(--color-primary) !important;
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent) !important;
  color: var(--color-primary) !important;
}

.tasks-view__calendar-container :deep(.fc-event--completada) {
  border-left-color: #16a34a !important;
  background-color: #dcfce7 !important;
  color: #15803d !important;
}

.tasks-view__calendar-container :deep(.fc-event--con-incidencia) {
  border-left-color: var(--color-error) !important;
  background-color: var(--color-error-container) !important;
  color: var(--color-on-error-container) !important;
}

.tasks-view__calendar-container :deep(.fc-daygrid-day.fc-day-today) {
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent) !important;
}

.tasks-view__calendar-container :deep(.fc-scrollgrid) {
  border-color: var(--color-outline-variant) !important;
}

.tasks-view__calendar-container :deep(td),
.tasks-view__calendar-container :deep(th) {
  border-color: var(--color-outline-variant) !important;
}

/* ─── Loading ────────────────────────────────────────────────────────────── */
.tasks-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.tasks-view__spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--color-outline-variant);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

.tasks-view__loading-text {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Error ──────────────────────────────────────────────────────────────── */
.tasks-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
}

.tasks-view__error-text {
  font-size: 0.875rem;
  color: var(--color-error);
  margin: 0;
  text-align: center;
}

.tasks-view__retry-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.tasks-view__retry-btn:hover {
  opacity: 0.85;
}

/* ─── Empty ─────────────────────────────────────────────────────────────── */
.tasks-view__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.tasks-view__empty-text {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  margin: 0;
}
</style>
