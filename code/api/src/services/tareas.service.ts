import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { TareaDoc, TareaEstado, TareaResponse, ListTareasQuery } from '../types/tarea.types'
import { TareaDocSchema } from '../types/tarea.types'
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
 * Converts a Firestore document to TareaResponse after validating the raw data.
 * Uses Zod safeParse to ensure runtime type safety — no silent failures on bad data.
 */
function docToResponse(id: string, data: FirebaseFirestore.DocumentData): TareaResponse {
  const parsed = TareaDocSchema.safeParse(data)
  if (!parsed.success) {
    console.error('[TareasService] Firestore doc failed schema validation:', parsed.error.flatten())
    throw new Error('Datos de la tarea en formato inesperado')
  }
  const d = parsed.data
  return {
    id,
    titulo: d.titulo,
    tipo: d.tipo,
    fechaHora: d.fechaHora,
    estado: d.estado,
    notas: d.notas,
    residenteId: d.residenteId,
    usuarioId: d.usuarioId,
    creadoEn: d.creadoEn,
    actualizadoEn: d.actualizadoEn,
    completadaEn: d.completadaEn,
  }
}

export class TareasService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.tareas)
  }

  async getTareas(filters: ListTareasQuery): Promise<TareaResponse[]> {
    let query: FirebaseFirestore.Query = this.collection

    if (filters.assignedTo) {
      query = query.where('usuarioId', '==', filters.assignedTo)
    }
    if (filters.status) {
      query = query.where('estado', '==', filters.status)
    }

    const snapshot = await query.get()
    let docs = snapshot.docs.map((doc) => docToResponse(doc.id, doc.data()))

    if (filters.date) {
      docs = docs.filter((t) => t.fechaHora.startsWith(filters.date as string))
    }

    return docs
  }

  async getTareaById(id: string): Promise<TareaResponse> {
    const snap = await this.collection.doc(id).get()
    if (!snap.exists) throw new NotFoundError('Tarea not found')
    return docToResponse(snap.id, snap.data()!)
  }

  async updateEstado(
    id: string,
    estado: TareaEstado,
    requestingUid: string,
    requestingRole: UserRole,
  ): Promise<TareaResponse> {
    await adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(COLLECTIONS.tareas).doc(id)
      const snap = await tx.get(ref)

      if (!snap.exists) throw new NotFoundError('Tarea not found')

      if (requestingRole === 'gerocultor' && snap.data()!['usuarioId'] !== requestingUid) {
        throw new ForbiddenError("Cannot update another user's task")
      }

      const updates: Partial<TareaDoc> = {
        estado,
        actualizadoEn: new Date().toISOString(),
      }
      if (estado === 'completada') {
        updates.completadaEn = new Date().toISOString()
      }

      tx.update(ref, updates as FirebaseFirestore.UpdateData<TareaDoc>)
    })

    return this.getTareaById(id)
  }
}
