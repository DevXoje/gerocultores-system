import type { Request, Response, NextFunction } from 'express'
import { TareasService, NotFoundError, ForbiddenError } from '../services/tareas.service'
import { UpdateEstadoSchema, ListTareasQuerySchema } from '../types/tarea.types'
import type { UserRole } from '../types/user.types'

export class TareasController {
  private service = new TareasService()

  listTareas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ListTareasQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const filters = parsed.data
      const userRole = req.user?.['role'] as UserRole
      const userUid = req.user?.uid as string

      // gerocultor can only see their own tasks
      if (userRole === 'gerocultor') {
        filters.assignedTo = userUid
      }

      const tareas = await this.service.getTareas(filters)
      res.json({ data: tareas, meta: { total: tareas.length } })
    } catch (e) {
      next(e)
    }
  }

  getTarea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string
      const tarea = await this.service.getTareaById(id)

      const userRole = req.user?.['role'] as UserRole
      const userUid = req.user?.uid as string

      if (userRole === 'gerocultor' && tarea.usuarioId !== userUid) {
        res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
        return
      }

      res.json({ data: tarea })
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      next(e)
    }
  }

  patchEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string
      const parsed = UpdateEstadoSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const userRole = req.user?.['role'] as UserRole
      const userUid = req.user?.uid as string

      const updated = await this.service.updateEstado(id, parsed.data.estado, userUid, userRole)
      res.json({ data: updated })
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
