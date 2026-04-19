import { z } from 'zod'

export const UserRoleEnum = z.enum(['admin', 'gerocultor'])
export type UserRole = z.infer<typeof UserRoleEnum>

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'displayName is required'),
  role: UserRoleEnum,
})
export type CreateUserDto = z.infer<typeof CreateUserSchema>

export const UpdateUserRoleSchema = z.object({
  role: UserRoleEnum,
})
export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleSchema>

export interface UserResponse {
  uid: string
  email: string
  displayName: string | null
  role: UserRole
  active: boolean
  createdAt: string
}

export interface UpdateRoleResponse {
  uid: string
  role: UserRole
}

export interface DisableUserResponse {
  uid: string
  active: false
}

export interface EnableUserResponse {
  uid: string
  active: true
}
