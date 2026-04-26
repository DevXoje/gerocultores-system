<script setup lang="ts">
/**
 * TaskCard — reusable card component for a Tarea item.
 *
 * Architecture (frontend-specialist.md §4, §6):
 *   - Uses <script setup lang="ts"> — Options API is BANNED.
 *   - BEM class names in HTML template; Tailwind via @apply in <style scoped>.
 *   - No store imports; props-only component.
 *
 * US-03: Consulta de agenda diaria
 * Stitch reference: Caregiver Dashboard (design-source.md)
 */
import type {
  TareaResponse,
  TareaEstado,
  TareaTipo,
} from '@/business/agenda/domain/entities/tarea.types'
import {
  UserIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  tarea: TareaResponse
  assignedToDisplayName?: string | null
}>()

const emit = defineEmits<{
  toggleComplete: [id: string]
  openDetail: [id: string]
  reportIncident: [id: string]
}>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFechaHora(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function estadoLabel(estado: TareaEstado): string {
  const labels: Record<TareaEstado, string> = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    completada: 'Completada',
    con_incidencia: 'Con incidencia',
  }
  return labels[estado]
}

function tipoLabel(tipo: TareaTipo): string {
  const labels: Record<TareaTipo, string> = {
    higiene: 'Higiene',
    medicacion: 'Medicación',
    alimentacion: 'Alimentación',
    actividad: 'Actividad',
    revision: 'Revisión',
    otro: 'Otro',
  }
  return labels[tipo]
}

function estadoModifier(estado: TareaEstado): string {
  const modifiers: Record<TareaEstado, string> = {
    pendiente: 'pending',
    en_curso: 'in-progress',
    completada: 'done',
    con_incidencia: 'incident',
  }
  return modifiers[estado]
}

function tipoModifier(tipo: TareaTipo): string {
  return tipo.replace('_', '-')
}

function isCompleted(estado: TareaEstado): boolean {
  return estado === 'completada'
}
</script>

<template>
  <article
    class="task-card"
    :class="`task-card--${estadoModifier(tarea.estado)}`"
    role="article"
    :aria-label="`Tarea: ${tarea.titulo}, estado: ${estadoLabel(tarea.estado)}`"
    :data-testid="`task-card-${tarea.id}`"
    tabindex="0"
    @keyup.enter="emit('openDetail', tarea.id)"
  >
    <!-- Status indicator bar -->
    <div
      class="task-card__status-bar"
      :class="`task-card__status-bar--${estadoModifier(tarea.estado)}`"
      aria-hidden="true"
    />

    <div class="task-card__body">
      <!-- Header row: time + tipo badge -->
      <div class="task-card__header">
        <time
          class="task-card__time"
          :datetime="tarea.fechaHora"
          :data-testid="`task-card-time-${tarea.id}`"
        >
          {{ formatFechaHora(tarea.fechaHora) }}
        </time>
        <span
          class="task-card__tipo-badge"
          :class="`task-card__tipo-badge--${tipoModifier(tarea.tipo)}`"
          :data-testid="`task-card-tipo-${tarea.id}`"
        >
          {{ tipoLabel(tarea.tipo) }}
        </span>
      </div>

      <!-- Title -->
      <h3
        class="task-card__title"
        :class="{ 'task-card__title--done': isCompleted(tarea.estado) }"
        :data-testid="`task-card-title-${tarea.id}`"
      >
        {{ tarea.titulo }}
      </h3>

      <!-- Notes (truncated) -->
      <template v-if="tarea.notas">
        <p class="task-card__notes" :data-testid="`task-card-notes-${tarea.id}`">
          {{ tarea.notas }}
        </p>
      </template>

      <!-- Footer: assignedTo + actions -->
      <div class="task-card__footer">
        <template v-if="props.assignedToDisplayName">
          <span
            class="task-card__assignee"
            :data-testid="`task-card-assignee-${tarea.id}`"
            :aria-label="`Asignado a: ${props.assignedToDisplayName}`"
          >
            <UserIcon class="task-card__assignee-icon" aria-hidden="true" />
            {{ props.assignedToDisplayName }}
          </span>
        </template>

        <div class="task-card__actions" role="group" :aria-label="`Acciones para ${tarea.titulo}`">
          <!-- Toggle complete -->
          <button
            class="task-card__action-btn"
            :class="
              isCompleted(tarea.estado)
                ? 'task-card__action-btn--undo'
                : 'task-card__action-btn--complete'
            "
            type="button"
            :aria-label="
              isCompleted(tarea.estado) ? 'Marcar como pendiente' : 'Marcar como completada'
            "
            :data-testid="`task-card-toggle-${tarea.id}`"
            @click.stop="emit('toggleComplete', tarea.id)"
          >
            <ArrowUturnLeftIcon
              v-if="isCompleted(tarea.estado)"
              class="task-card__action-icon"
              aria-hidden="true"
            />
            <CheckCircleIcon v-else class="task-card__action-icon" aria-hidden="true" />
          </button>

          <!-- Report incident (con_incidencia CTA — US-06) -->
          <button
            class="task-card__action-btn task-card__action-btn--incident"
            type="button"
            aria-label="Registrar incidencia"
            :data-testid="`task-card-incident-${tarea.id}`"
            @click.stop="emit('reportIncident', tarea.id)"
          >
            <ExclamationTriangleIcon class="task-card__action-icon" aria-hidden="true" />
          </button>

          <!-- Open detail -->
          <button
            class="task-card__action-btn task-card__action-btn--detail"
            type="button"
            :aria-label="`Ver detalle de ${tarea.titulo}`"
            :data-testid="`task-card-detail-${tarea.id}`"
            @click.stop="emit('openDetail', tarea.id)"
          >
            <ChevronRightIcon class="task-card__action-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
