<script setup lang="ts">
/**
 * AlertsPreviewWidget — card with unread critical alert count + "Ver alertas" link.
 *
 * Phase 5 task 5.3
 * Uses existing useNotificaciones composable.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificacion } from '@/business/notification/presentation/composables/useNotificacion'
import { BellAlertIcon } from '@heroicons/vue/24/outline'

const ALERTS_PATH = '/notificaciones'

const router = useRouter()
const { unreadCount, isLoading, fetchNotificaciones } = useNotificacion()

onMounted(() => {
  fetchNotificaciones()
})

const criticalAlerts = unreadCount

function handleVerAlertas(): void {
  router.push(ALERTS_PATH)
}
</script>

<template>
  <article class="alerts-widget">
    <header class="alerts-widget__header">
      <BellAlertIcon class="alerts-widget__icon" aria-hidden="true" />
      <h3 class="alerts-widget__title">Alertas críticas</h3>
    </header>

    <div class="alerts-widget__body">
      <p v-if="isLoading" class="alerts-widget__status">Cargando...</p>
      <p
        v-else-if="criticalAlerts === 0"
        class="alerts-widget__status alerts-widget__status--empty"
      >
        Sin alertas
      </p>
      <p v-else class="alerts-widget__count">
        <span class="alerts-widget__count-number">{{ criticalAlerts }}</span>
        <span class="alerts-widget__count-label">
          alerta{{ criticalAlerts === 1 ? '' : 's' }} crítica{{ criticalAlerts === 1 ? '' : 's' }}
        </span>
      </p>
    </div>

    <footer class="alerts-widget__footer">
      <button type="button" class="alerts-widget__link" @click="handleVerAlertas">
        Ver alertas
      </button>
    </footer>
  </article>
</template>

<style scoped>
@reference "#/style.css";

.alerts-widget {
  @apply flex flex-col gap-3 p-5 rounded-2xl;
  background-color: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
}

.alerts-widget__header {
  @apply flex items-center gap-2;
}

.alerts-widget__icon {
  @apply w-5 h-5;
  color: var(--color-error);
  flex-shrink: 0;
}

.alerts-widget__title {
  @apply text-sm font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.alerts-widget__body {
  @apply flex flex-col gap-1;
}

.alerts-widget__status {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.alerts-widget__status--empty {
  @apply italic;
}

.alerts-widget__count {
  @apply flex items-baseline gap-2;
}

.alerts-widget__count-number {
  @apply text-3xl font-bold;
  font-family: var(--font-headline);
  color: var(--color-error);
}

.alerts-widget__count-label {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.alerts-widget__footer {
  @apply mt-auto pt-2;
}

.alerts-widget__link {
  @apply text-sm font-medium cursor-pointer border-none bg-transparent;
  color: var(--color-primary);
  transition: opacity 0.15s ease;
}

.alerts-widget__link:hover {
  opacity: 0.75;
}
</style>
