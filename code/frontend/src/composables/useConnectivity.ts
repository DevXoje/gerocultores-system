/**
 * useConnectivity.ts — Composable for browser online/offline detection.
 *
 * US-08: Recibir notificaciones de alertas críticas (pause polling when offline)
 *
 * Architecture (frontend-specialist.md §7):
 *   - Lives in presentation/composables/ — pure Vue, no stores.
 *   - Wraps `navigator.onLine` + window events: lightweight, no deps.
 *   - Consumed by components/composables that need to pause work when offline.
 */
import { onMounted, onUnmounted, readonly, ref } from 'vue'

export function useConnectivity() {
  const isOnline = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  function handleOnline(): void {
    isOnline.value = true
  }

  function handleOffline(): void {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline: readonly(isOnline),
  }
}
