<!-- Stitch: projects/16168255182252500555 — New Incident Form - Serenity Care (US-06) -->
<!-- OUTPUTS/design-exports/US-06-incident__new-incident-form-serenity-care__20260328.png -->
<script setup lang="ts">
/**
 * IncidenceForm.vue — Modal/inline form to register a new incident.
 *
 * US-06: Registro de incidencia
 *
 * Props:
 *   - residents: list of active residents to populate the resident selector
 *   - preselectedResidenteId: optional pre-fill for residenteId
 *   - preselectedTareaId: optional pre-fill for tareaId
 *
 * Emits:
 *   - submitted(incidencia): incident was created successfully
 *   - cancelled: user dismissed the form
 */
import { computed, onMounted, watch } from 'vue'
import { useIncidencias } from '@/business/incidents/presentation/composables/useIncidencias'
import type {
  IncidenciaResponse,
  IncidenciaTipo,
  IncidenciaSeveridad,
} from '@/business/incidents/domain/entities/incidencia.types'

// ── Prop / Emit types ─────────────────────────────────────────────────────────

interface ResidenteOption {
  id: string
  nombre: string
  apellidos: string
}

const props = defineProps<{
  residents: ResidenteOption[]
  preselectedResidenteId?: string
  preselectedTareaId?: string | null
}>()

const emit = defineEmits<{
  (e: 'submitted', incidencia: IncidenciaResponse): void
  (e: 'cancelled'): void
}>()

// ── Composable ────────────────────────────────────────────────────────────────

const { form, fieldErrors, submitting, submitError, submitIncidencia, resetForm } = useIncidencias()

// ── Pre-fill ──────────────────────────────────────────────────────────────────

onMounted(() => {
  if (props.preselectedResidenteId) {
    form.residenteId = props.preselectedResidenteId
  }
  if (props.preselectedTareaId !== undefined) {
    form.tareaId = props.preselectedTareaId ?? null
  }
})

watch(
  () => props.preselectedResidenteId,
  (val) => {
    if (val) form.residenteId = val
  }
)

// ── Options ───────────────────────────────────────────────────────────────────

const TIPO_OPTIONS: { value: IncidenciaTipo; label: string }[] = [
  { value: 'caida', label: 'Caída' },
  { value: 'comportamiento', label: 'Comportamiento' },
  { value: 'salud', label: 'Salud' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'medicacion', label: 'Medicación' },
  { value: 'otro', label: 'Otro' },
]

const SEVERIDAD_OPTIONS: { value: IncidenciaSeveridad; label: string; modifier: string }[] = [
  { value: 'critica', label: 'Crítica', modifier: 'critica' },
  { value: 'moderada', label: 'Moderada', modifier: 'moderada' },
  { value: 'leve', label: 'Leve', modifier: 'leve' },
]

// ── Derived ───────────────────────────────────────────────────────────────────

const formIsValid = computed(
  () =>
    form.tipo !== '' &&
    form.severidad !== '' &&
    form.residenteId !== '' &&
    form.descripcion.trim().length > 0
)

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleSubmit(): Promise<void> {
  const created = await submitIncidencia()
  if (created) {
    emit('submitted', created)
  }
}

function handleCancel(): void {
  resetForm()
  emit('cancelled')
}

function handleSeveritySelect(value: IncidenciaSeveridad): void {
  form.severidad = value
}
</script>

