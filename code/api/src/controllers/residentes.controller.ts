/**
 * residentes.controller.ts — HTTP layer for /api/residentes
 *
 * US-05: Consulta de ficha de residente
 */
import type { Request, Response, NextFunction } from 'express'
import { ResidentesService, NotFoundError } from '../services/residentes.service'

export class ResidentesController {
  private service = new ResidentesService()

  /**
   * GET /api/residentes/:id
   * Returns the Residente document for the given id.
   * Accessible by both admin and gerocultor.
   * US-05 authorization rule: both roles may read resident details
   * (gerocultor visibility scoped to assigned residents is a future enhancement).
   */
  getResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string
      const residente = await this.service.getResidenteById(id)
      res.json({ data: residente })
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      next(e)
    }
  }
}
