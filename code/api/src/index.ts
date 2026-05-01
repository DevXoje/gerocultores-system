/**
 * Cloud Functions entry point — Express app wrapped as Firebase HTTP Function.
 *
 * Deployment:
 *   firebase deploy --only functions
 *
 * Local testing with emulators:
 *   firebase emulators:start --only functions
 *   (No código aquí cambia — el entry point se importa desde app.ts que ya tiene toda la lógica)
 *
 * Production (Cloud Functions):
 *   - Admin SDK usa Application Default Credentials (ADC) del service account
 *     asignado a la función. No requiere FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.
 *   - USE_FIREBASE_EMULATORS debe ser 'false' o indefinido en producción.
 */

import { onRequest } from 'firebase-functions/v1/https'
import app from './app'

// En Cloud Functions, el puerto lo maneja la plataforma — app.listen() nunca se ejecuta.
// Envolvemos el Express app como una Cloud Function HTTP.
export const api = onRequest(app)
