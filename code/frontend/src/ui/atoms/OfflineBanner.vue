<script setup lang="ts">
/**
 * OfflineBanner.vue — Persistent banner shown when the browser loses connectivity.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Stitch reference: inline UI element — no dedicated screen.
 *
 * Architecture (frontend-specialist.md §6):
 *   - Pure presentation atom — no props, no emits, reads connectivity from composable.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { useConnectivity } from '@/composables/useConnectivity'
import { SignalSlashIcon } from '@heroicons/vue/24/solid'

const { isOnline } = useConnectivity()
</script>

<template>
  <transition name="offline-slide">
    <div
      v-if="!isOnline"
      class="offline-banner"
      role="status"
      aria-live="polite"
      aria-label="Sin conexión a internet"
    >
      <SignalSlashIcon class="offline-banner__icon" aria-hidden="true" />
      <span class="offline-banner__text">Sin conexión — las notificaciones están pausadas.</span>
    </div>
  </transition>
</template>

<style scoped>
@reference "#/style.css";

.offline-banner {
  @apply flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium w-full;
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.offline-banner__icon {
  @apply w-5 h-5;
  flex-shrink: 0;
}

.offline-banner__text {
  @apply text-sm;
}

.offline-slide-enter-active,
.offline-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.offline-slide-enter-from,
.offline-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.offline-slide-enter-to,
.offline-slide-leave-from {
  max-height: 3rem;
  opacity: 1;
}
</style>
