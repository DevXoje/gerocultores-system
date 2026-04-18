<script setup lang="ts">
/**
 * LoginPage — authentication screen.
 *
 * Architecture (frontend-specialist.md §4, §6):
 *   - Pages import ONLY from presentation/composables/ — never stores or repos directly.
 *   - BEM class names in HTML template; Tailwind via @apply in <style scoped>.
 *
 * Stitch reference: screen e5e3e7eea6e249929b0deef401bf083b
 * (design-source.md row: Login screen — Care & Serenity portal)
 */
import { useLogin } from '../composables/useLogin'

const {
  email,
  passwordInput,
  errorMessage,
  showPassword,
  isLoading,
  handleSubmit,
  togglePassword,
} = useLogin()
const year = Temporal.Now.plainDateISO().year
</script>

<template>
  <!-- Full-screen centered layout with mint-teal gradient background -->
  <div class="login-page">
    <!-- Header above card -->
    <header class="login-header">
      <!-- Spa icon badge -->
      <div class="login-header__icon-badge">
        <span class="material-symbols-outlined login-header__icon" aria-hidden="true">spa</span>
      </div>
      <h1 class="login-header__title">Care &amp; Serenity</h1>
      <p class="login-header__subtitle">Accede a tu turno</p>
    </header>

    <!-- Login card -->
    <div class="login-card">
      <h2 class="login-card__heading">Iniciar sesión</h2>
      <form class="login-form" data-testid="login-form" novalidate @submit.prevent="handleSubmit">
        <!-- Email field -->
        <div class="login-form__field">
          <label class="login-form__label" for="login-email"> Correo electrónico </label>
          <input
            id="login-email"
            v-model="email"
            class="login-form__input"
            type="email"
            name="email"
            autocomplete="email"
            required
            data-testid="email-input"
            :disabled="isLoading"
            placeholder="nombre@care-serenity.com"
          />
        </div>

        <!-- Password field with visibility toggle -->
        <div class="login-form__field">
          <label class="login-form__label" for="login-password"> Contraseña </label>
          <div class="login-form__input-wrapper">
            <input
              id="login-password"
              v-model="passwordInput"
              class="login-form__input login-form__input--password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              required
              data-testid="password-input"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="login-form__toggle-visibility"
              :aria-label="showPassword ? 'Ocultar clave' : 'Mostrar clave'"
              @click="togglePassword"
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Generic error message (TC-04, TC-05) -->
        <div v-if="errorMessage" class="login-form__error" data-testid="error-message" role="alert">
          <span class="material-symbols-outlined login-form__error-icon" aria-hidden="true"
            >error</span
          >
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Divider -->
        <div class="login-form__divider">
          <div class="login-form__divider-line" aria-hidden="true" />
          <span class="login-form__divider-text">PORTAL INTERNO</span>
          <div class="login-form__divider-line" aria-hidden="true" />
        </div>

        <!-- Submit button with loading state (TC-09) -->
        <button
          class="login-form__submit"
          type="submit"
          data-testid="submit-button"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <span class="login-form__spinner" data-testid="loading-spinner" aria-hidden="true" />
            <span>Cargando...</span>
          </template>
          <template v-else>
            <span>Iniciar sesión</span>
            <span class="material-symbols-outlined login-form__submit-icon" aria-hidden="true"
              >arrow_forward</span
            >
          </template>
        </button>
      </form>
    </div>

    <!-- Footer -->
    <footer class="login-footer">
      <p class="login-footer__notice">
        <span class="material-symbols-outlined login-footer__lock" aria-hidden="true">lock</span>
        Solo para personal autorizado
      </p>
      <nav class="login-footer__links" aria-label="Legal y soporte">
        <a href="#" class="login-footer__link">Política de Privacidad</a>
        <span class="login-footer__separator" aria-hidden="true">|</span>
        <a href="#" class="login-footer__link">Soporte Técnico</a>
      </nav>
      <p class="login-footer__copyright">
        © {{ year }} Care &amp; Serenity Editorial. Staff Portal.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "../../../../style.css";

