/**
 * Firestore Security Rules — shifts (turnos) collection tests
 * US-11: Resumen de fin de turno
 *
 * Collection name in Firestore is 'shifts' (from collections.ts: turnos: 'shifts').
 * Requires Firebase Emulator running on localhost:18080.
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
      port: 8080,
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

// ─── /shifts/{turnoId} ───────────────────────────────────────────────────────

describe('Colección /shifts (turnos)', () => {
  const OWNER_UID = 'gero-uid-001';
  const OTHER_UID = 'gero-uid-002';
  const ADMIN_UID = 'admin-uid-001';
  const TURNO_ID = 'shift-001';

  const BASE_TURNO = {
    usuarioId: OWNER_UID,
    tipoTurno: 'manyana',
    inicio: '2026-04-25T06:00:00Z',
    fin: null,
    resumenTraspaso: null,
  };

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`shifts/${TURNO_ID}`).set(BASE_TURNO);
    });
  });

  // ─── READ ─────────────────────────────────────────────────────────────────

  test('gerocultor puede leer su propio turno', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(db.doc(`shifts/${TURNO_ID}`).get());
  });

  test('gerocultor NO puede leer turno de otro usuario', async () => {
    const db = authedDb(OTHER_UID, 'gerocultor');
    await assertFails(db.doc(`shifts/${TURNO_ID}`).get());
  });

  test('admin puede leer cualquier turno', async () => {
    const db = authedDb(ADMIN_UID, 'admin');
    await assertSucceeds(db.doc(`shifts/${TURNO_ID}`).get());
  });

  test('usuario no autenticado NO puede leer turnos', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`shifts/${TURNO_ID}`).get());
  });

  // ─── CREATE ───────────────────────────────────────────────────────────────

  test('gerocultor puede crear turno como propietario', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(
      db.doc('shifts/new-shift').set({
        usuarioId: OWNER_UID,
        tipoTurno: 'tarde',
        inicio: '2026-04-25T14:00:00Z',
        fin: null,
        resumenTraspaso: null,
      }),
    );
  });

  test('gerocultor NO puede crear turno con usuarioId de otro usuario', async () => {
    const db = authedDb(OTHER_UID, 'gerocultor');
    await assertFails(
      db.doc('shifts/spoofed-shift').set({
        usuarioId: OWNER_UID, // trying to spoof as OWNER
        tipoTurno: 'noche',
        inicio: '2026-04-25T22:00:00Z',
        fin: null,
        resumenTraspaso: null,
      }),
    );
  });

  test('usuario no autenticado NO puede crear turno', async () => {
    const db = unauthDb();
    await assertFails(
      db.doc('shifts/unauth-shift').set({
        usuarioId: 'anyone',
        tipoTurno: 'manyana',
        inicio: '2026-04-25T06:00:00Z',
        fin: null,
        resumenTraspaso: null,
      }),
    );
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  test('gerocultor puede cerrar (actualizar) su turno abierto', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(
      db.doc(`shifts/${TURNO_ID}`).update({
        fin: '2026-04-25T14:00:00Z',
        resumenTraspaso: 'Paciente 3 sin incidencias',
      }),
    );
  });

  test('gerocultor NO puede actualizar turno de otro usuario', async () => {
    const db = authedDb(OTHER_UID, 'gerocultor');
    await assertFails(
      db.doc(`shifts/${TURNO_ID}`).update({ fin: '2026-04-25T14:00:00Z' }),
    );
  });

  test('gerocultor NO puede actualizar un turno ya cerrado (fin != null)', async () => {
    // Set up a CLOSED turno
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc('shifts/closed-shift').set({
        ...BASE_TURNO,
        fin: '2026-04-25T14:00:00Z',
        resumenTraspaso: 'Cerrado',
      });
    });

    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(
      db.doc('shifts/closed-shift').update({ resumenTraspaso: 'Modificado' }),
    );
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  test('nadie puede eliminar turnos', async () => {
    const db = authedDb(ADMIN_UID, 'admin');
    await assertFails(db.doc(`shifts/${TURNO_ID}`).delete());
  });

  test('el propietario tampoco puede eliminar su turno', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(db.doc(`shifts/${TURNO_ID}`).delete());
  });
});
