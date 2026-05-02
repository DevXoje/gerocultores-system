import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  connectAuthEmulator,
  GoogleAuthProvider,
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// Connect to emulators BEFORE setPersistence — Firebase v10+ requires emulator
// to be connected before any other Auth operation (including setPersistence).
// Calling connectAuthEmulator after setPersistence causes auth/emulator-config-failed.
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectFunctionsEmulator(functions, 'localhost', 5001)
  console.log('[firebase] Connected to emulators (Auth:9099, Firestore:8080, Functions:5001)')
}

// Persist sessions across browser closes AND page refreshes.
// Required because Firebase JS SDK v10+ defaults to browserSessionPersistence
// (tab-only), which loses the session on browser close or hard refresh.
// Must be called AFTER connectAuthEmulator (which must be before any other Auth op).
await setPersistence(auth, browserLocalPersistence)

// Google OAuth provider for registration — email+profile scopes are required
// for Firebase to return the user's email and basic profile info.
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
