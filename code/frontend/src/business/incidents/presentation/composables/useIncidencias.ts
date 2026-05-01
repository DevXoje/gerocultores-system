/**
 * useIncidencias.ts — Presentation composable for incident registration.
 *
 * US-06: Registro de incidencia
 *
 * Architecture (frontend-specialist.md §3):
 *   - Lives in presentation/composables/ — ONLY layer touching Pinia store.
 *   - Orchestrates use cases and updates the store.
 *   - Owns form state and validation (form/fieldErrors stay local — they are UI state, not domain state).
 *   - Components import ONLY from this composable — never stores directly.
 */
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CreateIncidenciaSchema } from '@/business/incidents/domain/entities/incidencia.types'
import type {
  CreateIncidenciaDTO,
  IncidenciaTipo,
  IncidenciaSeveridad,
  IncidenciaResponse,
} from '@/business/incidents/domain/entities/incidencia.types'
import { createIncidencia } from '@/business/incidents/infrastructure/incidencias.api'
import { useIncidenciasStore } from '@/business/incidents/presentation/stores/incidenciasStore'
import { ZodError } from 'zod'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IncidenciaFormState {
  tipo: IncidenciaTipo | ''
  severidad: IncidenciaSeveridad | ''
  residenteId: string
  descripcion: string
  tareaId: string | null
}

export interface FieldErrors {
  tipo?: string
  severidad?: string
  residenteId?: string
  descripcion?: string
}

export function useIncidencias() {
  const store = useIncidenciasStore()
  const { submitting, submitError } = storeToRefs(store)

  // ── Form state (local — UI state, not domain state) ───────────────────────
  const form = reactive<IncidenciaFormState>({
    tipo: '',
    severidad: '',
    residenteId: '',
    descripcion: '',
    tareaId: null,
  })

  const fieldErrors = reactive<FieldErrors>({})
  const lastCreated = ref<IncidenciaResponse | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function clearErrors(): void {
    fieldErrors.tipo = undefined
    fieldErrors.severidad = undefined
    fieldErrors.residenteId = undefined
    fieldErrors.descripcion = undefined
    store.clearSubmitError()
  }

  function resetForm(): void {
    form.tipo = ''
    form.severidad = ''
    form.residenteId = ''
    form.descripcion = ''
    form.tareaId = null
    clearErrors()
    lastCreated.value = null
  }

  function toErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message
    if (typeof e === 'string') return e
    return 'Error desconocido'
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function submitIncidencia(): Promise<IncidenciaResponse | null> {
    clearErrors()

    // Client-side Zod validation
    const parseResult = CreateIncidenciaSchema.safeParse({
      tipo: form.tipo,
      severidad: form.severidad,
      residenteId: form.residenteId,
      descripcion: form.descripcion,
      tareaId: form.tareaId ?? undefined,
    })

    if (!parseResult.success) {
      if (parseResult.error instanceof ZodError) {
        for (const issue of parseResult.error.issues) {
          const field = issue.path[0] as keyof FieldErrors
          if (field in fieldErrors) {
            fieldErrors[field] = issue.message
          }
        }
      }
      return null
    }

    const dto: CreateIncidenciaDTO = parseResult.data
    store.setSubmitting(true)

    try {
      const created = await createIncidencia(dto)
      store.setLastCreated(created)
      lastCreated.value = created
      resetForm()
      return created
    } catch (e: unknown) {
      store.setSubmitError(toErrorMessage(e))
      return null
    } finally {
      store.setSubmitting(false)
    }
  }

  return {
    form,
    fieldErrors,
    submitting,
    submitError,
    lastCreated,
    submitIncidencia,
    resetForm,
  }
}
