/**
 * seed-rgpd.ts
 *
 * RGPD-safe demo seed for the GeroCare system.
 *
 * SAFETY: This script REQUIRES the Firestore emulator to be running.
 * It will abort immediately if FIRESTORE_EMULATOR_HOST is not set.
 *
 * All names, emails, addresses, and personal data are 100% fictional
 * and generated algorithmically by @faker-js/faker. No real personal
 * data is hardcoded anywhere in this file.
 *
 * Collections seeded:
 *   - users          (2 gerocultores + 1 admin)
 *   - residents      (8 residentes)
 *   - tasks          (24 tareas distribuidas)
 *   - incidences     (8 incidencias)
 *   - shifts         (3 turnos activos)
 *   - notificaciones (5 notificaciones demo)
 *
 * Usage (from code/api/):
 *   FIRESTORE_EMULATOR_HOST=localhost:18080 npm run seed
 *   FIRESTORE_EMULATOR_HOST=localhost:18080 npx tsx seeds/seed-rgpd.ts
 */

import * as admin from 'firebase-admin'
import { faker } from '@faker-js/faker/locale/es'

// ── Safety guard ─────────────────────────────────────────────────────────────

const emulatorHost = process.env['FIRESTORE_EMULATOR_HOST']

if (!emulatorHost) {
  console.error('❌  ABORT: seed-rgpd must run against the Firestore emulator.')
  console.error(
    '   Set FIRESTORE_EMULATOR_HOST (e.g. FIRESTORE_EMULATOR_HOST=localhost:18080).'
  )
  console.error('   This script will NEVER run against production Firestore.')
  process.exit(1)
}

if (emulatorHost.includes('firebaseio.com')) {
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

// ── Collection constants (mirrors src/services/collections.ts) ────────────────

const COLLECTIONS = {
  usuarios: 'users',
  residentes: 'residents',
  tareas: 'tasks',
  incidences: 'incidences',
  turnos: 'shifts',
  notificaciones: 'notificaciones',
} as const

// ── Type definitions (mirrors SPEC/entities.md) ───────────────────────────────

interface UsuarioSeed {
  uid: string
  email: string
  displayName: string | null
  role: 'admin' | 'gerocultor'
  disabled: boolean
  createdAt: admin.firestore.Timestamp
}

interface ResidenteSeed {
  id: string
  nombre: string
  apellidos: string
  fechaNacimiento: admin.firestore.Timestamp
  habitacion: string
  foto: string | null
  diagnosticos: string
  alergias: string
  medicacion: string
  preferencias: string
  archivado: boolean
  creadoEn: admin.firestore.Timestamp
  actualizadoEn: admin.firestore.Timestamp
  gerocultoresAsignados: string[]
}

interface TareaSeed {
  id: string
  titulo: string
  tipo: 'higiene' | 'medicacion' | 'alimentacion' | 'actividad' | 'revision' | 'otro'
  fechaHora: admin.firestore.Timestamp
  estado: 'pendiente' | 'en_curso' | 'completada' | 'con_incidencia'
  notas: string | null
  residenteId: string
  usuarioId: string
  creadoEn: admin.firestore.Timestamp
  actualizadoEn: admin.firestore.Timestamp
  completadaEn: admin.firestore.Timestamp | null
}

interface IncidenciaSeed {
  id: string
  tipo: 'caida' | 'comportamiento' | 'salud' | 'alimentacion' | 'medicacion' | 'otro'
  severidad: 'leve' | 'moderada' | 'critica'
  descripcion: string
  residenteId: string
  usuarioId: string
  tareaId: string | null
  registradaEn: admin.firestore.Timestamp
}

interface TurnoSeed {
  id: string
  usuarioId: string
  fecha: admin.firestore.Timestamp
  tipoTurno: 'manyana' | 'tarde' | 'noche'
  inicio: admin.firestore.Timestamp
  fin: admin.firestore.Timestamp | null
  resumenTraspaso: string | null
  creadoEn: admin.firestore.Timestamp
}

interface NotificacionSeed {
  id: string
  usuarioId: string
  tipo: 'incidencia_critica' | 'tarea_proxima' | 'traspaso_turno' | 'sistema'
  titulo: string
  mensaje: string
  leida: boolean
  referenciaId: string | null
  referenciaModelo: string | null
  creadaEn: admin.firestore.Timestamp
}

// ── Seed data generation (100% faker — zero real data) ────────────────────────

faker.seed(42) // Deterministic output for reproducibility

function ts(date: Date): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(date)
}

