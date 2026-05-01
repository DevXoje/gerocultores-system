/**
 * residentes.service.ts — Business logic + Firestore operations for Residente.
 *
 * Modelo descentralizado: cada gerocultor es dueño de los recursos que crea.
 * US-05: Consulta de ficha de residente
 * US-09: Alta y gestión de residentes
 */
import { randomUUID } from 'node:crypto'

import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { ResidenteResponse } from '../types/residente.types'
import { CreateResidenteSchema, ResidenteDocSchema, UpdateResidenteSchema } from '../types/residente.types'
import type { CreateResidenteDto, UpdateResidenteDto } from '../types/residente.types'

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
 * Converts a Firestore Timestamp to an ISO string.
 * Firestore returns Timestamp objects for serverTimestamp fields.
 */
function toISO(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return String(value)
}

/**
 * Converts a Firestore document to ResidenteResponse after validating the raw data.
 * Uses Zod safeParse to ensure runtime type safety — no silent failures on bad data.
 * Firestore Timestamp fields are converted to ISO strings before Zod validation.
 */
function docToResponse(id: string, data: FirebaseFirestore.DocumentData): ResidenteResponse {
  // Convert Firestore Timestamp fields to ISO strings so Zod schema (expecting string) passes
  const normalized = {
    ...data,
    creadoEn: toISO(data['creadoEn']),
    actualizadoEn: toISO(data['actualizadoEn']),
  }
  const parsed = ResidenteDocSchema.safeParse(normalized)
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
    usuarioId: d.usuarioId,
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
  ): Promise<ResidenteResponse> {
    const snap = await this.collection.doc(id).get()

    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    const data = snap.data()!

    // Ownership check: only the creator can read
    if (data.usuarioId !== requestingUid) {
      throw new ForbiddenError('No tienes acceso a este residente')
    }

    return docToResponse(snap.id, data)
  }

  /**
   * Creates a new resident. Any authenticated gerocultor can create residents.
   * US-09 — Phase 2 Task 2.1
   */
  async createResidente(
    dto: CreateResidenteDto,
    requestingUid: string,
  ): Promise<ResidenteResponse> {
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
      usuarioId: requestingUid, // Owner — el gerocultor que lo crea
      creadoEn: now,
      actualizadoEn: now,
    })

    // Fetch the written doc to get server timestamps
    const snap = await this.collection.doc(id).get()
    return docToResponse(snap.id, snap.data()!)
  }

  /**
   * Lists residents created by the requesting gerocultor.
   * US-09 — Phase 2 Task 2.2
   */
  async listResidentes(
    filter: 'active' | 'archived' | 'all',
    requestingUid: string,
  ): Promise<ResidenteResponse[]> {
    let query: FirebaseFirestore.Query = this.collection

    if (filter === 'active') {
      query = query.where('archivado', '==', false)
    } else if (filter === 'archived') {
      query = query.where('archivado', '==', true)
    }
    // 'all' → no filter

    const snap = await query.get()

    // Ownership filter: only residents created by this gerocultor
    return snap.docs
      .map((doc) => docToResponse(doc.id, doc.data()))
      .filter((r) => r.usuarioId === requestingUid)
  }

  /**
   * Updates a resident's fields. Only the owner can update.
   * US-09 — Phase 2 Task 2.3
   */
  async updateResidente(
    id: string,
    dto: UpdateResidenteDto,
    requestingUid: string,
  ): Promise<ResidenteResponse> {
    const parsed = UpdateResidenteSchema.safeParse(dto)
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(', ')
      throw new Error(`Validation error: ${message}`)
    }

    const snap = await this.collection.doc(id).get()
    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    const data = snap.data()!

    // Ownership check
    if (data.usuarioId !== requestingUid) {
      throw new ForbiddenError('Solo el creador del residente puede editarlo')
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
   * Archives a resident. Only the owner can archive.
   * US-09 — Phase 2 Task 2.4
   */
  async archiveResidente(
    id: string,
    requestingUid: string,
  ): Promise<ResidenteResponse> {
    const snap = await this.collection.doc(id).get()
    if (!snap.exists) {
      throw new NotFoundError('Residente not found')
    }

    const data = snap.data()!

    // Ownership check
    if (data.usuarioId !== requestingUid) {
      throw new ForbiddenError('Solo el creador del residente puede archivarlo')
    }

    await this.collection.doc(id).update({
      archivado: true,
      actualizadoEn: FieldValue.serverTimestamp(),
    })

    const updated = await this.collection.doc(id).get()
    return docToResponse(updated.id, updated.data()!)
  }
}
