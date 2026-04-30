/**
 * turnos.routes.ts — HTTP routes for turnos.
 *
 * US-11: Resumen de fin de turno
 *
 * Routes:
 *   POST   /api/turnos             — open a new turno
 *   PATCH  /api/turnos/:id/cierre  — close an active turno
 *   GET    /api/turnos/activo      — get the user's active turno
 *   GET    /api/turnos/:id/resumen — get the turno summary
 */
import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { TurnoService, ConflictError, NotFoundError, ForbiddenError } from '../services/turno.service'
import { OpenTurnoSchema, CloseTurnoSchema } from '../types/turno.types'

const router = Router()
const service = new TurnoService()

// All routes require authentication
router.use(verifyAuth)

/**
 * POST /api/turnos
 * Opens a new turno for the authenticated user.
 * Body: { tipoTurno: TipoTurno }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = OpenTurnoSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        error: 'Datos inválidos',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const usuarioId = req.user!.uid
    const turno = await service.openTurno(usuarioId, parsed.data.tipoTurno)
    res.status(201).json({ turno })
  } catch (e) {
    if (e instanceof ConflictError) {
      res.status(409).json({ error: 'Ya existe turno abierto', code: 'CONFLICT' })
      return
    }
    next(e)
  }
})

/**
 * GET /api/turnos/activo
 * Returns the active (open) turno for the authenticated user, or null.
 * NOTE: must be defined BEFORE /:id to avoid 'activo' being treated as an id.
 */
router.get('/activo', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarioId = req.user!.uid
    const turno = await service.getTurnoActivo(usuarioId)
    res.json({ turno })
  } catch (e) {
    next(e)
  }
})

/**
 * PATCH /api/turnos/:id/cierre
 * Closes an active turno by setting fin + resumenTraspaso.
 * Body: { resumenTraspaso: string }
 */
router.patch('/:id/cierre', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = CloseTurnoSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        error: 'Datos inválidos',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const id = req.params['id'] as string
    const usuarioId = req.user!.uid
    const turno = await service.closeTurno(id, usuarioId, parsed.data.resumenTraspaso)
    res.json({ turno })
  } catch (e) {
    if (e instanceof NotFoundError) {
      res.status(404).json({ error: 'Turno no encontrado', code: 'NOT_FOUND' })
      return
    }
    if (e instanceof ForbiddenError) {
      res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
      return
    }
    next(e)
  }
})

/**
 * GET /api/turnos/:id/resumen
 * Returns the aggregated summary for a turno.
 */
router.get('/:id/resumen', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string
    const usuarioId = req.user!.uid
    const resumen = await service.getResumen(id, usuarioId)
    res.json({ resumen })
  } catch (e) {
    if (e instanceof NotFoundError) {
      res.status(404).json({ error: 'Turno no encontrado', code: 'NOT_FOUND' })
      return
    }
    if (e instanceof ForbiddenError) {
      res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
      return
    }
    next(e)
  }
})

export default router