function generateUsuarios(): UsuarioSeed[] {
  const now = faker.date.recent({ days: 30 })
  return [
    {
      uid: 'seed-admin-001',
      email: faker.internet.email({ provider: 'geocare-demo.example' }),
      displayName: faker.person.fullName(),
      role: 'admin',
      disabled: false,
      createdAt: ts(now),
    },
    {
      uid: 'seed-gero-001',
      email: faker.internet.email({ provider: 'geocare-demo.example' }),
      displayName: faker.person.fullName(),
      role: 'gerocultor',
      disabled: false,
      createdAt: ts(faker.date.recent({ days: 20 })),
    },
    {
      uid: 'seed-gero-002',
      email: faker.internet.email({ provider: 'geocare-demo.example' }),
      displayName: faker.person.fullName(),
      role: 'gerocultor',
      disabled: false,
      createdAt: ts(faker.date.recent({ days: 15 })),
    },
  ]
}

function generateResidentes(gerocultorIds: string[]): ResidenteSeed[] {
  const HABITACIONES = ['101', '102', '103', '104', '105', '106', '201', '202']
  const DIAGNOSTICOS_DEMO = [
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
  ]
  const ALERGIAS_DEMO = [
    faker.lorem.words(3),
    faker.lorem.words(2),
    faker.lorem.words(4),
    faker.lorem.words(3),
    faker.lorem.words(2),
    faker.lorem.words(3),
    faker.lorem.words(2),
    faker.lorem.words(3),
  ]

  return HABITACIONES.map((hab, i) => {
    const creadoEn = faker.date.past({ years: 1 })
    return {
      id: `seed-residente-00${i + 1}`,
      nombre: faker.person.firstName(),
      apellidos: `${faker.person.lastName()} ${faker.person.lastName()}`,
      fechaNacimiento: ts(faker.date.birthdate({ min: 65, max: 95, mode: 'age' })),
      habitacion: hab,
      foto: null,
      diagnosticos: DIAGNOSTICOS_DEMO[i] ?? faker.lorem.sentence(),
      alergias: ALERGIAS_DEMO[i] ?? faker.lorem.words(3),
      medicacion: faker.lorem.sentence(),
      preferencias: faker.lorem.sentence(),
      archivado: false,
      creadoEn: ts(creadoEn),
      actualizadoEn: ts(faker.date.between({ from: creadoEn, to: new Date() })),
      gerocultoresAsignados: i < 4 ? [gerocultorIds[0]!] : [gerocultorIds[1]!],
    }
  })
}

