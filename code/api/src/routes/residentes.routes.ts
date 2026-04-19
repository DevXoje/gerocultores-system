import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { ResidentesController } from '../controllers/residentes.controller'

const router = Router()
const controller = new ResidentesController()

// All residentes routes require authentication
router.use(verifyAuth)

// GET /api/residentes/:id — US-05
router.get('/:id', controller.getResidente)

export default router
