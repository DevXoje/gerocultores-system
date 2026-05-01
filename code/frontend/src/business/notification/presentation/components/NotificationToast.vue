<script setup lang="ts">
/**
 * NotificationToast.vue — Transient toast popup for new notifications.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Stitch reference: Toast popup — no separate screen (inline UI element).
 * Design source: design-source.md — NotificationToast
 *
 * Architecture (frontend-specialist.md §6):
 *   - Pure presentation atom — receives data via props.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 *   - No store imports — component is driven by props only.
 */
import type { Notificacion } from '@/business/notification/domain/entities/Notificacion'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import type { FunctionalComponent, SVGAttributes } from 'vue'

const props = defineProps<{
  notification: Notificacion
}>()

const emit = defineEmits<{
  dismiss: [id: string]
}>()

function handleDismiss(): void {
  emit('dismiss', props.notification.id)
}

const iconMap: Record<Notificacion['tipo'], FunctionalComponent<SVGAttributes>> = {
  incidencia_critica: ExclamationTriangleIcon,
  tarea_proxima: ClockIcon,
  traspaso_turno: ArrowsRightLeftIcon,
  sistema: InformationCircleIcon,
}

const IconComponent = iconMap[props.notification.tipo]
</script>

<template>
  <div
    class="notification-toast"
    :class="`notification-toast--${notification.tipo}`"
    role="alert"
    aria-live="assertive"
  >
    <component :is="IconComponent" class="notification-toast__icon" aria-hidden="true" />
    <div class="notification-toast__body">
      <p class="notification-toast__title">{{ notification.titulo }}</p>
      <p class="notification-toast__message">{{ notification.mensaje }}</p>
    </div>
    <button
      type="button"
      class="notification-toast__close"
      aria-label="Cerrar notificación"
      @click="handleDismiss"
    >
      <XMarkIcon class="notification-toast__close-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "#/style.css";

.notification-toast {
  @apply flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium;
  @apply fixed bottom-6 left-1/2 -translate-x-1/2 z-50;
  max-width: calc(100vw - 3rem);
  min-width: 280px;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.notification-toast--incidencia_critica {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.notification-toast--tarea_proxima {
  background-color: var(--color-tertiary-container);
  color: var(--color-on-tertiary-container);
}

.notification-toast--traspaso_turno {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
}

.notification-toast--sistema {
  background-color: var(--color-surface-container-highest);
  color: var(--color-on-surface);
}

.notification-toast__icon {
  @apply w-5 h-5;
  flex-shrink: 0;
}

.notification-toast__body {
  @apply flex flex-col gap-0.5 flex-1 min-w-0;
}

.notification-toast__title {
  @apply font-semibold text-sm leading-tight;
}

.notification-toast__message {
  @apply text-xs leading-snug opacity-90 truncate;
}

.notification-toast__close {
  @apply flex-shrink-0 cursor-pointer border-none bg-transparent p-0;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.notification-toast__close:hover {
  opacity: 1;
}

.notification-toast__close-icon {
  @apply w-4 h-4;
}
</style>
