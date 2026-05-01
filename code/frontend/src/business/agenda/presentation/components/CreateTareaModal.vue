<script setup lang="ts">
/**
 * CreateTareaModal — Bottom-sheet/modal for creating a new task.
 *
 * US-14: Crear tarea
 *
 * G10: references "Task Creation Form" Stitch screen (design-source.md)
 *
 * Architecture rules (frontend-specialist.md §3):
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 *   - Uses useTareas (application/) for API calls.
 */
import { ref, computed, onMounted } from 'vue'
import { useTareas } from '@/business/agenda/application/useTareas'
import type { TareaTipo } from '@/business/agenda/domain/entities/tarea.types'
import { useAuthStore } from '@/business/auth/useAuthStore'
import type { CreateTareaDTO } from '@/business/agenda/domain/entities/tarea.types'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import type { CreateResidenteDto } from '@/business/residents/domain/Residente'
import ResidenteForm from '@/business/residents/presentation/components/ResidenteForm.vue'
import AppDialog from '@/ui/molecules/dialogs/AppDialog.vue'

const modelValue = defineModel<boolean>()

const emit = defineEmits<{
  close: []
}>()

const { isCreating, createError, createTarea } = useTareas()
const auth = useAuthStore()

// ─── Form state ───────────────────────────────────────────────────────────────

const titulo = ref('')
const tipo = ref<TareaTipo | ''>('')
const fechaHora = ref('')
const residenteId = ref('')
const notas = ref('')

// Pre-fill usuarioId from current session
const usuarioId = computed(() => auth.user?.uid ?? '')

// Validation error per field
const fieldErrors = ref<Record<string, string>>({})

// ─── Residentes ──────────────────────────────────────────────────────────────

const { activeResidentes, fetchResidentes, createResidente } = useResidents()

const showCreateResidente = ref(false)

onMounted(() => {
  fetchResidentes('active')
})

function handleResidenteChange(): void {
  if (residenteId.value === '__create_new__') {
    // Reset select display to placeholder
    residenteId.value = ''
    showCreateResidente.value = true
  }
}

async function handleCreateResidente(data: CreateResidenteDto): Promise<void> {
  const created = await createResidente(data)
  residenteId.value = created.id
  showCreateResidente.value = false
  // Refresh list so the new resident appears
  await fetchResidentes('active')
}

function handleCancelNewResidente(): void {
  showCreateResidente.value = false
}

function handleClose(): void {
  emit('close')
}

function handleCancel(): void {
  modelValue.value = false
}

const TIPO_OPTIONS: Array<{ value: TareaTipo; label: string }> = [
  { value: 'higiene', label: 'Higiene' },
  { value: 'medicacion', label: 'Medicación' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'revision', label: 'Revisión' },
  { value: 'otro', label: 'Otro' },
]

const residentesList = computed(() =>
  activeResidentes.value.map((r) => ({ id: r.id, nombre: `${r.nombre} ${r.apellidos}` }))
)

