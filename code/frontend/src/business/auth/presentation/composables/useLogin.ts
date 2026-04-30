/**
 * useLogin — composable bridge between LoginPage and useAuthStore.
 *
 * Architecture (frontend-specialist.md §7):
 *   - This composable is the ONLY entry point for LoginPage to interact with
 *     authentication state and actions.
 *   - Pages import ONLY this composable — never the store directly.
 *   - Owns: form state, loading, error, submit logic, visibility toggle.
 *   - Firebase calls delegated to AuthRepository (infrastructure), not called directly.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { authRepository } from '@/business/auth/infrastructure/AuthRepository'
import { DASHBOARD_ROUTES } from '@/views/route-names'

export function useLogin() {
  const store = useAuthStore()
  const router = useRouter()

  const email = ref('')
  const passwordInput = ref('')
  const errorMessage = ref<string | null>(null)
  const showPassword = ref(false)

  const isLoading = computed(() => store.isLoading)

  /**
   * On mount, check for a pending Google OAuth redirect result.
   * When signInWithRedirect completes, the user returns to this page without
   * a navigation event, so we must detect the credential here.
   */
  onMounted(async () => {
    const result = await authRepository.getPendingRedirectResult()
    if (result) {
      store.setUser(result.user)
      await store.setRoleFromUser(result.user)
      await router.push({ name: DASHBOARD_ROUTES.name })
    }
  })

  async function handleSubmit(): Promise<void> {
    if (!email.value || !passwordInput.value) return
    errorMessage.value = null
    try {
      const { user } = await authRepository.signInWithEmail(email.value, passwordInput.value)
      store.setUser(user)
      await store.setRoleFromUser(user)
      await router.push({ name: DASHBOARD_ROUTES.name })
    } catch {
      errorMessage.value = 'Credenciales incorrectas. Por favor intente de nuevo.'
    }
  }

  async function handleGoogleSubmit(): Promise<void> {
    errorMessage.value = null
    try {
      await authRepository.signInWithGoogle()
      // signInWithRedirect triggers redirect; user will return to the app.
      // getPendingRedirectResult() in onMounted will capture the credential.
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : String(err)
      if (code === 'AUTH_REDIRECT_INITIATED') return
      errorMessage.value = 'No se pudo iniciar sesión con Google. Intenta de nuevo.'
    }
  }

  function togglePassword(): void {
    showPassword.value = !showPassword.value
  }

  return {
    email,
    passwordInput,
    errorMessage,
    showPassword,
    isLoading,
    handleSubmit,
    handleGoogleSubmit,
    togglePassword,
  }
}