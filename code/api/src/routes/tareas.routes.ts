/**
 * tareas.routes.ts — Route definitions for /api/tareas.
 *
 * Auth enforcement: verifyAuth is applied but requireRole is intentionally
 * omitted in Sprint-2 — both roles (admin and gerocultor) can read/write
 * their own schedule. Role-based filtering may be added later.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 */
import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { TareasController } from '../controllers/tareas.controller'

const router = Router()
const controller = new TareasController()

// All tareas routes require a valid Firebase token
router.use(verifyAuth)

// GET  /api/tareas?fecha=YYYY-MM-DD&usuarioId=&residenteId=
router.get('/', controller.listTareas)

// POST /api/tareas
router.post('/', controller.createTarea)

// PATCH /api/tareas/:id/estado
router.patch('/:id/estado', controller.updateTareaEstado)

// PATCH /api/tareas/:id/notas
router.patch('/:id/notas', controller.addNota)

export default router
