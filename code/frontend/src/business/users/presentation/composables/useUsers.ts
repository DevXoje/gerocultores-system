/**
 * users/presentation/composables/useUsers.ts
 *
 * Composable bridge for the users admin module.
 * Handles fetching + mutating user data via the Express API.
 *
 * All Firebase interaction goes through the API (no direct Firebase calls here).
 * Token is retrieved from useAuthStore → auth.currentUser.getIdToken().
 */
import { ref } from 'vue'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { auth } from '@/services/firebase'
import type { UserResponse, UserRole } from '../../domain/entities/user.types'

const API_BASE = import.meta.env.VITE_API_URL as string

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Unknown error'
}

export function useUsers() {
  const store = useAuthStore()
  const users = ref<UserResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getToken(): Promise<string> {
    // Auth store has user ref; get fresh token from Firebase currentUser
    const currentUser = auth.currentUser ?? store.user
    if (!currentUser) throw new Error('User not authenticated')
    return currentUser.getIdToken()
  }

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }
      const body = (await response.json()) as { data: UserResponse[] }
      users.value = body.data
    } catch (e: unknown) {
      error.value = toErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function updateRole(uid: string, role: UserRole): Promise<void> {
    error.value = null
    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/admin/users/${uid}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })
      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }
      await fetchUsers()
    } catch (e: unknown) {
      error.value = toErrorMessage(e)
    }
  }

  async function disableUser(uid: string): Promise<void> {
    error.value = null
    try {
      const token = await getToken()
      const response = await fetch(`${API_BASE}/admin/users/${uid}/disable`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }
      await fetchUsers()
    } catch (e: unknown) {
      error.value = toErrorMessage(e)
    }
  }

  return { users, loading, error, fetchUsers, updateRole, disableUser }
}
