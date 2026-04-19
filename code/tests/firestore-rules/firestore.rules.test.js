/**
 * Firestore Security Rules Unit Tests
 * US-02: Role-based access control
 *
 * Requires Firebase Emulator running on localhost:8080
 * Set FIRESTORE_EMULATOR_HOST=localhost:8080 before running.
 */

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

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

function authedDb(uid, rol) {
  return testEnv.authenticatedContext(uid, { rol }).firestore();
}

function unauthDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ─── /usuarios/{userId} ──────────────────────────────────────────────────────

describe('Colección /usuarios', () => {
  const UID = 'user-123';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`usuarios/${UID}`).set({ nombre: 'Juan', rol: 'gerocultor' });
    });
  });

  test('owner puede leer su propio documento', async () => {
    const db = authedDb(UID, 'gerocultor');
    await assertSucceeds(db.doc(`usuarios/${UID}`).get());
  });

  test('otro usuario NO puede leer el documento de un tercero', async () => {
    const db = authedDb('other-user', 'gerocultor');
    await assertFails(db.doc(`usuarios/${UID}`).get());
  });

  test('usuario no autenticado NO puede leer', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`usuarios/${UID}`).get());
  });

  test('admin puede escribir un documento de usuario', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`usuarios/${UID}`).set({ nombre: 'María', rol: 'gerocultor' }));
  });

  test('gerocultor NO puede escribir documentos de usuario', async () => {
    const db = authedDb(UID, 'gerocultor');
    await assertFails(db.doc(`usuarios/${UID}`).set({ nombre: 'Hack' }));
  });
});

// ─── /tareas/{tareaId} ───────────────────────────────────────────────────────

describe('Colección /tareas', () => {
  const TAREA_ID = 'tarea-001';
  const OWNER_UID = 'gero-uid';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`tareas/${TAREA_ID}`).set({
        titulo: 'Baño matutino',
        userId: OWNER_UID,
      });
    });
  });

  test('gerocultor owner puede leer su tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(db.doc(`tareas/${TAREA_ID}`).get());
  });

  test('admin puede leer cualquier tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`tareas/${TAREA_ID}`).get());
  });

  test('admin puede leer cualquier tarea', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`tareas/${TAREA_ID}`).get());
  });

  test('otro gerocultor NO puede leer tarea ajena', async () => {
    const db = authedDb('other-gero', 'gerocultor');
    await assertFails(db.doc(`tareas/${TAREA_ID}`).get());
  });

  test('gerocultor puede crear una tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(db.doc('tareas/nueva-tarea').set({ titulo: 'Nueva', userId: OWNER_UID }));
  });

  test('usuario no autenticado NO puede crear tarea', async () => {
    const db = unauthDb();
    await assertFails(db.doc('tareas/hack-tarea').set({ titulo: 'Hack' }));
  });

  test('gerocultor owner puede actualizar su tarea', async () => {
    const db = authedDb(OWNER_UID, 'gerocultor');
    await assertSucceeds(db.doc(`tareas/${TAREA_ID}`).update({ completada: true }));
  });
});

// ─── /residentes/{residenteId} ───────────────────────────────────────────────

describe('Colección /residentes', () => {
  const RES_ID = 'residente-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`residentes/${RES_ID}`).set({ nombre: 'Ana López' });
    });
  });

  test('admin puede leer residente', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`residentes/${RES_ID}`).get());
  });

  test('admin puede leer residente', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`residentes/${RES_ID}`).get());
  });

  test('gerocultor NO puede leer residente', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`residentes/${RES_ID}`).get());
  });

  test('usuario no autenticado NO puede leer residente', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`residentes/${RES_ID}`).get());
  });

  test('admin puede escribir residente', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`residentes/${RES_ID}`).set({ nombre: 'Ana López Actualizada' }));
  });

  test('gerocultor NO puede escribir residente', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertFails(db.doc(`residentes/${RES_ID}`).set({ nombre: 'Hack' }));
  });
});

// ─── /incidencias/{incidenciaId} ─────────────────────────────────────────────

describe('Colección /incidencias', () => {
  const INC_ID = 'incidencia-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`incidencias/${INC_ID}`).set({
        descripcion: 'Caída en pasillo',
        userId: 'gero-uid',
      });
    });
  });

  test('gerocultor autenticado puede leer incidencias', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertSucceeds(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('admin puede leer incidencias', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('usuario no autenticado NO puede leer incidencias', async () => {
    const db = unauthDb();
    await assertFails(db.doc(`incidencias/${INC_ID}`).get());
  });

  test('gerocultor puede crear una incidencia', async () => {
    const db = authedDb('gero-uid', 'gerocultor');
    await assertSucceeds(
      db.doc('incidencias/nueva-inc').set({ descripcion: 'Nueva', userId: 'gero-uid' }),
    );
  });

  test('admin puede crear una incidencia', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(
      db.doc('incidencias/inc-coord').set({ descripcion: 'Coord inc', userId: 'coord-uid' }),
    );
  });

  test('admin puede crear una incidencia', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertSucceeds(
      db.doc('incidencias/inc-admin').set({ descripcion: 'Admin inc', userId: 'admin-uid' }),
    );
  });

  test('NO se puede actualizar una incidencia (inmutable)', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`incidencias/${INC_ID}`).update({ descripcion: 'Modificada' }));
  });

  test('NO se puede eliminar una incidencia (inmutable)', async () => {
    const db = authedDb('admin-uid', 'admin');
    await assertFails(db.doc(`incidencias/${INC_ID}`).delete());
  });
});
