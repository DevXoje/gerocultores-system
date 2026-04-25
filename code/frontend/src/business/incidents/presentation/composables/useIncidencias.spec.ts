/**
 * useIncidencias.spec.ts
 *
 * Unit tests for the useIncidencias presentation composable.
 *
 * US-06: Registro de incidencia
 *
 * The infrastructure layer (incidencias.api) is mocked — no real HTTP traffic.
 * Zod validation runs for real (no mocking of CreateIncidenciaSchema).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IncidenciaResponse } from '../../domain/entities/incidencia.types'

// ── Mock firebase/auth (required transitively via apiClient) ─────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  getIdToken: vi.fn(),
}))

// ── Mock the infrastructure layer ────────────────────────────────────────────
const mockCreateIncidencia = vi.fn()

vi.mock('../../infrastructure/incidencias.api', () => ({
  createIncidencia: (...args: unknown[]) => mockCreateIncidencia(...args),
}))

import { useIncidencias } from './useIncidencias'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeIncidenciaResponse(overrides: Partial<IncidenciaResponse> = {}): IncidenciaResponse {
  return {
    id: 'inc-1',
    tipo: 'caida',
    severidad: 'moderada',
    descripcion: 'Paciente se cayó al ir al baño',
    residenteId: 'res-1',
    usuarioId: 'usr-1',
    tareaId: null,
    registradaEn: '2026-04-24T10:00:00Z',
    ...overrides,
  }
}

/** Fill a form with valid data */
function fillValidForm(
  form: ReturnType<typeof useIncidencias>['form'],
  overrides: Partial<typeof form> = {}
): void {
  form.tipo = 'caida'
  form.severidad = 'moderada'
  form.residenteId = 'res-1'
  form.descripcion = 'Paciente se cayó al ir al baño'
  form.tareaId = null
  Object.assign(form, overrides)
}

