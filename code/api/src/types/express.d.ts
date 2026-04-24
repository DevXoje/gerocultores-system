import type { DecodedIdToken } from 'firebase-admin/auth'
import type { UserRole } from './user.types'

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by verifyAuth middleware after successful token validation.
       * Includes firebase-admin standard claims + custom role claim.
       */
      user?: DecodedIdToken & { role?: UserRole }
    }
  }
}
