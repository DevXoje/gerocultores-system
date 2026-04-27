import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/services/firebase'

/**
 * AuthStore — global authentication state.
 *
 * Architecture note (frontend-specialist.md §4):
 * - State + basic mutations live here (Pinia composable store)
 * - Firebase calls are kept minimal: signIn/signOut/onAuthStateChanged only
 * - The `role` claim is sourced from Firebase ID token custom claims
 * - initAuth() must be called from the router guard before checking auth state
 *
 * Placed in business/auth/ as the auth domain's canonical store.
 * Pages/composables access this via useAuthStore() — never import Firebase directly.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const role = ref<string | null>(null)
  const isLoading = ref(false)

  // ─── Private helpers ────────────────────────────────────────────────────

  async function loadRoleFromToken(firebaseUser: User): Promise<void> {
    const idTokenResult = await firebaseUser.getIdTokenResult()
    const claimedRole = idTokenResult.claims['role']
    role.value = typeof claimedRole === 'string' ? claimedRole : null
  }

  // ─── Public actions ─────────────────────────────────────────────────────

  /**
   * Authenticate with email and password.
   * Sets `user` and `role` on success. Throws on failure.
   * Callers (composables/components) must catch and display a generic error.
   */
  async function signIn(email: string, password: string): Promise<void> {
    isLoading.value = true
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await loadRoleFromToken(credential.user)
      user.value = credential.user
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign out the current user and clear local state.
   */
  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
    user.value = null
    role.value = null
  }

  /**
   * Set up the Firebase Auth state listener with a timeout.
   * Call this from the router guard before checking auth state — NOT from main.ts.
   * The 3-second timeout prevents the navigation from being blocked indefinitely
   * when Firebase is slow (e.g., emulator cold start, network latency).
   *
   * Pattern adapted from ride-on-workshop-v2 (router/index.ts initAuth).
   */
  function initAuth(): Promise<void> {
    return new Promise((resolve) => {
      // Short-circuit: if a user is already cached, resolve immediately.
      // This avoids waiting for onAuthStateChanged when Firebase already has the session.
      if (auth.currentUser !== null) {
        user.value = auth.currentUser
        loadRoleFromToken(auth.currentUser).catch(() => {
          // Non-fatal: role may be null but user is still valid
        })
        resolve()
        return
      }

      const holder: { unsubscribe?: () => void } = {}

      holder.unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await loadRoleFromToken(firebaseUser)
          user.value = firebaseUser
        } else {
          user.value = null
          role.value = null
        }
        if (holder.unsubscribe) holder.unsubscribe()
        resolve()
      })

      // Timeout: do not block navigation for more than 3 seconds.
      // This prevents a white screen on slow Firebase responses (e.g., Edge with
      // storage blocked, emulator cold start, or network latency).
      setTimeout(() => {
        if (holder.unsubscribe) {
          holder.unsubscribe()
        }
        resolve()
      }, 3000)
    })
  }

  return { user, role, isLoading, signIn, signOut, initAuth }
})
