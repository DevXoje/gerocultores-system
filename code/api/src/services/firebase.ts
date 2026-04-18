import * as admin from 'firebase-admin'

// When FIRESTORE_EMULATOR_HOST is set (or NODE_ENV is 'development'),
// the Admin SDK connects to the local emulator instead of production Firestore.
// The emulator does not require a real service-account credential.
const isEmulator =
  process.env['FIRESTORE_EMULATOR_HOST'] !== undefined ||
  process.env['NODE_ENV'] === 'development'

if (!admin.apps.length) {
  if (isEmulator) {
    // Emulator mode: only projectId is needed; no real credentials required.
    // FIREBASE_PROJECT_ID must be set in .env (see .env.example).
    const projectId = process.env['FIREBASE_PROJECT_ID']
    if (!projectId) throw new Error('FIREBASE_PROJECT_ID env var is required')
    admin.initializeApp({ projectId })
  } else {
    // Production mode: all credentials must be supplied via environment variables.
    // See code/api/.env.example for the required variable names.
    //
    // Note on FIREBASE_PRIVATE_KEY: Firebase encodes the private key with literal
    // \n sequences in the env var. These must be converted to real newlines (\n)
    // before the JWT library can parse the PEM certificate. This is standard
    // practice — no secret value is hardcoded here.
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

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
