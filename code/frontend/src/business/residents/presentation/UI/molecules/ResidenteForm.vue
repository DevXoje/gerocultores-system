<!--
  Stitch: projects/16168255182252500555 — Resident Records (US-09)
  Export: OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png
-->
<script setup lang="ts">
/**
 * ResidenteForm.vue — Reusable create/edit form for a resident.
 *
 * US-09: Alta y gestión de residentes
 *
 * Props:
 *   - initialData: optional Residente to pre-fill (edit mode)
 *   - submitLabel: button label text (default: 'Guardar')
 *
 * Emits:
 *   - submit(data: CreateResidenteDto | UpdateResidenteDto): user confirmed
 *   - cancelled: user dismissed the form
 */
import { ref, computed } from 'vue'
import type {
  CreateResidenteDto,
  UpdateResidenteDto,
  ResidenteFormField,
} from '@/business/residents/domain/Residente'
import {
  validateResidenteForm,
  validateResidenteFormField,
} from '@/business/residents/domain/Residente'
import {
  buildCreateResidenteDtoFromForm,
  type ResidentFormData,
} from '@/business/residents/domain/FormResident'

// ── Props / Emit ─────────────────────────────────────────────────────────────

interface Props {
  initialData?: ResidentFormData
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  submitLabel: 'Guardar',
})

const emit = defineEmits<{
  (e: 'submit', data: CreateResidenteDto | UpdateResidenteDto): void
  (e: 'cancelled'): void
}>()

// ── Form state ────────────────────────────────────────────────────────────────

const nombre = ref(props.initialData.nombre ?? '')
const apellidos = ref(props.initialData.apellidos ?? '')
const fechaNacimiento = ref(props.initialData.fechaNacimiento ?? '')
const habitacion = ref(props.initialData.habitacion ?? '')
const foto = ref(props.initialData.foto ?? '')
const diagnosticos = ref(props.initialData.diagnosticos ?? '')
const alergias = ref(props.initialData.alergias ?? '')
const medicacion = ref(props.initialData.medicacion ?? '')
const preferencias = ref(props.initialData.preferencias ?? '')

function resetFormData(): void {
  nombre.value = ''
  apellidos.value = ''
  fechaNacimiento.value = ''
  habitacion.value = ''
  foto.value = ''
  diagnosticos.value = ''
  alergias.value = ''
  medicacion.value = ''
  preferencias.value = ''
}

// ── Field-level error messages ─────────────────────────────────────────────

const fieldErrors = ref<Partial<Record<ResidenteFormField, string>>>({})

function getFormValidationData() {
  return {
    nombre: nombre.value,
    apellidos: apellidos.value,
    fechaNacimiento: fechaNacimiento.value,
    habitacion: habitacion.value,
    foto: foto.value,
  }
}

