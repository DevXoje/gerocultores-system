<script setup lang="ts">
/**
 * TurnoView.vue — Full-page view for shift management.
 *
 * US-11: Resumen de fin de turno
 *
 * Stitch reference: TurnoView
 * Screen ID: 74dc49b5d18c44ea8ab1b6079320622f
 * Design source: OUTPUTS/technical-docs/design-source.md
 *
 * Architecture (frontend-specialist.md §6):
 *   - Page-level view — imports only from composables.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 */
import { onMounted, ref } from 'vue'
import { useTurno } from '@/business/turno/presentation/composables/useTurno'
import ResumenTurnoModal from '@/business/turno/presentation/components/ResumenTurnoModal.vue'
import type { TipoTurno } from '@/business/turno/domain/entities/Turno'

const {
  turnoActivo,
  hasTurnoActivo,
  isLoading,
  error,
  resumen,
  cargarTurnoActivo,
  iniciarTurno,
  finalizarTurno,
} = useTurno()

const showResumenModal = ref(false)

onMounted(() => {
  cargarTurnoActivo()
})

function handleIniciar(tipoTurno: TipoTurno = 'manyana'): void {
  iniciarTurno(tipoTurno)
}

function handleFinalizarClick(): void {
  showResumenModal.value = true
}

async function handleConfirmResumen(resumenTraspaso: string): Promise<void> {
  await finalizarTurno(resumenTraspaso)
  // Modal stays open to show the aggregated resumen (resumen ref populated by useTurno)
}

function handleCancelResumen(): void {
  showResumenModal.value = false
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <main class="turno-view">
    <header class="turno-view__header">
      <h1 class="turno-view__title">Mi Turno</h1>
    </header>

    <!-- Error banner -->
    <div v-if="error" class="turno-view__error" role="alert">
      {{ error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading && !turnoActivo" class="turno-view__loading" aria-live="polite">
      <span class="turno-view__spinner" aria-hidden="true" />
      <span>Cargando turno…</span>
    </div>

    <!-- Active turno card -->
    <template v-else-if="hasTurnoActivo && turnoActivo">
      <section class="turno-view__card turno-view__card--active" aria-label="Turno activo">
        <div class="turno-view__card-header">
          <span class="turno-view__badge turno-view__badge--active">En curso</span>
          <time class="turno-view__fecha">{{ formatDate(turnoActivo.fecha) }}</time>
        </div>
        <dl class="turno-view__details">
          <div class="turno-view__detail-row">
            <dt class="turno-view__detail-label">Inicio</dt>
            <dd class="turno-view__detail-value">
              {{
                turnoActivo.inicio.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          class="turno-view__btn turno-view__btn--danger"
          :disabled="isLoading"
          @click="handleFinalizarClick"
        >
          Finalizar turno
        </button>
      </section>
    </template>

    <!-- No active turno -->
    <template v-else-if="!isLoading">
      <section class="turno-view__empty" aria-label="Sin turno activo">
        <ClockIcon class="turno-view__empty-icon" aria-hidden="true" />
        <p class="turno-view__empty-msg">No tienes un turno activo.</p>
        <button
          type="button"
          class="turno-view__btn turno-view__btn--primary"
          :disabled="isLoading"
          @click="handleIniciar()"
        >
          <span v-if="isLoading" class="turno-view__spinner" aria-hidden="true" />
          <span v-else>Iniciar turno</span>
        </button>
      </section>
    </template>

    <!-- Resumen modal -->
    <ResumenTurnoModal
      :open="showResumenModal"
      :is-loading="isLoading"
      :initial-resumen="turnoActivo?.resumenTraspaso"
      :resumen-data="resumen"
      @confirm="handleConfirmResumen"
      @cancel="handleCancelResumen"
    />
  </main>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "../../../../style.css";

.turno-view {
  @apply flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto;
}

.turno-view__header {
  @apply flex items-center justify-between;
}

.turno-view__title {
  @apply text-2xl font-bold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

/* ─── Error ──────────────────────────────────────────────────────────────── */
.turno-view__error {
  @apply rounded-xl px-4 py-3 text-sm;
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}

/* ─── Loading ─────────────────────────────────────────────────────────────── */
.turno-view__loading {
  @apply flex items-center justify-center gap-2 py-12 text-sm;
  color: var(--color-on-surface-variant);
}

.turno-view__spinner {
  @apply inline-block h-5 w-5 rounded-full border-2 border-t-transparent;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
.turno-view__card {
  @apply rounded-2xl p-5 flex flex-col gap-4 shadow-sm;
  background-color: var(--color-surface-container-low);
}

.turno-view__card--active {
  border-left: 4px solid var(--color-primary);
}

.turno-view__card-header {
  @apply flex items-center justify-between flex-wrap gap-2;
}

.turno-view__badge {
  @apply text-xs font-bold uppercase rounded-full px-3 py-1;
}

.turno-view__badge--active {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.turno-view__fecha {
  @apply text-sm capitalize;
  color: var(--color-on-surface-variant);
}

/* ─── Details ────────────────────────────────────────────────────────────── */
.turno-view__details {
  @apply flex flex-col gap-2;
}

.turno-view__detail-row {
  @apply flex items-center gap-2;
}

.turno-view__detail-label {
  @apply text-sm font-medium w-16;
  color: var(--color-on-surface-variant);
}

.turno-view__detail-value {
  @apply text-sm font-semibold;
  color: var(--color-on-surface);
}

/* ─── Empty ──────────────────────────────────────────────────────────────── */
.turno-view__empty {
  @apply flex flex-col items-center gap-4 py-12;
}

.turno-view__empty-icon {
  @apply w-12 h-12;
  color: var(--color-outline-variant);
}

.turno-view__empty-msg {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.turno-view__btn {
  @apply flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer border-none;
  transition: opacity 0.15s ease;
}

.turno-view__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.turno-view__btn--primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.turno-view__btn--danger {
  background-color: var(--color-error);
  color: var(--color-on-error);
}
</style>
