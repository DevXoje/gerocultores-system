import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import tareasRouter from './tareas.routes'
import notificacionesRouter from './notificaciones.routes'
import turnosRouter from './turnos.routes'
import registerRouter from './register.routes'

import residentesRouter from './residentes.routes'
import incidenciasRouter from './incidencias.routes'


const router = Router()

// Health check — no auth required
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Health check with /api prefix (for frontend compatibility)
router.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected route group — requires valid Firebase token
// Apply verifyAuth at the router level so all sub-routes inherit it
const protectedRouter = Router()
protectedRouter.use(verifyAuth)

// Base protected route — accessible to any authenticated user
protectedRouter.get('/', (_req, res) => {
  res.json({ status: 'authenticated' })
})

router.use('/api/protected', protectedRouter)
router.use('/api/tareas', tareasRouter)


router.use('/api/residentes', residentesRouter)
router.use('/api/incidencias', incidenciasRouter)
router.use('/api/notificaciones', notificacionesRouter)
router.use('/api/turnos', turnosRouter)
router.use('/api/register', registerRouter)

export default router
