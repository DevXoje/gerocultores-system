import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { adminAuth } from '../services/firebase'

type UserRole = 'gerocultor' | 'coordinador' | 'administrador'

/**
 * verifyAuth — validates the Firebase ID Token from Authorization: Bearer <token>.
 * On success, populates req.user with the decoded token and calls next().
 * On failure, responds with 401 Unauthorized.
 *
 * Apply at the router level, not on individual route handlers.
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
    const decodedToken = await adminAuth.verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch {
    // firebase-admin throws when token is expired, malformed, or revoked
    res.status(401).json({ error: 'Token inválido o expirado', code: 'UNAUTHORIZED' })
  }
}

/**
 * requireRole — factory that returns a RequestHandler enforcing role-based access.
 * Must be used AFTER verifyAuth in the middleware chain.
 *
 * Usage: router.get('/admin', verifyAuth, requireRole('coordinador'), controller.method)
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.['rol'] as UserRole | undefined

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
      return
    }

    next()
  }
}
