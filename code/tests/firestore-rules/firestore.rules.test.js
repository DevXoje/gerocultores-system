/**
 * Firestore Security Rules Unit Tests
 * US-02: Role-based access control
 *
 * ALL OPERATIONS ARE DENIED — rules set to allow read, write: if false
 * Requires Firebase Emulator running on localhost:18080
 * Set FIRESTORE_EMULATOR_HOST=localhost:18080 before running.
 */

import {
  initializeTestEnvironment,
  assertFails,
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

// ─── Helper: get authenticated Firestore context ────────────────────────────

function authedDb(uid, role) {
  return testEnv.authenticatedContext(uid, { role }).firestore();
}

function unauthDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ─── /users/{userId} ──────────────────────────────────────────────────────

describe('Colección /users', () => {
  const UID = 'user-123';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`users/${UID}`).set({ nombre: 'Juan', rol: 'gerocultor' });
    });
  });

  test('admin NO puede leer documento de usuario', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`users/${UID}`).get());
  });

  test('gerocultor NO puede leer documento de usuario', async () => {
    const db = authedDb(UID, 'gerocultor');
    await assertFails(db.doc(`users/${UID}`).get());
  });

  test('usuario no autenticado NO puede leer documento de usuario', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`users/${UID}`).get());
  });

  test('admin NO puede escribir documento de usuario', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`users/${UID}`).set({ nombre: 'María', rol: 'gerocultor' }));
  });

  test('gerocultor NO puede escribir documento de usuario', async () => {
    const db = authedDb(UID, 'gerocultor');
    await assertFails(db.doc(`users/${UID}`).set({ nombre: 'Hack' }));
  });

  test('usuario no autenticado NO puede escribir documento de usuario', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`users/${UID}`).set({ nombre: 'Hack' }));
  });
});

// ─── /tasks/{tareaId} ───────────────────────────────────────────────────────

describe('Colección /tasks', () => {
  const TAREA_ID = 'tarea-001';
  const OWNER_UID = 'gero-uid';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`tasks/${TAREA_ID}`).set({
        titulo: 'Baño matutino',
        usuarioId: OWNER_UID,
      });
    });
  });

  test('gerocultor NO puede leer su propia tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).get());
  });

  test('admin NO puede leer tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).get());
  });

  test('otro gerocultor NO puede leer tarea ajena', async () => {
    const db = authedDb('other-gero', 'gerocultor');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).get());
  });

  test('usuario no autenticado NO puede leer tarea', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`tasks/${TAREA_ID}`).get());
  });

  test('gerocultor NO puede crear tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(db.doc('tasks/nueva-tarea').set({ titulo: 'Nueva', usuarioId: OWNER_UID }));
  });

  test('admin NO puede crear tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc('tasks/nueva-tarea').set({ titulo: 'Nueva', usuarioId: OWNER_UID }));
  });

  test('usuario no autenticado NO puede crear tarea', async () => {
    const db = unauthDb();
    await assertFails(db.doc('tasks/hack-tarea').set({ titulo: 'Hack' }));
  });

  test('gerocultor NO puede actualizar su tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).update({ completada: true }));
  });

  test('admin NO puede actualizar tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).update({ completada: true }));
  });

  test('gerocultor NO puede eliminar tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).delete());
  });

  test('admin NO puede eliminar tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`tasks/${TAREA_ID}`).delete());
  });
});

// ─── /residents/{residenteId} ───────────────────────────────────────────────

describe('Colección /residents', () => {
  const RES_ID = 'residente-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`residents/${RES_ID}`).set({
        nombre: 'Ana López',
        usuarioId: 'gero-uid',
      });
    });
  });

  test('admin NO puede leer residente', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`residents/${RES_ID}`).get());
  });

  test('gerocultor owner NO puede leer residente', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`residents/${RES_ID}`).get());
  });

  test('otro gerocultor NO puede leer residente', async () => {
    const db = authedDb('other-gero', 'gerocultor');
    await assertFails(db.doc(`residents/${RES_ID}`).get());
  });

  test('usuario no autenticado NO puede leer residente', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`residents/${RES_ID}`).get());
  });

  test('admin NO puede escribir residente', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`residents/${RES_ID}`).set({ nombre: 'Ana López Actualizada' }));
  });

  test('gerocultor NO puede escribir residente', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`residents/${RES_ID}`).set({ nombre: 'Hack' }));
  });

  test('usuario no autenticado NO puede escribir residente', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`residents/${RES_ID}`).set({ nombre: 'Hack' }));
  });
});

// ─── /incidencias/{incidenciaId} ─────────────────────────────────────────────

describe('Colección /incidencias', () => {
  const INC_ID = 'incidencia-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`incidencias/${INC_ID}`).set({
        descripcion: 'Caída en pasillo',
        usuarioId: 'gero-uid',
      });
    });
  });

  test('gerocultor NO puede leer incidencias', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('admin NO puede leer incidencias', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('usuario no autenticado NO puede leer incidencias', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('gerocultor NO puede crear incidencia', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(
      db.doc('incidencias/nueva-inc').set({ descripcion: 'Nueva', usuarioId: 'gero-uid' }),
    );
  });

  test('admin NO puede crear incidencia', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(
      db.doc('incidencias/inc-admin').set({ descripcion: 'Admin inc', usuarioId: 'admin-uid' }),
    );
  });

  test('usuario no autenticado NO puede crear incidencia', async () => {
    const db = unauthDb();
    await assertFails(
      db.doc('incidencias/inc-unauth').set({ descripcion: 'Unauth inc' }),
    );
  });

  test('gerocultor NO puede actualizar incidencia', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`incidencias/${INC_ID}`).update({ descripcion: 'Modificada' }));
  });

  test('admin NO puede actualizar incidencia', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`incidencias/${INC_ID}`).update({ descripcion: 'Modificada' }));
  });

  test('gerocultor NO puede eliminar incidencia', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`incidencias/${INC_ID}`).delete());
  });

  test('admin NO puede eliminar incidencia', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`incidencias/${INC_ID}`).delete());
  });
});