/**
 * tareas.service.integration.spec.ts — Integration tests for TareasService.
 *
 * These tests run against the real Firebase Firestore Emulator.
 * Before running, ensure the emulator is started on port 8080:
 *   firebase emulators:exec --only firestore "cd code/api && npm test"
 *
 * US-03: Consulta de agenda diaria
 * US-04: Actualizar estado de una tarea
 *
 * Required env vars:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080
 *   FIREBASE_PROJECT_ID=gerocultores-test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import * as admin from 'firebase-admin'
import type { TareaDoc, TareaEstado } from '../types/tarea.types'
import { COLLECTIONS } from './collections'

// ─── Emulator setup ──────────────────────────────────────────────────────────
// FIRESTORE_EMULATOR_HOST is injected by `firebase emulators:exec`.
// FIREBASE_PROJECT_ID must be set in the environment before running tests.
// These values are read at import time — set them via environment before running:
//   FIREBASE_PROJECT_ID=gerocultores-test firebase emulators:exec --only firestore "cd api && npm test"

const PROJECT_ID = process.env['FIREBASE_PROJECT_ID'] ?? 'gerocultores-test'

// ─── Firebase Admin init (isolated app for integration tests) ─────────────────
// We initialize a SEPARATE named app so we don't conflict with the default app
// that may be initialized by other test files or the main firebase.ts module.

const TEST_APP_NAME = 'integration-tareas-test'

let testApp: admin.app.App
let testDb: admin.firestore.Firestore

beforeAll(() => {
  // Check if the named app already exists (vitest may run multiple files in the same process)
  const existing = admin.apps.find((a) => a?.name === TEST_APP_NAME)
  if (existing) {
    testApp = existing
  } else {
    testApp = admin.initializeApp({ projectId: PROJECT_ID }, TEST_APP_NAME)
  }
  testDb = testApp.firestore()
})

afterAll(async () => {
  // Clean up: delete the named app to avoid leaking handles between test runs
  if (testApp) {
    await testApp.delete()
  }
})

// ─── Import service ───────────────────────────────────────────────────────────
// The service uses the default Firebase Admin app (firebase.ts).
// Both the test's named app and the service's default app point to the same
// emulator + projectId, so they share the same data store.
import { TareasService, NotFoundError, ForbiddenError } from './tareas.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the current timestamp as ISO string */
function now(): string {
  return new Date().toISOString()
}

/** Builds a minimal valid TareaDoc fixture. */
function buildTareaDoc(overrides: Partial<TareaDoc> = {}): TareaDoc {
  return {
    titulo: 'Administrar medicación',
    tipo: 'medicacion',
    fechaHora: '2026-04-18T08:00:00.000Z',
    estado: 'pendiente',
    notas: null,
    residenteId: 'res-001',
    usuarioId: 'user-001',
    creadoEn: now(),
    actualizadoEn: now(),
    completadaEn: null,
    ...overrides,
  }
}

/**
 * Seeds a tarea document in the emulator and returns its auto-generated id.
 */
async function seedTarea(data: TareaDoc): Promise<string> {
  const ref = await testDb.collection(COLLECTIONS.tasks).add(data)
  return ref.id
}

/**
 * Deletes a tarea by id from the emulator.
 */
async function deleteTarea(id: string): Promise<void> {
  await testDb.collection(COLLECTIONS.tasks).doc(id).delete()
}

/**
 * Reads a raw tarea document directly from Firestore (bypasses the service layer).
 */