@reference "../../style.css";

/* ─── Base card ──────────────────────────────────────────────────────────────── */
.task-card {
  @apply flex flex-row overflow-hidden rounded-xl cursor-pointer select-none;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-on-surface) 10%, transparent);
  transition:
    box-shadow 0.15s ease,
    transform 0.1s ease;
  min-height: 44px;

  &:hover {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 15%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* ─── Status modifiers ───────────────────────────────────────────────────────── */
.task-card--done {
  @apply opacity-75;
}

/* ─── Status bar (left edge) ─────────────────────────────────────────────────── */
.task-card__status-bar {
  @apply w-1 shrink-0;
  background-color: var(--color-outline-variant);
}

.task-card__status-bar--pending {
  background-color: var(--color-outline);
}

.task-card__status-bar--in-progress {
  background-color: var(--color-primary);
}

.task-card__status-bar--done {
  background-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.task-card__status-bar--incident {
  background-color: var(--color-on-error-container);
}

/* ─── Body ───────────────────────────────────────────────────────────────────── */
.task-card__body {
  @apply flex flex-col gap-1.5 flex-1 px-4 py-3;
}

/* ─── Header row ─────────────────────────────────────────────────────────────── */
.task-card__header {
  @apply flex items-center justify-between gap-2;
}

.task-card__time {
  @apply text-xs font-semibold tabular-nums;
  color: var(--color-on-surface-variant);
  font-family: var(--font-body);
}

/* ─── Tipo badge ─────────────────────────────────────────────────────────────── */
.task-card__tipo-badge {
  @apply text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full;
  background-color: var(--color-secondary-container);
  color: var(--color-on-surface-variant);
}

.task-card__tipo-badge--medicacion {
  background-color: color-mix(in srgb, var(--color-primary-container) 20%, transparent);
  color: var(--color-primary);
}

.task-card__tipo-badge--higiene {
  background-color: var(--color-secondary-container);
  color: var(--color-on-surface-variant);
}

/* ─── Title ──────────────────────────────────────────────────────────────────── */
.task-card__title {
  @apply text-sm font-semibold leading-snug;
  color: var(--color-on-surface);
  font-family: var(--font-headline);
}

.task-card__title--done {
  @apply line-through opacity-60;
}

/* ─── Notes ──────────────────────────────────────────────────────────────────── */
.task-card__notes {
  @apply text-xs leading-relaxed line-clamp-2;
  color: var(--color-on-surface-variant);
  font-family: var(--font-body);
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
.task-card__footer {
  @apply flex items-center justify-between gap-2 mt-1;
}

/* ─── Assignee ───────────────────────────────────────────────────────────────── */
.task-card__assignee {
  @apply flex items-center gap-1 text-xs;
  color: var(--color-on-surface-variant);
  font-family: var(--font-body);
}

.task-card__assignee-icon {
  @apply w-3.5 h-3.5;
}

/* ─── Actions ────────────────────────────────────────────────────────────────── */
.task-card__actions {
  @apply flex items-center gap-1 ml-auto;
}

.task-card__action-btn {
  @apply flex items-center justify-center w-11 h-11 rounded-full border-none cursor-pointer;
  background-color: transparent;
  color: var(--color-on-surface-variant);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: var(--color-surface-container-high);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .task-card__action-icon {
    @apply w-5 h-5;
  }
}

.task-card__action-btn--complete {
  color: var(--color-primary);
}

.task-card__action-btn--undo {
  color: var(--color-outline);
}

.task-card__action-btn--incident {
  color: var(--color-error);
}

.task-card__action-btn--detail {
  color: var(--color-on-surface-variant);
}
</style>
