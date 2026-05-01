<script setup lang="ts">
/**
 * RegisterPage — self-service registration screen for gerocultors.
 *
 * Architecture (frontend-specialist.md §4, §6):
 *   - Pages import ONLY from presentation/composables/ — never stores or repos directly.
 *   - BEM class names in HTML template; Tailwind via @apply in <style scoped>.
 *
 * Stitch reference: screen e5e3e7eea6e249929b0deef401bf083b
 * (design-source.md row: Login screen — same visual style, adapted for registration)
 */
import { useRegister } from '@/business/auth/presentation/composables/useRegister'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import {
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline'

const {
  email,
  passwordInput,
  confirmPasswordInput,
  showPassword,
  errorMessage,
  isLoading,
  handleEmailPasswordSubmit,
  handleGoogleSubmit,
  togglePassword,
} = useRegister()

const year = Temporal.Now.plainDateISO().year
</script>

<template>
  <!-- Full-screen centered layout with mint-teal gradient background -->
  <div class="register-page">
    <!-- Header above card -->
    <header class="register-header">
      <!-- Spa icon badge -->
      <div class="register-header__icon-badge">
        <SparklesIcon class="register-header__icon" aria-hidden="true" />
      </div>
      <h1 class="register-header__title">Care &amp; Serenity</h1>
      <p class="register-header__subtitle">Crea tu cuenta de gerocultor</p>
    </header>

    <!-- Registration card -->
    <div class="register-card">
      <h2 class="register-card__heading">Registrarse</h2>

      <!-- Google OAuth button (primary action for Google users) -->
      <button
        class="register-form__google-submit"
        type="button"
        data-testid="google-submit-button"
        :disabled="isLoading"
        @click="handleGoogleSubmit"
      >
        <!-- Google brand icon -->
        <svg class="register-form__google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Continuar con Google</span>
      </button>

      <!-- Divider -->
      <div class="register-form__divider">
        <div class="register-form__divider-line" aria-hidden="true" />
        <span class="register-form__divider-text">O CON CORREO</span>
        <div class="register-form__divider-line" aria-hidden="true" />
      </div>

      <!-- Email/password form -->
      <form
        class="register-form"
        data-testid="register-form"
        novalidate
        @submit.prevent="handleEmailPasswordSubmit"
      >
        <!-- Email field -->
        <div class="register-form__field">
          <label class="register-form__label" for="register-email"> Correo electrónico </label>
          <input
            id="register-email"
            v-model="email"
            class="register-form__input"
            type="email"
            name="email"
            autocomplete="email"
            required
            data-testid="email-input"
            :disabled="isLoading"
            placeholder="nombre@care-serenity.com"
          />
        </div>

        <!-- Password field -->
        <div class="register-form__field">
          <label class="register-form__label" for="register-password"> Contraseña </label>
          <div class="register-form__input-wrapper">
            <input
              id="register-password"
              v-model="passwordInput"
              class="register-form__input register-form__input--password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="new-password"
              required
              data-testid="password-input"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="register-form__toggle-visibility"
              :aria-label="showPassword ? 'Ocultar clave' : 'Mostrar clave'"
              @click="togglePassword"
            >
              <EyeSlashIcon
                v-if="showPassword"
                class="register-form__visibility-icon"
                aria-hidden="true"
              />
              <EyeIcon v-else class="register-form__visibility-icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Confirm password field -->
        <div class="register-form__field">
          <label class="register-form__label" for="register-confirm-password">
            Confirmar contraseña
          </label>
          <div class="register-form__input-wrapper">
            <input
              id="register-confirm-password"
              v-model="confirmPasswordInput"
              class="register-form__input register-form__input--password"
              :type="showPassword ? 'text' : 'password'"
              name="confirmPassword"
              autocomplete="new-password"
              required
              data-testid="confirm-password-input"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="register-form__toggle-visibility"
              :aria-label="showPassword ? 'Ocultar clave' : 'Mostrar clave'"
              @click="togglePassword"
            >
              <EyeSlashIcon
                v-if="showPassword"
                class="register-form__visibility-icon"
                aria-hidden="true"
              />
              <EyeIcon v-else class="register-form__visibility-icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Generic error message -->
        <div
          v-if="errorMessage"
          class="register-form__error"
          data-testid="error-message"
          role="alert"
        >
          <ExclamationCircleIcon class="register-form__error-icon" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit button with loading state -->
        <button
          class="register-form__submit"
          type="submit"
          data-testid="submit-button"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <span class="register-form__spinner" data-testid="loading-spinner" aria-hidden="true" />
            <span>Cargando...</span>
          </template>
          <template v-else>
            <span>Crear cuenta</span>
            <ArrowRightIcon class="register-form__submit-icon" aria-hidden="true" />
          </template>
        </button>
      </form>

      <!-- Already have account link -->
      <p class="register-card__login-link">
        ¿Ya tienes cuenta?
        <router-link class="register-card__login-link-text" :to="{ name: AUTH_ROUTES.LOGIN.name }">
          Inicia sesión
        </router-link>
      </p>
    </div>

    <!-- Footer -->
    <footer class="register-footer">
      <p class="register-footer__notice">
        <LockClosedIcon class="register-footer__lock" aria-hidden="true" />
        Solo para personal autorizado
      </p>
      <nav class="register-footer__links" aria-label="Legal y soporte">
        <a href="#" class="register-footer__link">Política de Privacidad</a>
        <span class="register-footer__separator" aria-hidden="true">|</span>
        <a href="#" class="register-footer__link">Soporte Técnico</a>
      </nav>
      <p class="register-footer__copyright">
        © {{ year }} Care &amp; Serenity Editorial. Staff Portal.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "#/style.css";

/* ─── Page wrapper ──────────────────────────────────────────────────────────── */
.register-page {
  @apply min-h-screen flex flex-col items-center justify-center p-6;
  background: linear-gradient(135deg, #f0faf7 0%, #f6faf9 100%);
  gap: 1.5rem;
}

/* ─── Header ────────────────────────────────────────────────────────────────── */
.register-header {
  @apply flex flex-col items-center gap-2 text-center;
}

.register-header__icon-badge {
  @apply flex items-center justify-center w-12 h-12 rounded-full;
  background-color: var(--color-secondary-container);
}

.register-header__icon {
  @apply w-6 h-6;
  color: var(--color-primary);
}

.register-header__title {
  @apply font-bold text-3xl tracking-tight;
  font-family: var(--font-headline);
  color: var(--color-primary);
}

.register-header__subtitle {
  @apply text-sm;
  font-family: var(--font-body);
  color: var(--color-on-surface-variant);
  opacity: 0.7;
}

/* ─── Card ─────────────────────────────────────────────────────────────────── */
.register-card {
  @apply w-full max-w-sm rounded-xl p-8;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0px 24px 48px rgba(24, 29, 28, 0.06);
}

.register-card__heading {
  @apply text-xl font-semibold mb-5 text-center;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.register-card__login-link {
  @apply mt-4 text-center text-sm;
  font-family: var(--font-body);
  color: var(--color-on-surface-variant);
}

.register-card__login-link-text {
  @apply underline underline-offset-2;
  color: var(--color-primary);
}

/* ─── Form ───────────────────────────────────────────────────────────────────── */
.register-form {
  @apply flex flex-col gap-5;
}

.register-form__field {
  @apply flex flex-col gap-1.5;
}

.register-form__label {
  @apply px-1 text-sm font-medium;
  font-family: var(--font-body);
  color: var(--color-on-surface-variant);
}

.register-form__input-wrapper {
  @apply relative;
}

.register-form__input {
  @apply w-full border-none rounded-xl px-4 py-3.5 text-sm outline-none;
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface);
  transition: box-shadow 0.15s ease;

  &:focus {
    box-shadow: 1px 1px 10px 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
}

.register-form__input:disabled {
  @apply cursor-not-allowed opacity-60;
}

.register-form__input--password {
  @apply pr-12;
}

.register-form__toggle-visibility {
  @apply absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer;
  color: var(--color-outline);
  transition: color 0.15s ease;
}

.register-form__toggle-visibility:hover {
  color: var(--color-primary);
}

.register-form__toggle-visibility .register-form__visibility-icon {
  @apply w-[1.125rem] h-[1.125rem];
}

/* ─── Google button ─────────────────────────────────────────────────────────── */
.register-form__google-submit {
  @apply flex items-center justify-center gap-3 w-full rounded-full py-3.5 font-semibold text-base cursor-pointer border-none;
  font-family: var(--font-headline);
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface);
  transition:
    opacity 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: 0px 2px 8px rgba(24, 29, 28, 0.08);
}

.register-form__google-submit:hover:not(:disabled) {
  box-shadow: 0px 4px 16px rgba(24, 29, 28, 0.12);
}

.register-form__google-submit:disabled {
  @apply cursor-not-allowed;
  opacity: 0.6;
}

.register-form__google-icon {
  @apply w-5 h-5;
}

/* ─── Divider ─────────────────────────────────────────────────────────────────── */
.register-form__divider {
  @apply flex items-center gap-3;
}

.register-form__divider-line {
  @apply flex-1 h-px;
  background-color: var(--color-surface-container-high);
}

.register-form__divider-text {
  @apply uppercase tracking-widest text-[10px] whitespace-nowrap;
  color: var(--color-outline-variant);
  font-family: var(--font-body);
}

/* ─── Error message ──────────────────────────────────────────────────────────── */
.register-form__error {
  @apply flex items-center gap-2 p-3 rounded-lg text-xs;
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.register-form__error-icon {
  @apply w-4 h-4;
  flex-shrink: 0;
}

/* ─── Submit button ─────────────────────────────────────────────────────────── */
.register-form__submit {
  @apply flex items-center justify-center gap-2 w-full rounded-full py-4 font-semibold text-base cursor-pointer border-none;
  font-family: var(--font-headline);
  color: var(--color-on-primary);
  background: linear-gradient(135deg, #005050 0%, #006a6a 100%);
  box-shadow: 0px 8px 24px rgba(0, 80, 80, 0.25);
  transition:
    opacity 0.15s ease,
    box-shadow 0.15s ease;
}

.register-form__submit:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0px 12px 32px rgba(0, 80, 80, 0.3);
}

.register-form__submit:disabled {
  @apply cursor-not-allowed;
  opacity: 0.6;
}

.register-form__submit-icon {
  @apply w-[1.125rem] h-[1.125rem];
}

/* ─── Spinner ────────────────────────────────────────────────────────────────── */
.register-form__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
.register-footer {
  @apply flex flex-col items-center gap-1.5 text-center;
}

.register-footer__notice {
  @apply flex items-center gap-1.5 text-xs;
  color: var(--color-outline);
}

.register-footer__lock {
  @apply w-3.5 h-3.5;
}

.register-footer__links {
  @apply flex items-center gap-2 text-xs;
  color: var(--color-outline-variant);
}

.register-footer__link {
  @apply underline underline-offset-2;
  color: var(--color-outline);
  text-decoration-color: var(--color-outline-variant);
  transition: color 0.15s ease;
}

.register-footer__link:hover {
  color: var(--color-primary);
}

.register-footer__separator {
  color: var(--color-outline-variant);
}

.register-footer__copyright {
  @apply text-[10px];
  color: var(--color-outline-variant);
}
</style>
