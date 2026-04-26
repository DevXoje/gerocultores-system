<script setup lang="ts">
/**
 * App.vue — Root AppShell for GeroCare SPA.
 *
 * US-08: Recibir notificaciones de alertas críticas
 * US-11: Resumen de fin de turno (connectivity awareness)
 *
 * Wires:
 *  - OfflineBanner — shown when browser goes offline
 *  - NotificationToast — transient popup for new notifications
 *  - NotificationPanel — slide-out panel triggered by bell button
 *  - Notification polling — starts on mount, pauses automatically when offline
 *
 * Architecture (frontend-specialist.md §6):
 *  - No store imports directly — uses composables.
 */
import { onMounted, ref } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import OfflineBanner from '@/components/OfflineBanner.vue'
import NotificationPanel from '@/business/notification/presentation/components/NotificationPanel.vue'
import NotificationToast from '@/business/notification/presentation/components/NotificationToast.vue'
import { useNotificacion } from '@/business/notification/presentation/composables/useNotificacion'

const isPanelOpen = ref(false)

const { startPolling, items } = useNotificacion()

onMounted(() => {
  startPolling()
})
</script>

<template>
  <OfflineBanner />

  <!-- Notification bell button — opens the slide-out panel -->
  <button
    type="button"
    class="app-shell__notification-bell"
    data-testid="notification-bell"
    aria-label="Abrir panel de notificaciones"
    @click="isPanelOpen = true"
  >
    <BellIcon class="app-shell__notification-bell-icon" aria-hidden="true" />
  </button>

  <!-- Notification toast — shows for the latest unread notification -->
  <NotificationToast
    v-if="items.length > 0 && !items[0].leida"
    :notification="items[0]"
    data-testid="notification-toast"
    @dismiss="isPanelOpen = false"
  />

  <NotificationPanel :open="isPanelOpen" @close="isPanelOpen = false" />
  <RouterView />
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "./style.css";

.app-shell__notification-bell {
  @apply fixed top-4 right-4 z-40 flex items-center justify-center;
  @apply w-10 h-10 rounded-full cursor-pointer border-none;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  transition: opacity 0.15s ease;
}

.app-shell__notification-bell:hover {
  opacity: 0.8;
}

.app-shell__notification-bell-icon {
  @apply w-5 h-5;
}
</style>
