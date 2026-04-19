/**
 * residentes.controller.ts — HTTP layer for Residente endpoints.
 *
 * US-05: Consulta de ficha de residente
 */
import type { Request, Response, NextFunction } from 'express'
import { ResidentesService, NotFoundError, ForbiddenError } from '../services/residentes.service'
import { ResidenteIdParamSchema } from '../types/residente.types'
import type { UserRole } from '../types/user.types'

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
      const userRole = req.user?.['role'] as UserRole
      const userUid = req.user?.uid as string

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
