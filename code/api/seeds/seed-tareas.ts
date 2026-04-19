/**
 * seed-tareas.ts
 *
 * Seeds sample `tareas` documents into Firestore.
 *
 * SAFETY: This script REQUIRES the Firestore emulator to be running.
 * It will abort immediately if FIRESTORE_EMULATOR_HOST is not set
 * (and the --emulator flag is not passed on the command line).
 *
 * Usage (from code/api/):
 *   npm run seed:tareas                  # FIRESTORE_EMULATOR_HOST must be set in env
 *   npm run seed:tareas -- --emulator    # explicit override (still requires emulator env var)
 *
 * Example with explicit env var:
 *   FIRESTORE_EMULATOR_HOST=localhost:18080 npm run seed:tareas
 */

import * as admin from 'firebase-admin'
import { COLLECTIONS } from '../src/services/collections'

// ── Safety guard ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const hasEmulatorFlag = args.includes('--emulator')
const emulatorHost = process.env['FIRESTORE_EMULATOR_HOST']

if (!emulatorHost && !hasEmulatorFlag) {
  console.error('❌  ABORT: seed-tareas must run against the Firestore emulator.')
  console.error(
    '   Set FIRESTORE_EMULATOR_HOST (e.g. localhost:18080) or pass --emulator flag.'
  )
  console.error('   This script will NEVER run against production Firestore.')
  process.exit(1)
}

if (!emulatorHost && hasEmulatorFlag) {
  console.error(
    '❌  ABORT: --emulator flag passed but FIRESTORE_EMULATOR_HOST env var is not set.'
  )
  console.error(
    '   Please set FIRESTORE_EMULATOR_HOST (e.g. FIRESTORE_EMULATOR_HOST=localhost:18080).'
  )
  process.exit(1)
}

// Validate the host looks like a valid emulator address (not a real Firebase URL)
if (emulatorHost && emulatorHost.includes('firebaseio.com')) {
  console.error('❌  ABORT: FIRESTORE_EMULATOR_HOST appears to point to production Firebase.')
  console.error(`   Got: ${emulatorHost}`)
  console.error('   Expected format: localhost:<port> or 127.0.0.1:<port>')
  process.exit(1)
}

console.log(`✅  Emulator check passed. Connecting to: ${emulatorHost}`)

// ── Firebase init (emulator only) ────────────────────────────────────────────

const projectId = process.env['FIREBASE_PROJECT_ID'] ?? 'gerocultores-system'

if (!admin.apps.length) {
  admin.initializeApp({ projectId })
}

const db = admin.firestore()

// ── Seed data (do NOT modify the data content) ───────────────────────────────

interface Tarea {
  titulo: string
  descripcion: string
  residenteId: string
  turno: 'mañana' | 'tarde' | 'noche'
  estado: 'pendiente' | 'completada' | 'omitida'
  fecha: admin.firestore.Timestamp
}

const TAREAS: Tarea[] = [
  {
    titulo: 'Administrar medicación matutina',
    descripcion: 'Entregar pastillas del blíster del martes mañana',
    residenteId: 'residente-001',
    turno: 'mañana',
    estado: 'pendiente',
    fecha: admin.firestore.Timestamp.fromDate(new Date('2026-04-18T08:00:00')),
  },
  {
    titulo: 'Aseo personal',
    descripcion: 'Ducha asistida y cambio de ropa',
    residenteId: 'residente-001',
    turno: 'mañana',
    estado: 'pendiente',
    fecha: admin.firestore.Timestamp.fromDate(new Date('2026-04-18T09:00:00')),
  },
  {
    titulo: 'Control de constantes vitales',
    descripcion: 'Tensión arterial y temperatura',
    residenteId: 'residente-002',
    turno: 'tarde',
    estado: 'pendiente',
    fecha: admin.firestore.Timestamp.fromDate(new Date('2026-04-18T15:00:00')),
  },
  {
    titulo: 'Administrar medicación nocturna',
    descripcion: 'Pastillas del blíster del martes noche',
    residenteId: 'residente-002',
    turno: 'noche',
    estado: 'pendiente',
    fecha: admin.firestore.Timestamp.fromDate(new Date('2026-04-18T21:00:00')),
  },
  {
    titulo: 'Fisioterapia pasiva',
    descripcion: 'Ejercicios de movilización de miembros superiores',
    residenteId: 'residente-003',
    turno: 'mañana',
    estado: 'pendiente',
    fecha: admin.firestore.Timestamp.fromDate(new Date('2026-04-18T10:30:00')),
  },
]

// ── Seed function ─────────────────────────────────────────────────────────────

async function seedTareas(): Promise<void> {
  const collection = db.collection(COLLECTIONS.tasks)
  const batch = db.batch()

  for (const tarea of TAREAS) {
    const ref = collection.doc()
    batch.set(ref, tarea)
  }

  await batch.commit()
  console.log(`✅  Seeded ${TAREAS.length} tasks into emulator Firestore (collection: tasks).`)
}

// ── Entry point ───────────────────────────────────────────────────────────────

seedTareas().catch((err: unknown) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
