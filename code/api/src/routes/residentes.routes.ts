import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { requireRole } from '../middleware/requireRole'
import { ResidentesController } from '../controllers/residentes.controller'

const router = Router()
const controller = new ResidentesController()

// All residentes routes require authentication
router.use(verifyAuth)

// GET /api/residentes — US-03/US-09 list (all roles)
router.get('/', controller.listResidentes)

// GET /api/residentes/:id — US-05
router.get('/:id', controller.getResidente)

// POST /api/residentes — US-09 admin only
router.post('/', requireRole('admin'), controller.createResidente)

// PATCH /api/residentes/:id — US-09 admin only
router.patch('/:id', requireRole('admin'), controller.updateResidente)

// PATCH /api/residentes/:id/archive — US-09 admin only
router.patch('/:id/archive', requireRole('admin'), controller.archiveResidente)

export default router
