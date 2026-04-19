import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { ResidentesController } from '../controllers/residentes.controller'

const router = Router()
const controller = new ResidentesController()

// All residentes routes require authentication
router.use(verifyAuth)

// Both roles can access resident details; business rules enforced in controller/service
router.get('/:id', controller.getResidente)

export default router
