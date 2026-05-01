import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { ResidentesController } from '../controllers/residentes.controller'

const router = Router()
const controller = new ResidentesController()

// All residentes routes require authentication
router.use(verifyAuth)

// GET /api/residentes — US-03/US-09 list
router.get('/', controller.listResidentes)

// GET /api/residentes/:id — US-05
router.get('/:id', controller.getResidente)

// POST /api/residentes — US-09 any authenticated gerocultor
router.post('/', controller.createResidente)

// PATCH /api/residentes/:id — US-09 owner only
router.patch('/:id', controller.updateResidente)

// PATCH /api/residentes/:id/archive — US-09 owner only
router.patch('/:id/archive', controller.archiveResidente)

export default router