describe('useIncidencias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Initial state ────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('initializes form fields to empty/null', () => {
      const { form } = useIncidencias()

      expect(form.tipo).toBe('')
      expect(form.severidad).toBe('')
      expect(form.residenteId).toBe('')
      expect(form.descripcion).toBe('')
      expect(form.tareaId).toBeNull()
    })

    it('initializes submitting to false', () => {
      const { submitting } = useIncidencias()
      expect(submitting.value).toBe(false)
    })

    it('initializes lastCreated to null', () => {
      const { lastCreated } = useIncidencias()
      expect(lastCreated.value).toBeNull()
    })
  })

  // ── submitIncidencia — success ───────────────────────────────────────────────

  describe('submitIncidencia() — success', () => {
    it('calls createIncidencia with the form DTO on valid data', async () => {
      const created = makeIncidenciaResponse()
      mockCreateIncidencia.mockResolvedValue(created)

      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form)

      await submitIncidencia()

      expect(mockCreateIncidencia).toHaveBeenCalledOnce()
      expect(mockCreateIncidencia).toHaveBeenCalledWith({
        tipo: 'caida',
        severidad: 'moderada',
        residenteId: 'res-1',
        descripcion: 'Paciente se cayó al ir al baño',
      })
    })

    it('returns the created incidencia on success', async () => {
      const created = makeIncidenciaResponse()
      mockCreateIncidencia.mockResolvedValue(created)

      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form)

      const result = await submitIncidencia()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('inc-1')
    })

    it('stores the created incidencia in lastCreated', async () => {
      const created = makeIncidenciaResponse()
      mockCreateIncidencia.mockResolvedValue(created)

      const { form, lastCreated, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      expect(lastCreated.value?.id).toBe('inc-1')
    })

    it('resets the form after successful submit', async () => {
      const created = makeIncidenciaResponse()
      mockCreateIncidencia.mockResolvedValue(created)

      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      expect(form.tipo).toBe('')
      expect(form.severidad).toBe('')
      expect(form.residenteId).toBe('')
      expect(form.descripcion).toBe('')
      expect(form.tareaId).toBeNull()
    })

    it('sets submitting to false after successful submit', async () => {
      mockCreateIncidencia.mockResolvedValue(makeIncidenciaResponse())

      const { form, submitting, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      expect(submitting.value).toBe(false)
    })
  })

  // ── submitIncidencia — validation errors ─────────────────────────────────────

  describe('submitIncidencia() — Zod validation errors', () => {
    it('returns null when tipo is missing', async () => {
      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form, { tipo: '' })

      const result = await submitIncidencia()

      expect(result).toBeNull()
      expect(mockCreateIncidencia).not.toHaveBeenCalled()
    })

    it('sets fieldErrors.tipo when tipo is invalid', async () => {
      const { form, fieldErrors, submitIncidencia } = useIncidencias()
      fillValidForm(form, { tipo: '' })

      await submitIncidencia()

      expect(fieldErrors.tipo).toBeDefined()
    })

    it('returns null when severidad is missing', async () => {
      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form, { severidad: '' })

      const result = await submitIncidencia()

      expect(result).toBeNull()
    })

    it('sets fieldErrors.severidad when severidad is invalid', async () => {
      const { form, fieldErrors, submitIncidencia } = useIncidencias()
      fillValidForm(form, { severidad: '' })

      await submitIncidencia()

      expect(fieldErrors.severidad).toBeDefined()
    })

    it('returns null when descripcion is empty', async () => {
      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form, { descripcion: '' })

      const result = await submitIncidencia()

      expect(result).toBeNull()
    })

    it('sets fieldErrors.descripcion with required message when descripcion is empty', async () => {
      const { form, fieldErrors, submitIncidencia } = useIncidencias()
      fillValidForm(form, { descripcion: '' })

      await submitIncidencia()

      expect(fieldErrors.descripcion).toBe('La descripción es obligatoria')
    })

    it('returns null when residenteId is empty', async () => {
      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form, { residenteId: '' })

      const result = await submitIncidencia()

      expect(result).toBeNull()
    })

    it('sets fieldErrors.residenteId with required message when residenteId is empty', async () => {
      const { form, fieldErrors, submitIncidencia } = useIncidencias()
      fillValidForm(form, { residenteId: '' })

      await submitIncidencia()

      expect(fieldErrors.residenteId).toBe('El residente es obligatorio')
    })

    it('does not call createIncidencia on validation failure', async () => {
      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form, { tipo: '', severidad: '' })

      await submitIncidencia()

      expect(mockCreateIncidencia).not.toHaveBeenCalled()
    })
  })

  // ── submitIncidencia — API error ─────────────────────────────────────────────

  describe('submitIncidencia() — API error', () => {
    it('sets submitError when createIncidencia throws', async () => {
      mockCreateIncidencia.mockRejectedValue(new Error('Server error'))

      const { form, submitError, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      expect(submitError.value).toBe('Server error')
    })

    it('returns null when createIncidencia throws', async () => {
      mockCreateIncidencia.mockRejectedValue(new Error('Server error'))

      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      const result = await submitIncidencia()

      expect(result).toBeNull()
    })

    it('sets submitting to false even on API error', async () => {
      mockCreateIncidencia.mockRejectedValue(new Error('Server error'))

      const { form, submitting, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      expect(submitting.value).toBe(false)
    })

    it('does NOT reset the form on API error (user can fix and retry)', async () => {
      mockCreateIncidencia.mockRejectedValue(new Error('Server error'))

      const { form, submitIncidencia } = useIncidencias()
      fillValidForm(form)
      await submitIncidencia()

      // Form should still have the user's data so they can retry
      expect(form.tipo).toBe('caida')
      expect(form.descripcion).toBe('Paciente se cayó al ir al baño')
    })
  })

  // ── resetForm ────────────────────────────────────────────────────────────────

  describe('resetForm()', () => {
    it('clears all form fields', () => {
      const { form, resetForm } = useIncidencias()
      fillValidForm(form)
      resetForm()

      expect(form.tipo).toBe('')
      expect(form.severidad).toBe('')
      expect(form.residenteId).toBe('')
      expect(form.descripcion).toBe('')
      expect(form.tareaId).toBeNull()
    })

    it('clears all field errors', async () => {
      const { form, fieldErrors, submitIncidencia, resetForm } = useIncidencias()
      fillValidForm(form, { tipo: '', descripcion: '' })
      await submitIncidencia()

      // Errors should be set from validation
      expect(fieldErrors.tipo).toBeDefined()

      resetForm()

      expect(fieldErrors.tipo).toBeUndefined()
      expect(fieldErrors.descripcion).toBeUndefined()
    })
  })
})
