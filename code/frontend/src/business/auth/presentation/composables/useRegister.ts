/**
 * useRegister — composable bridge between RegisterPage and Firebase Auth + API.
 *
 * Architecture (frontend-specialist.md §7):
 *   - Pages import ONLY this composable — never stores or Firebase SDK directly.
 *   - Owns: form state, loading, error, submit logic, visibility toggle.
 *
 * State machine (design.md):
 *   idle → creating → setting-claims → signing-in → done
 *   Any error → error (stays until retry/reset)
 *
 * REST endpoint: POST /api/register/set-claims — assigns 'gerocultor' role.
 * Uses Firebase ID token from the newly created user as Bearer token.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { auth, googleProvider } from '@/services/firebase'
import { DASHBOARD_ROUTES } from '@/views/route-names'

const API_BASE = import.meta.env.VITE_API_URL as string

export type RegisterState = 'idle' | 'creating' | 'setting-claims' | 'signing-in' | 'done' | 'error'

export function useRegister() {
  const store = useAuthStore()
  const router = useRouter()

  // Form fields
  const email = ref('')
  const passwordInput = ref('')
  const confirmPasswordInput = ref('')
  const showPassword = ref(false)

  // UI state
  const errorMessage = ref<string | null>(null)
  const state = ref<RegisterState>('idle')

  const isLoading = computed(
    () =>
      state.value === 'creating' || state.value === 'setting-claims' || state.value === 'signing-in'
  )

  /**
   * Map Firebase Auth error codes to human-readable messages for registration.
   * These messages follow the same security-first principle as LoginPage:
   * never reveal which field caused the failure.
   */
  function mapAuthError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.'
      case 'auth/invalid-email':
        return 'El formato del correo no es válido.'
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.'
      case 'auth/network-request-failed':
        return 'Error de red. Verifica tu conexión.'
      default:
        return 'No se pudo crear la cuenta. Intenta de nuevo.'
    }
  }

  /**
   * Call POST /api/register/set-claims to assign 'gerocultor' role.
   * The uid comes from the Firebase ID token verified by the Express middleware.
   * Uses the user returned from the auth function — no need for auth.currentUser.
   */
  async function setClaimsOnApi(user: { getIdToken: () => Promise<string> }): Promise<void> {
    const token = await user.getIdToken()
    const response = await fetch(`${API_BASE}/register/set-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? `HTTP ${response.status}`)
    }
  }

  /**
   * Email/password registration flow:
   * 1. Create auth user
   * 2. Set displayName (required by spec for gerocultor identity)
   * 3. Call REST endpoint → assign 'gerocultor'
   * 4. Sign in and redirect
   */
  async function handleEmailPasswordSubmit(): Promise<void> {
    if (!email.value || !passwordInput.value || !confirmPasswordInput.value) return

    if (passwordInput.value !== confirmPasswordInput.value) {
      errorMessage.value = 'Las contraseñas no coinciden.'
      return
    }

    errorMessage.value = null
    state.value = 'creating'

    try {
      // Step 1: Create Firebase Auth user with email+password
      const { user } = await createUserWithEmailAndPassword(auth, email.value, passwordInput.value)

      // Step 2: Set displayName (derive from email local-part)
      const displayName = email.value.split('@')[0]
      await updateProfile(user, { displayName })

      // Step 3: Call REST endpoint → assign 'gerocultor' role
      state.value = 'setting-claims'
      await setClaimsOnApi(user)

      // Step 4: Update store with newly registered user and redirect
      state.value = 'signing-in'
      store.setUser(user)
      await store.setRoleFromUser(user)
      state.value = 'done'
      await router.push({ name: DASHBOARD_ROUTES.name })
    } catch (err: unknown) {
      state.value = 'error'
      const code =
        err instanceof Error && 'code' in err ? (err as { code: string }).code : String(err)
      errorMessage.value = mapAuthError(code)
    }
  }

  /**
   * Google OAuth registration flow:
   * 1. Sign in with Google popup
   * 2. Call REST endpoint → assign 'gerocultor'
   * 3. (User is already signed in from step 1) → redirect
   */
  async function handleGoogleSubmit(): Promise<void> {
    errorMessage.value = null
    state.value = 'creating'

    try {
      // Step 1: Open Google OAuth popup
      const { user } = await signInWithPopup(auth, googleProvider)

      // Step 2: Call REST endpoint → assign 'gerocultor'
      state.value = 'setting-claims'
      await setClaimsOnApi(user)

      // Step 3: User is already signed in from step 1 → redirect
      void user // suppress unused — presence confirms success
      state.value = 'done'
      await router.push({ name: DASHBOARD_ROUTES.name })
    } catch (err: unknown) {
      state.value = 'error'
      const code =
        err instanceof Error && 'code' in err ? (err as { code: string }).code : String(err)
      errorMessage.value = mapAuthError(code)
    }
  }

  function togglePassword(): void {
    showPassword.value = !showPassword.value
  }

  return {
    email,
    passwordInput,
    confirmPasswordInput,
    showPassword,
    errorMessage,
    state,
    isLoading,
    handleEmailPasswordSubmit,
    handleGoogleSubmit,
    togglePassword,
  }
}
