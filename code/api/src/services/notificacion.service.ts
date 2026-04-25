/**
 * notificacion.service.ts — Business logic for notificaciones collection.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Rules:
 * - Only `leida` field is mutable; all other updates are rejected (ownership-checked)
 * - getNotificaciones: filtered by usuarioId, optionally by leida, sorted by creadaEn desc
 * - markAsRead: ownership check before updating
 */
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import {
  NotificacionDocSchema,
  type NotificacionResponse,
  type GetNotificacionesResult,
} from '../types/notificacion.types'

export class NotFoundError extends Error {
  readonly statusCode = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

function docToResponse(id: string, data: FirebaseFirestore.DocumentData): NotificacionResponse {
  const parsed = NotificacionDocSchema.safeParse(data)
  if (!parsed.success) {
    console.error(
      '[NotificacionService] Firestore doc failed schema validation:',
      parsed.error.flatten(),
    )
    throw new Error('Datos de la notificación en formato inesperado')
  }
  const d = parsed.data
  return {
    id,
    usuarioId: d.usuarioId,
    tipo: d.tipo,
    titulo: d.titulo,
    mensaje: d.mensaje,
    leida: d.leida,
    referenciaId: d.referenciaId,
    referenciaModelo: d.referenciaModelo,
    creadaEn: d.creadaEn,
  }
}

export class NotificacionService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.notificaciones)
  }

  /**
   * Returns notifications for the given user, optionally filtered by read status.
   * Sorted by creadaEn descending (newest first).
   */
  async getNotificaciones(
    usuarioId: string,
    leida?: boolean,
    limit = 20,
  ): Promise<GetNotificacionesResult> {
    let query: FirebaseFirestore.Query = this.collection.where('usuarioId', '==', usuarioId)

    if (leida !== undefined) {
      query = query.where('leida', '==', leida)
    }

    query = query.orderBy('creadaEn', 'desc').limit(limit)

    const snapshot = await query.get()
    const notificaciones = snapshot.docs.map((doc) => docToResponse(doc.id, doc.data()))

    return { notificaciones, total: notificaciones.length }
  }

  /**
   * Marks a notification as read. Only the owner can mark their own notifications.
   * Only updates the `leida` field — no other mutations allowed.
   */
  async markAsRead(notificacionId: string, usuarioId: string): Promise<NotificacionResponse> {
    const ref = this.collection.doc(notificacionId)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Notificación no encontrada')
    }

    const data = snap.data()!
    if (data['usuarioId'] !== usuarioId) {
      throw new ForbiddenError('No tienes permiso para actualizar esta notificación')
    }

    await ref.update({ leida: true })

    const updated = await ref.get()
    return docToResponse(updated.id, updated.data()!)
  }
}
