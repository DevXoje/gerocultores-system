/**
 * residentes.service.ts — Business logic + Firestore operations for Residente.
 *
 * US-05: Consulta de ficha de residente
 * - Admin: can access any resident
 * - Gerocultor: can only access residents in their gerocultoresAsignados array
 */
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { ResidenteDoc, ResidenteResponse } from '../types/residente.types'
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

function docToResponse(id: string, data: FirebaseFirestore.DocumentData): ResidenteResponse {
  return {
    id,
    nombre: data['nombre'] as string,
    apellidos: data['apellidos'] as string,
    fechaNacimiento: data['fechaNacimiento'] as string,
    habitacion: data['habitacion'] as string,
    foto: (data['foto'] as string | null) ?? null,
    diagnosticos: (data['diagnosticos'] as string | null) ?? null,
    alergias: (data['alergias'] as string | null) ?? null,
    medicacion: (data['medicacion'] as string | null) ?? null,
    preferencias: (data['preferencias'] as string | null) ?? null,
    archivado: data['archivado'] as boolean,
    creadoEn: data['creadoEn'] as string,
    actualizadoEn: data['actualizadoEn'] as string,
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
      const assigned = (data['gerocultoresAsignados'] as string[] | undefined) ?? []
      if (!assigned.includes(requestingUid)) {
        throw new ForbiddenError('No tienes acceso a este residente')
      }
    }

    return docToResponse(snap.id, data)
  }
}
