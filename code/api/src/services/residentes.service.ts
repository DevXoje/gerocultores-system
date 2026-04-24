/**
 * residentes.service.ts — Business logic + Firestore operations for Residente.
 *
 * US-05: Consulta de ficha de residente
 * - Admin: can access any resident
 * - Gerocultor: can only access residents in their gerocultoresAsignados array
 */
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { ResidenteResponse } from '../types/residente.types'
import { ResidenteDocSchema } from '../types/residente.types'
import type { UserRole } from '../types/user.types'

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

/**
 * Converts a Firestore document to ResidenteResponse after validating the raw data.
 * Uses Zod safeParse to ensure runtime type safety — no silent failures on bad data.
 */
function docToResponse(id: string, data: FirebaseFirestore.DocumentData): ResidenteResponse {
  const parsed = ResidenteDocSchema.safeParse(data)
  if (!parsed.success) {
    // Log for debugging; in production this should never happen if Firestore rules are correct
    console.error('[ResidentesService] Firestore doc failed schema validation:', parsed.error.flatten())
    throw new Error('Datos del residente en formato inesperado')
  }
  const d = parsed.data
  return {
    id,
    nombre: d.nombre,
    apellidos: d.apellidos,
    fechaNacimiento: d.fechaNacimiento,
    habitacion: d.habitacion,
    foto: d.foto,
    diagnosticos: d.diagnosticos,
    alergias: d.alergias,
    medicacion: d.medicacion,
    preferencias: d.preferencias,
    archivado: d.archivado,
    creadoEn: d.creadoEn,
    actualizadoEn: d.actualizadoEn,
  }
}

export class ResidentesService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.residentes)
  }

  async getResidenteById(
    id: string,
    requestingUid: string,
    requestingRole: UserRole,
  ): Promise<ResidenteResponse> {
    const snap = await this.collection.doc(id).get()

    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    const data = snap.data()!

    // Gerocultor access control: must be in gerocultoresAsignados array
    if (requestingRole === 'gerocultor') {
      const assigned = data['gerocultoresAsignados'] ?? []
      if (!Array.isArray(assigned) || !assigned.includes(requestingUid)) {
        throw new ForbiddenError('No tienes acceso a este residente')
      }
    }

    return docToResponse(snap.id, data)
  }
}
