/**
 * seed-tareas.ts — Seed script for `tareas` Firestore collection.
 *
 * Seeds ~10 realistic tasks for 3 simulated residents and 2 gerocultores.
 * Targets the Firestore emulator by default (FIRESTORE_EMULATOR_HOST env var).
 *
 * Usage:
 *   npm run seed:firestore
 *
 * US-03: Consulta de agenda diaria
 */
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'

dotenv.config()

// ─── Firebase init ────────────────────────────────────────────────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'gerocultores-dev',
  })
}

const db = admin.firestore()

// ─── Seed data ─────────────────────────────────────────────────────────────────

// Simulated UIDs — must match real user UIDs when run against a populated emulator
const USUARIO_IDS = {
  gerocultor1: 'gerocultor-uid-001',
  gerocultor2: 'gerocultor-uid-002',
}

const RESIDENTE_IDS = {
  residente1: 'residente-uid-001',
  residente2: 'residente-uid-002',
  residente3: 'residente-uid-003',
}

const TODAY = new Date()
const d = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date(TODAY)
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return admin.firestore.Timestamp.fromDate(date)
}

const now = admin.firestore.Timestamp.now()

const SEED_TAREAS = [
  {
    titulo: 'Higiene matutina — aseo personal',
    tipo: 'higiene',
    fechaHora: d(0, 8, 0),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente1,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Administración de medicación matutina',
    tipo: 'medicacion',
    fechaHora: d(0, 8, 30),
    estado: 'completada',
    notas: 'Tomó toda la medicación sin incidencias.',
    residenteId: RESIDENTE_IDS.residente1,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: d(0, 8, 45),
  },
  {
    titulo: 'Desayuno asistido',
    tipo: 'alimentacion',
    fechaHora: d(0, 9, 0),
    estado: 'en_curso',
    notas: null,
    residenteId: RESIDENTE_IDS.residente2,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Actividad de estimulación cognitiva',
    tipo: 'actividad',
    fechaHora: d(0, 10, 0),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente2,
    usuarioId: USUARIO_IDS.gerocultor2,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Revisión de constantes vitales',
    tipo: 'revision',
    fechaHora: d(0, 11, 0),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente3,
    usuarioId: USUARIO_IDS.gerocultor2,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Almuerzo asistido',
    tipo: 'alimentacion',
    fechaHora: d(0, 13, 0),
    estado: 'pendiente',
    notas: 'Dieta triturada según indicación médica.',
    residenteId: RESIDENTE_IDS.residente1,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Medicación mediodía',
    tipo: 'medicacion',
    fechaHora: d(0, 13, 30),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente3,
    usuarioId: USUARIO_IDS.gerocultor2,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Higiene vespertina',
    tipo: 'higiene',
    fechaHora: d(0, 16, 0),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente2,
    usuarioId: USUARIO_IDS.gerocultor2,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Paseo en jardín',
    tipo: 'actividad',
    fechaHora: d(1, 10, 0),
    estado: 'pendiente',
    notas: null,
    residenteId: RESIDENTE_IDS.residente1,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
  {
    titulo: 'Revisión semanal de medicación',
    tipo: 'revision',
    fechaHora: d(1, 9, 0),
    estado: 'pendiente',
    notas: 'Coordinar con enfermería para actualizar pauta.',
    residenteId: RESIDENTE_IDS.residente3,
    usuarioId: USUARIO_IDS.gerocultor1,
    creadoEn: now,
    actualizadoEn: now,
    completadaEn: null,
  },
]

// ─── Seed execution ────────────────────────────────────────────────────────────

async function seedTareas(): Promise<void> {
  console.log(`🌱 Seeding ${SEED_TAREAS.length} tareas into Firestore...`)

  const batch = db.batch()

  for (const tarea of SEED_TAREAS) {
    const ref = db.collection('tareas').doc()
    batch.set(ref, tarea)
  }

  await batch.commit()

  console.log(`✅ Successfully seeded ${SEED_TAREAS.length} tareas.`)
}

seedTareas().catch((err: unknown) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
