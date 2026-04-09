import { Router } from 'express'
import { verifyAuth, requireRole } from '../middleware/verifyAuth'

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

// Coordinador-only route — requires coordinador or administrador role
protectedRouter.get('/coordinador-only', requireRole('coordinador', 'administrador'), (_req, res) => {
  res.json({ status: 'authorized' })
})

router.use('/api/protected', protectedRouter)

export default router
