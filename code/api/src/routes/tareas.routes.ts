import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { TareasController } from '../controllers/tareas.controller'

const router = Router()
const controller = new TareasController()

// All tareas routes require authentication
router.use(verifyAuth)

// Gerocultor can only see their own tasks (filter applied in controller)
router.get('/', controller.listTareas)
router.get('/:id', controller.getTarea)
router.patch('/:id/estado', controller.patchEstado)

// POST /api/tareas — any authenticated gerocultor can create tasks for themselves
router.post('/', controller.createTarea)

export default router
