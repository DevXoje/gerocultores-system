/**
 * users.service.integration.spec.ts — Integration tests for UsersService.
 *
 * Runs against the Firebase Emulator (Auth + Firestore).
 * Uses a named Firebase app to avoid conflicts with the default app initialization
 * order in firebase.ts (which reads env vars at module load time).
 *
 * Required env vars (set automatically via firebase emulators:exec, or manually):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080
 *   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
 *   FIREBASE_PROJECT_ID=gero-care
 *
 * US-10: Gestión de cuentas de usuarios
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import * as admin from 'firebase-admin'
import { COLLECTIONS } from './collections'

// ─── Emulator setup ───────────────────────────────────────────────────────────

const PROJECT_ID = process.env['FIREBASE_PROJECT_ID'] ?? 'gero-care'
const FIRESTORE_HOST = process.env['FIRESTORE_EMULATOR_HOST'] ?? 'localhost:8080'
const AUTH_HOST = process.env['FIREBASE_AUTH_EMULATOR_HOST'] ?? 'localhost:9099'

const TEST_APP_NAME = 'users-service-integration-test'

let testApp: admin.app.App
let testAuth: admin.auth.Auth
let testDb: admin.firestore.Firestore

// Track UIDs created during tests so we can clean them up reliably.
const createdUids: string[] = []

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function cleanupUser(uid: string): Promise<void> {
  try {
    await testAuth.deleteUser(uid)
  } catch {
    // User may already be deleted — ignore
  }
  try {
    await testDb.collection(COLLECTIONS.usuarios).doc(uid).delete()
  } catch {
    // Doc may not exist — ignore
  }
}

// ─── Suite setup ──────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Ensure emulator env vars are set before any Firebase Admin SDK calls.
  // These are also set in integration-setup.ts (setupFiles) but we set them
  // here as well to guard against module load order issues.
  process.env['FIRESTORE_EMULATOR_HOST'] = FIRESTORE_HOST
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = AUTH_HOST
  process.env['FIREBASE_PROJECT_ID'] = PROJECT_ID

  // Initialise a named Firebase app pointing at the emulator.
  // We use a named app to avoid conflicts with the default app managed by firebase.ts.
  const existing = admin.apps.find((a) => a?.name === TEST_APP_NAME)
  if (existing) {
    testApp = existing
  } else {
    testApp = admin.initializeApp({ projectId: PROJECT_ID }, TEST_APP_NAME)
  }
  testAuth = testApp.auth()
  testDb = testApp.firestore()

  // Mock the firebase.ts module so that UsersService uses OUR named app
  // instead of the default app. This avoids the module-level initialization
  // timing issue in firebase.ts.
  vi.doMock('./firebase', () => ({
    adminAuth: testAuth,
    adminDb: testDb,
  }))
})

afterAll(async () => {
  vi.restoreAllMocks()
  try {
    await testApp.delete()
  } catch {
    // Ignore cleanup errors
  }
})

afterEach(async () => {
  // Clean up all users created during the test
  await Promise.all(createdUids.splice(0).map(cleanupUser))
})

// ─── Dynamic import of service (after mock is set up) ─────────────────────────

async function getService() {
  // Dynamic import ensures the mock is in place before the module loads
  const { UsersService } = await import('./users.service')
  return new UsersService()
}

// ─── listUsers ────────────────────────────────────────────────────────────────

describe('UsersService.listUsers()', () => {
  it('returns an array (possibly empty) when no test users exist', async () => {
    const service = await getService()
    const users = await service.listUsers()
    expect(Array.isArray(users)).toBe(true)
  })

  it('returns users that exist in Firestore', async () => {
    const uid = 'test-list-user-001'
    createdUids.push(uid)

    // Write directly to Firestore via testDb to control the fixture
    await testDb.collection(COLLECTIONS.usuarios).doc(uid).set({
      email: 'list-test@example.com',
      displayName: 'List Test User',
      role: 'gerocultor',
      active: true,
      createdAt: new Date().toISOString(),
    })

    const service = await getService()
    const users = await service.listUsers()

    const found = users.find((u) => u.uid === uid)
    expect(found).toBeDefined()
    expect(found?.email).toBe('list-test@example.com')
    expect(found?.role).toBe('gerocultor')
    expect(found?.active).toBe(true)
  })
})

// ─── createUser ───────────────────────────────────────────────────────────────

describe('UsersService.createUser()', () => {
  it('creates a user in Auth and Firestore with role gerocultor', async () => {
    const service = await getService()

    const result = await service.createUser({
      email: 'create-gerocultor@example.com',
      password: 'password123',
      displayName: 'Gero Test',
      role: 'gerocultor',
    })

    createdUids.push(result.uid)

    // Validate the returned response shape
    expect(result.uid).toBeTruthy()
    expect(result.email).toBe('create-gerocultor@example.com')
    expect(result.displayName).toBe('Gero Test')
    expect(result.role).toBe('gerocultor')
    expect(result.active).toBe(true)
    expect(result.createdAt).toBeTruthy()

    // Verify the user exists in Auth (emulator)
    const authUser = await testAuth.getUser(result.uid)
    expect(authUser.email).toBe('create-gerocultor@example.com')

    // Verify custom claims were set
    const claims = authUser.customClaims as Record<string, unknown> | undefined
    expect(claims?.['role']).toBe('gerocultor')

    // Verify Firestore document was created
    const doc = await testDb.collection(COLLECTIONS.usuarios).doc(result.uid).get()
    expect(doc.exists).toBe(true)
    expect(doc.data()?.['email']).toBe('create-gerocultor@example.com')
    expect(doc.data()?.['role']).toBe('gerocultor')
    expect(doc.data()?.['active']).toBe(true)
  })

  it('creates a user with role admin', async () => {
    const service = await getService()

    const result = await service.createUser({
      email: 'create-admin@example.com',
      password: 'adminpass123',
      displayName: 'Admin Test',
      role: 'admin',
    })

    createdUids.push(result.uid)

    expect(result.role).toBe('admin')

    const authUser = await testAuth.getUser(result.uid)
    const claims = authUser.customClaims as Record<string, unknown> | undefined
    expect(claims?.['role']).toBe('admin')
  })

  it('stores createdAt as an ISO string within test bounds', async () => {
    const service = await getService()
    const before = new Date().toISOString()

    const result = await service.createUser({
      email: 'timestamp-test@example.com',
      password: 'password123',
      displayName: 'Timestamp Test',
      role: 'gerocultor',
    })

    createdUids.push(result.uid)

    const after = new Date().toISOString()
    expect(result.createdAt >= before).toBe(true)
    expect(result.createdAt <= after).toBe(true)
  })
})

// ─── updateUserRole ───────────────────────────────────────────────────────────

describe('UsersService.updateUserRole()', () => {
  it('updates the role custom claim and the Firestore document', async () => {
    const service = await getService()

    // Create a gerocultor first
    const created = await service.createUser({
      email: 'role-update@example.com',
      password: 'password123',
      displayName: 'Role Update Test',
      role: 'gerocultor',
    })
    createdUids.push(created.uid)

    // Promote to admin
    const result = await service.updateUserRole(created.uid, { role: 'admin' })

    expect(result.uid).toBe(created.uid)
    expect(result.role).toBe('admin')

    // Verify Auth custom claim was updated
    const authUser = await testAuth.getUser(created.uid)
    const claims = authUser.customClaims as Record<string, unknown> | undefined
    expect(claims?.['role']).toBe('admin')

    // Verify Firestore document was updated
    const doc = await testDb.collection(COLLECTIONS.usuarios).doc(created.uid).get()
    expect(doc.data()?.['role']).toBe('admin')
  })

  it('can demote an admin back to gerocultor', async () => {
    const service = await getService()

    const created = await service.createUser({
      email: 'demote-admin@example.com',
      password: 'password123',
      displayName: 'Demote Test',
      role: 'admin',
    })
    createdUids.push(created.uid)

    const result = await service.updateUserRole(created.uid, { role: 'gerocultor' })
    expect(result.role).toBe('gerocultor')

    const authUser = await testAuth.getUser(created.uid)
    const claims = authUser.customClaims as Record<string, unknown> | undefined
    expect(claims?.['role']).toBe('gerocultor')
  })

  it('throws when the uid does not exist in Auth', async () => {
    const service = await getService()

    await expect(
      service.updateUserRole('non-existent-uid-xyz-999', { role: 'admin' }),
    ).rejects.toThrow()
  })
})

// ─── disableUser ──────────────────────────────────────────────────────────────

describe('UsersService.disableUser()', () => {
  it('sets disabled=true in Auth and active=false in Firestore', async () => {
    const service = await getService()

    const created = await service.createUser({
      email: 'disable-test@example.com',
      password: 'password123',
      displayName: 'Disable Test',
      role: 'gerocultor',
    })
    createdUids.push(created.uid)

    const result = await service.disableUser(created.uid)

    expect(result.uid).toBe(created.uid)
    expect(result.active).toBe(false)

    // Verify Auth record was disabled
    const authUser = await testAuth.getUser(created.uid)
    expect(authUser.disabled).toBe(true)

    // Verify Firestore document active flag
    const doc = await testDb.collection(COLLECTIONS.usuarios).doc(created.uid).get()
    expect(doc.data()?.['active']).toBe(false)
  })

  it('throws when the uid does not exist', async () => {
    const service = await getService()

    await expect(service.disableUser('non-existent-uid-xyz-999')).rejects.toThrow()
  })
})

// ─── enableUser ───────────────────────────────────────────────────────────────

describe('UsersService.enableUser()', () => {
  it('sets disabled=false in Auth and active=true in Firestore', async () => {
    const service = await getService()

    // Create and then disable a user first
    const created = await service.createUser({
      email: 'enable-test@example.com',
      password: 'password123',
      displayName: 'Enable Test',
      role: 'gerocultor',
    })
    createdUids.push(created.uid)

    await service.disableUser(created.uid)

    // Now re-enable
    const result = await service.enableUser(created.uid)

    expect(result.uid).toBe(created.uid)
    expect(result.active).toBe(true)

    // Verify Auth record was re-enabled
    const authUser = await testAuth.getUser(created.uid)
    expect(authUser.disabled).toBe(false)

    // Verify Firestore document active flag
    const doc = await testDb.collection(COLLECTIONS.usuarios).doc(created.uid).get()
    expect(doc.data()?.['active']).toBe(true)
  })

  it('throws when the uid does not exist', async () => {
    const service = await getService()

    await expect(service.enableUser('non-existent-uid-xyz-999')).rejects.toThrow()
  })
})
