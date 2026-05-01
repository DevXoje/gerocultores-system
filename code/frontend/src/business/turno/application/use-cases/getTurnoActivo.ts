/**
 * getTurnoActivo.ts — Use case: fetch the active turno for the current user.
 *
 * US-11: Resumen de fin de turno
 */
import { turnoApi } from '@/business/turno/infrastructure/api/turnoApi'
import type { Turno } from '@/business/turno/domain/entities/Turno'

export async function getTurnoActivo(): Promise<Turno | null> {
  return turnoApi.getTurnoActivo()
}
