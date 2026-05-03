<script setup lang="ts">
/**
 * ResidenteFormModal.vue — Modal wrapping ResidenteForm for creating or editing a resident.
 *
 * US-09: Alta y gestión de residentes
 *
 * Props:
 *   - modelValue: Controls visibility
 *   - residentId: (optional) ID of the resident to edit. If omitted, creates a new resident.
 *
 * Emits:
 *   - update:modelValue: on visibility change
 *   - saved: when resident is successfully created or updated
 */
import { ref, computed, onMounted } from 'vue'
import AppDialog from '@/ui/molecules/dialogs/AppDialog.vue'
import ResidenteForm from '@/business/residents/presentation/UI/molecules/ResidenteForm.vue'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import {
  CreateResidenteDtoSchema,
  type Residente,
  type UpdateResidenteDto,
} from '@/business/residents/domain/Residente'
import {
  mapResidenteToFormData,
  type ResidentFormData,
} from '@/business/residents/domain/FormResident'

interface Props {
  residentId?: Residente['id']
}

const modelValue = defineModel<boolean>()

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const { createResidente, updateResidente, residentes, error } = useResidents()

const submitting = ref(false)
const isEditMode = computed(() => !!props.residentId)

const initialData = ref<ResidentFormData>({})

const loaded = ref(false)

const title = computed(() => (isEditMode.value ? 'Editar residente' : 'Alta nuevo residente'))
const submitLabel = computed(() => (isEditMode.value ? 'Guardar cambios' : 'Dar de alta'))

function resetFormData(): void {
  initialData.value = {}
}

async function handleSubmit(data: UpdateResidenteDto): Promise<void> {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditMode.value && props.residentId) {
      await updateResidente(props.residentId, data)
    } else {
      const createDto = CreateResidenteDtoSchema.parse(data)
      await createResidente(createDto)
    }
    emit('saved')
    modelValue.value = false
  } catch (err) {
    console.error('Error saving resident:', err)
    // Error is handled by the composable, but we stop the submitting state
  } finally {
    submitting.value = false
  }
}

function handleCancel(): void {
  modelValue.value = false
}

onMounted(() => {
  if (isEditMode.value && props.residentId) {
    const residente = residentes.value.find((r) => r.id === props.residentId)
    console.log({ residente })

    if (residente) {
      initialData.value = mapResidenteToFormData(residente)
    } else {
      console.warn(`Residente with ID ${props.residentId} not found.`)
      resetFormData()
    }
  } else {
    resetFormData()
  }
  loaded.value = true
})
</script>

<template>
  <AppDialog v-if="loaded" v-model="modelValue" :title="title" size="md">
    <!-- Error banner -->
    <div v-if="error" class="residente-modal__error" role="alert">
      <span>{{ error }}</span>
    </div>

    <ResidenteForm
      :initial-data="initialData"
      :submit-label="submitting ? 'Guardando...' : submitLabel"
      @submit="handleSubmit"
      @cancelled="handleCancel"
    />
  </AppDialog>
</template>

<style scoped>
.residente-modal__error {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}
</style>
