<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'

// ─── Composable dependencies ─────────────────────────────────────────────────
// Per frontend-specialist.md §7: composables are the bridge between pages and stores.
// However, for the auth store (global state), the page imports it directly via useAuthStore().
// This is the established pattern for the auth module (see AGENTS.md §3).

const store = useAuthStore()
const router = useRouter()

// ─── Local form state ────────────────────────────────────────────────────────

const email = ref('')
const passwordInput = ref('')
const errorMessage = ref<string | null>(null)

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleSubmit(): Promise<void> {
  // Basic client-side guard: HTML5 `required` attributes handle the native validation,
  // but we also check here to avoid Firebase calls with empty credentials (TC-08).
  if (!email.value || !passwordInput.value) return

  errorMessage.value = null

  try {
    await store.signIn(email.value, passwordInput.value)
    await router.push('/dashboard')
  } catch {
    // Generic error message — must NOT reveal which field failed (TC-04, TC-05).
    errorMessage.value = 'Credenciales incorrectas. Inténtelo de nuevo.'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__title">Iniciar sesión</h1>

      <form class="login-form" @submit.prevent="handleSubmit">
        <!-- Email field -->
        <div class="login-form__field">
          <label class="login-form__label" for="login-email">
            Correo electrónico
          </label>
          <input
            id="login-email"
            v-model="email"
            class="login-form__input"
            type="email"
            name="email"
            autocomplete="email"
            required
            :disabled="store.isLoading"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <!-- Password field -->
        <div class="login-form__field">
          <label class="login-form__label" for="login-password">
            Contraseña
          </label>
          <input
            id="login-password"
            v-model="passwordInput"
            class="login-form__input"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            :disabled="store.isLoading"
          />
        </div>

        <!-- Generic error message (TC-04, TC-05) -->
        <p
          v-if="errorMessage"
          class="login-form__error"
          data-testid="error-message"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <!-- Submit button with loading state (TC-09) -->
        <button
          class="login-form__submit"
          type="submit"
          :disabled="store.isLoading"
        >
          <template v-if="store.isLoading">
            <span
              class="login-form__spinner"
              data-testid="loading-spinner"
              aria-hidden="true"
            />
            <span>Cargando...</span>
          </template>
          <template v-else>
            Iniciar sesión
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "../style.css";

/* ─── Page wrapper ──────────────────────────────────────────────────────────── */
.login-page {
  @apply min-h-screen flex items-center justify-center bg-gray-50 px-4;
}

/* ─── Card ──────────────────────────────────────────────────────────────────── */
.login-card {
  @apply w-full max-w-sm bg-white rounded-2xl shadow-lg p-8;
}

.login-card__title {
  @apply text-2xl font-semibold text-gray-900 mb-6 text-center;
}

/* ─── Form ───────────────────────────────────────────────────────────────────── */
.login-form {
  @apply flex flex-col gap-5;
}

.login-form__field {
  @apply flex flex-col gap-1;
}

.login-form__label {
  @apply text-sm font-medium text-gray-700;
}

.login-form__input {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
         disabled:bg-gray-100 disabled:cursor-not-allowed transition;
}

/* ─── Error message ──────────────────────────────────────────────────────────── */
.login-form__error {
  @apply rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700;
}

/* ─── Submit button ──────────────────────────────────────────────────────────── */
.login-form__submit {
  @apply flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-2.5
         text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2
         focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition;
}

/* ─── Spinner ────────────────────────────────────────────────────────────────── */
.login-form__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
