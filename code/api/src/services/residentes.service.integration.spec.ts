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

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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

import { ResidentesService, NotFoundError } from './residentes.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString()
}

function buildResidenteDoc(overrides: Partial<ResidenteDoc> = {}): ResidenteDoc {
  return {
    nombre: 'María',
    apellidos: 'García López',
    fechaNacimiento: '1940-05-15',
    habitacion: '101A',
    foto: null,
    diagnosticos: 'Alzheimer leve',
    alergias: 'Penicilina',
    medicacion: 'Donepezilo 5mg',
    preferencias: 'Prefiere ducharse por la mañana',
    archivado: false,
    creadoEn: now(),
    actualizadoEn: now(),
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

  beforeAll(() => {
    service = new ResidentesService()
  })

  describe('getResidenteById', () => {
    it('returns the residente when it exists', async () => {
      const doc = buildResidenteDoc()
      const id = await seedResidente(doc)

      try {
        const result = await service.getResidenteById(id)

        expect(result.id).toBe(id)
        expect(result.nombre).toBe(doc.nombre)
        expect(result.apellidos).toBe(doc.apellidos)
        expect(result.habitacion).toBe(doc.habitacion)
        expect(result.archivado).toBe(false)
        expect(result.foto).toBeNull()
        expect(result.diagnosticos).toBe(doc.diagnosticos)
        expect(result.alergias).toBe(doc.alergias)
      } finally {
        await deleteResidente(id)
      }
    })

    it('throws NotFoundError when the id does not exist', async () => {
      await expect(service.getResidenteById('non-existent-id-xyz')).rejects.toThrow(NotFoundError)
    })

    it('correctly maps a residente with all nullable fields set to null', async () => {
      const doc = buildResidenteDoc({
        foto: null,
        diagnosticos: null,
        alergias: null,
        medicacion: null,
        preferencias: null,
      })
      const id = await seedResidente(doc)

      try {
        const result = await service.getResidenteById(id)

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
