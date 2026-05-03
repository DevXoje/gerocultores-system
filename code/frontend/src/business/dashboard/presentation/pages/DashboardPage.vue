<script setup lang="ts">
/**
 * DashboardPage — navigation hub for the logged-in caregiver.
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
 *   - Pages are the owning surface for dashboard composition.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import { TASKS_ROUTES } from '@/views/route-names'
import DashboardWidgetGrid from '@/business/agenda/presentation/components/dashboard/DashboardWidgetGrid.vue'
import TasksSummaryWidget from '@/business/agenda/presentation/components/dashboard/TasksSummaryWidget.vue'
import AlertsPreviewWidget from '@/business/agenda/presentation/components/dashboard/AlertsPreviewWidget.vue'
import RecentResidentsWidget from '@/business/agenda/presentation/components/dashboard/RecentResidentsWidget.vue'
import CreateTareaModal from '@/business/agenda/presentation/components/CreateTareaModal.vue'
import IncidenceFormModal from '@/business/incidents/presentation/components/IncidenceFormModal.vue'
import DashboardSidebar from '@/business/dashboard/presentation/organisms/DashboardSidebar.vue'
import DashboardTopBar from '@/business/dashboard/presentation/organisms/DashboardTopBar.vue'
import { useDashboardPage } from '@/business/dashboard/presentation/composables/useDashboardPage'
import { PlusIcon } from '@heroicons/vue/24/outline'

const {
  fechaHoy,
  formattedDate,
  formattedTime,
  isOnline,
  nombreUsuario,
  showCreateModal,
  showCreateIncidentModal,
  turnoLabel,
  turnoMeta,
  signOut,
  openCreateModal,
  closeCreateModal,
  openIncidenceModal,
  closeIncidenceModal,
} = useDashboardPage()
</script>

<template>
  <div class="dashboard-page">
    <DashboardSidebar
      :user-name="nombreUsuario"
      :is-incidence-open="showCreateIncidentModal"
      @open-incidence="openIncidenceModal"
      @sign-out="signOut"
    />

    <div class="dashboard-page__main">
      <DashboardTopBar
        :formatted-date="formattedDate"
        :formatted-time="formattedTime"
        :turno-label="turnoLabel"
        :turno-meta="turnoMeta"
        :is-online="isOnline"
      />

      <main class="dashboard-page__content">
        <section class="dashboard-page__hero">
          <div class="dashboard-page__hero-copy">
            <p class="dashboard-page__eyebrow">Panel de inicio</p>
            <h2 class="dashboard-page__title">Resumen del día</h2>
            <p class="dashboard-page__fecha">{{ fechaHoy }}</p>
          </div>

          <RouterLink
            :to="{ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name }"
            class="dashboard-page__hero-link"
          >
            Ver residentes
          </RouterLink>
        </section>

        <section class="dashboard-page__grid">
          <div class="dashboard-page__primary-column">
            <DashboardWidgetGrid>
              <TasksSummaryWidget />
              <AlertsPreviewWidget />
              <RecentResidentsWidget />
            </DashboardWidgetGrid>
          </div>

          <aside class="dashboard-page__secondary-column">
            <article class="dashboard-page__quick-actions-card">
              <div class="dashboard-page__quick-actions-header">
                <h3 class="dashboard-page__section-title">Acciones rápidas</h3>
                <p class="dashboard-page__section-copy">Accesos directos operativos</p>
              </div>

              <div class="dashboard-page__quick-actions-grid">
                <RouterLink
                  :to="{ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name }"
                  class="dashboard-page__quick-action"
                >
                  Residentes
                </RouterLink>
                <RouterLink :to="{ name: TASKS_ROUTES.name }" class="dashboard-page__quick-action">
                  Tareas
                </RouterLink>
                <button
                  type="button"
                  class="dashboard-page__quick-action dashboard-page__quick-action-btn"
                  @click="openIncidenceModal"
                >
                  Incidencia
                </button>
              </div>
            </article>
          </aside>
        </section>

        <div class="dashboard-page__fab-container">
          <button
            type="button"
            class="dashboard-page__fab"
            aria-label="Crear nueva tarea"
            @click="openCreateModal"
          >
            <PlusIcon class="dashboard-page__fab-icon" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>

    <CreateTareaModal v-if="showCreateModal" @close="closeCreateModal" />

    <IncidenceFormModal
      v-if="showCreateIncidentModal"
      v-model="showCreateIncidentModal"
      @close="closeIncidenceModal"
    />
  </div>
</template>

<style scoped>
@reference "#/style.css";

.dashboard-page {
  @apply min-h-screen gap-5 p-4;
  background:
    radial-gradient(circle at top left, rgba(244, 196, 72, 0.18), transparent 28%),
    linear-gradient(180deg, #f6f8fc 0%, #eef3fa 100%);
}

.dashboard-page__main {
  @apply flex flex-1 flex-col gap-4;
}

.dashboard-page__content {
  @apply flex flex-1 flex-col gap-5;
}

.dashboard-page__hero {
  @apply flex flex-col gap-4 rounded-[28px] border px-6 py-5;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(222, 229, 242, 0.92);
  box-shadow: 0 18px 40px rgba(215, 223, 240, 0.28);
}

.dashboard-page__hero-copy {
  @apply flex flex-col gap-1;
}

.dashboard-page__eyebrow {
  @apply text-xs font-semibold uppercase tracking-[0.18em];
  color: #6d7690;
}

.dashboard-page__title {
  @apply text-3xl font-semibold;
  color: #1b2437;
}

.dashboard-page__fecha {
  @apply text-sm capitalize;
  color: #6d7690;
}

.dashboard-page__hero-link {
  @apply inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-medium no-underline;
  background-color: #eff5ff;
  color: #2856b3;
}

.dashboard-page__grid {
  @apply grid gap-5;
}

.dashboard-page__primary-column,
.dashboard-page__secondary-column {
  @apply flex flex-col gap-5;
}

.dashboard-page__quick-actions-card {
  @apply flex flex-col gap-4 rounded-[28px] border px-5 py-5;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(222, 229, 242, 0.92);
  box-shadow: 0 18px 40px rgba(215, 223, 240, 0.22);
}

.dashboard-page__quick-actions-header {
  @apply flex flex-col gap-1;
}

.dashboard-page__section-title {
  @apply text-lg font-semibold;
  color: #1b2437;
}

.dashboard-page__section-copy {
  @apply text-sm;
  color: #6d7690;
}

.dashboard-page__quick-actions-grid {
  @apply grid grid-cols-1 gap-3;
}

.dashboard-page__fab-container {
  @apply flex justify-end pt-2;
}

.dashboard-page__quick-action {
  @apply rounded-2xl border px-4 py-4 text-sm font-medium no-underline;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border-color: rgba(219, 227, 243, 0.94);
  color: #33405c;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.dashboard-page__quick-action:hover {
  border-color: rgba(94, 133, 243, 0.55);
  box-shadow: 0 12px 24px rgba(213, 222, 241, 0.28);
  transform: translateY(-1px);
}

.dashboard-page__quick-action-btn {
  @apply cursor-pointer text-left;
}

.dashboard-page__fab {
  @apply flex h-14 w-14 items-center justify-center rounded-full cursor-pointer border-none;
  background-color: #dfe9ff;
  color: #10254c;
  box-shadow: 0 18px 28px rgba(73, 119, 255, 0.34);
  transition: opacity 0.15s ease;
}

.dashboard-page__fab:hover {
  opacity: 0.85;
}

.dashboard-page__fab-icon {
  @apply w-5 h-5;
}

@media (min-width: 900px) {
  .dashboard-page {
    @apply grid min-h-screen;
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .dashboard-page__grid {
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.8fr);
  }

  .dashboard-page__hero {
    @apply flex-row items-center justify-between;
  }
}
</style>
