import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type {
  TareaDoc,
  TareaEstado,
  TareaResponse,
  ListTareasQuery,
  CreateTareaDto,
} from '../types/tarea.types'
import { TareaDocSchema, CreateTareaSchema } from '../types/tarea.types'

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

export class ValidationError extends Error {
  readonly statusCode = 400
  constructor(message: string, readonly field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ResidenteNotFoundError extends Error {
  readonly statusCode = 400
  readonly field = 'residenteId'
  constructor(message = 'El residente especificado no existe o no está activo') {
    super(message)
    this.name = 'ResidenteNotFoundError'
  }
}

export class UsuarioNotFoundError extends Error {
  readonly statusCode = 400
  readonly field = 'usuarioId'
  constructor(message = 'El usuario especificado no existe o está desactivado') {
    super(message)
    this.name = 'UsuarioNotFoundError'
  }
}

export class AccessDeniedError extends Error {
  readonly statusCode = 400
  readonly field = 'residenteId'
  constructor(message = 'No tienes acceso a este residente') {
    super(message)
    this.name = 'AccessDeniedError'
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
  ): Promise<TareaResponse> {
    await adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(COLLECTIONS.tareas).doc(id)
      const snap = await tx.get(ref)

      if (!snap.exists) throw new NotFoundError('Tarea not found')

      // Ownership check: only the assigned gerocultor can update
      if (snap.data()!['usuarioId'] !== requestingUid) {
        throw new ForbiddenError('No tienes acceso a esta tarea')
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

  /**
   * Creates a new task in the Firestore subcollection.
   * Any authenticated gerocultor can create tasks for any resident.
   * The `usuarioId` in the task must match the requester's uid.
   * US-14: Task creation
   */
  async createTarea(
    dto: CreateTareaDto,
    requestingUid: string,
  ): Promise<TareaResponse> {
    // 1. Validate with Zod — forward Zod errors as 400
    const parseResult = CreateTareaSchema.safeParse(dto)
    if (!parseResult.success) {
      const issues = parseResult.error.issues
      const firstError = issues && issues.length > 0 ? issues[0] : { message: 'Validation failed', path: [] as string[] }
      throw new ValidationError(firstError.message, firstError.path.join('.'))
    }

    const data = parseResult.data

    // 2. Fetch and validate Residente exists and is active
    const residenteSnap = await adminDb.collection(COLLECTIONS.residentes).doc(data.residenteId).get()
    if (!residenteSnap.exists || residenteSnap.data()?.['archivado'] === true) {
      throw new ResidenteNotFoundError()
    }

    // 3. Validate usuarioId matches the requester (self-assignment only)
    if (data.usuarioId !== requestingUid) {
      throw new AccessDeniedError('Solo puedes crear tareas para ti mismo')
    }

    // 3. Generate UUID and write to root tasks collection (consistent with reads)
    const uuid = crypto.randomUUID()
    const now = new Date().toISOString()
    const tareaRef = adminDb.collection(COLLECTIONS.tareas).doc(uuid)

    const docData: TareaDoc = {
      titulo: data.titulo,
      tipo: data.tipo,
      fechaHora: data.fechaHora,
      estado: 'pendiente',
      notas: data.notas ?? null,
      residenteId: data.residenteId,
      usuarioId: data.usuarioId,
      creadoEn: now,
      actualizadoEn: now,
      completadaEn: null,
    }

    await tareaRef.set(docData)

    return {
      id: uuid,
      ...docData,
    }
  }
}
