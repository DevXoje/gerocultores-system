<script setup lang="ts">
/**
 * TasksSummaryWidget — mini panel del turno con listado y tabs.
 *
 * US-03: Consulta de agenda diaria
 * US-11: Resumen de fin de turno (vista preliminar en dashboard)
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TASKS_ROUTES } from '@/views/route-names'
import { useAgendaHoy } from '@/business/agenda/application/useAgendaHoy'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import type {
  TareaResponse,
  TareaEstado,
  TareaTipo,
} from '@/business/agenda/domain/entities/tarea.types'
import {
  ListBulletIcon,
  EllipsisVerticalIcon,
  BeakerIcon,
  HeartIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { tareas, isLoading: isLoadingTareas, cargarTareas } = useAgendaHoy()
const { residentes, fetchResidentes } = useResidents()

type TabOption = 'todas' | 'pendientes' | 'completadas'
const activeTab = ref<TabOption>('todas')

onMounted(async () => {
  await Promise.all([cargarTareas(), fetchResidentes('active')])
})

// ─── Computed data ────────────────────────────────────────────────────────
const pendientes = computed(() =>
  tareas.value.filter((t) => t.estado === 'pendiente' || t.estado === 'en_curso')
)
const completadas = computed(() => tareas.value.filter((t) => t.estado === 'completada'))

const visibleTareas = computed(() => {
  let list: TareaResponse[] = []
  if (activeTab.value === 'todas') list = tareas.value
  else if (activeTab.value === 'pendientes') list = pendientes.value
  else if (activeTab.value === 'completadas') list = completadas.value

  // Solo mostramos un preview de hasta 5 tareas para no desbordar el widget
  return list.slice(0, 5)
})

// ─── Formatting helpers ───────────────────────────────────────────────────
function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

function getResidentInfo(residenteId: string): string {
  const r = residentes.value.find((res) => res.id === residenteId)
  if (!r) return 'Residente...'
  return `${r.nombre} ${r.apellidos} (${r.habitacion})`
}

function getIcon(tipo: TareaTipo) {
  const icons: Record<TareaTipo, typeof BeakerIcon> = {
    higiene: BeakerIcon,
    medicacion: HeartIcon,
    alimentacion: BoltIcon,
    actividad: UserIcon,
    revision: ClipboardDocumentCheckIcon,
    otro: ClipboardDocumentCheckIcon,
  }
  return icons[tipo] || ClipboardDocumentCheckIcon
}

function formatEstado(estado: TareaEstado): string {
  const labels: Record<TareaEstado, string> = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    completada: 'Completada',
    con_incidencia: 'Incidencia',
  }
  return labels[estado] || estado
}

function handleVerTodas(): void {
  router.push(TASKS_ROUTES.all)
}
</script>

<template>
  <article class="tasks-widget">
    <header class="tasks-widget__header">
      <ListBulletIcon class="tasks-widget__header-icon" aria-hidden="true" />
      <h3 class="tasks-widget__title">Tareas del turno</h3>
    </header>

    <nav class="tasks-widget__tabs">
      <button
        class="tasks-widget__tab"
        :class="{ 'tasks-widget__tab--active': activeTab === 'todas' }"
        @click="activeTab = 'todas'"
      >
        Todas <span class="tasks-widget__badge">{{ tareas.length }}</span>
      </button>
      <button
        class="tasks-widget__tab"
        :class="{ 'tasks-widget__tab--active': activeTab === 'pendientes' }"
        @click="activeTab = 'pendientes'"
      >
        Pendientes <span class="tasks-widget__badge">{{ pendientes.length }}</span>
      </button>
      <button
        class="tasks-widget__tab"
        :class="{ 'tasks-widget__tab--active': activeTab === 'completadas' }"
        @click="activeTab = 'completadas'"
      >
        Completadas <span class="tasks-widget__badge">{{ completadas.length }}</span>
      </button>
    </nav>

    <div class="tasks-widget__body">
      <div v-if="isLoadingTareas" class="tasks-widget__empty">Cargando tareas...</div>
      <div v-else-if="tareas.length === 0" class="tasks-widget__empty">
        No hay tareas programadas.
      </div>
      <div v-else-if="visibleTareas.length === 0" class="tasks-widget__empty">
        No hay tareas en esta categoría.
      </div>

      <ul v-else class="tasks-widget__list">
        <li v-for="tarea in visibleTareas" :key="tarea.id" class="task-item">
          <time class="task-item__time">{{ formatTime(tarea.fechaHora) }}</time>

          <div class="task-item__icon-wrapper" :class="`task-item__icon-wrapper--${tarea.tipo}`">
            <component :is="getIcon(tarea.tipo)" class="task-item__icon" />
          </div>

          <div class="task-item__content">
            <p class="task-item__title">{{ tarea.titulo }}</p>
            <p class="task-item__resident">{{ getResidentInfo(tarea.residenteId) }}</p>
          </div>

          <span class="task-item__status-badge" :class="`task-item__status-badge--${tarea.estado}`">
            {{ formatEstado(tarea.estado) }}
          </span>

          <button class="task-item__options-btn" aria-label="Opciones" @click="handleVerTodas">
            <EllipsisVerticalIcon class="w-5 h-5" />
          </button>
        </li>
      </ul>
    </div>

    <footer class="tasks-widget__footer">
      <button type="button" class="tasks-widget__link" @click="handleVerTodas">
        Ver todas las tareas
      </button>
    </footer>
  </article>
</template>

<style scoped>
@reference "#/style.css";

.tasks-widget {
  @apply flex flex-col rounded-2xl bg-white h-full;
  border: 1px solid rgba(222, 229, 242, 0.92);
  box-shadow: 0 4px 12px rgba(215, 223, 240, 0.2);
  overflow: hidden;
}

/* ─── Header ────────────────────────────────────────────────────────────── */
.tasks-widget__header {
  @apply flex items-center gap-2 p-4 pb-3 border-b border-gray-100;
}

