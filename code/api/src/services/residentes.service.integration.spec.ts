/**
 * residentes.service.integration.spec.ts — Integration tests for ResidentesService.
 *
 * These tests run against the real Firebase Firestore Emulator.
 * Before running, ensure the emulator is started on port 8080:
 *   firebase emulators:exec --only firestore "cd code/api && npm test -- --config=vitest.integration.config.ts"
 *
 * US-05: Consulta de ficha de residente
 *
 * Required env vars:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080
 *   FIREBASE_PROJECT_ID=gerocultores-test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import * as admin from 'firebase-admin'
import type { ResidenteDoc } from '../types/residente.types'
import { COLLECTIONS } from './collections'

// ─── Emulator setup ──────────────────────────────────────────────────────────

const PROJECT_ID = process.env['FIREBASE_PROJECT_ID'] ?? 'gerocultores-test'
const TEST_APP_NAME = 'integration-residentes-test'

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
import { ResidentesService, NotFoundError, ForbiddenError } from './residentes.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const GERO_UID = 'gero-uid-integration-test'
const ADMIN_UID = 'admin-uid-integration-test'
const OTHER_GERO_UID = 'other-gero-uid-integration-test'

function buildResidenteDoc(overrides: Partial<ResidenteDoc> = {}): ResidenteDoc {
  return {
    nombre: 'Eleanor',
    apellidos: 'Vance',
    fechaNacimiento: '1940-05-12',
    habitacion: '204',
    foto: null,
    diagnosticos: 'Demencia leve',
    alergias: 'Penicilina',
    medicacion: 'Donepezilo 10mg',
    preferencias: 'Prefiere desayuno temprano',
    archivado: false,
    gerocultoresAsignados: [GERO_UID],
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    ...overrides,
  }
}

async function seedResidente(data: ResidenteDoc): Promise<string> {
  const ref = await testDb.collection(COLLECTIONS.residentes).add(data)
  return ref.id
}

async function deleteResidente(id: string): Promise<void> {
  await testDb.collection(COLLECTIONS.residentes).doc(id).delete()
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('ResidentesService integration (Firestore Emulator)', () => {
  let service: ResidentesService

  beforeEach(() => {
    service = new ResidentesService()
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getResidenteById — Happy paths
  // ──────────────────────────────────────────────────────────────────────────

  describe('getResidenteById — happy paths', () => {
    it('admin can access any resident', async () => {
      const doc = buildResidenteDoc()
      const id = await seedResidente(doc)

      try {
        const result = await service.getResidenteById(id, ADMIN_UID, 'admin')

        expect(result.id).toBe(id)
        expect(result.nombre).toBe('Eleanor')
        expect(result.apellidos).toBe('Vance')
        expect(result.diagnosticos).toBe('Demencia leve')
        expect(result.alergias).toBe('Penicilina')
        expect(result.medicacion).toBe('Donepezilo 10mg')
        expect(result.preferencias).toBe('Prefiere desayuno temprano')
        expect(result.archivado).toBe(false)
        // gerocultoresAsignados must NOT be in the response
        expect((result as Record<string, unknown>)['gerocultoresAsignados']).toBeUndefined()
      } finally {
        await deleteResidente(id)
      }
    })

    it('gerocultor assigned to resident can access their data', async () => {
      const doc = buildResidenteDoc({ gerocultoresAsignados: [GERO_UID] })
      const id = await seedResidente(doc)

      try {
        const result = await service.getResidenteById(id, GERO_UID, 'gerocultor')

        expect(result.id).toBe(id)
        expect(result.nombre).toBe('Eleanor')
      } finally {
        await deleteResidente(id)
      }
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getResidenteById — Access control (403)
  // ──────────────────────────────────────────────────────────────────────────

  describe('getResidenteById — access control', () => {
    it('throws ForbiddenError when gerocultor is not assigned to the resident', async () => {
      const doc = buildResidenteDoc({ gerocultoresAsignados: [GERO_UID] })
      const id = await seedResidente(doc)

      try {
        await expect(
          service.getResidenteById(id, OTHER_GERO_UID, 'gerocultor'),
        ).rejects.toThrow(ForbiddenError)
      } finally {
        await deleteResidente(id)
      }
    })

    it('throws ForbiddenError when gerocultoresAsignados is empty', async () => {
      const doc = buildResidenteDoc({ gerocultoresAsignados: [] })
      const id = await seedResidente(doc)

      try {
        await expect(
          service.getResidenteById(id, GERO_UID, 'gerocultor'),
        ).rejects.toThrow(ForbiddenError)
      } finally {
        await deleteResidente(id)
      }
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getResidenteById — Not found (404)
  // ──────────────────────────────────────────────────────────────────────────

  describe('getResidenteById — not found', () => {
    it('throws NotFoundError when resident id does not exist', async () => {
      await expect(
        service.getResidenteById('nonexistent-resident-id-xyz', ADMIN_UID, 'admin'),
      ).rejects.toThrow(NotFoundError)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // getResidenteById — Null/optional fields
  // ──────────────────────────────────────────────────────────────────────────

  describe('getResidenteById — optional fields', () => {
    it('returns null for optional fields when absent from Firestore', async () => {
      const doc = buildResidenteDoc({
        foto: null,
        diagnosticos: null,
        alergias: null,
        medicacion: null,
        preferencias: null,
      })
      const id = await seedResidente(doc)

      try {
        const result = await service.getResidenteById(id, ADMIN_UID, 'admin')

        expect(result.foto).toBeNull()
        expect(result.diagnosticos).toBeNull()
        expect(result.alergias).toBeNull()
        expect(result.medicacion).toBeNull()
        expect(result.preferencias).toBeNull()
      } finally {
        await deleteResidente(id)
      }
    })
  })
})
