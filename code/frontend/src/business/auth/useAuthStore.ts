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
 * - init() must be called once from main.ts before app.mount()
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
   * Set up the Firebase Auth state listener.
   * Call this ONCE from main.ts before app.mount() so that
   * the auth state is restored on page reload (TC-06).
   */
  async function init(): Promise<void> {
    return new Promise((resolve) => {
      // unsubscribeFn is assigned synchronously by onAuthStateChanged before
      // the callback can ever be invoked (the callback is async / microtask).
      // We use a mutable holder to avoid TDZ issues inside the callback.
      let unsubscribeFn: (() => void) | undefined

      unsubscribeFn = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await loadRoleFromToken(firebaseUser)
          user.value = firebaseUser
        } else {
          user.value = null
          role.value = null
        }
        if (unsubscribeFn) unsubscribeFn()
        resolve()
      })
    })
  }

  return { user, role, isLoading, signIn, signOut, init }
})
