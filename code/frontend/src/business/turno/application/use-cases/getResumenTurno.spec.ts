/**
 * getResumenTurno.spec.ts — Tests for getResumenTurno use case.
 *
 * US-11: Resumen de fin de turno
 *
 * TDD: RED phase — tests written before implementation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/business/turno/infrastructure/api/turnoApi', () => ({
  turnoApi: {
    getTurnoActivo: vi.fn(),
    iniciarTurno: vi.fn(),
    finalizarTurno: vi.fn(),
    getResumen: vi.fn(),
  },
}))

import { turnoApi } from '@/business/turno/infrastructure/api/turnoApi'
import { getResumenTurno } from './getResumenTurno'

const mockResumen = {
  tareasCompletadas: 5,
  tareasPendientes: 2,
  incidenciasRegistradas: 1,
  residentesAtendidos: ['res-1', 'res-2'],
  textoResumen: 'Turno manyana: 5 tarea(s) completada(s), 2 pendiente(s)',
}

describe('getResumenTurno', () => {
  beforeEach(() => {
    vi.mocked(turnoApi.getResumen).mockResolvedValue(mockResumen)
  })

  it('calls turnoApi.getResumen with the given id', async () => {
    await getResumenTurno('turno-123')
    expect(turnoApi.getResumen).toHaveBeenCalledWith('turno-123')
  })

  it('returns the resumen from the API', async () => {
    const result = await getResumenTurno('turno-123')
    expect(result.tareasCompletadas).toBe(5)
    expect(result.tareasPendientes).toBe(2)
    expect(result.incidenciasRegistradas).toBe(1)
    expect(result.textoResumen).toBe('Turno manyana: 5 tarea(s) completada(s), 2 pendiente(s)')
  })

  it('returns residentesAtendidos array from the API', async () => {
    const result = await getResumenTurno('turno-123')
    expect(result.residentesAtendidos).toHaveLength(2)
    expect(result.residentesAtendidos[0]).toBe('res-1')
  })

  it('propagates errors from turnoApi.getResumen', async () => {
    vi.mocked(turnoApi.getResumen).mockRejectedValue(new Error('Not Found'))
    await expect(getResumenTurno('turno-999')).rejects.toThrow('Not Found')
  })
})
