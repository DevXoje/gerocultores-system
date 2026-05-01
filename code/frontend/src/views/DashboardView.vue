<script setup lang="ts">
/**
 * DashboardView — navigation hub for the logged-in caregiver.
 *
 * US-03: Dashboard hub (widgets + "Ver todas")
 * US-08: Alerts preview
 * US-09: Residents preview
 * US-14: Quick task creation via FAB
 *
 * Stitch reference: Caregiver Dashboard
 * Export: OUTPUTS/design-exports/US-03-agenda-home__caregiver-dashboard__20260328.png
 *
 * Architecture (frontend-specialist.md §3):
 *   - Views import ONLY from composables — not stores or repos directly.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import DashboardWidgetGrid from '@/business/agenda/presentation/components/dashboard/DashboardWidgetGrid.vue'
import TasksSummaryWidget from '@/business/agenda/presentation/components/dashboard/TasksSummaryWidget.vue'
import AlertsPreviewWidget from '@/business/agenda/presentation/components/dashboard/AlertsPreviewWidget.vue'
import RecentResidentsWidget from '@/business/agenda/presentation/components/dashboard/RecentResidentsWidget.vue'
import CreateTareaModal from '@/business/agenda/presentation/components/CreateTareaModal.vue'
import { SparklesIcon, PlusIcon } from '@heroicons/vue/24/outline'

// ─── Router ─────────────────────────────────────────────────────────────────
const router = useRouter()

// ─── Auth ───────────────────────────────────────────────────────────────────
const auth = useAuthStore()
const nombreUsuario = auth.user?.displayName ?? auth.user?.email ?? 'Cuidador/a'

function signOut() {
  auth.signOut()
  router.push({ name: AUTH_ROUTES.LOGIN.name })
}

// ─── Modal ─────────────────────────────────────────────────────────────────
const showCreateModal = ref(false)

function handleOpenCreateModal(): void {
  showCreateModal.value = true
}

function handleCloseCreateModal(): void {
  showCreateModal.value = false
}

// ─── Date ───────────────────────────────────────────────────────────────────
const fechaHoy = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
</script>

<template>
  <div class="dashboard-page">
    <!-- ─── Header ──────────────────────────────────────────────────────── -->
    <header class="dashboard-page__header">
      <div class="dashboard-page__header-brand">
        <SparklesIcon class="dashboard-page__logo-icon" aria-hidden="true" />
        <span class="dashboard-page__brand-name">Care &amp; Serenity</span>
      </div>
      <div class="dashboard-page__header-user">
        <span class="dashboard-page__user-name">{{ nombreUsuario }}</span>
        <button class="dashboard-page__signout" type="button" @click="signOut">
          Cerrar sesión
        </button>
      </div>
    </header>

    <!-- ─── Quick-nav ─────────────────────────────────────────────────────── -->
    <nav class="dashboard-page__quick-nav" aria-label="Navegación rápida">
      <RouterLink
        :to="{ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name }"
        class="dashboard-page__quick-link"
      >
        Residentes
      </RouterLink>
    </nav>

    <!-- ─── Main content ────────────────────────────────────────────────── -->
    <main class="dashboard-page__content">
      <!-- Page greeting -->
      <section class="dashboard-page__greeting">
        <h1 class="dashboard-page__title">Buenos días</h1>
        <p class="dashboard-page__fecha">{{ fechaHoy }}</p>
      </section>

      <!-- Widget grid — Phase 5 -->
      <DashboardWidgetGrid>
        <TasksSummaryWidget />
        <AlertsPreviewWidget />
        <RecentResidentsWidget />
      </DashboardWidgetGrid>

      <!-- FAB: create new task (US-14) -->
      <div class="dashboard-page__fab-container">
        <button
          type="button"
          class="dashboard-page__fab"
          aria-label="Crear nueva tarea"
          @click="handleOpenCreateModal"
        >
          <PlusIcon class="dashboard-page__fab-icon" aria-hidden="true" />
        </button>
      </div>
    </main>

    <!-- ─── Create Tarea Modal (US-14) ───────────────────────────────────── -->
    <CreateTareaModal v-if="showCreateModal" @close="handleCloseCreateModal" />
  </div>
</template>

<style scoped>
@reference "#/style.css";

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
  @apply w-5 h-5;
  color: var(--color-primary);
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

/* ─── Quick nav ────────────────────────────────────────────────────────── */
.dashboard-page__quick-nav {
  @apply flex items-center gap-0.5 px-6 py-2;
  background-color: var(--color-surface-container-low);
  border-bottom: 1px solid var(--color-outline-variant);
}

.dashboard-page__quick-link {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium no-underline;
  color: var(--color-on-surface-variant);
  transition:
    background-color 0.15s,
    color 0.15s;
}

.dashboard-page__quick-link:hover {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
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

/* ─── FAB (create tarea — US-14) ─────────────────────────────────────────── */
.dashboard-page__fab-container {
  @apply flex justify-end;
}

.dashboard-page__fab {
  @apply w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: opacity 0.15s ease;
}

.dashboard-page__fab:hover {
  opacity: 0.85;
}

.dashboard-page__fab-icon {
  @apply w-5 h-5;
}
</style>
