<script setup lang="ts">
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import { TASKS_ROUTES } from '@/views/route-names'
import {
  BoltIcon,
  BugAntIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  (e: 'open-incidence'): void
  (e: 'open-create-task'): void
}>()
</script>

<template>
  <article class="dashboard-quick-actions">
    <div class="dashboard-quick-actions__header">
      <BoltIcon class="dashboard-quick-actions__header-icon" />
      <h3 class="dashboard-quick-actions__title">Acciones rápidas</h3>
    </div>

    <div class="dashboard-quick-actions__grid">
      <!-- Registrar incidencia (Red) -->
      <button
        type="button"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--red"
        @click="emit('open-incidence')"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <BugAntIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Registrar<br />incidencia</span>
      </button>

      <!-- Añadir observación (Blue) -->
      <button
        type="button"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--blue"
        @click="emit('open-create-task')"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <PencilSquareIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Añadir<br />observación</span>
      </button>

      <!-- Registrar actividad (Green) -->
      <button
        type="button"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--green"
        @click="emit('open-create-task')"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <ClipboardDocumentCheckIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Registrar<br />actividad</span>
      </button>

      <!-- Ver calendario (Purple) -->
      <RouterLink
        :to="{ name: TASKS_ROUTES.name }"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--purple"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <CalendarIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Ver<br />calendario</span>
      </RouterLink>

      <!-- Ver residentes (Cyan) -->
      <RouterLink
        :to="{ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name }"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--cyan"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <UsersIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Ver<br />residentes</span>
      </RouterLink>

      <!-- Mensajes equipo (Orange) -->
      <button
        type="button"
        class="dashboard-quick-actions__action dashboard-quick-actions__action--orange"
        @click="() => alert('Mensajes de equipo en desarrollo')"
      >
        <div class="dashboard-quick-actions__icon-wrapper">
          <ChatBubbleLeftRightIcon class="dashboard-quick-actions__icon" />
        </div>
        <span class="dashboard-quick-actions__label">Mensajes<br />equipo</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
@reference "#/style.css";

.dashboard-quick-actions {
  @apply flex flex-col gap-4 rounded-[28px] border px-5 py-5;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(222, 229, 242, 0.92);
  box-shadow: 0 18px 40px rgba(215, 223, 240, 0.22);
}

.dashboard-quick-actions__header {
  @apply flex items-center gap-2 mb-1;
}

.dashboard-quick-actions__header-icon {
  @apply h-5 w-5;
  color: #1b2437;
}

.dashboard-quick-actions__title {
  @apply text-lg font-semibold;
  color: #1b2437;
}

.dashboard-quick-actions__grid {
  @apply grid grid-cols-2 gap-3 sm:grid-cols-3;
}

.dashboard-quick-actions__action {
  @apply flex flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center cursor-pointer no-underline border border-transparent transition-all;
}

.dashboard-quick-actions__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.dashboard-quick-actions__icon-wrapper {
  @apply flex h-10 w-10 items-center justify-center;
}

.dashboard-quick-actions__icon {
  @apply h-6 w-6;
}

.dashboard-quick-actions__label {
  @apply text-sm font-medium leading-snug;
  color: #1b2437;
}

/* Colors matching the image */

/* Red - Registrar incidencia */
.dashboard-quick-actions__action--red {
  background-color: #fff4f4;
}
.dashboard-quick-actions__action--red .dashboard-quick-actions__icon-wrapper {
  color: #e53e3e;
}

/* Blue - Añadir observación */
.dashboard-quick-actions__action--blue {
  background-color: #f3f7ff;
}
.dashboard-quick-actions__action--blue .dashboard-quick-actions__icon-wrapper {
  color: #3182ce;
}

/* Green - Registrar actividad */
.dashboard-quick-actions__action--green {
  background-color: #f3fdf5;
}
.dashboard-quick-actions__action--green .dashboard-quick-actions__icon-wrapper {
  color: #38a169;
}

/* Purple - Ver calendario */
.dashboard-quick-actions__action--purple {
  background-color: #f8f4ff;
}
.dashboard-quick-actions__action--purple .dashboard-quick-actions__icon-wrapper {
  color: #805ad5;
}

/* Cyan - Ver residentes */
.dashboard-quick-actions__action--cyan {
  background-color: #f0fbff;
}
.dashboard-quick-actions__action--cyan .dashboard-quick-actions__icon-wrapper {
  color: #00b5d8;
}

/* Orange - Mensajes equipo */
.dashboard-quick-actions__action--orange {
  background-color: #fffaf0;
}
.dashboard-quick-actions__action--orange .dashboard-quick-actions__icon-wrapper {
  color: #dd6b20;
}
</style>
