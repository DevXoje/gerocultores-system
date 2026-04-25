/**
 * Firestore Security Rules — Notificaciones collection tests
 * US-08: Recibir notificaciones de alertas críticas
 *
 * Requires Firebase Emulator running on localhost:18080
 * Set FIRESTORE_EMULATOR_HOST=localhost:18080 before running.
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';

const PROJECT_ID = 'demo-test';
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host: 'localhost',
      port: 18080,
    },
  });
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

afterEach(async () => {
  if (testEnv) await testEnv.clearFirestore();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authedDb(uid, rol) {
  return testEnv.authenticatedContext(uid, { rol }).firestore();
}

function unauthDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ─── /notificaciones/{notifId} ───────────────────────────────────────────────

describe('Colección /notificaciones', () => {
  const OWNER_UID = 'gero-uid-001';
  const OTHER_UID = 'gero-uid-002';
  const ADMIN_UID = 'admin-uid-001';
  const NOTIF_ID = 'notif-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`notificaciones/${NOTIF_ID}`).set({
        usuarioId: OWNER_UID,
        tipo: 'tarea_proxima',
        titulo: 'Tarea próxima',
        mensaje: 'Administrar medicación en 15 min',
        leida: false,
        referenciaId: 'tarea-001',
        referenciaModelo: 'tarea',
        creadaEn: '2026-04-25T08:00:00Z',
      });
    });
  });

  // ─── READ ─────────────────────────────────────────────────────────────────

  test('gerocultor puede leer su propia notificación', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(db.doc(`notificaciones/${NOTIF_ID}`).get());
  });

  test('gerocultor NO puede leer notificación de otro usuario', async () => {
    const db = authedDb(OTHER_UID, 'gerocultor');
    await assertFails(db.doc(`notificaciones/${NOTIF_ID}`).get());
  });

  test('admin puede leer cualquier notificación', async () => {
    const db = authedDb(ADMIN_UID, 'admin');
    await assertSucceeds(db.doc(`notificaciones/${NOTIF_ID}`).get());
  });

  test('usuario no autenticado NO puede leer notificaciones', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`notificaciones/${NOTIF_ID}`).get());
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  test('gerocultor puede marcar su propia notificación como leída (sólo campo leida)', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(
      db.doc(`notificaciones/${NOTIF_ID}`).update({ leida: true }),
    );
  });

  test('gerocultor NO puede actualizar campo distinto a leida', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(
      db.doc(`notificaciones/${NOTIF_ID}`).update({ mensaje: 'Modificado' }),
    );
  });

  test('gerocultor NO puede marcar notificación de otro usuario como leída', async () => {
    const db = authedDb(OTHER_UID, 'gerocultor');
    await assertFails(
      db.doc(`notificaciones/${NOTIF_ID}`).update({ leida: true }),
    );
  });

  // ─── CREATE ───────────────────────────────────────────────────────────────

  test('gerocultor NO puede crear notificaciones (sólo servidor)', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(
      db.doc('notificaciones/nueva-notif').set({
        usuarioId: OWNER_UID,
        tipo: 'alerta_critica',
        titulo: 'Test',
        mensaje: 'Test message',
        leida: false,
        creadaEn: '2026-04-25T09:00:00Z',
      }),
    );
  });

  test('admin NO puede crear notificaciones desde cliente (sólo servidor)', async () => {
    const db = authedDb(ADMIN_UID, 'admin');
    await assertFails(
      db.doc('notificaciones/admin-notif').set({
        usuarioId: ADMIN_UID,
        tipo: 'alerta_critica',
        titulo: 'Admin test',
        mensaje: 'Test message',
        leida: false,
        creadaEn: '2026-04-25T09:00:00Z',
      }),
    );
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  test('nadie puede eliminar notificaciones', async () => {
    const db = authedDb(ADMIN_UID, 'admin');
    await assertFails(db.doc(`notificaciones/${NOTIF_ID}`).delete());
  });
});