function validateAll(): boolean {
  const errors = validateResidenteForm(getFormValidationData())
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// ── Derived ───────────────────────────────────────────────────────────────────

const isValid = computed(() => {
  return Object.keys(validateResidenteForm(getFormValidationData())).length === 0
})

// ── Handlers ─────────────────────────────────────────────────────────────────

function handleSubmit(): void {
  fieldErrors.value = {}
  if (!validateAll()) return

  const dto: CreateResidenteDto | UpdateResidenteDto = buildCreateResidenteDtoFromForm({
    nombre: nombre.value,
    apellidos: apellidos.value,
    fechaNacimiento: fechaNacimiento.value,
    habitacion: habitacion.value,
    foto: foto.value,
    diagnosticos: diagnosticos.value,
    alergias: alergias.value,
    medicacion: medicacion.value,
    preferencias: preferencias.value,
  })

  emit('submit', dto)
}

function handleCancel(): void {
  resetFormData()
  emit('cancelled')
}
</script>

<template>
  <div class="residente-form">
    <form class="residente-form__body" novalidate @submit.prevent="handleSubmit">
      <!-- Row: Nombre + Apellidos -->
      <div class="residente-form__row">
        <div class="residente-form__field">
          <label for="rf-nombre" class="residente-form__label">Nombre *</label>
          <input
            id="rf-nombre"
            v-model="nombre"
            type="text"
            class="residente-form__input"
            :class="{ 'residente-form__input--error': fieldErrors['nombre'] }"
            autocomplete="given-name"
            aria-required="true"
            :aria-invalid="!!fieldErrors['nombre']"
            :aria-describedby="fieldErrors['nombre'] ? 'rf-nombre-err' : undefined"
            @blur="fieldErrors['nombre'] = validateResidenteFormField('nombre', nombre)"
          />
          <p
            v-if="fieldErrors['nombre']"
            id="rf-nombre-err"
            class="residente-form__field-error"
            role="alert"
          >
            {{ fieldErrors['nombre'] }}
          </p>
        </div>

        <div class="residente-form__field">
          <label for="rf-apellidos" class="residente-form__label">Apellidos *</label>
          <input
            id="rf-apellidos"
            v-model="apellidos"
            type="text"
            class="residente-form__input"
            :class="{ 'residente-form__input--error': fieldErrors['apellidos'] }"
            autocomplete="family-name"
            aria-required="true"
            :aria-invalid="!!fieldErrors['apellidos']"
            :aria-describedby="fieldErrors['apellidos'] ? 'rf-apellidos-err' : undefined"
            @blur="fieldErrors['apellidos'] = validateResidenteFormField('apellidos', apellidos)"
          />
          <p
            v-if="fieldErrors['apellidos']"
            id="rf-apellidos-err"
            class="residente-form__field-error"
            role="alert"
          >
            {{ fieldErrors['apellidos'] }}
          </p>
        </div>
      </div>

      <!-- Row: Fecha de nacimiento + Habitación -->
      <div class="residente-form__row">
        <div class="residente-form__field">
          <label for="rf-fecha" class="residente-form__label">Fecha de nacimiento *</label>
          <input
            id="rf-fecha"
            v-model="fechaNacimiento"
            type="date"
            class="residente-form__input"
            :class="{ 'residente-form__input--error': fieldErrors['fechaNacimiento'] }"
            aria-required="true"
            :aria-invalid="!!fieldErrors['fechaNacimiento']"
            :aria-describedby="fieldErrors['fechaNacimiento'] ? 'rf-fecha-err' : undefined"
            @blur="
              fieldErrors['fechaNacimiento'] = validateResidenteFormField(
                'fechaNacimiento',
                fechaNacimiento
              )
            "
          />
          <p
            v-if="fieldErrors['fechaNacimiento']"
            id="rf-fecha-err"
            class="residente-form__field-error"
            role="alert"
          >
            {{ fieldErrors['fechaNacimiento'] }}
          </p>
        </div>

        <div class="residente-form__field">
          <label for="rf-habitacion" class="residente-form__label">Habitación *</label>
          <input
            id="rf-habitacion"
            v-model="habitacion"
            type="text"
            class="residente-form__input"
            :class="{ 'residente-form__input--error': fieldErrors['habitacion'] }"
            autocomplete="off"
            placeholder="Ej: 101-A"
            aria-required="true"
            :aria-invalid="!!fieldErrors['habitacion']"
            :aria-describedby="fieldErrors['habitacion'] ? 'rf-habitacion-err' : undefined"
            @blur="fieldErrors['habitacion'] = validateResidenteFormField('habitacion', habitacion)"
          />
          <p
            v-if="fieldErrors['habitacion']"
            id="rf-habitacion-err"
            class="residente-form__field-error"
            role="alert"
          >
            {{ fieldErrors['habitacion'] }}
          </p>
        </div>
      </div>

      <!-- Foto URL -->
      <div class="residente-form__field">
        <label for="rf-foto" class="residente-form__label">
          Fotografía <span class="residente-form__label-optional">(URL opcional)</span>
        </label>
        <input
          id="rf-foto"
          v-model="foto"
          type="url"
          class="residente-form__input"
          :class="{ 'residente-form__input--error': fieldErrors['foto'] }"
          autocomplete="photo"
          placeholder="https://..."
          :aria-invalid="!!fieldErrors['foto']"
          :aria-describedby="fieldErrors['foto'] ? 'rf-foto-err' : undefined"
          @blur="fieldErrors['foto'] = validateResidenteFormField('foto', foto)"
        />
        <p
          v-if="fieldErrors['foto']"
          id="rf-foto-err"
          class="residente-form__field-error"
          role="alert"
        >
          {{ fieldErrors['foto'] }}
        </p>
      </div>

      <!-- RGPD fields — collapsible medical info -->
      <details class="residente-form__rgpd">
        <summary class="residente-form__rgpd-summary">
          <span class="residente-form__rgpd-icon" aria-hidden="true">🔒</span>
          Información médica (opcional)
          <span class="residente-form__rgpd-hint">Datos protegidos — RGPD art. 9</span>
        </summary>

        <div class="residente-form__rgpd-body">
          <div class="residente-form__field">
            <label for="rf-diagnosticos" class="residente-form__label">Diagnósticos</label>
            <textarea
              id="rf-diagnosticos"
              v-model="diagnosticos"
              class="residente-form__textarea"
              rows="3"
              placeholder="Diagnósticos principales..."
            />
          </div>

          <div class="residente-form__field">
            <label for="rf-alergias" class="residente-form__label">Alergias</label>
            <textarea
              id="rf-alergias"
              v-model="alergias"
              class="residente-form__textarea"
              rows="2"
              placeholder="Alergias conocidas..."
            />
          </div>

          <div class="residente-form__field">
            <label for="rf-medicacion" class="residente-form__label">Medicación activa</label>
            <textarea
              id="rf-medicacion"
              v-model="medicacion"
              class="residente-form__textarea"
              rows="3"
              placeholder="Medicación y pautas..."
            />
          </div>

          <div class="residente-form__field">
            <label for="rf-preferencias" class="residente-form__label"
              >Preferencias y observaciones</label
            >
            <textarea
              id="rf-preferencias"
              v-model="preferencias"
              class="residente-form__textarea"
              rows="3"
              placeholder="Preferencias de cuidado..."
            />
          </div>
        </div>
      </details>

      <!-- Actions -->
      <div class="residente-form__actions">
        <button type="submit" class="residente-form__submit-btn" :disabled="!isValid">
          {{ submitLabel }}
        </button>
        <button type="button" class="residente-form__cancel-btn" @click="handleCancel">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* ── Root ────────────────────────────────────────────────────────────────── */
.residente-form {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* ── Body ──────────────────────────────────────────────────────────────── */
.residente-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Row ───────────────────────────────────────────────────────────────── */
.residente-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .residente-form__row {
    grid-template-columns: 1fr;
  }
}

/* ── Field ─────────────────────────────────────────────────────────────── */
.residente-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.residente-form__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.residente-form__label-optional {
  font-weight: 400;
  color: #9ca3af;
}

/* ── Inputs ────────────────────────────────────────────────────────────── */
.residente-form__input,
.residente-form__textarea {
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
  font-family: inherit;
}

.residente-form__input:focus,
.residente-form__textarea:focus {
  border-color: #2d6a6a;
  box-shadow: 0 0 0 3px rgba(45, 106, 106, 0.15);
  background-color: #ffffff;
}

.residente-form__input--error {
  border-color: #dc2626;
}

.residente-form__textarea {
  resize: vertical;
  min-height: 80px;
}

/* ── Field error ───────────────────────────────────────────────────────── */
.residente-form__field-error {
  font-size: 0.75rem;
  color: #dc2626;
}

/* ── RGPD collapsible ──────────────────────────────────────────────────── */
.residente-form__rgpd {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.residente-form__rgpd-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
  list-style: none;
  user-select: none;
}

.residente-form__rgpd-summary::-webkit-details-marker {
  display: none;
}

.residente-form__rgpd-icon {
  font-size: 1rem;
}

.residente-form__rgpd-hint {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 400;
  color: #9ca3af;
}

.residente-form__rgpd-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
}

/* ── Actions ─────────────────────────────────────────────────────────────── */
.residente-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.residente-form__submit-btn {
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

.residente-form__submit-btn:hover:not(:disabled) {
  background-color: #1f4d4d;
}

.residente-form__submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.residente-form__cancel-btn {
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

.residente-form__cancel-btn:hover {
  background-color: #f3f4f6;
}
</style>
