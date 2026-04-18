/**
 * tareas.controller.ts — HTTP layer for Tarea endpoints.
 *
 * Responsibilities: parse request, call service, send response.
 * No business logic here — all logic lives in TareasService.
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 */
import type { Request, Response, NextFunction } from 'express'
import { TareasService } from '../services/tareas.service'
import {
  CreateTareaSchema,
  UpdateTareaEstadoSchema,
  AddNotaSchema,
  ListTareasQuerySchema,
} from '../types/tarea.types'

export class TareasController {
  private service = new TareasService()

  listTareas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = ListTareasQuerySchema.safeParse(req.query)
      if (!result.success) {
        res.status(400).json({
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const tareas = await this.service.listTareas(result.data)
      res.json({ data: tareas })
    } catch (e) {
      next(e)
    }
  }

  createTarea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = CreateTareaSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const tarea = await this.service.createTarea(result.data)
      res.status(201).json({ data: tarea })
    } catch (e) {
      next(e)
    }
  }

  updateTareaEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = UpdateTareaEstadoSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const id = req.params['id'] as string
      const tarea = await this.service.updateTareaEstado(id, result.data)
      res.json({ data: tarea })
    } catch (e) {
      next(e)
    }
  }

  addNota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = AddNotaSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
        })
        return
      }
      const id = req.params['id'] as string
      const tarea = await this.service.addNota(id, result.data)
      res.json({ data: tarea })
    } catch (e) {
      next(e)
    }
  }
}
