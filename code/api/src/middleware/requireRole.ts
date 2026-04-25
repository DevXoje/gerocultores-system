import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { UserRoleEnum } from '../types/user.types'

/**
 * requireRole — factory that returns a RequestHandler enforcing role-based access.
 * Must be used AFTER verifyAuth in the middleware chain.
 *
 * Usage: router.get('/admin', verifyAuth, requireRole('admin'), controller.method)
 */
export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rawRole = req.user?.['role']
    // Defensive: reject if role claim is missing or not a valid UserRole
    const userRole = UserRoleEnum.safeParse(rawRole)
    if (!userRole.success || !roles.includes(userRole.data)) {
      res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
      return
    }

    next()
  }
}
