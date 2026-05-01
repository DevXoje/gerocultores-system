/**
 * useIncidencias.ts — Presentation composable for incident registration.
 *
 * US-06: Registro de incidencia
 *
 * Owns form state, validation (Zod), submission lifecycle, and toast feedback.
 * Does NOT import Firebase or Axios directly — delegates to infrastructure layer.
 */
import { ref, reactive } from 'vue'
import { CreateIncidenciaSchema } from '@/business/incidents/domain/entities/incidencia.types'
import type {
  CreateIncidenciaDTO,
  IncidenciaTipo,
  IncidenciaSeveridad,
  IncidenciaResponse,
} from '@/business/incidents/domain/entities/incidencia.types'
import { createIncidencia } from '@/business/incidents/infrastructure/incidencias.api'
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
  // ── Form state ──────────────────────────────────────────────────────────────
  const form = reactive<IncidenciaFormState>({
    tipo: '',
    severidad: '',
    residenteId: '',
    descripcion: '',
    tareaId: null,
  })

  const fieldErrors = reactive<FieldErrors>({})
  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const lastCreated = ref<IncidenciaResponse | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function clearErrors(): void {
    fieldErrors.tipo = undefined
    fieldErrors.severidad = undefined
    fieldErrors.residenteId = undefined
    fieldErrors.descripcion = undefined
    submitError.value = null
  }

  function resetForm(): void {
    form.tipo = ''
    form.severidad = ''
    form.residenteId = ''
    form.descripcion = ''
    form.tareaId = null
    clearErrors()
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
    submitting.value = true

    try {
      const created = await createIncidencia(dto)
      lastCreated.value = created
      resetForm()
      return created
    } catch (e: unknown) {
      submitError.value = toErrorMessage(e)
      return null
    } finally {
      submitting.value = false
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
