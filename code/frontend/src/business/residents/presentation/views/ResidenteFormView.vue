<!--
  ResidenteFormView.vue — Route view wrapping ResidenteForm for create/edit.
  US-09: Alta y gestión de residentes
-->
<script setup lang="ts">
/**
 * ResidenteFormView.vue — Full-page create/edit view for a resident.
 *
 * US-09: Alta y gestión de residentes
 *
 * Route params:
 *   - id (optional): pre-loads resident for edit mode
 *
 * On success → navigates to /admin/residents
 * On cancel  → navigates back
 */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResidents } from '@/business/residents/presentation/composables/useResidents'
import ResidenteForm from '@/business/residents/presentation/components/ResidenteForm.vue'
import type { CreateResidenteDto, UpdateResidenteDto } from '@/business/residents/domain/Residente'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'

const route = useRoute()
const router = useRouter()
const { createResidente, updateResidente, fetchResidentes, residentes, error } = useResidents()

// ── State ──────────────────────────────────────────────────────────────────
const initialData = ref<{
  id?: string
  nombre?: string
  apellidos?: string
  fechaNacimiento?: string
  habitacion?: string
  foto?: string | null
  diagnosticos?: string | null
  alergias?: string | null
  medicacion?: string | null
  preferencias?: string | null
}>({})

const isEditMode = ref(false)
const submitting = ref(false)

onMounted(async () => {
  const id = route.params.id as string | undefined
  if (id) {
    isEditMode.value = true
    await fetchResidentes('all')
    const found = residentes.value.find((r) => r.id === id)
    if (found) {
      initialData.value = {
        id: found.id,
        nombre: found.nombre,
        apellidos: found.apellidos,
        fechaNacimiento: found.fechaNacimiento,
        habitacion: found.habitacion,
        foto: found.foto,
        diagnosticos: found.diagnosticos,
        alergias: found.alergias,
        medicacion: found.medicacion,
        preferencias: found.preferencias,
      }
    }
  }
})

// ── Handlers ──────────────────────────────────────────────────────────────

async function handleSubmit(data: CreateResidenteDto | UpdateResidenteDto): Promise<void> {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditMode.value && initialData.value.id) {
      await updateResidente(initialData.value.id, data as UpdateResidenteDto)
    } else {
      await createResidente(data as CreateResidenteDto)
    }
    router.push({ name: RESIDENTS_ROUTES.RESIDENTS_ADMIN.name })
  } catch {
    // error managed in store
  } finally {
    submitting.value = false
  }
}

function handleCancel(): void {
  router.push({ name: RESIDENTS_ROUTES.RESIDENTS_ADMIN.name })
}
</script>

<template>
  <div class="residente-form-view">
    <!-- Back nav -->
    <div class="residente-form-view__nav">
      <button type="button" class="residente-form-view__back-btn" @click="handleCancel">
        ← Volver a residentes
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="residente-form-view__error" role="alert">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <ResidenteForm
      :initial-data="initialData"
      :submit-label="isEditMode ? 'Actualizar' : 'Dar de alta'"
      @submit="handleSubmit"
      @cancelled="handleCancel"
    />
  </div>
</template>

<style scoped>
.residente-form-view {
  padding: 1.5rem;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.residente-form-view__nav {
  margin-bottom: 1.5rem;
}

.residente-form-view__back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.15s;
}

.residente-form-view__back-btn:hover {
  color: #374151;
}

.residente-form-view__error {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}
</style>
