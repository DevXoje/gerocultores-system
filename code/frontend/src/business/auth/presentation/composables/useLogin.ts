/**
 * useLogin — composable bridge between LoginPage and useAuthStore.
 *
 * Architecture (frontend-specialist.md §7):
 *   - This composable is the ONLY entry point for LoginPage to interact with
 *     authentication state and actions.
 *   - Pages import ONLY this composable — never the store directly.
 *   - Owns: form state, loading, error, submit logic, visibility toggle.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { DASHBOARD_ROUTES } from '@/views/route-names'

export function useLogin() {
  const store = useAuthStore()
  const router = useRouter()

  const email = ref('')
  const passwordInput = ref('')
  const errorMessage = ref<string | null>(null)
  const showPassword = ref(false)

  const isLoading = computed(() => store.isLoading)

  async function handleSubmit(): Promise<void> {
    // Basic client-side guard: HTML5 `required` attributes handle the native validation,
    // but we also check here to avoid Firebase calls with empty credentials (TC-08).
    if (!email.value || !passwordInput.value) return
    errorMessage.value = null
    try {
      await store.signIn(email.value, passwordInput.value)
      await router.push({ name: DASHBOARD_ROUTES.name })
    } catch {
      // Generic error message — must NOT reveal which field failed (TC-04, TC-05).
      errorMessage.value = 'Credenciales incorrectas. Por favor intente de nuevo.'
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
    togglePassword,
  }
}
