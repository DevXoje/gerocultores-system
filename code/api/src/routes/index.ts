import { Router } from 'express'

const router = Router()

// Health check — no auth required
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