<template>
  <div
    class="incidence-form"
    role="dialog"
    aria-modal="true"
    aria-labelledby="incidence-form-title"
  >
    <!-- Header -->
    <header class="incidence-form__header">
      <p class="incidence-form__section-label">DOCUMENTACIÓN CLÍNICA</p>
      <h2 id="incidence-form-title" class="incidence-form__title">Detalles del Informe</h2>
      <p class="incidence-form__subtitle">
        Asegúrese de documentar todos los detalles con precisión para la seguridad del residente.
      </p>
    </header>

    <form class="incidence-form__body" novalidate @submit.prevent="handleSubmit">
      <!-- Row: Resident + Task -->
      <div class="incidence-form__row">
        <!-- Resident selector -->
        <div class="incidence-form__field">
          <label for="incidence-residente" class="incidence-form__label">
            Selección de Residente
          </label>
          <select
            id="incidence-residente"
            v-model="form.residenteId"
            class="incidence-form__select"
            :class="{ 'incidence-form__select--error': fieldErrors.residenteId }"
            aria-required="true"
            :aria-invalid="!!fieldErrors.residenteId"
            :aria-describedby="fieldErrors.residenteId ? 'incidence-residente-err' : undefined"
          >
            <option value="" disabled>Seleccionar residente…</option>
            <template v-for="r in residents" :key="r.id">
              <option :value="r.id">{{ r.nombre }} {{ r.apellidos }}</option>
            </template>
          </select>
          <p
            v-if="fieldErrors.residenteId"
            id="incidence-residente-err"
            class="incidence-form__field-error"
            role="alert"
          >
            {{ fieldErrors.residenteId }}
          </p>
        </div>

        <!-- Tipo selector -->
        <div class="incidence-form__field">
          <label for="incidence-tipo" class="incidence-form__label">Tipo de Incidencia</label>
          <select
            id="incidence-tipo"
            v-model="form.tipo"
            class="incidence-form__select"
            :class="{ 'incidence-form__select--error': fieldErrors.tipo }"
            aria-required="true"
            :aria-invalid="!!fieldErrors.tipo"
            :aria-describedby="fieldErrors.tipo ? 'incidence-tipo-err' : undefined"
          >
            <option value="" disabled>Seleccionar tipo…</option>
            <template v-for="opt in TIPO_OPTIONS" :key="opt.value">
              <option :value="opt.value">{{ opt.label }}</option>
            </template>
          </select>
          <p
            v-if="fieldErrors.tipo"
            id="incidence-tipo-err"
            class="incidence-form__field-error"
            role="alert"
          >
            {{ fieldErrors.tipo }}
          </p>
        </div>
      </div>

      <!-- Severity toggle group -->
      <div class="incidence-form__field">
        <p id="incidence-severidad-label" class="incidence-form__label">Nivel de Gravedad</p>
        <div
          class="incidence-form__severity-group"
          role="group"
          aria-labelledby="incidence-severidad-label"
        >
          <template v-for="opt in SEVERIDAD_OPTIONS" :key="opt.value">
            <button
              type="button"
              class="incidence-form__severity-btn"
              :class="{
                [`incidence-form__severity-btn--${opt.modifier}`]: true,
                'incidence-form__severity-btn--active': form.severidad === opt.value,
              }"
              :aria-pressed="form.severidad === opt.value"
              @click="handleSeveritySelect(opt.value)"
            >
              {{ opt.label }}
            </button>
          </template>
        </div>
        <p v-if="fieldErrors.severidad" class="incidence-form__field-error" role="alert">
          {{ fieldErrors.severidad }}
        </p>
      </div>

      <!-- Description textarea -->
      <div class="incidence-form__field">
        <label for="incidence-descripcion" class="incidence-form__label">
          Descripción Detallada
        </label>
        <textarea
          id="incidence-descripcion"
          v-model="form.descripcion"
          class="incidence-form__textarea"
          :class="{ 'incidence-form__textarea--error': fieldErrors.descripcion }"
          rows="4"
          placeholder="Describa exactamente lo que ocurrió, incluyendo acciones inmediatas tomadas y testigos si aplica…"
          aria-required="true"
          :aria-invalid="!!fieldErrors.descripcion"
          :aria-describedby="fieldErrors.descripcion ? 'incidence-descripcion-err' : undefined"
        />
        <p
          v-if="fieldErrors.descripcion"
          id="incidence-descripcion-err"
          class="incidence-form__field-error"
          role="alert"
        >
          {{ fieldErrors.descripcion }}
        </p>
      </div>

      <!-- Global error -->
      <div v-if="submitError" class="incidence-form__error" role="alert">
        <span class="incidence-form__error-icon" aria-hidden="true">⚠</span>
        <span class="incidence-form__error-message">{{ submitError }}</span>
      </div>

      <!-- Compliance note -->
      <div class="incidence-form__compliance" aria-live="polite">
        <span class="incidence-form__compliance-icon" aria-hidden="true">🔒</span>
        <p class="incidence-form__compliance-text">
          Este informe será registrado automáticamente en el historial médico del residente. En caso
          de gravedad crítica, se notificará al administrador.
        </p>
      </div>

      <!-- Actions -->
      <div class="incidence-form__actions">
        <button
          type="submit"
          class="incidence-form__submit-btn"
          :disabled="submitting || !formIsValid"
          :aria-busy="submitting"
        >
          <span v-if="submitting" class="incidence-form__spinner" aria-hidden="true" />
          {{ submitting ? 'Enviando…' : 'Enviar Informe' }}
        </button>
        <button
          type="button"
          class="incidence-form__cancel-btn"
          :disabled="submitting"
          @click="handleCancel"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* ── Root ────────────────────────────────────────────────────────────────── */
