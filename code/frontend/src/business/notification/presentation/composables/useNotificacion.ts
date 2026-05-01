/**
 * useNotificacion.ts — Composable bridge between notification state and components.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Architecture (frontend-specialist.md §7):
 *   - Lives in presentation/composables/ — ONLY layer touching Pinia stores.
 *   - Orchestrates use cases (application layer) and updates the store.
 *   - Components import ONLY from this composable — never stores directly.
 *   - Polling every 30s as per design decision.
 */
import { computed, onUnmounted, readonly, ref } from 'vue'
import { useNotificacionStore } from '@/business/notification/presentation/stores/notificacion.store'
import { getNotificaciones } from '@/business/notification/application/use-cases/getNotificaciones'
import { markAsRead as markAsReadUseCase } from '@/business/notification/application/use-cases/markAsRead'

const POLL_INTERVAL_MS = 30_000

export function useNotificacion() {
  const store = useNotificacionStore()
  const error = ref<string | null>(null)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  // ── Derived state (read-only refs for components) ────────────────────────
  const items = computed(() => store.items)
  const unreadCount = computed(() => store.unreadCount)
  const isLoading = computed(() => store.isLoading)

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchNotificaciones(): Promise<void> {
    store.setLoading(true)
    error.value = null
    try {
      const notificaciones = await getNotificaciones({ leida: false, limit: 20 })
      store.setItems(notificaciones)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar notificaciones'
    } finally {
      store.setLoading(false)
    }
  }

  // ── Mark as read ─────────────────────────────────────────────────────────
  async function markNotificacionAsRead(id: string): Promise<void> {
    // Optimistic update
    store.markAsRead(id)
    try {
      await markAsReadUseCase(id)
    } catch (e) {
      // Reload on failure to re-sync state
      await fetchNotificaciones()
      error.value = e instanceof Error ? e.message : 'Error al marcar como leída'
    }
  }

  // ── Polling ──────────────────────────────────────────────────────────────
  function startPolling(isOnline: () => boolean = () => navigator.onLine): void {
    if (pollTimer !== null) return
    pollTimer = setInterval(() => {
      if (isOnline()) {
        fetchNotificaciones()
      }
    }, POLL_INTERVAL_MS)
  }

  function stopPolling(): void {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  onUnmounted(() => {
    stopPolling()
  })

  return {
    items,
    unreadCount,
    isLoading,
    error: readonly(error),
    fetchNotificaciones,
    markNotificacionAsRead,
    startPolling,
    stopPolling,
  }
}
