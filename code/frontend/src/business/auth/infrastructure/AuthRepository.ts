/**
 * auth/infrastructure/AuthRepository.ts
 *
 * Firebase Auth implementation of IAuthRepository.
 * This is the ONLY place in the auth module that imports Firebase Auth directly.
 */
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/services/firebase'
import type { AuthResult, IAuthRepository } from '../domain/interfaces/IAuthRepository'

export class AuthRepository implements IAuthRepository {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return { user: credential.user }
  }

  /**
   * Google OAuth via redirect — avoids popup blocker, works reliably on tablet/mobile.
   * signInWithRedirect triggers the redirect; the credential is returned via
   * getRedirectResult (called by the auth state listener in the router guard).
   * Throws if the redirect was initiated; success is handled by onAuthStateChanged.
   */
  async signInWithGoogle(): Promise<AuthResult> {
    await signInWithRedirect(auth, googleProvider)
    // Redirect was initiated — user will return to the app.
    // The router guard's initAuth() will detect the returned user via getRedirectResult.
    throw new Error('AUTH_REDIRECT_INITIATED')
  }

  /**
   * Retrieves the pending credential from a redirect flow.
   * Returns null if there is no pending result (user came via normal navigation).
   */
  async getPendingRedirectResult(): Promise<AuthResult | null> {
    const credential = await getRedirectResult(auth)
    if (!credential) return null
    return { user: credential.user }
  }
}

// Singleton instance for use across composables
export const authRepository = new AuthRepository()