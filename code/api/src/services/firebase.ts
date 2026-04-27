import * as admin from 'firebase-admin'

const shouldUseEmulators = process.env['USE_FIREBASE_EMULATORS'] === 'true'
const firestoreEmulatorHost = process.env['FIRESTORE_EMULATOR_HOST']
const authEmulatorHost = process.env['FIREBASE_AUTH_EMULATOR_HOST']

if (shouldUseEmulators) {
  console.log('[firebase] Emulator mode enabled')
  console.log(`[firebase] Firestore Emulator: ${firestoreEmulatorHost ?? 'Not set'}`)
  console.log(`[firebase] Auth Emulator: ${authEmulatorHost ?? 'Not set'}`)
}

if (!admin.apps.length) {
  if (shouldUseEmulators) {
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID must be set when using emulators')
    }
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault(),
    })
  } else {
    const projectId = process.env['FIREBASE_PROJECT_ID']
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL']
    const rawKey = process.env['FIREBASE_PRIVATE_KEY']

    if (!projectId || !clientEmail || !rawKey) {
      throw new Error(
        'Missing required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
      )
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/\\n/g, '\n'),
      }),
    })
  }
}

// Connect Admin SDK to Firestore emulator
if (firestoreEmulatorHost) {
  admin.firestore().settings({
    host: firestoreEmulatorHost,
    ssl: false,
  })
}

// Auth emulator is auto-detected by firebase-admin via FIREBASE_AUTH_EMULATOR_HOST env var
// No explicit useEmulator() call needed — it is handled internally by the Admin SDK

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
