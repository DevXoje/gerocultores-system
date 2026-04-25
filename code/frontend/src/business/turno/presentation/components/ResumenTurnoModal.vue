<script setup lang="ts">
/**
 * ResumenTurnoModal.vue — Modal for entering end-of-shift handover notes
 * and displaying the aggregated shift summary from GET /api/turnos/:id/resumen.
 *
 * US-11: Resumen de fin de turno
 *
 * Stitch reference: ResumenTurnoModal (inline element within TurnoView)
 * Design source: OUTPUTS/technical-docs/design-source.md — TurnoView screen 74dc49b5d18c44ea8ab1b6079320622f
 *
 * Architecture (frontend-specialist.md §6):
 *   - Pure presentation — receives state via props, emits actions.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 *   - No store imports — all state flows via composable in parent.
 */
import type { TurnoResumen } from '@/business/turno/infrastructure/api/turnoApi'

const props = defineProps<{
  open: boolean
  isLoading: boolean
  initialResumen?: string | null
  /** Populated after finalizarTurno — shows aggregated stats */
  resumenData?: TurnoResumen | null
}>()

const emit = defineEmits<{
  confirm: [resumen: string]
  cancel: []
}>()

import { ref, watch } from 'vue'

const resumen = ref(props.initialResumen ?? '')

watch(
  () => props.initialResumen,
  (val) => {
    resumen.value = val ?? ''
  }
)

function handleConfirm(): void {
  emit('confirm', resumen.value.trim())
}
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="open"
      class="resumen-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resumen-modal-title"
    >
      <div class="resumen-modal__card">
        <!-- Header -->
        <header class="resumen-modal__header">
          <h2 id="resumen-modal-title" class="resumen-modal__title">Resumen de fin de turno</h2>
        </header>

        <!-- Aggregated stats — shown after shift is closed (resumenData populated) -->
        <div v-if="resumenData" class="resumen-modal__stats" aria-label="Estadísticas del turno">
          <dl class="resumen-modal__stats-grid">
            <div class="resumen-modal__stat">
              <dt class="resumen-modal__stat-label">Tareas completadas</dt>
              <dd class="resumen-modal__stat-value">{{ resumenData.tareasCompletadas }}</dd>
            </div>
            <div class="resumen-modal__stat">
              <dt class="resumen-modal__stat-label">Tareas pendientes</dt>
              <dd class="resumen-modal__stat-value">{{ resumenData.tareasPendientes }}</dd>
            </div>
            <div class="resumen-modal__stat">
              <dt class="resumen-modal__stat-label">Incidencias</dt>
              <dd class="resumen-modal__stat-value">{{ resumenData.incidenciasRegistradas }}</dd>
            </div>
            <div class="resumen-modal__stat">
              <dt class="resumen-modal__stat-label">Residentes atendidos</dt>
              <dd class="resumen-modal__stat-value">
                {{ resumenData.residentesAtendidos.length }}
              </dd>
            </div>
          </dl>
          <p class="resumen-modal__texto">{{ resumenData.textoResumen }}</p>
        </div>

        <!-- Body — textarea for handover notes (shown when shift not yet closed) -->
        <div v-if="!resumenData" class="resumen-modal__body">
          <label for="resumen-textarea" class="resumen-modal__label"> Notas de traspaso </label>
          <textarea
            id="resumen-textarea"
            v-model="resumen"
            class="resumen-modal__textarea"
            rows="6"
            placeholder="Describe el estado de los residentes, incidencias relevantes y cualquier información para el siguiente turno…"
            :disabled="isLoading"
          />
        </div>

        <!-- Footer -->
        <footer class="resumen-modal__footer">
          <button
            type="button"
            class="resumen-modal__btn resumen-modal__btn--secondary"
            :disabled="isLoading"
            @click="emit('cancel')"
          >
            Cancelar
          </button>
          <button
            v-if="!resumenData"
            type="button"
            class="resumen-modal__btn resumen-modal__btn--primary"
            :disabled="isLoading || resumen.trim().length === 0"
            @click="handleConfirm"
          >
            <span v-if="isLoading" class="resumen-modal__spinner" aria-hidden="true" />
            <span v-else>Finalizar turno</span>
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Tailwind v4: @reference is required in scoped styles to access @apply utilities */
@reference "../../../../style.css";

.resumen-modal__backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
  background-color: rgba(0, 0, 0, 0.4);
}

.resumen-modal__card {
  @apply w-full max-w-lg rounded-2xl shadow-xl flex flex-col;
  background-color: var(--color-surface);
  max-height: 90vh;
}

.resumen-modal__header {
  @apply px-6 pt-6 pb-4;
}

.resumen-modal__title {
  @apply text-lg font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.resumen-modal__body {
  @apply px-6 pb-4 flex flex-col gap-2 flex-1;
}

.resumen-modal__label {
  @apply text-sm font-medium;
  color: var(--color-on-surface-variant);
}

.resumen-modal__textarea {
  @apply w-full rounded-xl border p-3 text-sm resize-none outline-none transition-colors;
  border-color: var(--color-outline-variant);
  color: var(--color-on-surface);
  background-color: var(--color-surface-container-low);
}

.resumen-modal__textarea:focus {
  border-color: var(--color-primary);
}

.resumen-modal__textarea:disabled {
  opacity: 0.6;
}

.resumen-modal__footer {
  @apply flex justify-end gap-3 px-6 py-4 border-t;
  border-color: var(--color-outline-variant);
}

.resumen-modal__btn {
  @apply px-5 py-2 rounded-full text-sm font-semibold cursor-pointer border-none;
  transition: opacity 0.15s ease;
}

.resumen-modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resumen-modal__btn--secondary {
  background-color: var(--color-surface-container-highest);
  color: var(--color-on-surface-variant);
}

.resumen-modal__btn--primary {
  @apply flex items-center gap-2;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.resumen-modal__spinner {
  @apply inline-block h-4 w-4 rounded-full border-2 border-t-transparent;
  border-color: var(--color-on-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
