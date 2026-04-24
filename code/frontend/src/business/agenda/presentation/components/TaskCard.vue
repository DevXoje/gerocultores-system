<script setup lang="ts">
/**
 * TaskCard — displays a single task with status badge and status-change actions.
 *
 * US-04: Actualizar estado de una tarea
 *
 * Stitch reference: projects/16168255182252500555/screens/fd70b595b29344339f770edc74f2d285
 * Export: OUTPUTS/design-exports/US-04-task-detail__task-detail-medication-round__20260328.png
 *
 * Architecture (frontend-specialist.md §3):
 *   - Component lives in presentation/components/
 *   - All async logic via useTaskCard composable — no direct API calls
 *   - BEM class names, Tailwind via @apply in <style scoped>
 */
import { computed } from 'vue'
import { useTaskCard } from '../composables/useTaskCard'
import type { TareaDTO, EstadoTarea } from '@/services/tareas.api'

// ─── Props ─────────────────────────────────────────────────────────────────

const props = defineProps<{
  tarea: TareaDTO
  actualizarEstado: (
    id: string,
    estado: EstadoTarea,
  ) => Promise<{ success: boolean; errorMsg?: string }>
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
  (e: 'estado-actualizado', id: string, estado: EstadoTarea): void
}>()

// ─── Composable ─────────────────────────────────────────────────────────────

const { isUpdating, cambiarEstado } = useTaskCard({
  tareaId: props.tarea.id,
  actualizarEstado: props.actualizarEstado,
  onError: (msg) => emit('error', msg),
})

// ─── Derived data ────────────────────────────────────────────────────────────

const horaFormateada = computed(() => {
  try {
    return new Date(props.tarea.fechaHora).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return props.tarea.fechaHora
  }
})

type EstadoInfo = {
  label: string
  modifier: string
  icon: string
}

const estadoInfo = computed<EstadoInfo>(() => {
  const map: Record<EstadoTarea, EstadoInfo> = {
    pendiente: { label: 'Pendiente', modifier: 'pendiente', icon: 'schedule' },
    en_curso: { label: 'En curso', modifier: 'en-curso', icon: 'autorenew' },
    completada: { label: 'Completada', modifier: 'completada', icon: 'check_circle' },
    con_incidencia: { label: 'Con incidencia', modifier: 'con-incidencia', icon: 'warning' },
  }
  return map[props.tarea.estado] ?? { label: props.tarea.estado, modifier: 'pendiente', icon: 'schedule' }
})

/** Next status transitions available from current status (CA-1) */
const accionesDisponibles = computed<Array<{ estado: EstadoTarea; label: string; icon: string }>>(() => {
  const all: Array<{ estado: EstadoTarea; label: string; icon: string }> = [
    { estado: 'en_curso', label: 'Marcar en curso', icon: 'autorenew' },
    { estado: 'completada', label: 'Completar', icon: 'check_circle' },
    { estado: 'con_incidencia', label: 'Con incidencia', icon: 'warning' },
    { estado: 'pendiente', label: 'Volver a pendiente', icon: 'undo' },
  ]
  return all.filter((a) => a.estado !== props.tarea.estado)
})

const tipoIconos: Record<string, string> = {
  higiene: 'soap',
  medicacion: 'medication',
  alimentacion: 'restaurant',
  actividad: 'sports_and_outdoors',
  revision: 'stethoscope',
  otro: 'task_alt',
}

const tipoIcono = computed(() => tipoIconos[props.tarea.tipo] ?? 'task_alt')

async function onCambiarEstado(estado: EstadoTarea): Promise<void> {
  await cambiarEstado(estado)
  emit('estado-actualizado', props.tarea.id, estado)
}
</script>