function generateTareas(
  residenteIds: string[],
  gerocultorIds: string[]
): TareaSeed[] {
  const TIPOS: TareaSeed['tipo'][] = [
    'higiene',
    'medicacion',
    'alimentacion',
    'actividad',
    'revision',
    'otro',
  ]
  const TITULOS: Record<TareaSeed['tipo'], string[]> = {
    higiene: [
      'Higiene personal matutina',
      'Ducha asistida',
      'Cambio de ropa',
      'Higiene bucal',
    ],
    medicacion: [
      'Administración medicación matutina',
      'Medicación nocturna',
      'Control de glucemia',
      'Cambio de parche transdérmico',
    ],
    alimentacion: [
      'Desayuno asistido',
      'Almuerzo asistido',
      'Cena asistida',
      'Hidratación y merienda',
    ],
    actividad: [
      'Fisioterapia pasiva',
      'Paseo matutino',
      'Taller de estimulación cognitiva',
      'Ejercicios de movilidad',
    ],
    revision: [
      'Control de constantes vitales',
      'Revisión de escaras',
      'Evaluación de estado general',
      'Revisión de sondas',
    ],
    otro: ['Llamada familiar', 'Traslado a consulta', 'Reunión con familia'],
  }

  const tareas: TareaSeed[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 3 tareas por residente para hoy
  for (const residenteId of residenteIds) {
    const gerocultorId =
      gerocultorIds[faker.number.int({ min: 0, max: gerocultorIds.length - 1 })]!

    const tiposParaResidente = faker.helpers.arrayElements(TIPOS, 3)
    for (const tipo of tiposParaResidente) {
      const hora = faker.number.int({ min: 7, max: 21 })
      const fechaHora = new Date(today)
      fechaHora.setHours(hora, 0, 0, 0)

      const tituloList = TITULOS[tipo]
      const titulo = faker.helpers.arrayElement(tituloList)
      const creadoEn = faker.date.recent({ days: 1 })
      const esCompletada = faker.datatype.boolean({ probability: 0.4 })

      tareas.push({
        id: `seed-tarea-${residenteId}-${tipo}`,
        titulo,
        tipo,
        fechaHora: ts(fechaHora),
        estado: esCompletada ? 'completada' : 'pendiente',
        notas: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : null,
        residenteId,
        usuarioId: gerocultorId,
        creadoEn: ts(creadoEn),
        actualizadoEn: ts(creadoEn),
        completadaEn: esCompletada ? ts(new Date()) : null,
      })
    }
  }

  return tareas
}

function generateIncidencias(
  residenteIds: string[],
  gerocultorIds: string[],
  tareaIds: string[]
): IncidenciaSeed[] {
  const TIPOS: IncidenciaSeed['tipo'][] = [
    'caida',
    'comportamiento',
    'salud',
    'alimentacion',
    'medicacion',
    'otro',
  ]
  const SEVERIDADES: IncidenciaSeed['severidad'][] = ['leve', 'moderada', 'critica']

  return residenteIds.slice(0, 8).map((residenteId, i) => {
    const tipo = faker.helpers.arrayElement(TIPOS)
    const severidad = faker.helpers.arrayElement(SEVERIDADES)
    const gerocultorId = gerocultorIds[i % gerocultorIds.length]!

    return {
      id: `seed-incidencia-00${i + 1}`,
      tipo,
      severidad,
      descripcion: faker.lorem.paragraph(),
      residenteId,
      usuarioId: gerocultorId,
      tareaId: faker.datatype.boolean({ probability: 0.4 })
        ? (tareaIds[faker.number.int({ min: 0, max: tareaIds.length - 1 })] ?? null)
        : null,
      registradaEn: ts(faker.date.recent({ days: 7 })),
    }
  })
}

function generateTurnos(gerocultorIds: string[]): TurnoSeed[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const TIPOS: TurnoSeed['tipoTurno'][] = ['manyana', 'tarde', 'noche']
  const HORARIOS: Record<TurnoSeed['tipoTurno'], { h: number; duracion: number }> = {
    manyana: { h: 7, duracion: 8 },
    tarde: { h: 15, duracion: 8 },
    noche: { h: 23, duracion: 8 },
  }

  return gerocultorIds.map((uid, i) => {
    const tipoTurno = TIPOS[i % TIPOS.length]!
    const { h, duracion } = HORARIOS[tipoTurno]
    const inicio = new Date(today)
    inicio.setHours(h, 0, 0, 0)
    const fin = new Date(inicio)
    fin.setHours(h + duracion, 0, 0, 0)

    const isActive = i === 0 // first gerocultor has an open shift
    return {
      id: `seed-turno-00${i + 1}`,
      usuarioId: uid,
      fecha: ts(today),
      tipoTurno,
      inicio: ts(inicio),
      fin: isActive ? null : ts(fin),
      resumenTraspaso: isActive ? null : faker.lorem.paragraph(),
      creadoEn: ts(inicio),
    }
  })
}

function generateNotificaciones(
  adminId: string,
  gerocultorIds: string[],
  incidenciaIds: string[]
): NotificacionSeed[] {
  const allUsers = [adminId, ...gerocultorIds]

  return [
    {
      id: 'seed-notif-001',
      usuarioId: adminId,
      tipo: 'incidencia_critica',
      titulo: 'Incidencia crítica registrada',
      mensaje: faker.lorem.sentence(),
      leida: false,
      referenciaId: incidenciaIds[0] ?? null,
      referenciaModelo: 'Incidencia',
      creadaEn: ts(faker.date.recent({ days: 1 })),
    },
    {
      id: 'seed-notif-002',
      usuarioId: gerocultorIds[0] ?? adminId,
      tipo: 'tarea_proxima',
      titulo: 'Tarea próxima en 15 minutos',
      mensaje: faker.lorem.sentence(),
      leida: false,
      referenciaId: null,
      referenciaModelo: 'Tarea',
      creadaEn: ts(faker.date.recent({ days: 1 })),
    },
    {
      id: 'seed-notif-003',
      usuarioId: gerocultorIds[1] ?? adminId,
      tipo: 'traspaso_turno',
      titulo: 'Resumen de traspaso de turno',
      mensaje: faker.lorem.paragraph(),
      leida: true,
      referenciaId: 'seed-turno-001',
      referenciaModelo: 'Turno',
      creadaEn: ts(faker.date.recent({ days: 2 })),
    },
    {
      id: 'seed-notif-004',
      usuarioId: allUsers[faker.number.int({ min: 0, max: allUsers.length - 1 })] ?? adminId,
      tipo: 'sistema',
      titulo: 'Mantenimiento programado',
      mensaje: faker.lorem.sentence(),
      leida: faker.datatype.boolean(),
      referenciaId: null,
      referenciaModelo: null,
      creadaEn: ts(faker.date.recent({ days: 3 })),
    },
    {
      id: 'seed-notif-005',
      usuarioId: adminId,
      tipo: 'incidencia_critica',
      titulo: 'Nueva incidencia moderada',
      mensaje: faker.lorem.sentence(),
      leida: true,
      referenciaId: incidenciaIds[1] ?? null,
      referenciaModelo: 'Incidencia',
      creadaEn: ts(faker.date.recent({ days: 4 })),
    },
  ]
}

// ── Clear collections ─────────────────────────────────────────────────────────

async function clearCollection(collectionPath: string): Promise<void> {
  const snap = await db.collection(collectionPath).get()
  if (snap.empty) return

  const batches: admin.firestore.WriteBatch[] = []
  let current = db.batch()
  let count = 0

  for (const doc of snap.docs) {
    current.delete(doc.ref)
    count++
    if (count === 500) {
      batches.push(current)
      current = db.batch()
      count = 0
    }
  }
  if (count > 0) batches.push(current)

  for (const batch of batches) await batch.commit()
  console.log(`  🗑️   Cleared ${snap.size} docs from '${collectionPath}'`)
}

// ── Main seed function ────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('\n🌱  Starting RGPD-safe seed...\n')

  // 1. Clear all collections
  console.log('🗑️   Clearing existing collections...')
  for (const col of Object.values(COLLECTIONS)) {
    await clearCollection(col)
  }

  // 2. Generate data
  const usuarios = generateUsuarios()
  const adminUser = usuarios.find(u => u.role === 'admin')!
  const gerocultores = usuarios.filter(u => u.role === 'gerocultor')
  const gerocultorIds = gerocultores.map(g => g.uid)
  const gerocultorIdsNonNull: string[] = gerocultorIds.filter((id): id is string => id !== undefined)

  const residentes = generateResidentes(gerocultorIdsNonNull)
  const residenteIds = residentes.map(r => r.id)

  const tareas = generateTareas(residenteIds, gerocultorIdsNonNull)
  const tareaIds = tareas.map(t => t.id)

  const incidencias = generateIncidencias(residenteIds, gerocultorIdsNonNull, tareaIds)
  const incidenciaIds = incidencias.map(i => i.id)

  const turnos = generateTurnos(gerocultorIdsNonNull)

  const notificaciones = generateNotificaciones(adminUser.uid, gerocultorIdsNonNull, incidenciaIds)

  // 3. Write users
  console.log('\n👤  Seeding users...')
  const userBatch = db.batch()
  for (const u of usuarios) {
    userBatch.set(db.collection(COLLECTIONS.usuarios).doc(u.uid), u)
  }
  await userBatch.commit()
  console.log(`   ✅  ${usuarios.length} users (1 admin, ${gerocultores.length} gerocultores)`)

  // 4. Write residents
  console.log('\n🏠  Seeding residents...')
  const resBatch = db.batch()
  for (const r of residentes) {
    resBatch.set(db.collection(COLLECTIONS.residentes).doc(r.id), r)
  }
  await resBatch.commit()
  console.log(`   ✅  ${residentes.length} residents`)

  // 5. Write tasks
  console.log('\n📋  Seeding tasks...')
  const taskBatch = db.batch()
  for (const t of tareas) {
    taskBatch.set(db.collection(COLLECTIONS.tareas).doc(t.id), t)
  }
  await taskBatch.commit()
  console.log(`   ✅  ${tareas.length} tasks`)

  // 6. Write incidences
  console.log('\n⚠️   Seeding incidences...')
  const incBatch = db.batch()
  for (const inc of incidencias) {
    incBatch.set(db.collection(COLLECTIONS.incidences).doc(inc.id), inc)
  }
  await incBatch.commit()
  console.log(`   ✅  ${incidencias.length} incidences`)

  // 7. Write shifts
  console.log('\n🕐  Seeding shifts...')
  const shiftBatch = db.batch()
  for (const t of turnos) {
    shiftBatch.set(db.collection(COLLECTIONS.turnos).doc(t.id), t)
  }
  await shiftBatch.commit()
  console.log(`   ✅  ${turnos.length} shifts`)

  // 8. Write notifications
  console.log('\n🔔  Seeding notifications...')
  const notifBatch = db.batch()
  for (const n of notificaciones) {
    notifBatch.set(db.collection(COLLECTIONS.notificaciones).doc(n.id), n)
  }
  await notifBatch.commit()
  console.log(`   ✅  ${notificaciones.length} notifications`)

  // 9. Summary
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║  🌱  RGPD-safe seed complete!            ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  users          : ${String(usuarios.length).padEnd(24)}║`)
  console.log(`║  residents      : ${String(residentes.length).padEnd(24)}║`)
  console.log(`║  tasks          : ${String(tareas.length).padEnd(24)}║`)
  console.log(`║  incidences     : ${String(incidencias.length).padEnd(24)}║`)
  console.log(`║  shifts         : ${String(turnos.length).padEnd(24)}║`)
  console.log(`║  notificaciones : ${String(notificaciones.length).padEnd(24)}║`)
  console.log('╚══════════════════════════════════════════╝')
  console.log('\n⚡  All data is 100% synthetic (RGPD-safe). No real personal data.')
}

// ── Entry point ───────────────────────────────────────────────────────────────

seed().catch((err: unknown) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
