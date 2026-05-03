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
import { ref } from 'vue'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import DashboardWidgetGrid from '@/business/agenda/presentation/components/dashboard/DashboardWidgetGrid.vue'
import TasksSummaryWidget from '@/business/agenda/presentation/components/dashboard/TasksSummaryWidget.vue'
import AlertsPreviewWidget from '@/business/agenda/presentation/components/dashboard/AlertsPreviewWidget.vue'
import RecentResidentsWidget from '@/business/agenda/presentation/components/dashboard/RecentResidentsWidget.vue'
import CreateTareaModal from '@/business/agenda/presentation/components/CreateTareaModal.vue'
import DashboardTopBar from '@/business/dashboard/presentation/organisms/DashboardTopBar.vue'
import DashboardQuickActions from '@/business/dashboard/presentation/organisms/DashboardQuickActions.vue'
import FloatingDial from '@/ui/atoms/FloatingDial.vue'
import ResidenteFormModal from '@/business/residents/presentation/UI/molecules/dialogs/ResidenteFormModal.vue'
import { useDashboardPage } from '@/business/dashboard/presentation/composables/useDashboardPage'

const isDialOpen = ref(false)

const {
  fechaHoy,
  formattedDate,
  formattedTime,
  isOnline,
  showCreateModal,
  showCreateResidenteModal,
  turnoLabel,
  turnoMeta,
  openCreateModal,
  closeCreateModal,
  openResidenteModal,
  closeResidenteModal,
} = useDashboardPage()
</script>

<template>
  <div class="dashboard-page">
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
          <DashboardQuickActions
            @open-incidence="openIncidenceModal"
            @open-create-task="openCreateModal"
          />
        </aside>
      </section>

      <div class="dashboard-page__fab-container">
        <FloatingDial
          v-model="isDialOpen"
          @create-task="openCreateModal"
          @create-incident="openIncidenceModal"
          @create-resident="openResidenteModal"
        />
      </div>
    </main>

    <CreateTareaModal v-if="showCreateModal" @close="closeCreateModal" />

    <ResidenteFormModal
      v-if="showCreateResidenteModal"
      v-model="showCreateResidenteModal"
      @saved="closeResidenteModal"
    />
  </div>
</template>

<style scoped>
@reference "#/style.css";

.dashboard-page {
  @apply flex min-h-screen flex-col gap-4 p-3;
  background:
    radial-gradient(circle at top left, rgba(244, 196, 72, 0.18), transparent 28%),
    linear-gradient(180deg, #f6f8fc 0%, #eef3fa 100%);
}

.dashboard-page__content {
  @apply flex flex-1 flex-col gap-4;
}

.dashboard-page__hero {
  @apply flex flex-col gap-3 rounded-3xl border px-5 py-4;
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
  @apply text-2xl font-semibold;
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
  @apply grid gap-4;
}

.dashboard-page__primary-column {
  @apply flex flex-col gap-4;
}

.dashboard-page__secondary-column {
  @apply hidden md:flex flex-col gap-4;
}

.dashboard-page__fab-container {
  @apply hidden md:flex justify-end pt-2;
}

@media (min-width: 640px) {
  .dashboard-page {
    @apply p-4;
  }
}

@media (min-width: 900px) {
  .dashboard-page__grid {
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.8fr);
  }

  .dashboard-page__hero {
    @apply flex-row items-center justify-between rounded-[28px] px-6 py-5;
  }

  .dashboard-page__title {
    @apply text-3xl;
  }
}
</style>
