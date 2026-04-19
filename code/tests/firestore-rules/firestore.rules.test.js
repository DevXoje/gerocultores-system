/**
 * Firestore Security Rules Unit Tests
 *
 * These tests validate the PRACTICA policy for gerocultores-system:
 * - gerocultor can read/update ONLY their own tasks (tareas where userId == uid)
 * - gerocultor can read ONLY residentes assigned to them (assignedTo == uid)
 * - administrador has full read/write access on all collections
 *
 * Prerequisites:
 *   1. Firebase Emulator Suite running on default ports:
 *      npx firebase emulators:start --only firestore
 *      OR: cd code && ./start_emulators.sh
 *   2. Install deps: cd code/tests/firestore-rules && npm install
 *   3. Run tests: npm test
 *
 * Environment:
 *   FIRESTORE_EMULATOR_HOST defaults to "127.0.0.1:8080" if not set.
 */

const { readFileSync } = require('fs')
const { resolve } = require('path')

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing')

// Path to the actual rules file used in production
const RULES_PATH = resolve(__dirname, '../../firestore.rules')

let testEnv

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gerocultores-test',
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] ?? '127.0.0.1',
      port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] ?? 8080),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a Firestore context authenticated as the given uid and custom claims.
 */
function authedContext(uid, claims = {}) {
  return testEnv.authenticatedContext(uid, claims)
}

/**
 * Seeds data into Firestore bypassing rules (using admin context).
 */
async function seedDoc(collection, docId, data) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection(collection).doc(docId).set(data)
  })
}

// ---------------------------------------------------------------------------
// /tareas tests
// ---------------------------------------------------------------------------

describe('Tareas — gerocultor access', () => {
  const GEROCULTOR_UID = 'uid-gerocultor-01'
  const OTHER_GEROCULTOR_UID = 'uid-gerocultor-02'
  const GEROCULTOR_CLAIMS = { rol: 'gerocultor' }

  beforeEach(async () => {
    // Own tarea
    await seedDoc('tareas', 'tarea-own', { userId: GEROCULTOR_UID, title: 'Own task' })
    // Other user's tarea
    await seedDoc('tareas', 'tarea-other', { userId: OTHER_GEROCULTOR_UID, title: 'Other task' })
  })

  it('allows gerocultor to read their own tarea', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertSucceeds(db.collection('tareas').doc('tarea-own').get())
  })

  it('denies gerocultor reading another user\'s tarea', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertFails(db.collection('tareas').doc('tarea-other').get())
  })

  it('allows gerocultor to update their own tarea', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertSucceeds(
      db.collection('tareas').doc('tarea-own').update({ title: 'Updated' })
    )
  })

  it('denies gerocultor updating another user\'s tarea', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertFails(
      db.collection('tareas').doc('tarea-other').update({ title: 'Hack' })
    )
  })

  it('allows gerocultor to create a tarea', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertSucceeds(
      db.collection('tareas').doc('tarea-new').set({ userId: GEROCULTOR_UID, title: 'New task' })
    )
  })
})

// ---------------------------------------------------------------------------
// /residentes tests
// ---------------------------------------------------------------------------

describe('Residentes — gerocultor access', () => {
  const GEROCULTOR_UID = 'uid-gerocultor-01'
  const OTHER_GEROCULTOR_UID = 'uid-gerocultor-02'
  const GEROCULTOR_CLAIMS = { rol: 'gerocultor' }

  beforeEach(async () => {
    // Residente assigned to GEROCULTOR_UID
    await seedDoc('residentes', 'residente-assigned', {
      nombre: 'María García',
      assignedTo: GEROCULTOR_UID,
    })
    // Residente assigned to a different gerocultor
    await seedDoc('residentes', 'residente-unassigned', {
      nombre: 'Juan López',
      assignedTo: OTHER_GEROCULTOR_UID,
    })
  })

  it('allows gerocultor to read a residente assigned to them', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertSucceeds(db.collection('residentes').doc('residente-assigned').get())
  })

  it('denies gerocultor reading a residente not assigned to them', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertFails(db.collection('residentes').doc('residente-unassigned').get())
  })

  it('denies gerocultor writing to residentes', async () => {
    const db = authedContext(GEROCULTOR_UID, GEROCULTOR_CLAIMS).firestore()
    await assertFails(
      db.collection('residentes').doc('residente-assigned').update({ nombre: 'Hack' })
    )
  })
})

// ---------------------------------------------------------------------------
// /tareas + /residentes — administrador has full access
// ---------------------------------------------------------------------------

describe('Administrador — full access', () => {
  const ADMIN_UID = 'uid-admin-01'
  const ADMIN_CLAIMS = { rol: 'administrador' }

  beforeEach(async () => {
    await seedDoc('tareas', 'tarea-any', { userId: 'other-user', title: 'Some task' })
    await seedDoc('residentes', 'residente-any', { nombre: 'Ana Ruiz', assignedTo: 'other-user' })
  })

  it('allows administrador to read any tarea', async () => {
    const db = authedContext(ADMIN_UID, ADMIN_CLAIMS).firestore()
    await assertSucceeds(db.collection('tareas').doc('tarea-any').get())
  })

  it('allows administrador to update any tarea', async () => {
    const db = authedContext(ADMIN_UID, ADMIN_CLAIMS).firestore()
    await assertSucceeds(
      db.collection('tareas').doc('tarea-any').update({ title: 'Admin edit' })
    )
  })

  it('allows administrador to create a tarea', async () => {
    const db = authedContext(ADMIN_UID, ADMIN_CLAIMS).firestore()
    await assertSucceeds(
      db.collection('tareas').doc('tarea-new').set({ userId: ADMIN_UID, title: 'Admin task' })
    )
  })

  it('allows administrador to read any residente', async () => {
    const db = authedContext(ADMIN_UID, ADMIN_CLAIMS).firestore()
    await assertSucceeds(db.collection('residentes').doc('residente-any').get())
  })

  it('allows administrador to write to residentes', async () => {
    const db = authedContext(ADMIN_UID, ADMIN_CLAIMS).firestore()
    await assertSucceeds(
      db.collection('residentes').doc('residente-any').update({ nombre: 'Admin edit' })
    )
  })
})

// ---------------------------------------------------------------------------
// Unauthenticated access — always denied
// ---------------------------------------------------------------------------

describe('Unauthenticated access — always denied', () => {
  beforeEach(async () => {
    await seedDoc('tareas', 'tarea-any', { userId: 'some-user', title: 'Task' })
    await seedDoc('residentes', 'residente-any', { nombre: 'Someone', assignedTo: 'some-user' })
  })

  it('denies unauthenticated read of tareas', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.collection('tareas').doc('tarea-any').get())
  })

  it('denies unauthenticated read of residentes', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.collection('residentes').doc('residente-any').get())
  })
})