function validate(): boolean {
  const errors: Record<string, string> = {}

  if (!titulo.value.trim()) {
    errors['titulo'] = 'El título es requerido'
  }
  if (!tipo.value) {
    errors['tipo'] = 'El tipo es requerido'
  }
  if (!fechaHora.value) {
    errors['fechaHora'] = 'La fecha y hora son requeridas'
  }
  if (!residenteId.value) {
    errors['residenteId'] = 'El residente es requerido'
  }
  if (!usuarioId.value) {
    errors['usuarioId'] = 'No se encontró el usuario actual'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  const dto: CreateTareaDTO = {
    titulo: titulo.value.trim(),
    tipo: tipo.value as TareaTipo,
    fechaHora: new Date(fechaHora.value).toISOString(),
    residenteId: residenteId.value,
    usuarioId: usuarioId.value,
    notas: notas.value.trim() || undefined,
  }

  const result = await createTarea(dto)

  if (result.success) {
    modelValue.value = false
    emit('close')
  }
}
</script>

<template>
  <AppDialog v-model="modelValue" title="Nueva tarea" size="sm" @close="handleClose">
    <form
      id="create-tarea-form"
      class="create-tarea-modal__form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <!-- titulo -->
      <div class="create-tarea-modal__field">
        <label for="tarea-titulo" class="create-tarea-modal__label">Título</label>
        <input
          id="tarea-titulo"
          v-model="titulo"
          type="text"
          class="create-tarea-modal__input"
          :class="{ 'create-tarea-modal__input--error': fieldErrors['titulo'] }"
          placeholder="Ej: Aseo matutino"
          maxlength="200"
        />
        <span v-if="fieldErrors['titulo']" class="create-tarea-modal__error">
          {{ fieldErrors['titulo'] }}
        </span>
      </div>

      <!-- tipo -->
      <div class="create-tarea-modal__field">
        <label for="tarea-tipo" class="create-tarea-modal__label">Tipo</label>
        <select
          id="tarea-tipo"
          v-model="tipo"
          class="create-tarea-modal__select"
          :class="{ 'create-tarea-modal__select--error': fieldErrors['tipo'] }"
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option v-for="opt in TIPO_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span v-if="fieldErrors['tipo']" class="create-tarea-modal__error">
          {{ fieldErrors['tipo'] }}
        </span>
      </div>

      <!-- fechaHora -->
      <div class="create-tarea-modal__field">
        <label for="tarea-fecha" class="create-tarea-modal__label">Fecha y hora</label>
        <input
          id="tarea-fecha"
          v-model="fechaHora"
          type="datetime-local"
          class="create-tarea-modal__input"
          :class="{ 'create-tarea-modal__input--error': fieldErrors['fechaHora'] }"
        />
        <span v-if="fieldErrors['fechaHora']" class="create-tarea-modal__error">
          {{ fieldErrors['fechaHora'] }}
        </span>
      </div>

      <!-- residenteId -->
      <div class="create-tarea-modal__field">
        <label for="tarea-residente" class="create-tarea-modal__label">Residente</label>
        <select
          id="tarea-residente"
          v-model="residenteId"
          class="create-tarea-modal__select"
          :class="{ 'create-tarea-modal__select--error': fieldErrors['residenteId'] }"
          @change="handleResidenteChange"
        >
          <option value="" disabled>Selecciona un residente</option>
          <option v-for="res in residentesList" :key="res.id" :value="res.id">
            {{ res.nombre }}
          </option>
          <option value="__create_new__">— Alta nuevo residente —</option>
        </select>
        <span v-if="fieldErrors['residenteId']" class="create-tarea-modal__error">
          {{ fieldErrors['residenteId'] }}
        </span>
      </div>

      <!-- notas (optional) -->
      <div class="create-tarea-modal__field">
        <label for="tarea-notas" class="create-tarea-modal__label">
          Notas
          <span class="create-tarea-modal__optional">(opcional)</span>
        </label>
        <textarea
          id="tarea-notas"
          v-model="notas"
          class="create-tarea-modal__textarea"
          placeholder="Indicaciones adicionales..."
          rows="3"
          maxlength="2000"
        />
      </div>

      <!-- Submit error -->
      <p v-if="createError" class="create-tarea-modal__submit-error" role="alert">
        {{ createError }}
      </p>
    </form>

    <template #footer>
      <div class="create-tarea-modal__actions">
        <button
          type="button"
          class="create-tarea-modal__btn create-tarea-modal__btn--cancel"
          @click="handleCancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="create-tarea-form"
          class="create-tarea-modal__btn create-tarea-modal__btn--submit"
          :disabled="isCreating"
        >
          {{ isCreating ? 'Guardando...' : 'Guardar tarea' }}
        </button>
      </div>
    </template>

    <!-- Nested modal for resident creation -->
    <AppDialog
      v-if="showCreateResidente"
      v-model="showCreateResidente"
      title="Alta nuevo residente"
      size="md"
    >
      <ResidenteForm
        submit-label="Crear residente"
        @submit="handleCreateResidente"
        @cancelled="handleCancelNewResidente"
      />
    </AppDialog>
  </AppDialog>
</template>

<style scoped>
@reference "#/style.css";

/* ─── Form ───────────────────────────────────────────────────────────────── */
.create-tarea-modal__form {
  @apply flex flex-col gap-5;
}

/* ─── Field ──────────────────────────────────────────────────────────────── */
.create-tarea-modal__field {
  @apply flex flex-col gap-1.5;
}

.create-tarea-modal__label {
  @apply text-sm font-medium;
  color: var(--color-on-surface);
}

.create-tarea-modal__optional {
  @apply text-xs font-normal;
  color: var(--color-on-surface-variant);
  margin-left: 0.25rem;
}

.create-tarea-modal__input,
.create-tarea-modal__select,
.create-tarea-modal__textarea {
  @apply rounded-lg px-4 py-3 text-sm border border-outline;
  background-color: var(--color-surface-container-lowest);
  color: var(--color-on-surface);
  transition: border-color 0.15s ease;
}

.create-tarea-modal__input:focus,
.create-tarea-modal__select:focus,
.create-tarea-modal__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.create-tarea-modal__input--error,
.create-tarea-modal__select--error {
  border-color: var(--color-error);
}

.create-tarea-modal__textarea {
  @apply resize-none;
}

.create-tarea-modal__error {
  @apply text-xs;
  color: var(--color-error);
}

/* ─── Submit error ───────────────────────────────────────────────────────── */
.create-tarea-modal__submit-error {
  @apply text-sm text-center;
  color: var(--color-error);
}

/* ─── Actions ─────────────────────────────────────────────────────────────── */
.create-tarea-modal__actions {
  @apply flex gap-3 pt-2;
}

.create-tarea-modal__btn {
  @apply flex-1 rounded-full py-3 text-sm font-medium cursor-pointer border-none transition-opacity;
}

.create-tarea-modal__btn--cancel {
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.create-tarea-modal__btn--submit {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.create-tarea-modal__btn--submit:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
