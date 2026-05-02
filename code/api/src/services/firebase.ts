import * as admin from 'firebase-admin'

const shouldUseEmulators = process.env['USE_EMULATORS'] === 'true'
const firestoreEmulatorHost = process.env['GOOGLE_FIRESTORE_EMULATOR_HOST']
const authEmulatorHost = process.env['GOOGLE_AUTH_EMULATOR_HOST']

if (shouldUseEmulators) {
  console.log('[firebase] Emulator mode enabled')
  console.log(`[firebase] Firestore Emulator: ${firestoreEmulatorHost ?? 'Not set'}`)
  console.log(`[firebase] Auth Emulator: ${authEmulatorHost ?? 'Not set'}`)
}
const hasApps = admin.apps?.length > 0

if (!hasApps) {
  if (shouldUseEmulators) {
    process.env['GOOGLE_AUTH_EMULATOR_HOST'] = 'localhost:9099'
    process.env['GOOGLE_FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
    const projectId = process.env['GOOGLE_PROJECT_ID'] ?? 'gerocultores-system'
    admin.initializeApp({ projectId: projectId })
  } else {
    admin.initializeApp({ projectId: 'gerocultores-system' })
  }
}

// Connect Admin SDK to Firestore emulator
if (firestoreEmulatorHost) {
  admin.firestore().settings({
    host: firestoreEmulatorHost,
    ssl: false,
  })
}

// Auth emulator is auto-detected by firebase-admin via GOOGLE_AUTH_EMULATOR_HOST env var
// No explicit useEmulator() call needed — it is handled internally by the Admin SDK

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
