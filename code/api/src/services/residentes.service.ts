/**
 * residentes.service.ts — Business logic + Firestore operations for Residente.
 *
 * US-05: Consulta de ficha de residente
 * US-09: Alta y gestión de residentes
 * - Admin: full access to all operations
 * - Gerocultor: read-only access to residents in their gerocultoresAsignados array
 */
import { randomUUID } from 'node:crypto'

import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import { FieldValue } from 'firebase-admin/firestore'
import type { ResidenteResponse } from '../types/residente.types'
import { CreateResidenteSchema, ResidenteDocSchema, UpdateResidenteSchema } from '../types/residente.types'
import type { CreateResidenteDto, UpdateResidenteDto } from '../types/residente.types'
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

  /**
   * Creates a new resident. Admin only.
   * US-09 — Phase 2 Task 2.1
   */
  async createResidente(
    dto: CreateResidenteDto,
    _requestingUid: string,
    requestingRole: UserRole,
  ): Promise<ResidenteResponse> {
    if (requestingRole !== 'admin') {
      throw new ForbiddenError('Solo un admin puede crear residentes')
    }

    const parsed = CreateResidenteSchema.safeParse(dto)
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(', ')
      throw new Error(`Validation error: ${message}`)
    }

    const id = randomUUID()
    const now = FieldValue.serverTimestamp()

    await this.collection.doc(id).set({
      id,
      nombre: parsed.data.nombre,
      apellidos: parsed.data.apellidos,
      fechaNacimiento: parsed.data.fechaNacimiento,
      habitacion: parsed.data.habitacion,
      foto: parsed.data.foto ?? null,
      diagnosticos: parsed.data.diagnosticos ?? null,
      alergias: parsed.data.alergias ?? null,
      medicacion: parsed.data.medicacion ?? null,
      preferencias: parsed.data.preferencias ?? null,
      archivado: false,
      gerocultoresAsignados: [],
      creadoEn: now,
      actualizadoEn: now,
    })

    // Fetch the written doc to get server timestamps
    const snap = await this.collection.doc(id).get()
    return docToResponse(snap.id, snap.data()!)
  }

  /**
   * Lists residents with optional filter.
   * - Admin: all residents (respects filter)
   * - Gerocultor: only residents where uid appears in gerocultoresAsignados
   * US-09 — Phase 2 Task 2.2
   */
  async listResidentes(
    filter: 'active' | 'archived' | 'all',
    requestingUid: string,
    requestingRole: UserRole,
  ): Promise<ResidenteResponse[]> {
    let query: FirebaseFirestore.Query = this.collection

    if (filter === 'active') {
      query = query.where('archivado', '==', false)
    } else if (filter === 'archived') {
      query = query.where('archivado', '==', true)
    }
    // 'all' → no filter

    const snap = await query.get()
    const all = snap.docs.map((doc) => docToResponse(doc.id, doc.data()))

    if (requestingRole === 'admin') {
      return all
    }

    // Gerocultor: filter to only their assigned residents
    return all.filter((r) => {
      // For this we need gerocultoresAsignados — not in ResidenteResponse
      // Fetch raw doc to check the array
      return snap.docs.some((doc) => {
        const data = doc.data()
        const assigned: string[] = data['gerocultoresAsignados'] ?? []
        return doc.id === r.id && assigned.includes(requestingUid)
      })
    })
  }

  /**
   * Updates a resident's fields. Admin only.
   * US-09 — Phase 2 Task 2.3
   */
  async updateResidente(
    id: string,
    dto: UpdateResidenteDto,
    _requestingUid: string,
    requestingRole: UserRole,
  ): Promise<ResidenteResponse> {
    if (requestingRole !== 'admin') {
      throw new ForbiddenError('Solo un admin puede actualizar residentes')
    }

    const parsed = UpdateResidenteSchema.safeParse(dto)
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(', ')
      throw new Error(`Validation error: ${message}`)
    }

    const snap = await this.collection.doc(id).get()
    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { actualizadoEn: FieldValue.serverTimestamp() }
    if (parsed.data.nombre !== undefined) updates['nombre'] = parsed.data.nombre
    if (parsed.data.apellidos !== undefined) updates['apellidos'] = parsed.data.apellidos
    if (parsed.data.fechaNacimiento !== undefined) updates['fechaNacimiento'] = parsed.data.fechaNacimiento
    if (parsed.data.habitacion !== undefined) updates['habitacion'] = parsed.data.habitacion
    if (parsed.data.foto !== undefined) updates['foto'] = parsed.data.foto
    if (parsed.data.diagnosticos !== undefined) updates['diagnosticos'] = parsed.data.diagnosticos
    if (parsed.data.alergias !== undefined) updates['alergias'] = parsed.data.alergias
    if (parsed.data.medicacion !== undefined) updates['medicacion'] = parsed.data.medicacion
    if (parsed.data.preferencias !== undefined) updates['preferencias'] = parsed.data.preferencias

    await this.collection.doc(id).update(updates)

    const updated = await this.collection.doc(id).get()
    return docToResponse(updated.id, updated.data()!)
  }

  /**
   * Archives a resident. Admin only.
   * US-09 — Phase 2 Task 2.4
   */
  async archiveResidente(
    id: string,
    _requestingUid: string,
    requestingRole: UserRole,
  ): Promise<ResidenteResponse> {
    if (requestingRole !== 'admin') {
      throw new ForbiddenError('Solo un admin puede archivar residentes')
    }

    const snap = await this.collection.doc(id).get()
    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    await this.collection.doc(id).update({
      archivado: true,
      actualizadoEn: FieldValue.serverTimestamp(),
    })

    const updated = await this.collection.doc(id).get()
    return docToResponse(updated.id, updated.data()!)
  }
}
