import { Router, type Request, type Response } from 'express'
import { verifyAuth } from '../middleware/verifyAuth'
import { adminAuth } from '../services/firebase'

const router = Router()

/**
 * POST /api/register/set-claims
 *
 * Assigns the 'gerocultor' role to the authenticated user.
 * The uid is extracted from the Firebase ID token validated by verifyAuth —
 * NOT from the request body. This prevents privilege escalation.
 *
 * Security: role is ALWAYS hardcoded to 'gerocultor', ignoring any body payload.
 */
router.post('/set-claims', verifyAuth, async (req: Request, res: Response) => {
  const uid = req.user?.uid

  if (!uid) {
    res.status(401).json({ error: 'Token requerido', code: 'UNAUTHORIZED' })
    return
  }

  try {
    await adminAuth.setCustomUserClaims(uid, { role: 'gerocultor' })
    res.status(200).json({ success: true, uid, role: 'gerocultor' })
  } catch (err) {
    console.error('[register/set-claims] Failed to set custom claims:', err)
    res.status(500).json({ error: 'Error interno al asignar rol', code: 'INTERNAL_ERROR' })
  }
})

export default router
