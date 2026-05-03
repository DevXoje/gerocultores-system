<!-- Stitch: projects/16168255182252500555 — New Incident Form - Serenity Care (US-06) -->
<!-- OUTPUTS/design-exports/US-06-incident__new-incident-form-serenity-care__20260328.png -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import AppDialog from '@/ui/molecules/dialogs/AppDialog.vue'
import IncidenceForm from '@/business/incidents/presentation/components/IncidenceForm.vue'
import { getResidentes } from '@/business/residents/infrastructure/residentes.api'
import type { ResidenteDTO } from '@/business/residents/domain/entities/residente.types'
import type { IncidenciaResponse } from '@/business/incidents/domain/entities/incidencia.types'

interface Props {
  preselectedResidenteId?: string
  preselectedTareaId?: string | null
}

const modelValue = defineModel<boolean>({ default: false })

const props = defineProps<Props>()

const emit = defineEmits<{
  submitted: [incidencia: IncidenciaResponse]
  close: []
}>()

const residents = ref<ResidenteDTO[]>([])
const loadingResidents = ref(false)
const residentsError = ref<string | null>(null)

const hasResidents = computed(() => residents.value.length > 0)

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Error desconocido al cargar residentes'
}

async function fetchResidents(): Promise<void> {
  loadingResidents.value = true
  residentsError.value = null
  try {
    residents.value = await getResidentes()
  } catch (error: unknown) {
    residentsError.value = toErrorMessage(error)
  } finally {
    loadingResidents.value = false
  }
}

function closeModal(): void {
  modelValue.value = false
  emit('close')
}

function handleSubmitted(incidencia: IncidenciaResponse): void {
  emit('submitted', incidencia)
  closeModal()
}

onMounted(() => {
  fetchResidents()
})
</script>

<template>
  <AppDialog v-model="modelValue" title="Registrar incidencia" size="lg" @close="closeModal">
    <div
      v-if="loadingResidents"
      class="incidence-form-modal__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="incidence-form-modal__spinner" aria-hidden="true" />
      <span>Cargando residentes...</span>
    </div>

    <div v-else-if="residentsError" class="incidence-form-modal__error" role="alert">
      <ExclamationCircleIcon class="incidence-form-modal__error-icon" aria-hidden="true" />
      <p class="incidence-form-modal__error-message">{{ residentsError }}</p>
      <button type="button" class="incidence-form-modal__retry-btn" @click="fetchResidents">
        Reintentar
      </button>
    </div>

    <output v-else-if="!hasResidents" class="incidence-form-modal__empty">
      <p class="incidence-form-modal__empty-message">
        No hay residentes disponibles para registrar una incidencia.
      </p>
    </output>

    <IncidenceForm
      v-else
      :residents="residents"
      :preselected-residente-id="props.preselectedResidenteId"
      :preselected-tarea-id="props.preselectedTareaId"
      @submitted="handleSubmitted"
      @cancelled="closeModal"
    />
  </AppDialog>
</template>

<style scoped>
@reference "#/style.css";

.incidence-form-modal__loading,
.incidence-form-modal__error,
.incidence-form-modal__empty {
  @apply flex flex-col items-center justify-center gap-3 py-10 text-center;
}

.incidence-form-modal__spinner {
  @apply inline-block h-5 w-5 rounded-full border-2 border-t-transparent;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

.incidence-form-modal__error-icon {
  @apply h-8 w-8;
  color: var(--color-error);
}

.incidence-form-modal__error-message,
.incidence-form-modal__empty-message,
.incidence-form-modal__loading {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.incidence-form-modal__retry-btn {
  @apply rounded-full px-4 py-2 text-sm font-medium cursor-pointer border-none;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
