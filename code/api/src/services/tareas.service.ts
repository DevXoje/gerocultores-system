/**
 * tareas.service.ts — Business logic and Firestore operations for Tarea.
 *
 * This is the only service layer allowed to access Firestore for tareas.
 * US-03: Consulta de agenda diaria / US-04: Actualizar estado de una tarea
 *
 * Assumption (no formal API spec found at sdd/sprint-2/api-tareas/spec):
 *  - tareas are stored in the root `tareas` collection (not as Firestore subcollection)
 *    for simplicity in Sprint-2. Migration to subcollection under `residentes`
 *    is captured in SPEC/entities.md design notes and deferred.
 *  - listTareas supports optional date filter (YYYY-MM-DD) and optional usuarioId / residenteId.
 */
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type {
  Tarea,
  TareaResponse,
  CreateTareaDto,
  UpdateTareaEstadoDto,
  AddNotaDto,
  ListTareasQuery,
} from '../types/tarea.types'

export class TareasService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.tareas)
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  async listTareas(filters?: ListTareasQuery): Promise<TareaResponse[]> {
    let query: FirebaseFirestore.Query = this.collection

    if (filters?.usuarioId) {
      query = query.where('usuarioId', '==', filters.usuarioId)
    }

    if (filters?.residenteId) {
      query = query.where('residenteId', '==', filters.residenteId)
    }

    if (filters?.fecha) {
      const start = new Date(`${filters.fecha}T00:00:00.000Z`)
      const end = new Date(`${filters.fecha}T23:59:59.999Z`)
      query = query
        .where('fechaHora', '>=', Timestamp.fromDate(start))
        .where('fechaHora', '<=', Timestamp.fromDate(end))
    }

    const snapshot = await query.orderBy('fechaHora', 'asc').get()
    return snapshot.docs.map((doc) => this.toResponse(doc.id, doc.data()))
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  async createTarea(dto: CreateTareaDto): Promise<TareaResponse> {
    const now = Timestamp.now()
    const data: Omit<Tarea, 'id'> = {
      titulo: dto.titulo,
      tipo: dto.tipo,
      fechaHora: new Date(dto.fechaHora),
      estado: 'pendiente',
      notas: dto.notas ?? null,
      residenteId: dto.residenteId,
      usuarioId: dto.usuarioId,
      creadoEn: now.toDate(),
      actualizadoEn: now.toDate(),
      completadaEn: null,
    }

    const docRef = await this.collection.add({
      ...data,
      fechaHora: Timestamp.fromDate(data.fechaHora),
      creadoEn: now,
      actualizadoEn: now,
    })

    return this.toResponse(docRef.id, {
      ...data,
      fechaHora: Timestamp.fromDate(data.fechaHora),
      creadoEn: now,
      actualizadoEn: now,
    })
  }

  // ─── Update Estado ─────────────────────────────────────────────────────────

  async updateTareaEstado(id: string, dto: UpdateTareaEstadoDto): Promise<TareaResponse> {
    const now = Timestamp.now()
    const updates: Record<string, unknown> = {
      estado: dto.estado,
      actualizadoEn: now,
    }

    if (dto.estado === 'completada') {
      updates['completadaEn'] = now
    }

    await this.collection.doc(id).update(updates)

    const doc = await this.collection.doc(id).get()
    if (!doc.exists) {
      throw new Error(`Tarea ${id} not found after update`)
    }

    return this.toResponse(doc.id, doc.data()!)
  }

  // ─── Add Nota ─────────────────────────────────────────────────────────────

  async addNota(id: string, dto: AddNotaDto): Promise<TareaResponse> {
    const now = Timestamp.now()

    await this.collection.doc(id).update({
      notas: dto.notas,
      actualizadoEn: now,
    })

    const doc = await this.collection.doc(id).get()
    if (!doc.exists) {
      throw new Error(`Tarea ${id} not found after update`)
    }

    return this.toResponse(doc.id, doc.data()!)
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private toResponse(id: string, data: FirebaseFirestore.DocumentData): TareaResponse {
    return {
      id,
      titulo: data['titulo'],
      tipo: data['tipo'],
      fechaHora: this.toIso(data['fechaHora']),
      estado: data['estado'],
      notas: data['notas'] ?? null,
      residenteId: data['residenteId'],
      usuarioId: data['usuarioId'],
      creadoEn: this.toIso(data['creadoEn']),
      actualizadoEn: this.toIso(data['actualizadoEn']),
      completadaEn: data['completadaEn'] ? this.toIso(data['completadaEn']) : null,
    }
  }

  private toIso(value: FirebaseFirestore.Timestamp | Date | string | null | undefined): string {
    if (!value) return new Date().toISOString()
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'string') return value
    // Firestore Timestamp
    return (value as FirebaseFirestore.Timestamp).toDate().toISOString()
  }
}
