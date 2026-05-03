import { describe, expect, it } from 'vitest'
import {
  buildCreateResidenteDtoFromForm,
  mapResidenteToFormData,
} from '@/business/residents/domain/FormResident'
import { filterResidentesByState, type Residente } from '@/business/residents/domain/Residente'

describe('FormResident domain helpers', () => {
  it('maps resident to form data', () => {
    const residente: Residente = {
      id: 'res-1',
      nombre: 'Maria',
      apellidos: 'Lopez',
      fechaNacimiento: '1940-05-12',
      habitacion: '101',
      foto: null,
      diagnosticos: null,
      alergias: null,
      medicacion: null,
      preferencias: null,
      archivado: false,
      creadoEn: '2026-01-01T00:00:00Z',
      actualizadoEn: '2026-01-02T00:00:00Z',
    }

    const formData = mapResidenteToFormData(residente)

    expect(formData).toMatchObject({
      id: 'res-1',
      nombre: 'Maria',
      apellidos: 'Lopez',
      habitacion: '101',
    })
  })

  it('builds create dto with trimming and nullables', () => {
    const dto = buildCreateResidenteDtoFromForm({
      nombre: '  Maria ',
      apellidos: ' Lopez ',
      fechaNacimiento: '1940-05-12',
      habitacion: ' 101-A ',
      foto: ' ',
      diagnosticos: '',
      alergias: '  Penicilina ',
      medicacion: '',
      preferencias: '',
    })

    expect(dto).toEqual({
      nombre: 'Maria',
      apellidos: 'Lopez',
      fechaNacimiento: '1940-05-12',
      habitacion: '101-A',
      foto: null,
      diagnosticos: null,
      alergias: 'Penicilina',
      medicacion: null,
      preferencias: null,
    })
  })

  it('filters residents by active state', () => {
    const residentes: Residente[] = [
      {
        id: 'res-1',
        nombre: 'A',
        apellidos: 'A',
        fechaNacimiento: '1940-01-01',
        habitacion: '101',
        foto: null,
        diagnosticos: null,
        alergias: null,
        medicacion: null,
        preferencias: null,
        archivado: false,
        creadoEn: '2026-01-01T00:00:00Z',
        actualizadoEn: '2026-01-01T00:00:00Z',
      },
      {
        id: 'res-2',
        nombre: 'B',
        apellidos: 'B',
        fechaNacimiento: '1940-01-01',
        habitacion: '102',
        foto: null,
        diagnosticos: null,
        alergias: null,
        medicacion: null,
        preferencias: null,
        archivado: true,
        creadoEn: '2026-01-01T00:00:00Z',
        actualizadoEn: '2026-01-01T00:00:00Z',
      },
    ]

    expect(filterResidentesByState(residentes, 'active')).toHaveLength(1)
    expect(filterResidentesByState(residentes, 'archived')).toHaveLength(1)
    expect(filterResidentesByState(residentes, 'all')).toHaveLength(2)
  })
})