<template>
  <!-- task-card: shows title, time, resident, tipo, status badge, and action buttons -->
  <article class="task-card" :class="`task-card--${estadoInfo.modifier}`" :aria-busy="isUpdating">
    <!-- ─── Header row ─────────────────────────────────────────────────── -->
    <div class="task-card__header">
      <div class="task-card__meta">
        <span class="material-symbols-outlined task-card__tipo-icon" aria-hidden="true">
          {{ tipoIcono }}
        </span>
        <time class="task-card__hora" :datetime="tarea.fechaHora">{{ horaFormateada }}</time>
      </div>

      <!-- Status badge (CA-2) -->
      <span
        class="task-card__badge"
        :class="`task-card__badge--${estadoInfo.modifier}`"
        :aria-label="`Estado: ${estadoInfo.label}`"
      >
        <span class="material-symbols-outlined task-card__badge-icon" aria-hidden="true">
          {{ estadoInfo.icon }}
        </span>
        {{ estadoInfo.label }}
      </span>
    </div>

    <!-- ─── Body ─────────────────────────────────────────────────────────── -->
    <div class="task-card__body">
      <h3 class="task-card__titulo">{{ tarea.titulo }}</h3>
      <p v-if="tarea.notas" class="task-card__notas">{{ tarea.notas }}</p>
    </div>

    <!-- ─── Actions (CA-1) ──────────────────────────────────────────────── -->
    <div class="task-card__actions" role="group" :aria-label="`Acciones para ${tarea.titulo}`">
      <template v-if="isUpdating">
        <span class="task-card__spinner" aria-label="Actualizando..." />
      </template>
      <template v-else>
        <button
          v-for="accion in accionesDisponibles"
          :key="accion.estado"
          type="button"
          class="task-card__action-btn"
          :class="`task-card__action-btn--${accion.estado.replace('_', '-')}`"
          @click="onCambiarEstado(accion.estado)"
        >
          <span class="material-symbols-outlined task-card__action-icon" aria-hidden="true">
            {{ accion.icon }}
          </span>
          {{ accion.label }}
        </button>
      </template>
    </div>
  </article>
</template>

<style scoped>
@reference "../../../../style.css";

/* ─── Card base ─────────────────────────────────────────────────────────── */
.task-card {
  @apply rounded-xl p-4 flex flex-col gap-3 transition-shadow;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-left: 3px solid var(--color-outline-variant);
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Left-border accent per status */
.task-card--pendiente {
  border-left-color: var(--color-outline);
}
.task-card--en-curso {
  border-left-color: var(--color-primary);
}
.task-card--completada {
  border-left-color: #16a34a; /* green-600 */
  opacity: 0.85;
}
.task-card--con-incidencia {
  border-left-color: var(--color-error);
}

/* ─── Header ────────────────────────────────────────────────────────────── */
.task-card__header {
  @apply flex items-center justify-between gap-2;
}

.task-card__meta {
  @apply flex items-center gap-1.5;
}

.task-card__tipo-icon {
  font-size: 1rem;
  color: var(--color-outline);
  font-variation-settings: 'FILL' 0;
}

.task-card__hora {
  @apply text-xs font-medium;
  color: var(--color-on-surface-variant);
}

/* ─── Status badge ──────────────────────────────────────────────────────── */
.task-card__badge {
  @apply inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.task-card__badge-icon {
  font-size: 0.75rem;
}

.task-card__badge--pendiente {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}
.task-card__badge--en-curso {
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}
.task-card__badge--completada {
  @apply bg-green-100 text-green-700;
}
.task-card__badge--con-incidencia {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

/* ─── Body ──────────────────────────────────────────────────────────────── */
.task-card__body {
  @apply flex flex-col gap-1;
}

.task-card__titulo {
  @apply text-sm font-semibold;
  color: var(--color-on-surface);
  font-family: var(--font-headline);
}

.task-card__notas {
  @apply text-xs leading-relaxed;
  color: var(--color-on-surface-variant);
}

/* ─── Actions ───────────────────────────────────────────────────────────── */
.task-card__actions {
  @apply flex flex-wrap gap-2 pt-1 border-t;
  border-color: var(--color-surface-container-high);
}

.task-card__action-btn {
  @apply inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer border-none transition-opacity;
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
}

.task-card__action-btn:hover {
  opacity: 0.8;
}

.task-card__action-btn--en-curso {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.task-card__action-btn--completada {
  @apply bg-green-100 text-green-700;
}

.task-card__action-btn--con-incidencia {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.task-card__action-icon {
  font-size: 0.875rem;
}

/* ─── Spinner ───────────────────────────────────────────────────────────── */
.task-card__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-t-transparent mx-auto my-0.5;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
