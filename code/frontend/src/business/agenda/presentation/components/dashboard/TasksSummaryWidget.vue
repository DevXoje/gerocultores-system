<script setup lang="ts">
/**
 * TasksSummaryWidget — card with today's task count + "Ver todas" link.
 *
 * Phase 5 task 5.2
 * Uses useAgendaHoy().tareas.length
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgendaHoy } from '@/business/agenda/application/useAgendaHoy'
import { TASKS_ROUTES } from '@/views/route-names'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { tareas, isLoading, cargarTareas } = useAgendaHoy()

onMounted(() => {
  cargarTareas()
})

function handleVerTodas(): void {
  router.push(TASKS_ROUTES.all)
}
</script>

<template>
  <article class="tasks-widget">
    <header class="tasks-widget__header">
      <CalendarDaysIcon class="tasks-widget__icon" aria-hidden="true" />
      <h3 class="tasks-widget__title">Tareas de hoy</h3>
    </header>

    <div class="tasks-widget__body">
      <p v-if="isLoading" class="tasks-widget__status">Cargando...</p>
      <p v-else-if="tareas.length === 0" class="tasks-widget__status tasks-widget__status--empty">
        No hay tareas para hoy
      </p>
      <p v-else class="tasks-widget__count">
        <span class="tasks-widget__count-number">{{ tareas.length }}</span>
        <span class="tasks-widget__count-label">
          {{ tareas.length === 1 ? 'tarea' : 'tareas' }} pendiente{{
            tareas.length === 1 ? '' : 's'
          }}
        </span>
      </p>
    </div>

    <footer class="tasks-widget__footer">
      <button type="button" class="tasks-widget__link" @click="handleVerTodas">Ver todas</button>
    </footer>
  </article>
</template>

<style scoped>
@reference "#/style.css";

.tasks-widget {
  @apply flex flex-col gap-3 p-5 rounded-2xl;
  background-color: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
}

.tasks-widget__header {
  @apply flex items-center gap-2;
}

.tasks-widget__icon {
  @apply w-5 h-5;
  color: var(--color-primary);
  flex-shrink: 0;
}

.tasks-widget__title {
  @apply text-sm font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.tasks-widget__body {
  @apply flex flex-col gap-1;
}

.tasks-widget__status {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.tasks-widget__status--empty {
  @apply italic;
}

.tasks-widget__count {
  @apply flex items-baseline gap-2;
}

.tasks-widget__count-number {
  @apply text-3xl font-bold;
  font-family: var(--font-headline);
  color: var(--color-primary);
}

.tasks-widget__count-label {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.tasks-widget__footer {
  @apply mt-auto pt-2;
}

.tasks-widget__link {
  @apply text-sm font-medium cursor-pointer border-none bg-transparent;
  color: var(--color-primary);
  transition: opacity 0.15s ease;
}

.tasks-widget__link:hover {
  opacity: 0.75;
}
</style>
