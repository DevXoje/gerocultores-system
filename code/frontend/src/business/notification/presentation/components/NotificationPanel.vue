<script setup lang="ts">
/**
 * NotificationPanel.vue — Slide-out panel listing all notifications.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Stitch reference: Notification Panel
 * Screen ID: 9da813299be1474bb3293febda0c35fe
 * Design source: OUTPUTS/technical-docs/design-source.md
 *
 * Architecture (frontend-specialist.md §6):
 *   - Imports ONLY from composables — never stores directly.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { onMounted } from 'vue'
import { useNotificacion } from '../composables/useNotificacion'
import type { Notificacion } from '../../domain/entities/Notificacion'
import { XMarkIcon, BellSlashIcon } from '@heroicons/vue/24/outline'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  read: [id: string]
}>()

const { items, unreadCount, isLoading, fetchNotificaciones, markNotificacionAsRead } =
  useNotificacion()

async function handleMarkAsRead(notif: Notificacion): Promise<void> {
  if (notif.leida) return
  await markNotificacionAsRead(notif.id)
  emit('read', notif.id)
}

function handleClose(): void {
  emit('close')
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const tipoLabel: Record<Notificacion['tipo'], string> = {
  incidencia_critica: 'Incidencia crítica',
  tarea_proxima: 'Tarea próxima',
  traspaso_turno: 'Traspaso de turno',
  sistema: 'Sistema',
}

onMounted(() => {
  fetchNotificaciones()
})
</script>

<template>
  <!-- Overlay -->
  <transition name="overlay">
    <div v-if="open" class="notification-panel__overlay" aria-hidden="true" @click="handleClose" />
  </transition>

  <!-- Panel -->
  <transition name="panel-slide">
    <aside
      v-if="open"
      class="notification-panel"
      role="dialog"
      aria-label="Panel de notificaciones"
      aria-modal="true"
    >
      <!-- Header -->
      <header class="notification-panel__header">
        <h2 class="notification-panel__title">Notificaciones</h2>
        <span
          v-if="unreadCount > 0"
          class="notification-panel__badge"
          aria-label="`${unreadCount} sin leer`"
          >{{ unreadCount }}</span
        >
        <button
          type="button"
          class="notification-panel__close"
          aria-label="Cerrar panel"
          @click="handleClose"
        >
          <XMarkIcon class="notification-panel__close-icon" aria-hidden="true" />
        </button>
      </header>

      <!-- Loading state -->
      <div v-if="isLoading" class="notification-panel__loading" aria-live="polite">
        <span class="notification-panel__spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="notification-panel__empty" aria-live="polite">
        <BellSlashIcon class="notification-panel__empty-icon" aria-hidden="true" />
        <p class="notification-panel__empty-msg">No tienes notificaciones.</p>
      </div>

      <!-- Notification list -->
      <ul v-else class="notification-panel__list" aria-label="Lista de notificaciones">
        <template v-for="notif in items" :key="notif.id">
          <li
            class="notification-panel__item"
            :class="{ 'notification-panel__item--unread': !notif.leida }"
          >
            <button
              type="button"
              class="notification-panel__item-btn"
              @click="handleMarkAsRead(notif)"
            >
              <span class="notification-panel__tipo">{{ tipoLabel[notif.tipo] }}</span>
              <p class="notification-panel__item-title">{{ notif.titulo }}</p>
              <p class="notification-panel__item-message">{{ notif.mensaje }}</p>
              <time class="notification-panel__item-time">{{ formatDate(notif.creadaEn) }}</time>
            </button>
          </li>
        </template>
      </ul>
    </aside>
  </transition>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "../../../../style.css";

/* ─── Overlay ────────────────────────────────────────────────────────────── */
.notification-panel__overlay {
  @apply fixed inset-0 z-40;
  background-color: rgba(0, 0, 0, 0.3);
}

/* ─── Panel ──────────────────────────────────────────────────────────────── */
.notification-panel {
  @apply fixed top-0 right-0 h-full w-80 z-50 flex flex-col;
  background-color: var(--color-surface);
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.12);
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
.notification-panel__header {
  @apply flex items-center gap-2 px-4 py-4 border-b;
  border-color: var(--color-outline-variant);
}

.notification-panel__title {
  @apply text-base font-semibold flex-1;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.notification-panel__badge {
  @apply text-xs font-bold rounded-full px-2 py-0.5;
  background-color: var(--color-error);
  color: var(--color-on-error);
}

.notification-panel__close {
  @apply cursor-pointer border-none bg-transparent p-1;
  color: var(--color-on-surface-variant);
  transition: color 0.15s ease;
}

.notification-panel__close:hover {
  color: var(--color-on-surface);
}

.notification-panel__close-icon {
  @apply w-5 h-5;
}
.notification-panel__loading {
  @apply flex items-center justify-center gap-2 py-8 text-sm;
  color: var(--color-on-surface-variant);
}

.notification-panel__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-t-transparent;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Empty ──────────────────────────────────────────────────────────────── */
.notification-panel__empty {
  @apply flex flex-col items-center gap-3 py-12 px-6 text-center;
}

.notification-panel__empty-icon {
  @apply w-10 h-10;
  color: var(--color-outline-variant);
}

.notification-panel__empty-msg {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

/* ─── List ───────────────────────────────────────────────────────────────── */
.notification-panel__list {
  @apply flex-1 overflow-y-auto list-none p-0 m-0;
}

.notification-panel__item {
  @apply border-b;
  border-color: var(--color-outline-variant);
}

.notification-panel__item--unread {
  background-color: var(--color-primary-container);
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.notification-panel__item-btn {
  @apply w-full text-left px-4 py-3 flex flex-col gap-0.5 cursor-pointer border-none bg-transparent;
  transition: background-color 0.15s ease;
}

.notification-panel__item-btn:hover {
  background-color: color-mix(in srgb, var(--color-on-surface) 5%, transparent);
}

.notification-panel__tipo {
  @apply text-xs font-semibold uppercase;
  color: var(--color-primary);
}

.notification-panel__item-title {
  @apply text-sm font-medium;
  color: var(--color-on-surface);
}

.notification-panel__item-message {
  @apply text-xs;
  color: var(--color-on-surface-variant);
}

.notification-panel__item-time {
  @apply text-xs mt-1;
  color: var(--color-outline);
  font-variant-numeric: tabular-nums;
}

/* ─── Transitions ─────────────────────────────────────────────────────────── */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.25s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
