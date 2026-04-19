import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { IncidenciasController } from '../controllers/incidencias.controller'

const router = Router()
const controller = new IncidenciasController()

// All incidencias routes require authentication (admin and gerocultor)
router.use(verifyAuth)

router.post('/', controller.createIncidencia)

export default router
