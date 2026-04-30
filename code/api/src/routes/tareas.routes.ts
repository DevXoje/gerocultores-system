import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { requireRole } from '../middleware/requireRole'
import { TareasController } from '../controllers/tareas.controller'

const router = Router()
const controller = new TareasController()

// All tareas routes require authentication
router.use(verifyAuth)

// Both roles can access these routes; authorization logic is in the controller/service
router.get('/', controller.listTareas)
router.get('/:id', controller.getTarea)
router.patch('/:id/estado', controller.patchEstado)

// POST /api/tareas — requires admin or gerocultor role
router.post('/', requireRole('admin', 'gerocultor'), controller.createTarea)

export default router
