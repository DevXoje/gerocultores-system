import type { Request, Response, NextFunction } from 'express'
import { UsersService } from '../services/users.service'
import { CreateUserSchema, UpdateUserRoleSchema } from '../types/user.types'

export class UsersController {
  private service = new UsersService()

  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.listUsers()
      res.json({ data: users })
    } catch (e) {
      next(e)
    }
  }

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = CreateUserSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const user = await this.service.createUser(result.data)
      res.status(201).json({ data: user })
    } catch (e) {
      next(e)
    }
  }

  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = UpdateUserRoleSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const uid = req.params['uid'] as string
      const updated = await this.service.updateUserRole(uid, result.data)
      res.json({ data: updated })
    } catch (e) {
      next(e)
    }
  }

  disableUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uid = req.params['uid'] as string
      const result = await this.service.disableUser(uid)
      res.json({ data: result })
    } catch (e) {
      next(e)
    }
  }
}
