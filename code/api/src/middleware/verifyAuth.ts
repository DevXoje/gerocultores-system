import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../services/firebase'

const isEmulator = process.env['USE_FIREBASE_EMULATORS'] === 'true'

/**
 * verifyAuth — validates the Firebase ID Token from Authorization: Bearer <token>.
 * On success, populates req.user with the decoded token and calls next().
 * On failure, responds with 401 Unauthorized.
 *
 * Apply at the router level (e.g., router.use(verifyAuth)), not on individual route handlers.
 */
export async function verifyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
    return
  }

  const token = authHeader.slice('Bearer '.length).trim()

  if (!token) {
    res.status(401).json({ error: 'Token no provisto o inválido', code: 'UNAUTHORIZED' })
    return
  }

  try {
    // verifyIdToken validates against Firebase Auth (or the Auth emulator when
    // FIREBASE_AUTH_EMULATOR_HOST is set in the environment).
    const decodedToken = await adminAuth.verifyIdToken(token)
    // Cast through unknown because DecodedIdToken may not expose custom claims in its type,
    // but firebase-admin guarantees they are present at runtime.
    req.user = decodedToken as typeof req.user
    next()
  } catch (err) {
    const error = err as { code?: string; message?: string }

    // Emulator mode: on any verification failure, decode the JWT payload without
    // signature verification and trust it. Tokens from the frontend Auth emulator
    // use alg:none so verifyIdToken can't validate them.
    if (isEmulator) {
      console.log('[verifyAuth] Emulator mode — verifyIdToken failed, parsing alg:none token:', error.message)
      try {
        const payloadBase64 = token.split('.')[1]
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8')
        const decoded = JSON.parse(payloadJson) as Record<string, unknown>

        const uid = (decoded['uid'] ?? decoded['user_id'] ?? decoded['sub']) as string
        const rawRole = decoded['role'] as string | undefined
        const role: 'admin' | 'gerocultor' = rawRole === 'admin' ? 'admin' : 'gerocultor'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.user = { ...decoded, uid, role } as any
        next()
        return
      } catch (parseErr) {
        console.error('[verifyAuth] Emulator parse failed:', parseErr)
        // Fall through to production error response
      }
    }

    console.error('[verifyAuth] Token verification failed:', error.message)
    res.status(401).json({ error: 'Token inválido o expirado', code: 'UNAUTHORIZED' })
  }
}
