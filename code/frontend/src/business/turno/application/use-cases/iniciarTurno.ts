/**
 * iniciarTurno.ts — Use case: start a new work shift.
 *
 * US-11: Resumen de fin de turno
 */
import { turnoApi } from '@/business/turno/infrastructure/api/turnoApi'
import type { Turno, TipoTurno } from '@/business/turno/domain/entities/Turno'

export async function iniciarTurno(tipoTurno: TipoTurno): Promise<Turno> {
  return turnoApi.iniciarTurno(tipoTurno)
}
