import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import adminUsersRouter from './admin.users.routes'
import tareasRouter from './tareas.routes'
import incidenciasRouter from './incidencias.routes'

const router = Router()

// Health check — no auth required
router.get('/health', (_req, res) => {
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
router.use('/api/admin/users', adminUsersRouter)
router.use('/api/tareas', tareasRouter)
router.use('/api/incidencias', incidenciasRouter)

export default router
