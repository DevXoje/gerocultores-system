<script setup lang="ts">
/**
 * DashboardView — daily agenda for the logged-in caregiver.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Stitch reference: Caregiver Dashboard
 * Export: OUTPUTS/design-exports/US-03-agenda-home__caregiver-dashboard__20260328.png
 *
 * Architecture (frontend-specialist.md §3):
 *   - Views import ONLY from composables — not stores or repos directly.
 *   - Async logic lives in useAgendaHoy (application/).
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../business/auth/useAuthStore'
import { useAgendaHoy } from '../business/agenda/application/useAgendaHoy'
import TaskCard from '../business/agenda/presentation/components/TaskCard.vue'
import type { EstadoTarea } from '@/services/tareas.api'
import { INCIDENTS_ROUTES } from '../business/incidents/route-names'

// ─── Router ─────────────────────────────────────────────────────────────────
const router = useRouter()

// ─── Auth ───────────────────────────────────────────────────────────────────
const auth = useAuthStore()
const nombreUsuario = auth.user?.displayName ?? auth.user?.email ?? 'Cuidador/a'

function signOut() {
  auth.signOut()
}

// ─── Agenda ────────────────────────────────────────────────────────────────
const { tareas, isLoading, error, cargarTareas, actualizarEstado } = useAgendaHoy()

const toastMsg = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string): void {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMsg.value = null
  }, 4000)
}

/**
 * Adapter: bridges useAgendaHoy's TareaEstado to the new TaskCard's
 * actualizarEstado prop signature (EstadoTarea — structurally identical).
 */
function makeActualizarEstado(
  id: string,
  estado: EstadoTarea,
): Promise<{ success: boolean; errorMsg?: string }> {
  return actualizarEstado(id, estado)
}

