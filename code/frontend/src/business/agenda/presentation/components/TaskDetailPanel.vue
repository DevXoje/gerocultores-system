<script setup lang="ts">
/**
 * TaskDetailPanel — slide-in panel showing full task data with state-change actions.
 *
 * US-04: Actualizar estado de una tarea
 *
 * Stitch reference: projects/16168255182252500555/screens/c4df0dcfc4114cb29deb834b50647f00
 * (Tasks Calendar View — detail panel slides in from right on event click)
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in presentation/components/
 *   - All async logic through tareasStore mutations — no direct API calls here
 *   - BEM class names; Tailwind via @apply in <style scoped>
 */
import { computed } from 'vue'
import type { TareaResponse, TareaEstado } from '@/business/agenda/domain/entities/tarea.types'
import { useTareasStore } from '@/business/agenda/presentation/stores/tareasStore'
import {
  XMarkIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
  BeakerIcon,
  HeartIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent, SVGAttributes } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  tarea: TareaResponse
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'estado-changed', id: string, estado: TareaEstado): void
}>()

// ─── Store ────────────────────────────────────────────────────────────────────

const store = useTareasStore()

// ─── Formatted data ───────────────────────────────────────────────────────────

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

const fechaFormateada = computed(() => {
  try {
    return new Date(props.tarea.fechaHora).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return props.tarea.fechaHora
  }
})

// ─── Estado ────────────────────────────────────────────────────────────────────

type EstadoInfo = {
  label: string
  modifier: string
  icon: FunctionalComponent<SVGAttributes>
}

const estadoInfoMap: Record<TareaEstado, EstadoInfo> = {
  pendiente: { label: 'Pendiente', modifier: 'pendiente', icon: ClockIcon },
  en_curso: { label: 'En curso', modifier: 'en-curso', icon: ArrowPathIcon },
  completada: { label: 'Completada', modifier: 'completada', icon: CheckCircleIcon },
  con_incidencia: {
    label: 'Con incidencia',
    modifier: 'con-incidencia',
    icon: ExclamationTriangleIcon,
  },
}

const estadoInfo = computed(() => estadoInfoMap[props.tarea.estado] ?? estadoInfoMap.pendiente)

// ─── Tipo ──────────────────────────────────────────────────────────────────────

const tipoIconos: Record<string, FunctionalComponent<SVGAttributes>> = {
  higiene: BeakerIcon,
  medicacion: HeartIcon,
  alimentacion: BoltIcon,
  actividad: BoltIcon,
  revision: ClipboardDocumentCheckIcon,
  otro: ClipboardDocumentCheckIcon,
}

const tipoIcono = computed(() => tipoIconos[props.tarea.tipo] ?? ClipboardDocumentCheckIcon)

// ─── Available state transitions ───────────────────────────────────────────────

type Accion = {
  estado: TareaEstado
  label: string
  icon: FunctionalComponent<SVGAttributes>
  modifier: string
}

const accionesDisponibles = computed<Accion[]>(() => {
  const all: Accion[] = [
    { estado: 'en_curso', label: 'Marcar en curso', icon: ArrowPathIcon, modifier: 'en-curso' },
    { estado: 'completada', label: 'Completar', icon: CheckCircleIcon, modifier: 'completada' },
    {
      estado: 'con_incidencia',
      label: 'Con incidencia',
      icon: ExclamationTriangleIcon,
      modifier: 'con-incidencia',
    },
    {
      estado: 'pendiente',
      label: 'Volver a pendiente',
      icon: ArrowUturnLeftIcon,
      modifier: 'pendiente',
    },
  ]
  return all.filter((a) => a.estado !== props.tarea.estado)
})

// ─── Event handlers (G11 — named functions, no inline) ────────────────────────

function handleClose(): void {
  emit('close')
}

function handleBackdropClick(): void {
  emit('close')
}

function handleEstadoChange(estado: TareaEstado): void {
  // Optimistic update through store
  store.updateTareaEstado(props.tarea.id, estado)
  emit('estado-changed', props.tarea.id, estado)
}
</script>

