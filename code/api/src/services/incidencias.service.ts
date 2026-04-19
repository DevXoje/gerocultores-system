import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { CreateIncidenciaDTO, IncidenciaDoc, IncidenciaResponse } from '../types/incidencia.types'

/**
 * incidencias.service.ts — Business logic for Incidencia entity.
 * US-06: Registro de incidencia
 */

export class IncidenciasService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.incidences)
  }

  /**
   * Creates a new Incidencia in Firestore.
   * - registradaEn is set server-side (not client-provided).
   * - The historial is immutable: no edit/delete operations.
   * US-06: Any authenticated user (admin or gerocultor) may register an incidencia.
   */
  async createIncidencia(dto: CreateIncidenciaDTO, creatingUserId: string): Promise<IncidenciaResponse> {
    const doc: IncidenciaDoc = {
      tipo: dto.tipo,
      severidad: dto.severidad,
      descripcion: dto.descripcion,
      residenteId: dto.residenteId,
      usuarioId: creatingUserId,
      tareaId: dto.tareaId ?? null,
      registradaEn: new Date().toISOString(),
    }

    const ref = await this.collection.add(doc)

    return {
      id: ref.id,
      ...doc,
    }
  }
}
