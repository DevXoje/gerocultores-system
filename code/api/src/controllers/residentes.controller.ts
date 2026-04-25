/**
 * residentes.controller.ts — HTTP layer for Residente endpoints.
 *
 * US-05: Consulta de ficha de residente
 */
import type { Request, Response, NextFunction } from 'express'
import { ResidentesService, NotFoundError, ForbiddenError } from '../services/residentes.service'
import { ResidenteIdParamSchema } from '../types/residente.types'
import type { UserRole } from '../types/user.types'
import { UserRoleEnum } from '../types/user.types'

function getAuthUser(req: Request): { uid: string; role: UserRole } {
  const rawRole = req.user?.['role']
  const role = UserRoleEnum.safeParse(rawRole)
  if (!role.success || !req.user?.uid) {
    throw new Error('Autorización inválida')
  }
  return { uid: req.user.uid, role: role.data }
}

export class ResidentesController {
  private service = new ResidentesService()

  getResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ResidenteIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { id } = parsed.data
      const { uid: userUid, role: userRole } = getAuthUser(req)

      const residente = await this.service.getResidenteById(id, userUid, userRole)
      res.json({ data: residente })
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      if (e instanceof ForbiddenError) {
        res.status(403).json({ error: e.message, code: 'FORBIDDEN' })
        return
      }
      next(e)
    }
  }
}
