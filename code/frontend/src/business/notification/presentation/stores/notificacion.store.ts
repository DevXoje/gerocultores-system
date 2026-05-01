/**
 * notificacion.store.ts — Pinia store for in-app notification state.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Architecture (frontend-specialist.md §4):
 *   - State + getters + basic mutations ONLY.
 *   - NO async calls, NO Firebase, NO business logic.
 *   - Async data-fetching lives in useNotificacion composable.
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Notificacion } from '@/business/notification/domain/entities/Notificacion'

export const useNotificacionStore = defineStore('notificacion', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const items = ref<Notificacion[]>([])
  const isLoading = ref(false)

  // ── Getters ──────────────────────────────────────────────────────────────
  const unreadCount = computed(() => items.value.filter((n) => !n.leida).length)

  // ── Mutations ────────────────────────────────────────────────────────────
  function setItems(newItems: Notificacion[]): void {
    items.value = newItems
  }

  function markAsRead(id: string): void {
    const notif = items.value.find((n) => n.id === id)
    if (notif) {
      notif.leida = true
    }
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  return {
    items,
    isLoading,
    unreadCount,
    setItems,
    markAsRead,
    setLoading,
  }
})
