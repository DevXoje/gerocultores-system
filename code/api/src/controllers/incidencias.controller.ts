/**
 * incidencias.controller.ts — HTTP layer for /api/incidencias
 *
 * US-06: Registro de incidencia
 */
import type { Request, Response, NextFunction } from 'express'
import { IncidenciasService } from '../services/incidencias.service'
import { CreateIncidenciaSchema } from '../types/incidencia.types'
import { UserRoleEnum } from '../types/user.types'

function getAuthUser(req: Request): { uid: string; role: string } {
  if (!req.user?.uid) {
    throw new Error('Autorización inválida')
  }
  const rawRole = req.user?.['role']
  const role = UserRoleEnum.safeParse(rawRole)
  // Incidencias: both admin and gerocultor can create, but we still validate the role claim
  if (!role.success) {
    throw new Error('Autorización inválida')
  }
  return { uid: req.user.uid, role: role.data }
}

export class IncidenciasController {
  private service = new IncidenciasService()

  /**
   * POST /api/incidencias
   * Creates a new Incidencia in Firestore.
   * Auth: requires valid Bearer token (both admin and gerocultor may create).
   * The creator's uid is taken from req.user — not from the request body.
   */
  createIncidencia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = CreateIncidenciaSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid: creatingUserId } = getAuthUser(req)
      const incidencia = await this.service.createIncidencia(parsed.data, creatingUserId)
      res.status(201).json({ data: incidencia })
    } catch (e) {
      next(e)
    }
  }
}
