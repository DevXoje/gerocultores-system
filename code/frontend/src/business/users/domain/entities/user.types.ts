/**
 * users/domain/entities/user.types.ts
 *
 * Frontend domain types for user management.
 * Field names must match SPEC/entities.md and the backend API exactly (G04).
 *
 * Note: Zod is backend-only. Frontend uses plain TypeScript interfaces.
 */

export type UserRole = 'admin' | 'gerocultor'

export interface UserResponse {
  uid: string
  displayName: string | null
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}