.incidence-form {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.incidence-form__header {
  margin-bottom: 1.5rem;
}

.incidence-form__section-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.incidence-form__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.incidence-form__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* ── Body ────────────────────────────────────────────────────────────────── */
.incidence-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Row ─────────────────────────────────────────────────────────────────── */
.incidence-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .incidence-form__row {
    grid-template-columns: 1fr;
  }
}

/* ── Field ───────────────────────────────────────────────────────────────── */
.incidence-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.incidence-form__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

/* ── Inputs ──────────────────────────────────────────────────────────────── */
.incidence-form__select,
.incidence-form__textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: #f9fafb;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  outline: none;
}

.incidence-form__select:focus,
.incidence-form__textarea:focus {
  border-color: #2d6a6a;
  box-shadow: 0 0 0 3px rgba(45, 106, 106, 0.15);
  background-color: #ffffff;
}

.incidence-form__select--error,
.incidence-form__textarea--error {
  border-color: #dc2626;
}

.incidence-form__textarea {
  resize: vertical;
  min-height: 100px;
}

/* ── Severity group ──────────────────────────────────────────────────────── */
.incidence-form__severity-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.incidence-form__severity-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 2px solid transparent;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  background-color: #f3f4f6;
  color: #374151;
}

.incidence-form__severity-btn--critica {
  border-color: #dc2626;
  color: #dc2626;
}

.incidence-form__severity-btn--critica.incidence-form__severity-btn--active {
  background-color: #dc2626;
  color: #ffffff;
}

.incidence-form__severity-btn--moderada {
  border-color: #f59e0b;
  color: #92400e;
}

.incidence-form__severity-btn--moderada.incidence-form__severity-btn--active {
  background-color: #f59e0b;
  color: #ffffff;
}

.incidence-form__severity-btn--leve {
  border-color: #6b7280;
  color: #374151;
}

.incidence-form__severity-btn--leve.incidence-form__severity-btn--active {
  background-color: #6b7280;
  color: #ffffff;
}

/* ── Field error ─────────────────────────────────────────────────────────── */
.incidence-form__field-error {
  font-size: 0.75rem;
  color: #dc2626;
}

/* ── Global error ────────────────────────────────────────────────────────── */
.incidence-form__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.incidence-form__error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.incidence-form__error-message {
  font-size: 0.875rem;
  color: #991b1b;
}

/* ── Compliance ──────────────────────────────────────────────────────────── */
.incidence-form__compliance {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.incidence-form__compliance-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.incidence-form__compliance-text {
  font-size: 0.75rem;
  color: #166534;
  line-height: 1.4;
}

/* ── Actions ─────────────────────────────────────────────────────────────── */
.incidence-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.incidence-form__submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #2d6a6a;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  min-height: 44px;
}

.incidence-form__submit-btn:hover:not(:disabled) {
  background-color: #1f4d4d;
}

.incidence-form__submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.incidence-form__cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  min-height: 44px;
}

.incidence-form__cancel-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.incidence-form__cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.incidence-form__spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: incidence-spin 0.6s linear infinite;
}

@keyframes incidence-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