/* ─── Page wrapper ──────────────────────────────────────────────────────────── */
.login-page {
  @apply min-h-screen flex flex-col items-center justify-center p-6;
  background: linear-gradient(135deg, #f0faf7 0%, #f6faf9 100%);
  gap: 1.5rem;
}

/* ─── Header ────────────────────────────────────────────────────────────────── */
.login-header {
  @apply flex flex-col items-center gap-2 text-center;
}

.login-header__icon-badge {
  @apply flex items-center justify-center w-12 h-12 rounded-full;
  background-color: var(--color-secondary-container);
}

.login-header__icon {
  font-size: 1.5rem;
  color: var(--color-primary);
  font-variation-settings:
    'FILL' 1,
    'wght' 400;
}

.login-header__title {
  @apply font-bold text-3xl tracking-tight;
  font-family: var(--font-headline);
  color: var(--color-primary);
}

.login-header__subtitle {
  @apply text-sm;
  font-family: var(--font-body);
  color: var(--color-on-surface-variant);
  opacity: 0.7;
}

/* ─── Card ──────────────────────────────────────────────────────────────────── */
.login-card {
  @apply w-full max-w-sm rounded-xl p-8;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0px 24px 48px rgba(24, 29, 28, 0.06);
}

.login-card__heading {
  @apply text-xl font-semibold mb-5 text-center;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

/* ─── Form ───────────────────────────────────────────────────────────────────── */
.login-form {
  @apply flex flex-col gap-5;
}

.login-form__field {
  @apply flex flex-col gap-1.5;
}

.login-form__label {
  @apply px-1 text-sm font-medium;
  font-family: var(--font-body);
  color: var(--color-on-surface-variant);
}

.login-form__input-wrapper {
  @apply relative;
}

.login-form__input {
  @apply w-full border-none rounded-xl px-4 py-3.5 text-sm outline-none;
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface);
  transition: box-shadow 0.15s ease;

  &:focus {
    box-shadow: 1px 1px 10px 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
}

.login-form__input:disabled {
  @apply cursor-not-allowed opacity-60;
}

.login-form__input--password {
  @apply pr-12;
}

.login-form__toggle-visibility {
  @apply absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer;
  color: var(--color-outline);
  transition: color 0.15s ease;
}

.login-form__toggle-visibility:hover {
  color: var(--color-primary);
}

.login-form__toggle-visibility .material-symbols-outlined {
  font-size: 1.125rem;
}

/* ─── Error message ──────────────────────────────────────────────────────────── */
.login-form__error {
  @apply flex items-center gap-2 p-3 rounded-lg text-xs;
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

.login-form__error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* ─── Divider ─────────────────────────────────────────────────────────────────── */
.login-form__divider {
  @apply flex items-center gap-3;
}

.login-form__divider-line {
  @apply flex-1 h-px;
  background-color: var(--color-surface-container-high);
}

.login-form__divider-text {
  @apply uppercase tracking-widest text-[10px] whitespace-nowrap;
  color: var(--color-outline-variant);
  font-family: var(--font-body);
}

/* ─── Submit button ──────────────────────────────────────────────────────────── */
.login-form__submit {
  @apply flex items-center justify-center gap-2 w-full rounded-full py-4 font-semibold text-base cursor-pointer border-none;
  font-family: var(--font-headline);
  color: var(--color-on-primary);
  background: linear-gradient(135deg, #005050 0%, #006a6a 100%);
  box-shadow: 0px 8px 24px rgba(0, 80, 80, 0.25);
  transition:
    opacity 0.15s ease,
    box-shadow 0.15s ease;
}

.login-form__submit:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0px 12px 32px rgba(0, 80, 80, 0.3);
}

.login-form__submit:disabled {
  @apply cursor-not-allowed;
  opacity: 0.6;
}

.login-form__submit-icon {
  font-size: 1.125rem;
}

/* ─── Spinner ────────────────────────────────────────────────────────────────── */
.login-form__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
.login-footer {
  @apply flex flex-col items-center gap-1.5 text-center;
}

.login-footer__notice {
  @apply flex items-center gap-1.5 text-xs;
  color: var(--color-outline);
}

.login-footer__lock {
  font-size: 0.875rem;
  font-variation-settings: 'FILL' 1;
}

.login-footer__links {
  @apply flex items-center gap-2 text-xs;
  color: var(--color-outline-variant);
}

.login-footer__link {
  @apply underline underline-offset-2;
  color: var(--color-outline);
  text-decoration-color: var(--color-outline-variant);
  transition: color 0.15s ease;
}

.login-footer__link:hover {
  color: var(--color-primary);
}

.login-footer__separator {
  color: var(--color-outline-variant);
}

.login-footer__copyright {
  @apply text-[10px];
  color: var(--color-outline-variant);
}
</style>
