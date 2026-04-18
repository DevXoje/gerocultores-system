import type { Request, Response, NextFunction, RequestHandler } from 'express'

type UserRole = 'admin' | 'gerocultor'

/**
 * requireRole — factory that returns a RequestHandler enforcing role-based access.
 * Must be used AFTER verifyAuth in the middleware chain.
 *
 * Usage: router.get('/admin', verifyAuth, requireRole('admin'), controller.method)
 */
export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.['rol'] as UserRole | undefined

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
      return
    }

    next()
  }
}
