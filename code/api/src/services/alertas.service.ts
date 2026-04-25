/**
 * alertas.service.ts — Alert generation with deduplication for tarea_proxima notifications.
 *
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Key rule: Only ONE tarea_proxima notification is created per tareaId+usuarioId
 * within a given polling window. Duplicate polling calls MUST NOT create repeats.
 */
import { adminDb } from './firebase'
import { COLLECTIONS } from './collections'

const WINDOW_MINUTES = 15

/**
 * AlertasService handles generating notifications triggered by upcoming tasks.
 * Deduplication is guaranteed by querying Firestore before creating.
 */
export class AlertasService {
  private get tareasCollection() {
    return adminDb.collection(COLLECTIONS.tareas)
  }

  private get notificacionesCollection() {
    return adminDb.collection(COLLECTIONS.notificaciones)
  }

  /**
   * Generates tarea_proxima notifications for tasks due within the next WINDOW_MINUTES.
   * For each task, checks if a notification for that tareaId+usuarioId already exists.
   * If it does, skips. If not, creates one.
   *
   * @param windowStart - ISO string representing the start of the current polling window
   * @returns number of notifications actually created
   */
  async generateTareaProximaAlerts(windowStart: string): Promise<number> {
    const windowEnd = new Date(
      new Date(windowStart).getTime() + WINDOW_MINUTES * 60 * 1000,
    ).toISOString()

    // Query tasks due within the window that are still pending
    const tareasSnap = await this.tareasCollection
      .where('fechaHora', '>=', windowStart)
      .where('fechaHora', '<=', windowEnd)
      .get()

    if (tareasSnap.docs.length === 0) return 0

    let created = 0

    for (const tareaDoc of tareasSnap.docs) {
      const tarea = tareaDoc.data()
      const tareaId = tareaDoc.id
      const usuarioId = tarea['usuarioId'] as string | undefined

      if (!usuarioId) continue

      // Deduplication check: does a tarea_proxima notification already exist for this task?
      const existingSnap = await this.notificacionesCollection
        .where('tipo', '==', 'tarea_proxima')
        .where('referenciaId', '==', tareaId)
        .where('usuarioId', '==', usuarioId)
        .limit(1)
        .get()

      if (existingSnap.docs.length > 0) {
        // Already notified — skip to prevent duplicate
        continue
      }

      // Create the notification
      const titulo = tarea['titulo'] as string | undefined ?? 'Tarea próxima'
      await this.notificacionesCollection.add({
        usuarioId,
        tipo: 'tarea_proxima',
        titulo: `Tarea próxima: ${titulo}`,
        mensaje: `Tienes una tarea pendiente que vence en los próximos ${WINDOW_MINUTES} minutos.`,
        leida: false,
        referenciaId: tareaId,
        referenciaModelo: 'tarea',
        creadaEn: new Date().toISOString(),
      })

      created++
    }

    return created
  }
}