.tasks-widget__header-icon {
  @apply w-5 h-5;
  color: #1b2437;
}

.tasks-widget__title {
  @apply text-base font-semibold;
  color: #1b2437;
}

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
.tasks-widget__tabs {
  @apply flex items-center px-4 pt-2 border-b border-gray-100 gap-4;
}

.tasks-widget__tab {
  @apply flex items-center gap-2 pb-2 text-sm font-medium border-b-2 cursor-pointer bg-transparent transition-colors;
  color: #6d7690;
  border-color: transparent;
}

.tasks-widget__tab:hover {
  color: #1b2437;
}

.tasks-widget__tab--active {
  color: #2856b3;
  border-color: #2856b3;
}

.tasks-widget__badge {
  @apply inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold;
  background-color: #f1f5f9;
  color: #64748b;
}

.tasks-widget__tab--active .tasks-widget__badge {
  background-color: #eff5ff;
  color: #2856b3;
}

/* ─── Body & Empty states ───────────────────────────────────────────────── */
.tasks-widget__body {
  @apply flex flex-col;
}

.tasks-widget__empty {
  @apply p-6 text-center text-sm italic;
  color: #6d7690;
}

.tasks-widget__list {
  @apply flex flex-col p-0 m-0 list-none;
}

/* ─── Task Item ─────────────────────────────────────────────────────────── */
.task-item {
  @apply flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors;
}

.task-item:last-child {
  @apply border-b-0;
}

.task-item:hover {
  @apply bg-gray-50;
}

.task-item__time {
  @apply text-sm font-medium w-12 text-gray-700;
}

.task-item__icon-wrapper {
  @apply flex items-center justify-center w-8 h-8 rounded-lg;
}

.task-item__icon {
  @apply w-4 h-4;
}

/* Colors for icon wrapper by task type */
.task-item__icon-wrapper--higiene {
  @apply bg-blue-50 text-blue-600;
}
.task-item__icon-wrapper--medicacion {
  @apply bg-indigo-50 text-indigo-600;
}
.task-item__icon-wrapper--alimentacion {
  @apply bg-green-50 text-green-600;
}
.task-item__icon-wrapper--actividad {
  @apply bg-purple-50 text-purple-600;
}
.task-item__icon-wrapper--revision,
.task-item__icon-wrapper--otro {
  @apply bg-gray-100 text-gray-600;
}

.task-item__content {
  @apply flex flex-col flex-1 min-w-0;
}

.task-item__title {
  @apply text-sm font-medium truncate;
  color: #1b2437;
}

.task-item__resident {
  @apply text-xs truncate;
  color: #6d7690;
}

/* ─── Status Badge ──────────────────────────────────────────────────────── */
.task-item__status-badge {
  @apply px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap;
}

.task-item__status-badge--pendiente {
  @apply bg-orange-50 text-orange-600;
}

.task-item__status-badge--en_curso {
  @apply bg-blue-50 text-blue-600;
}

.task-item__status-badge--completada {
  @apply bg-green-50 text-green-600;
}

.task-item__status-badge--con_incidencia {
  @apply bg-red-50 text-red-600;
}

.task-item__options-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer border-none bg-transparent;
}

/* ─── Footer ────────────────────────────────────────────────────────────── */
.tasks-widget__footer {
  @apply flex items-center justify-center p-4 pt-2 mt-auto;
}

.tasks-widget__link {
  @apply text-sm font-semibold cursor-pointer border-none bg-transparent;
  color: #2856b3;
}

.tasks-widget__link:hover {
  text-decoration: underline;
}
</style>