async function readTareaRaw(id: string): Promise<admin.firestore.DocumentData | undefined> {
  const snap = await testDb.collection(COLLECTIONS.tasks).doc(id).get()
  return snap.data()
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('TareasService integration (Firestore Emulator)', () => {
  let service: TareasService

  beforeEach(() => {
    service = new TareasService()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getTareaById
  // ──────────────────────────────────────────────────────────────────────────

  describe('getTareaById', () => {
    it('returns the tarea when it exists', async () => {
      const doc = buildTareaDoc()
      const id = await seedTarea(doc)

      try {
        const result = await service.getTareaById(id)

        expect(result.id).toBe(id)
        expect(result.titulo).toBe(doc.titulo)
        expect(result.tipo).toBe(doc.tipo)
        expect(result.estado).toBe(doc.estado)
        expect(result.usuarioId).toBe(doc.usuarioId)
        expect(result.residenteId).toBe(doc.residenteId)
        expect(result.notas).toBeNull()
        expect(result.completadaEn).toBeNull()
      } finally {
        await deleteTarea(id)
      }
    })

    it('throws NotFoundError when the id does not exist', async () => {
      await expect(service.getTareaById('non-existent-id-xyz')).rejects.toThrow(NotFoundError)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getTareas
  // ──────────────────────────────────────────────────────────────────────────

  describe('getTareas', () => {
    const FECHA = '2026-04-18'
    const USUARIO_A = 'gero-user-a'
    const USUARIO_B = 'gero-user-b'

    let idA1: string
    let idA2: string
    let idB1: string

    beforeEach(async () => {
      // Seed: user A has two tasks on FECHA, user B has one task on FECHA
      idA1 = await seedTarea(
        buildTareaDoc({ fechaHora: `${FECHA}T08:00:00.000Z`, usuarioId: USUARIO_A }),
      )
      idA2 = await seedTarea(
        buildTareaDoc({ fechaHora: `${FECHA}T14:00:00.000Z`, usuarioId: USUARIO_A }),
      )
      idB1 = await seedTarea(
        buildTareaDoc({ fechaHora: `${FECHA}T09:00:00.000Z`, usuarioId: USUARIO_B }),
      )
    })

    afterEach(async () => {
      await Promise.all([deleteTarea(idA1), deleteTarea(idA2), deleteTarea(idB1)])
    })

    it('filters tasks by assignedTo', async () => {
      const results = await service.getTareas({ assignedTo: USUARIO_A })

      const ids = results.map((t) => t.id)
      expect(ids).toContain(idA1)
      expect(ids).toContain(idA2)
      expect(ids).not.toContain(idB1)
    })

    it('filters tasks by date', async () => {
      // Seed an extra task on a different date to verify date filtering
      const otherDateId = await seedTarea(
        buildTareaDoc({ fechaHora: '2026-04-20T08:00:00.000Z', usuarioId: USUARIO_A }),
      )

      try {
        const results = await service.getTareas({ date: FECHA })

        const ids = results.map((t) => t.id)
        expect(ids).toContain(idA1)
        expect(ids).toContain(idA2)
        expect(ids).toContain(idB1)
        expect(ids).not.toContain(otherDateId)
      } finally {
        await deleteTarea(otherDateId)
      }
    })

    it('filters tasks by both date and assignedTo', async () => {
      const results = await service.getTareas({ assignedTo: USUARIO_A, date: FECHA })

      const ids = results.map((t) => t.id)
      expect(ids).toContain(idA1)
      expect(ids).toContain(idA2)
      expect(ids).not.toContain(idB1)
    })

    it('filters tasks by status', async () => {
      const enCursoId = await seedTarea(
        buildTareaDoc({ estado: 'en_curso', usuarioId: USUARIO_A }),
      )

      try {
        const results = await service.getTareas({ status: 'en_curso' })

        const ids = results.map((t) => t.id)
        expect(ids).toContain(enCursoId)
        // idA1 and idA2 are 'pendiente', should NOT appear
        expect(ids).not.toContain(idA1)
      } finally {
        await deleteTarea(enCursoId)
      }
    })

    it('returns empty array when no tasks match the filter', async () => {
      const results = await service.getTareas({ assignedTo: 'no-such-user' })
      expect(results).toHaveLength(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // updateEstado
  // ──────────────────────────────────────────────────────────────────────────

  describe('updateEstado', () => {
    const ESTADOS: TareaEstado[] = ['pendiente', 'en_curso', 'completada', 'con_incidencia']

    it('admin can update estado of any task', async () => {
      const id = await seedTarea(buildTareaDoc({ usuarioId: 'some-user' }))

      try {
        const result = await service.updateEstado(id, 'en_curso', 'admin-uid', 'admin')

        expect(result.id).toBe(id)
        expect(result.estado).toBe('en_curso')
        expect(result.actualizadoEn).toBeDefined()
        expect(result.completadaEn).toBeNull()
      } finally {
        await deleteTarea(id)
      }
    })

    it('gerocultor can update estado of their own task', async () => {
      const uid = 'gero-own-user'
      const id = await seedTarea(buildTareaDoc({ usuarioId: uid }))

      try {
        const result = await service.updateEstado(id, 'en_curso', uid, 'gerocultor')

        expect(result.estado).toBe('en_curso')
      } finally {
        await deleteTarea(id)
      }
    })

    it('gerocultor cannot update estado of another user\'s task', async () => {
      const id = await seedTarea(buildTareaDoc({ usuarioId: 'owner-uid' }))

      try {
        await expect(
          service.updateEstado(id, 'en_curso', 'different-uid', 'gerocultor'),
        ).rejects.toThrow(ForbiddenError)
      } finally {
        await deleteTarea(id)
      }
    })

    it('sets completadaEn when estado is set to completada', async () => {
      const id = await seedTarea(buildTareaDoc({ estado: 'en_curso' }))

      try {
        const result = await service.updateEstado(id, 'completada', 'admin-uid', 'admin')

        expect(result.estado).toBe('completada')
        expect(result.completadaEn).toBeTruthy()

        // Verify it was persisted in Firestore
        const raw = await readTareaRaw(id)
        expect(raw?.['completadaEn']).toBeTruthy()
      } finally {
        await deleteTarea(id)
      }
    })

    it('does NOT set completadaEn when estado is not completada', async () => {
      const id = await seedTarea(buildTareaDoc({ estado: 'pendiente' }))

      try {
        await service.updateEstado(id, 'en_curso', 'admin-uid', 'admin')

        const raw = await readTareaRaw(id)
        // completadaEn should remain null (Firestore stores undefined keys as absent)
        const completadaEn = raw?.['completadaEn'] ?? null
        expect(completadaEn).toBeNull()
      } finally {
        await deleteTarea(id)
      }
    })

    it('throws NotFoundError when the task does not exist', async () => {
      await expect(
        service.updateEstado('nonexistent-id', 'en_curso', 'admin-uid', 'admin'),
      ).rejects.toThrow(NotFoundError)
    })

    it('persists the new estado in Firestore (read-back verification)', async () => {
      const id = await seedTarea(buildTareaDoc({ estado: 'pendiente' }))

      try {
        await service.updateEstado(id, 'con_incidencia', 'admin-uid', 'admin')

        const raw = await readTareaRaw(id)
        expect(raw?.['estado']).toBe('con_incidencia')
      } finally {
        await deleteTarea(id)
      }
    })

    it.each(ESTADOS)('can set estado to %s', async (estado) => {
      const id = await seedTarea(buildTareaDoc())

      try {
        const result = await service.updateEstado(id, estado, 'admin-uid', 'admin')
        expect(result.estado).toBe(estado)
      } finally {
        await deleteTarea(id)
      }
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // updateEstado — concurrency (transaction safety)
  // ──────────────────────────────────────────────────────────────────────────

  describe('updateEstado — concurrency', () => {
    it('two simultaneous updateEstado calls on the same doc both succeed', async () => {
      const id = await seedTarea(buildTareaDoc({ estado: 'pendiente' }))

      try {
        // Fire two concurrent updates: one sets en_curso, the other sets con_incidencia.
        // With Firestore transactions, both should resolve without throwing —
        // one will retry internally if there's a conflict. The final state will be
        // one of the two valid values (whichever transaction committed last).
        const [result1, result2] = await Promise.all([
          service.updateEstado(id, 'en_curso', 'admin-uid', 'admin'),
          service.updateEstado(id, 'con_incidencia', 'admin-uid', 'admin'),
        ])

        // Both Promises should resolve (no error thrown)
        expect(result1.id).toBe(id)
        expect(result2.id).toBe(id)

        // The final persisted estado must be one of the two requested values
        const raw = await readTareaRaw(id)
        const finalEstado = raw?.['estado'] as TareaEstado
        expect(['en_curso', 'con_incidencia']).toContain(finalEstado)
      } finally {
        await deleteTarea(id)
      }
    })
  })
})
