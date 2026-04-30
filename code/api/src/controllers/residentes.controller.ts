/**
 * residentes.controller.ts — HTTP layer for Residente endpoints.
 *
 * US-05: Consulta de ficha de residente
 */
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ResidentesService, NotFoundError, ForbiddenError } from '../services/residentes.service'
import {
  ResidenteIdParamSchema,
  CreateResidenteSchema,
  UpdateResidenteSchema,
  ListResidentesQuerySchema,
} from '../types/residente.types'
import type { UserRole } from '../types/user.types'
import { UserRoleEnum } from '../types/user.types'

function getAuthUser(req: Request): { uid: string; role: UserRole } {
  const rawRole = req.user?.['role']
  const role = UserRoleEnum.safeParse(rawRole)
  if (!role.success || !req.user?.uid) {
    throw new Error('Autorización inválida')
  }
  return { uid: req.user.uid, role: role.data }
}

export class ResidentesController {
  private service = new ResidentesService()

  getResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ResidenteIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { id } = parsed.data
      const { uid: userUid, role: userRole } = getAuthUser(req)

      const residente = await this.service.getResidenteById(id, userUid, userRole)
      res.json({ data: residente })
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      if (e instanceof ForbiddenError) {
        res.status(403).json({ error: e.message, code: 'FORBIDDEN' })
        return
      }
      next(e)
    }
  }

  createResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = CreateResidenteSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid, role } = getAuthUser(req)

      if (role !== 'admin') {
        res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
        return
      }

      const residente = await this.service.createResidente(parsed.data, uid, role)
      res.status(201).json({ data: residente })
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: e.flatten().fieldErrors })
        return
      }
      if (e instanceof ForbiddenError) {
        res.status(403).json({ error: e.message, code: 'FORBIDDEN' })
        return
      }
      next(e)
    }
  }

  listResidentes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ListResidentesQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid, role } = getAuthUser(req)
      const filter = parsed.data.filter ?? 'active'

      const residentes = await this.service.listResidentes(filter, uid, role)
      res.json({ data: residentes })
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: 'Parámetros inválidos', code: 'VALIDATION_ERROR', details: e.flatten().fieldErrors })
        return
      }
      next(e)
    }
  }

  updateResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParsed = ResidenteIdParamSchema.safeParse(req.params)
      if (!idParsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: idParsed.error.flatten().fieldErrors,
        })
        return
      }

      const bodyParsed = UpdateResidenteSchema.safeParse(req.body)
      if (!bodyParsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: bodyParsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid, role } = getAuthUser(req)

      if (role !== 'admin') {
        res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
        return
      }

      const residente = await this.service.updateResidente(idParsed.data.id, bodyParsed.data, uid, role)
      res.json({ data: residente })
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: e.flatten().fieldErrors })
        return
      }
      if (e instanceof ForbiddenError) {
        res.status(403).json({ error: e.message, code: 'FORBIDDEN' })
        return
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      next(e)
    }
  }

  archiveResidente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ResidenteIdParamSchema.safeParse(req.params)
      if (!parsed.success) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        })
        return
      }

      const { uid, role } = getAuthUser(req)

      if (role !== 'admin') {
        res.status(403).json({ error: 'Acceso no autorizado', code: 'FORBIDDEN' })
        return
      }

      const residente = await this.service.archiveResidente(parsed.data.id, uid, role)
      res.json({ data: residente })
    } catch (e) {
      if (e instanceof ForbiddenError) {
        res.status(403).json({ error: e.message, code: 'FORBIDDEN' })
        return
      }
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message, code: 'NOT_FOUND' })
        return
      }
      next(e)
    }
  }
}
