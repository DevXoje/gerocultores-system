import type { Request, Response, NextFunction } from 'express'
import { TareasService, NotFoundError, ForbiddenError } from '../services/tareas.service'
import { UpdateEstadoSchema, ListTareasQuerySchema } from '../types/tarea.types'
import type { UserRole } from '../types/user.types'
import { UserRoleEnum } from '../types/user.types'

function getAuthUser(req: Request): { uid: string; role: UserRole } {
  // Support both emulator tokens (user_id) and production tokens (uid)
  const uid = req.user?.['uid'] || req.user?.['user_id']
  const rawRole = req.user?.['role']
  const role = UserRoleEnum.safeParse(rawRole)
  if (!role.success || !uid) {
    throw new Error('Autorización inválida')
  }
  return { uid, role: role.data }
}

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

      // Extract auth user — return 401 if missing/invalid role
      let userUid: string
      let userRole: UserRole
      try {
        const authUser = getAuthUser(req)
        userUid = authUser.uid
        userRole = authUser.role
      } catch (authError) {
        res.status(401).json({ error: authError instanceof Error ? authError.message : 'Autorización inválida', code: 'UNAUTHORIZED' })
        return
      }

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
      const rawId = req.params['id']
      if (!rawId || Array.isArray(rawId)) {
        res.status(400).json({ error: 'ID requerido', code: 'VALIDATION_ERROR' })
        return
      }
      const id = rawId
      const tarea = await this.service.getTareaById(id)

      const { uid: userUid, role: userRole } = getAuthUser(req)

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
      const rawId = req.params['id']
      if (!rawId || Array.isArray(rawId)) {
        res.status(400).json({ error: 'ID requerido', code: 'VALIDATION_ERROR' })
        return
      }
      const id = rawId
      const parsed = UpdateEstadoSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid: userUid, role: userRole } = getAuthUser(req)

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
