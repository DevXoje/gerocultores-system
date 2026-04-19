import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type { TareaDoc, TareaEstado, TareaResponse, ListTareasQuery } from '../types/tarea.types'
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

function docToResponse(id: string, data: FirebaseFirestore.DocumentData): TareaResponse {
  return {
    id,
    titulo: data['titulo'] as string,
    tipo: data['tipo'],
    fechaHora: data['fechaHora'] as string,
    estado: data['estado'],
    notas: (data['notas'] as string | null) ?? null,
    residenteId: data['residenteId'] as string,
    usuarioId: data['usuarioId'] as string,
    creadoEn: data['creadoEn'] as string,
    actualizadoEn: data['actualizadoEn'] as string,
    completadaEn: (data['completadaEn'] as string | null) ?? null,
  }
}

export class TareasService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.tasks)
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
      const ref = adminDb.collection(COLLECTIONS.tasks).doc(id)
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
