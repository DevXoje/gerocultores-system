<script setup lang="ts">
/**
 * MainLayout.vue — Layout wrapper for authenticated routes.
 *
 * US-08: Recibir notificaciones de alertas críticas
 * US-11: Resumen de fin de turno (connectivity awareness)
 *
 * Responsibilities:
 *  - OfflineBanner — shown when browser goes offline
 *  - NotificationToast — transient popup for new notifications
 *  - NotificationPanel — slide-out panel triggered by bell button
 *  - Notification polling — starts on mount, only active in authenticated zone
 *
 * Architecture (frontend-specialist.md §6):
 *  - No store imports directly — uses composables.
 */
import { onMounted, ref } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import OfflineBanner from '@/ui/atoms/OfflineBanner.vue'
import NotificationPanel from '@/business/notification/presentation/components/NotificationPanel.vue'
import NotificationToast from '@/business/notification/presentation/components/NotificationToast.vue'
import { useNotificacion } from '@/business/notification/presentation/composables/useNotificacion'
import AppShell from '@/ui/layouts/AppShell.vue'

const isPanelOpen = ref(false)

const { startPolling, items } = useNotificacion()

onMounted(() => {
  startPolling()
})

function handleOpenPanel(): void {
  isPanelOpen.value = true
}

function handleDismissPanel(): void {
  isPanelOpen.value = false
}

function handleClosePanel(): void {
  isPanelOpen.value = false
}
</script>

<template>
  <AppShell>
    <template #header-actions>
      <button
        type="button"
        class="main-layout__notification-bell main-layout__notification-bell--inline"
        data-testid="notification-bell-mobile"
        aria-label="Abrir panel de notificaciones"
        @click="handleOpenPanel"
      >
        <BellIcon class="main-layout__notification-bell-icon" aria-hidden="true" />
      </button>
    </template>

    <OfflineBanner />

    <button
      type="button"
      class="main-layout__notification-bell main-layout__notification-bell--desktop"
      data-testid="notification-bell"
      aria-label="Abrir panel de notificaciones"
      @click="handleOpenPanel"
    >
      <BellIcon class="main-layout__notification-bell-icon" aria-hidden="true" />
    </button>

    <!-- Notification toast — shows for the latest unread notification -->
    <NotificationToast
      v-if="items.length > 0 && !items[0].leida"
      :notification="items[0]"
      data-testid="notification-toast"
      @dismiss="handleDismissPanel"
    />

    <NotificationPanel :open="isPanelOpen" @close="handleClosePanel" />

    <RouterView />
  </AppShell>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "#/style.css";

.main-layout__notification-bell {
  @apply w-10 h-10 rounded-full cursor-pointer border-none;
  @apply flex items-center justify-center;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  transition: opacity 0.15s ease;
  box-shadow: 0 12px 24px rgba(215, 223, 240, 0.22);
}

.main-layout__notification-bell:hover {
  opacity: 0.8;
}

.main-layout__notification-bell-icon {
  @apply w-5 h-5;
}

.main-layout__notification-bell--desktop {
  display: none;
}

@media (min-width: 900px) {
  .main-layout__notification-bell--inline {
    display: none;
  }

  .main-layout__notification-bell--desktop {
    @apply fixed top-4 right-4 z-40;
    display: flex;
  }
}
</style>
