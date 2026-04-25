/**
 * notificaciones.routes.ts — HTTP routes for notificaciones.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Routes:
 *   GET  /api/notificaciones       — list notifications for authenticated user
 *   PATCH /api/notificaciones/:id/leida — mark notification as read
 */
import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { NotificacionService, NotFoundError, ForbiddenError } from '../services/notificacion.service'
import { GetNotificacionesQuerySchema } from '../types/notificacion.types'

const router = Router()
const service = new NotificacionService()

// All routes require authentication
router.use(verifyAuth)

/**
 * GET /api/notificaciones
 * Query params: leida (boolean string), limit (number)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = GetNotificacionesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.flatten().fieldErrors })
      return
    }

    const usuarioId = req.user!.uid
    const { leida, limit } = parsed.data

    const result = await service.getNotificaciones(usuarioId, leida, limit ?? 20)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

/**
 * PATCH /api/notificaciones/:id/leida
 * Marks notification as read. Only owner can mark.
 */
router.patch('/:id/leida', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string
    const usuarioId = req.user!.uid

    const notificacion = await service.markAsRead(id, usuarioId)
    res.json({ notificacion })
  } catch (e) {
    if (e instanceof NotFoundError) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    if (e instanceof ForbiddenError) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next(e)
  }
})

export default router
