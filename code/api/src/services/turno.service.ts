/**
 * turno.service.ts — Business logic for turnos collection.
 *
 * US-11: Resumen de fin de turno
 *
 * Rules:
 * - openTurno: creates new turno, rejects (409) if active one exists
 * - closeTurno: sets fin + resumenTraspaso, ownership check
 * - getTurnoActivo: returns null or open turno for user
 * - getResumen: aggregates tareas + incidencias from Firestore
 */
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import { TurnoDocSchema, type TurnoResponse, type TurnoTipo, type TurnoResumen } from '../types/turno.types'

export class ConflictError extends Error {
  readonly statusCode = 409
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

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

function docToResponse(id: string, data: FirebaseFirestore.DocumentData): TurnoResponse {
  const parsed = TurnoDocSchema.safeParse(data)
  if (!parsed.success) {
    console.error(
      '[TurnoService] Firestore doc failed schema validation:',
      parsed.error.flatten(),
    )
    throw new Error('Datos del turno en formato inesperado')
  }
  const d = parsed.data
  return {
    id,
    usuarioId: d.usuarioId,
    fecha: d.fecha,
    tipoTurno: d.tipoTurno,
    inicio: d.inicio,
    fin: d.fin,
    resumenTraspaso: d.resumenTraspaso,
    creadoEn: d.creadoEn,
  }
}

export class TurnoService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.turnos)
  }

  /**
   * Opens a new turno for the user. Throws ConflictError if already has active shift.
   */
  async openTurno(usuarioId: string, tipoTurno: TurnoTipo): Promise<TurnoResponse> {
    // Check for existing active shift (fin == null)
    const existing = await this.collection
      .where('usuarioId', '==', usuarioId)
      .where('fin', '==', null)
      .limit(1)
      .get()

    if (!existing.docs.length === false || existing.docs.length > 0) {
      throw new ConflictError('Ya existe turno abierto')
    }

    const now = new Date().toISOString()
    const ref = await this.collection.add({
      usuarioId,
      fecha: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      tipoTurno,
      inicio: now,
      fin: null,
      resumenTraspaso: null,
      creadoEn: now,
    })

    const created = await ref.get()
    return docToResponse(created.id, created.data()!)
  }

  /**
   * Closes a turno: sets fin + resumenTraspaso. Ownership required.
   */
  async closeTurno(
    turnoId: string,
    usuarioId: string,
    resumenTraspaso: string,
  ): Promise<TurnoResponse> {
    const ref = this.collection.doc(turnoId)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Turno no encontrado')
    }

    const data = snap.data()!
    if (data['usuarioId'] !== usuarioId) {
      throw new ForbiddenError('No tienes permiso para cerrar este turno')
    }

    await ref.update({
      fin: new Date().toISOString(),
      resumenTraspaso,
    })

    const updated = await ref.get()
    return docToResponse(updated.id, updated.data()!)
  }

  /**
   * Returns the active (open) turno for the user, or null if none.
   */
  async getTurnoActivo(usuarioId: string): Promise<TurnoResponse | null> {
    const snapshot = await this.collection
      .where('usuarioId', '==', usuarioId)
      .where('fin', '==', null)
      .limit(1)
      .get()

    if (snapshot.docs.length === 0) return null

    const doc = snapshot.docs[0]
    return docToResponse(doc.id, doc.data())
  }

  /**
   * Aggregates tareas + incidencias to produce the turno summary.
   * Ownership check required.
   */
  async getResumen(turnoId: string, usuarioId: string): Promise<TurnoResumen> {
    const ref = this.collection.doc(turnoId)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Turno no encontrado')
    }

    const turnoData = snap.data()!
    if (turnoData['usuarioId'] !== usuarioId) {
      throw new ForbiddenError('No tienes permiso para ver el resumen de este turno')
    }

    const inicio: string = turnoData['inicio']
    const fin: string | null = turnoData['fin']

    // Query tareas assigned to this user within the turno window
    const tareasSnap = await adminDb
      .collection(COLLECTIONS.tareas)
      .where('usuarioId', '==', usuarioId)
      .where('fechaHora', '>=', inicio)
      .get()

    // Filter further if turno has ended
    const allTareas = tareasSnap.docs.map((d) => d.data())
    const tareasEnVentana = fin
      ? allTareas.filter((t) => {
          const th = t['fechaHora'] as string
          return th >= inicio && th <= fin
        })
      : allTareas

    const tareasCompletadas = tareasEnVentana.filter((t) => t['estado'] === 'completada').length
    const tareasPendientes = tareasEnVentana.filter(
      (t) => t['estado'] === 'pendiente' || t['estado'] === 'en_curso',
    ).length

    // Query incidencias for this user within the turno window
    const incidenciasSnap = await adminDb
      .collection(COLLECTIONS.incidences)
      .where('usuarioId', '==', usuarioId)
      .where('creadaEn', '>=', inicio)
      .get()

    const incidenciasRegistradas = incidenciasSnap.docs.length

    // Collect unique residenteId values from both tareas and incidencias
    const residentSet = new Set<string>()
    tareasEnVentana.forEach((t) => {
      const rid = t['residenteId'] as string | undefined
      if (rid) residentSet.add(rid)
    })
    incidenciasSnap.docs.forEach((d) => {
      const rid = d.data()['residenteId'] as string | undefined
      if (rid) residentSet.add(rid)
    })
    const residentesAtendidos = Array.from(residentSet)

    const textoResumen =
      `Turno ${turnoData['tipoTurno']}: ` +
      `${tareasCompletadas} tarea(s) completada(s), ` +
      `${tareasPendientes} pendiente(s), ` +
      `${incidenciasRegistradas} incidencia(s) registrada(s), ` +
      `${residentesAtendidos.length} residente(s) atendido(s).`

    return {
      tareasCompletadas,
      tareasPendientes,
      incidenciasRegistradas,
      residentesAtendidos,
      textoResumen,
    }
  }
}