<template>
  <!-- Slide-in panel backdrop -->
  <Teleport to="body">
    <Transition name="panel">
      <div
        v-if="open"
        class="task-detail-panel__backdrop"
        aria-modal="true"
        role="dialog"
        aria-labelledby="task-detail-panel-title"
        @click.self="handleBackdropClick"
      >
        <!-- Panel -->
        <aside class="task-detail-panel">
          <!-- Header -->
          <header class="task-detail-panel__header">
            <div class="task-detail-panel__header-left">
              <component :is="tipoIcono" class="task-detail-panel__tipo-icon" aria-hidden="true" />
              <h2 id="task-detail-panel-title" class="task-detail-panel__title">
                {{ tarea.titulo }}
              </h2>
            </div>
            <button
              type="button"
              class="task-detail-panel__close"
              aria-label="Cerrar detalle"
              @click="handleClose"
            >
              <XMarkIcon class="task-detail-panel__close-icon" aria-hidden="true" />
            </button>
          </header>

          <!-- Body -->
          <div class="task-detail-panel__body">
            <!-- Status badge -->
            <div class="task-detail-panel__status-row">
              <span
                class="task-detail-panel__badge"
                :class="`task-detail-panel__badge--${estadoInfo.modifier}`"
              >
                <component
                  :is="estadoInfo.icon"
                  class="task-detail-panel__badge-icon"
                  aria-hidden="true"
                />
                {{ estadoInfo.label }}
              </span>
            </div>

            <!-- Date/time -->
            <div class="task-detail-panel__datetime">
              <time class="task-detail-panel__date" :datetime="tarea.fechaHora">
                {{ fechaFormateada }}
              </time>
              <span class="task-detail-panel__separator">·</span>
              <time class="task-detail-panel__time" :datetime="tarea.fechaHora">
                {{ horaFormateada }}
              </time>
            </div>

            <!-- Notes -->
            <section v-if="tarea.notas" class="task-detail-panel__section">
              <h3 class="task-detail-panel__section-title">Notas</h3>
              <p class="task-detail-panel__notas">{{ tarea.notas }}</p>
            </section>

            <!-- State-change actions -->
            <section class="task-detail-panel__section">
              <h3 class="task-detail-panel__section-title">Cambiar estado</h3>
              <div
                class="task-detail-panel__actions"
                role="group"
                :aria-label="`Acciones para ${tarea.titulo}`"
              >
                <button
                  v-for="accion in accionesDisponibles"
                  :key="accion.estado"
                  type="button"
                  class="task-detail-panel__action-btn"
                  :class="`task-detail-panel__action-btn--${accion.modifier}`"
                  @click="handleEstadoChange(accion.estado)"
                >
                  <component
                    :is="accion.icon"
                    class="task-detail-panel__action-icon"
                    aria-hidden="true"
                  />
                  {{ accion.label }}
                </button>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@reference "#/style.css";

/* ─── Backdrop ─────────────────────────────────────────────────────────────── */
.task-detail-panel__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

/* ─── Panel ────────────────────────────────────────────────────────────────── */
.task-detail-panel {
  width: 85%;
  max-width: 400px;
  height: 100%;
  background: var(--color-surface);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
.task-detail-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-outline-variant);
  gap: 12px;
}

.task-detail-panel__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.task-detail-panel__tipo-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-primary);
}

.task-detail-panel__title {
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-detail-panel__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: var(--color-on-surface-variant);
  transition: background-color 0.15s;
  flex-shrink: 0;
}

.task-detail-panel__close:hover {
  background-color: var(--color-surface-container-high);
}

.task-detail-panel__close-icon {
  width: 20px;
  height: 20px;
}

/* ─── Body ────────────────────────────────────────────────────────────────── */
.task-detail-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─── Status ───────────────────────────────────────────────────────────────── */
.task-detail-panel__status-row {
  display: flex;
  align-items: center;
}

.task-detail-panel__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.task-detail-panel__badge-icon {
  width: 14px;
  height: 14px;
}

.task-detail-panel__badge--pendiente {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.task-detail-panel__badge--en-curso {
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.task-detail-panel__badge--completada {
  background-color: #dcfce7;
  color: #15803d;
}

.task-detail-panel__badge--con-incidencia {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

/* ─── DateTime ─────────────────────────────────────────────────────────────── */
.task-detail-panel__datetime {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.task-detail-panel__date {
  font-weight: 500;
  color: var(--color-on-surface);
  text-transform: capitalize;
}

.task-detail-panel__time {
  font-weight: 600;
  color: var(--color-primary);
}

.task-detail-panel__separator {
  color: var(--color-outline);
}

/* ─── Sections ────────────────────────────────────────────────────────────── */
.task-detail-panel__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-detail-panel__section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-variant);
  margin: 0;
}

.task-detail-panel__notas {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-on-surface);
  margin: 0;
  padding: 12px;
  background-color: var(--color-surface-container-low);
  border-radius: 8px;
}

/* ─── Actions ──────────────────────────────────────────────────────────────── */
.task-detail-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-detail-panel__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  transition: opacity 0.15s;
}

.task-detail-panel__action-btn:hover {
  opacity: 0.8;
}

.task-detail-panel__action-icon {
  width: 16px;
  height: 16px;
}

.task-detail-panel__action-btn--en-curso {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.task-detail-panel__action-btn--completada {
  background-color: #dcfce7;
  color: #15803d;
}

.task-detail-panel__action-btn--con-incidencia {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.task-detail-panel__action-btn--pendiente {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

/* ─── Transition ───────────────────────────────────────────────────────────── */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 250ms ease;
}

.panel-enter-active .task-detail-panel,
.panel-leave-active .task-detail-panel {
  transition: transform 250ms ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .task-detail-panel,
.panel-leave-to .task-detail-panel {
  transform: translateX(100%);
}
</style>
