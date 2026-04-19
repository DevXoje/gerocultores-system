/**
 * incidencias.service.integration.spec.ts — Integration tests for IncidenciasService.
 *
 * These tests run against the real Firebase Firestore Emulator.
 * Before running, ensure the emulator is started on port 8080:
 *   firebase emulators:exec --only firestore "cd code/api && npm test -- --config=vitest.integration.config.ts"
 *
 * US-06: Registro de incidencia
 *
 * Required env vars (set via integration-setup.ts):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080
 *   FIREBASE_PROJECT_ID=demo-gerocultores-system
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import * as admin from 'firebase-admin'
import type { IncidenciaDoc } from '../types/incidencia.types'
import { COLLECTIONS } from './collections'

// ─── Emulator setup ──────────────────────────────────────────────────────────
// FIRESTORE_EMULATOR_HOST is injected by `firebase emulators:exec`.
// integration-setup.ts sets these env vars before this module loads.

const PROJECT_ID = process.env['FIREBASE_PROJECT_ID'] ?? 'demo-gerocultores-system'

// ─── Firebase Admin init (isolated app for integration tests) ─────────────────

const TEST_APP_NAME = 'integration-incidencias-test'

let testApp: admin.app.App
let testDb: admin.firestore.Firestore

beforeAll(() => {
  const existing = admin.apps.find((a) => a?.name === TEST_APP_NAME)
  if (existing) {
    testApp = existing
  } else {
    testApp = admin.initializeApp({ projectId: PROJECT_ID }, TEST_APP_NAME)
  }
  testDb = testApp.firestore()
})

afterAll(async () => {
  if (testApp) {
    await testApp.delete()
  }
})

// ─── Import service ───────────────────────────────────────────────────────────
import { IncidenciasService } from './incidencias.service'
import type { CreateIncidenciaDTO } from '../types/incidencia.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Builds a minimal valid CreateIncidenciaDTO fixture. */
function buildDTO(overrides: Partial<CreateIncidenciaDTO> = {}): CreateIncidenciaDTO {
  return {
    tipo: 'caida',
    severidad: 'leve',
    descripcion: 'El residente se cayó al levantarse',
    residenteId: 'res-integration-001',
    tareaId: null,
    ...overrides,
  }
}

/**
 * Deletes an incidencia document directly from the emulator (bypasses service).
 */
async function deleteIncidencia(id: string): Promise<void> {
  await testDb.collection(COLLECTIONS.incidences).doc(id).delete()
}

/**
 * Reads a raw incidencia document directly from Firestore (bypasses the service layer).
 */
async function readIncidenciaRaw(id: string): Promise<admin.firestore.DocumentData | undefined> {
  const snap = await testDb.collection(COLLECTIONS.incidences).doc(id).get()
  return snap.data()
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('IncidenciasService integration (Firestore Emulator)', () => {
  let service: IncidenciasService

  beforeEach(() => {
    service = new IncidenciasService()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // createIncidencia
  // ──────────────────────────────────────────────────────────────────────────

  describe('createIncidencia', () => {
    it('creates a document in Firestore and returns it with id', async () => {
      const dto = buildDTO()
      const uid = 'gero-user-integration-001'

      const result = await service.createIncidencia(dto, uid)

      try {
        expect(result.id).toBeTruthy()
        expect(result.tipo).toBe(dto.tipo)
        expect(result.severidad).toBe(dto.severidad)
        expect(result.descripcion).toBe(dto.descripcion)
        expect(result.residenteId).toBe(dto.residenteId)
        expect(result.usuarioId).toBe(uid)
        expect(result.tareaId).toBeNull()
        expect(typeof result.registradaEn).toBe('string')

        // Verify document was actually written to Firestore
        const raw = await readIncidenciaRaw(result.id)
        expect(raw).toBeDefined()
        expect(raw!['tipo']).toBe(dto.tipo)
        expect(raw!['usuarioId']).toBe(uid)
      } finally {
        await deleteIncidencia(result.id)
      }
    })

    it('sets registradaEn server-side as a valid ISO string', async () => {
      const before = new Date().toISOString()
      const dto = buildDTO({ tipo: 'salud', severidad: 'moderada', descripcion: 'Fiebre alta' })
      const uid = 'gero-user-integration-002'

      const result = await service.createIncidencia(dto, uid)
      const after = new Date().toISOString()

      try {
        expect(result.registradaEn >= before).toBe(true)
        expect(result.registradaEn <= after).toBe(true)

        // Verify it's persisted in Firestore
        const raw = await readIncidenciaRaw(result.id)
        expect(raw!['registradaEn']).toBe(result.registradaEn)
      } finally {
        await deleteIncidencia(result.id)
      }
    })

    it('stores tareaId when provided', async () => {
      const dto = buildDTO({ tareaId: 'tarea-integration-001' })
      const uid = 'gero-user-integration-003'

      const result = await service.createIncidencia(dto, uid)

      try {
        expect(result.tareaId).toBe('tarea-integration-001')

        const raw = await readIncidenciaRaw(result.id)
        expect(raw!['tareaId']).toBe('tarea-integration-001')
      } finally {
        await deleteIncidencia(result.id)
      }
    })

    it('stores tareaId as null when not provided', async () => {
      const dto = buildDTO({ tareaId: undefined })
      const uid = 'gero-user-integration-004'

      const result = await service.createIncidencia(dto, uid)

      try {
        expect(result.tareaId).toBeNull()

        const raw = await readIncidenciaRaw(result.id)
        expect(raw!['tareaId']).toBeNull()
      } finally {
        await deleteIncidencia(result.id)
      }
    })

    it('creates separate documents for each call (no overwrite)', async () => {
      const dto1 = buildDTO({ descripcion: 'Primera incidencia' })
      const dto2 = buildDTO({ descripcion: 'Segunda incidencia' })
      const uid = 'gero-user-integration-005'

      const result1 = await service.createIncidencia(dto1, uid)
      const result2 = await service.createIncidencia(dto2, uid)

      try {
        expect(result1.id).not.toBe(result2.id)
        expect(result1.descripcion).toBe('Primera incidencia')
        expect(result2.descripcion).toBe('Segunda incidencia')
      } finally {
        await Promise.all([deleteIncidencia(result1.id), deleteIncidencia(result2.id)])
      }
    })

    it.each([
      ['caida', 'leve'],
      ['comportamiento', 'moderada'],
      ['salud', 'critica'],
      ['alimentacion', 'leve'],
      ['medicacion', 'moderada'],
      ['otro', 'critica'],
    ] as Array<[IncidenciaDoc['tipo'], IncidenciaDoc['severidad']]>)(
      'persists tipo=%s and severidad=%s correctly',
      async (tipo, severidad) => {
        const dto = buildDTO({ tipo, severidad })
        const uid = 'gero-user-integration-type-test'

        const result = await service.createIncidencia(dto, uid)

        try {
          expect(result.tipo).toBe(tipo)
          expect(result.severidad).toBe(severidad)

          const raw = await readIncidenciaRaw(result.id)
          expect(raw!['tipo']).toBe(tipo)
          expect(raw!['severidad']).toBe(severidad)
        } finally {
          await deleteIncidencia(result.id)
        }
      },
    )
  })
})
