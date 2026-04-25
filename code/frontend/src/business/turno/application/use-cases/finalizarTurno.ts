/**
 * finalizarTurno.ts — Use case: end the active turno and save resumen de traspaso.
 *
 * US-11: Resumen de fin de turno
 */
import { turnoApi } from '../../infrastructure/api/turnoApi'
import type { Turno } from '../../domain/entities/Turno'

export async function finalizarTurno(id: string, resumenTraspaso: string): Promise<Turno> {
  return turnoApi.finalizarTurno(id, resumenTraspaso)
}
