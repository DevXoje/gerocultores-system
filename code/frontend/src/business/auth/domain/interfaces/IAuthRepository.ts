/**
 * auth/domain/interfaces/IAuthRepository.ts
 *
 * Interface for authentication operations.
 * The store (useAuthStore) is state-only; all auth actions live in the composable
 * which delegates to this interface — keeping infrastructure calls out of the store.
 *
 * Implementations live in auth/infrastructure/.
 */
import type { User } from 'firebase/auth'

export interface AuthResult {
  user: User
}

export interface IAuthRepository {
  /**
   * Sign in with email and password.
   * Returns the authenticated user credential.
   * Throws Firebase auth errors on failure.
   */
  signInWithEmail(email: string, password: string): Promise<AuthResult>

  /**
   * Sign in with Google OAuth popup.
   * Returns the authenticated user credential.
   * Throws Firebase auth errors on failure.
   */
  signInWithGoogle(): Promise<AuthResult>
}