function onTaskError(msg: string): void {
  showToast(msg)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onEstadoActualizado(_id: string, _estado: EstadoTarea): void {
  // Future: e.g. analytics, audit log hook (US-04 extension point)
}

// ─── Incidents ───────────────────────────────────────────────────────────────
function onReportIncident(tareaId: string): void {
  router.push({
    name: INCIDENTS_ROUTES.NUEVA_INCIDENCIA.name,
    query: { tareaId },
  })
}

// Today label
const fechaHoy = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

onMounted(() => {
  cargarTareas()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <header class="dashboard-page__header">
      <div class="dashboard-page__header-brand">
        <span class="material-symbols-outlined dashboard-page__logo-icon" aria-hidden="true">
          spa
        </span>
        <span class="dashboard-page__brand-name">Care &amp; Serenity</span>
      </div>
      <div class="dashboard-page__header-user">
        <span class="dashboard-page__user-name">{{ nombreUsuario }}</span>
        <button class="dashboard-page__signout" type="button" @click="signOut">
          Cerrar sesión
        </button>
      </div>
    </header>

    <!-- ─── Main content ────────────────────────────────────────────────── -->
    <main class="dashboard-page__content">
      <!-- Page greeting -->
      <section class="dashboard-page__greeting">
        <h1 class="dashboard-page__title">Buenos días</h1>
        <p class="dashboard-page__fecha">{{ fechaHoy }}</p>
      </section>

      <!-- Agenda section -->
      <section class="dashboard-page__agenda" aria-label="Agenda de hoy">
        <h2 class="dashboard-page__agenda-title">Tareas de hoy</h2>

        <!-- Loading state -->
        <div v-if="isLoading" class="dashboard-page__loading" aria-live="polite" aria-busy="true">
          <span class="dashboard-page__spinner" aria-hidden="true" />
          <span>Cargando tareas...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="dashboard-page__error" role="alert">
          <span class="material-symbols-outlined dashboard-page__error-icon" aria-hidden="true">
            error
          </span>
          <p class="dashboard-page__error-msg">{{ error }}</p>
          <button class="dashboard-page__retry" type="button" @click="cargarTareas()">
            Reintentar
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="tareas.length === 0" class="dashboard-page__empty" aria-live="polite">
          <span class="material-symbols-outlined dashboard-page__empty-icon" aria-hidden="true">
            event_available
          </span>
          <p class="dashboard-page__empty-msg">No hay tareas programadas para hoy.</p>
        </div>

        <!-- Task list — CA-2: updated state reflects immediately via optimistic update -->
        <ul v-else class="dashboard-page__task-list" aria-label="Lista de tareas">
          <li v-for="tarea in tareas" :key="tarea.id" class="dashboard-page__task-item">
            <TaskCard
              :tarea="tarea"
              :actualizar-estado="makeActualizarEstado"
              @error="onTaskError"
              @estado-actualizado="onEstadoActualizado"
              @report-incident="onReportIncident"
            />
          </li>
        </ul>
      </section>
    </main>

    <!-- ─── Toast notification ──────────────────────────────────────────── -->
    <transition name="toast">
      <div v-if="toastMsg" class="dashboard-page__toast" role="alert" aria-live="assertive">
        <span class="material-symbols-outlined dashboard-page__toast-icon" aria-hidden="true">
          error_outline
        </span>
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
@reference "../style.css";

/* ─── Page shell ────────────────────────────────────────────────────────── */
.dashboard-page {
  @apply min-h-screen flex flex-col;
  background-color: var(--color-surface);
}

/* ─── Header ────────────────────────────────────────────────────────────── */
.dashboard-page__header {
  @apply flex items-center justify-between px-6 py-4;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.dashboard-page__header-brand {
  @apply flex items-center gap-2;
}

.dashboard-page__logo-icon {
  font-size: 1.25rem;
  color: var(--color-primary);
  font-variation-settings: 'FILL' 1;
}

.dashboard-page__brand-name {
  @apply text-base font-semibold;
  font-family: var(--font-headline);
  color: var(--color-primary);
}

.dashboard-page__header-user {
  @apply flex items-center gap-4;
}

.dashboard-page__user-name {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.dashboard-page__signout {
  @apply text-xs font-medium cursor-pointer border-none bg-transparent;
  color: var(--color-error);
  transition: opacity 0.15s ease;
}

.dashboard-page__signout:hover {
  opacity: 0.75;
}

/* ─── Main content ──────────────────────────────────────────────────────── */
.dashboard-page__content {
  @apply flex-1 px-6 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full;
}

/* ─── Greeting ──────────────────────────────────────────────────────────── */
.dashboard-page__greeting {
  @apply flex flex-col gap-0.5;
}

.dashboard-page__title {
  @apply text-2xl font-bold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.dashboard-page__fecha {
  @apply text-sm capitalize;
  color: var(--color-on-surface-variant);
}

/* ─── Agenda section ────────────────────────────────────────────────────── */
.dashboard-page__agenda {
  @apply flex flex-col gap-4;
}

.dashboard-page__agenda-title {
  @apply text-base font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

/* ─── Loading ───────────────────────────────────────────────────────────── */
.dashboard-page__loading {
  @apply flex items-center gap-3 py-8 justify-center text-sm;
  color: var(--color-on-surface-variant);
}

.dashboard-page__spinner {
  @apply inline-block h-5 w-5 rounded-full border-2 border-t-transparent;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Error ─────────────────────────────────────────────────────────────── */
.dashboard-page__error {
  @apply flex flex-col items-center gap-3 py-8 text-center;
}

.dashboard-page__error-icon {
  font-size: 2rem;
  color: var(--color-error);
}

.dashboard-page__error-msg {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.dashboard-page__retry {
  @apply rounded-full px-4 py-2 text-sm font-medium cursor-pointer border-none;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  transition: opacity 0.15s ease;
}

.dashboard-page__retry:hover {
  opacity: 0.85;
}

/* ─── Empty state ───────────────────────────────────────────────────────── */
.dashboard-page__empty {
  @apply flex flex-col items-center gap-3 py-12 text-center;
}

.dashboard-page__empty-icon {
  font-size: 3rem;
  color: var(--color-outline-variant);
  font-variation-settings: 'FILL' 1;
}

.dashboard-page__empty-msg {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

/* ─── Task list ─────────────────────────────────────────────────────────── */
.dashboard-page__task-list {
  @apply flex flex-col gap-3 list-none p-0 m-0;
}

.dashboard-page__task-item {
  @apply p-0 m-0;
}

/* ─── Toast ─────────────────────────────────────────────────────────────── */
.dashboard-page__toast {
  @apply fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg z-50;
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
  max-width: calc(100vw - 3rem);
}

.dashboard-page__toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* ─── Toast transition ──────────────────────────────────────────────────── */
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
