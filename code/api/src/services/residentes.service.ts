import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { ResidenteDoc, ResidenteResponse } from '../types/residente.types'

export class NotFoundError extends Error {
  readonly statusCode = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
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

  /**
   * Returns the Residente with the given id.
   * Throws NotFoundError if the document does not exist.
   * US-05: Consulta de ficha de residente.
   */
  async getResidenteById(id: string): Promise<ResidenteResponse> {
    const snap = await this.collection.doc(id).get()
    if (!snap.exists) throw new NotFoundError('Residente not found')
    return docToResponse(snap.id, snap.data()!)
  }
}
