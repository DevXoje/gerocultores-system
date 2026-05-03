import { describe, expect, it } from 'vitest'
import {
  validateResidenteForm,
  validateResidenteFormField,
} from '@/business/residents/domain/Residente'

describe('Residente form validation (domain)', () => {
  it('validates required fields with domain messages', () => {
    expect(validateResidenteFormField('nombre', '   ')).toBe('El nombre es requerido')
    expect(validateResidenteFormField('apellidos', '')).toBe('Los apellidos son requeridos')
    expect(validateResidenteFormField('habitacion', '')).toBe('La habitación es requerida')
  })

  it('accepts empty foto and rejects invalid URL', () => {
    expect(validateResidenteFormField('foto', '')).toBe('')
    expect(validateResidenteFormField('foto', 'foto-local')).toBe('URL inválida')
    expect(validateResidenteFormField('foto', 'https://example.com/foto.jpg')).toBe('')
  })

  it('returns field-level errors for an invalid form', () => {
    const errors = validateResidenteForm({
      nombre: '   ',
      apellidos: 'Perez',
      fechaNacimiento: '30-01-1940',
      habitacion: '',
      foto: 'http://',
    })

    expect(errors).toEqual({
      nombre: 'El nombre es requerido',
      fechaNacimiento: 'Formato ISO 8601 (YYYY-MM-DD)',
      habitacion: 'La habitación es requerida',
      foto: 'URL inválida',
    })
  })
})
