/**
 * Cloud Functions entry point — Express app wrapped as Firebase HTTP Function (v2).
 *
 * Deployment:
 *   firebase deploy --only functions
 *
 * Local testing with emulators:
 *   firebase emulators:start --only functions
 *   (No código aquí cambia — el entry point se importa desde app.ts que ya tiene toda la lógica)
 *
 * Production (Cloud Functions v2):
 *   - Admin SDK usa Application Default Credentials (ADC) del service account
 *     asignado a la función. No requiere FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.
 *   - USE_FIREBASE_EMULATORS debe ser 'false' o indefinido en producción.
 *   - La región 'europe-west1' es coherente con ADR-04b (RGPD).
 */

import { onRequest } from 'firebase-functions/v2/https'
import app from './app'

// Cloud Functions v2: opciones de configuración para rendimiento y control de costos.
// region: europe-west1 (Bélgica) — coherente con Firestore y ADR-04b (RGPD).
// minInstances: 0 — escala a cero en horas de baja actividad.
// maxInstances: 10 — límite máximo para controlar costos.
// cors: true — la función maneja CORS directamente.
export const api = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10,
  },
  app,
)