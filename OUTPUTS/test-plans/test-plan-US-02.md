# Test Plan — US-02: Control de acceso por rol

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-02 — Como administrador, quiero que cada usuario solo acceda a las funciones y datos que corresponden a su rol, para proteger la privacidad de los residentes y mantener la integridad del sistema.

---

## Scope

**Cubre**:
- Vue Router guards: bloqueo de rutas protegidas según `rol` del Custom Claim del token Firebase Auth
- Redirección a `/403` o `/agenda` cuando un gerocultor intenta acceder a `/admin/usuarios`
- Middleware Express `verifyAuth`: validación del JWT y retorno de 401/403 según rol
- Firestore Security Rules (RBAC): acceso a colecciones `residentes`, `tareas`, `usuarios`, `incidencias`
- Acceso correcto de coordinador a todos los residentes (vía API y Firestore)
- Restricción de gerocultor a residentes no asignados (Firestore Rules + API)
- Tests de reglas Firestore con Firebase Emulator Suite y `@firebase/rules-unit-testing`

**No cubre (out of scope)**:
- Autenticación en sí (inicio/cierre de sesión) — cubierto en US-01
- Creación y gestión de usuarios/roles — cubierto en US-10
- Lógica de asignación de residentes a gerocultores — cubierto en US-09/US-10
- Notificaciones (US-08)

**Stack implicado**: Vue 3 + Vue Router (guards) | Express + middleware `verifyAuth` + Firebase Admin SDK | Firebase Auth Custom Claims (`rol`) | Firestore Security Rules | Firebase Emulator Suite (Auth:9099, Firestore:8080) | `@firebase/rules-unit-testing`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099, Firestore en 8080 / 18080)
- Usuarios de test creados en el emulador con Custom Claims configurados:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-01`
  - Email: `test.coordinador@example.com` / Password: `Test1234!` / Rol: `coordinador` / UID: `uid-coordinador-01`
  - Email: `test.admin@example.com` / Password: `Test1234!` / Rol: `administrador` / UID: `uid-admin-01`
- Documentos de Firestore seed en el emulador:
  - `/residentes/res-001` con datos de un residente **asignado** al gerocultor (`userId: uid-gerocultor-01`)
  - `/residentes/res-002` con datos de un residente **no asignado** al gerocultor (`userId: uid-coordinador-01`)
  - `/tareas/tarea-001` con `userId: uid-gerocultor-01`
  - `/tareas/tarea-002` con `userId: uid-coordinador-01`
  - `/usuarios/uid-gerocultor-01` con datos del gerocultor
- Frontend corriendo: `cd frontend && npm run dev` (http://localhost:5173)
- API Express corriendo con emulador como backend

---

## Test Cases

### TC-01: Gerocultor intenta acceder a `/admin/usuarios` — redirigido por Router guard

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Navegar directamente a `http://localhost:5173/admin/usuarios` por la barra de direcciones.
- **Steps**:
  1. Autenticar con `test.gerocultor@example.com` / `Test1234!`.
  2. Modificar la URL en el navegador a `http://localhost:5173/admin/usuarios`.
  3. Observar el resultado de la navegación.
- **Expected Result**:
  - El Vue Router guard detecta que `rol === 'gerocultor'` y la ruta está protegida para `administrador`.
  - El usuario es redirigido a `/403` o a `/agenda` (según la configuración del guard).
  - La vista de administración de usuarios **NO** se renderiza en ningún momento.
  - No se producen peticiones a la API con datos de usuarios del sistema.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-02: Coordinador intenta acceder a `/admin/usuarios` — redirigido por Router guard

- **Preconditions**: Usuario `test.coordinador@example.com` autenticado. Navegar directamente a `/admin/usuarios`.
- **Steps**:
  1. Autenticar con `test.coordinador@example.com` / `Test1234!`.
  2. Modificar la URL en el navegador a `http://localhost:5173/admin/usuarios`.
  3. Observar el resultado de la navegación.
- **Expected Result**:
  - El Vue Router guard detecta que `rol === 'coordinador'` y la ruta está reservada para `administrador`.
  - El usuario es redirigido a `/403` o a su vista correspondiente.
  - La vista de administración de usuarios **NO** se renderiza.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-03: Petición a API sin token — retorna HTTP 401

- **Preconditions**: Cliente sin token de autenticación (sesión cerrada o petición curl sin cabecera).
- **Steps**:
  1. Enviar una petición GET a `http://localhost:3000/api/residents` **sin** cabecera `Authorization`.
  2. Observar el código de respuesta HTTP y el body.
- **Expected Result**:
  - La respuesta es `HTTP 401 Unauthorized`.
  - El body incluye un mensaje indicando ausencia de token (ej. `{ "error": "Token no provisto o inválido" }`).
  - No se devuelven datos de residentes.
- **Type**: integration (supertest / curl)
- **Priority**: high

---

### TC-04: Petición a endpoint restringido con token de rol incorrecto — retorna HTTP 403

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado con token válido. El endpoint `/api/admin/usuarios` está restringido a `administrador`.
- **Steps**:
  1. Obtener el ID token del gerocultor: `await firebase.auth().currentUser.getIdToken()`.
  2. Enviar GET a `http://localhost:3000/api/admin/usuarios` con cabecera `Authorization: Bearer <token>`.
  3. Observar el código de respuesta HTTP y el body.
- **Expected Result**:
  - El middleware `verifyAuth` verifica el JWT y detecta que `token.rol !== 'administrador'`.
  - La respuesta es `HTTP 403 Forbidden`.
  - El body incluye un mensaje de acceso denegado (ej. `{ "error": "Acceso denegado: rol insuficiente" }`).
  - No se devuelven datos del sistema.
- **Type**: integration (supertest)
- **Priority**: high

---

### TC-05: Coordinador puede ver todos los residentes vía API

- **Preconditions**: Usuario `test.coordinador@example.com` autenticado. Existen documentos en `/residentes` (res-001 y res-002).
- **Steps**:
  1. Obtener el ID token del coordinador.
  2. Enviar GET a `http://localhost:3000/api/residents` con cabecera `Authorization: Bearer <token>`.
  3. Observar el código de respuesta y el cuerpo.
- **Expected Result**:
  - La respuesta es `HTTP 200 OK`.
  - El body incluye la lista de **todos** los residentes (res-001 y res-002).
  - Los datos incluyen campos sensibles según el contrato de API (`alergias`, `medicacion`).
- **Type**: integration (supertest)
- **Priority**: high

---

### TC-06: Gerocultor NO puede leer residentes no asignados — Firestore Rule bloquea

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado con Custom Claim `rol: 'gerocultor'`. Documento `/residentes/res-002` pertenece a otro usuario.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con el contexto del gerocultor.
  2. Intentar leer `/residentes/res-002` directamente desde el cliente Firestore con las credenciales del gerocultor.
  3. Observar si la operación es permitida o denegada.
- **Expected Result**:
  - La regla `allow read: if hasAnyRole(['coordinador', 'administrador'])` deniega el acceso.
  - La operación lanza un error `FirebaseError: Missing or insufficient permissions`.
  - El gerocultor **NO** puede leer datos de residentes que no le pertenecen (la colección `residentes` requiere rol coordinador/administrador).
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-07: Coordinador puede leer todos los residentes — Firestore Rule permite

- **Preconditions**: Firebase Emulator activo. Usuario `uid-coordinador-01` autenticado con Custom Claim `rol: 'coordinador'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con el contexto del coordinador.
  2. Intentar leer `/residentes/res-001` y `/residentes/res-002`.
  3. Observar si las operaciones son permitidas.
- **Expected Result**:
  - La regla `allow read: if hasAnyRole(['coordinador', 'administrador'])` permite el acceso.
  - Ambos documentos son devueltos sin error.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-08: Gerocultor puede leer sus propias tareas — Firestore Rule permite

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado. Documento `/tareas/tarea-001` tiene `userId: 'uid-gerocultor-01'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con el contexto del gerocultor.
  2. Intentar leer `/tareas/tarea-001`.
  3. Observar si la operación es permitida.
- **Expected Result**:
  - La regla `allow read: if isResourceOwner()` permite el acceso.
  - El documento es devuelto correctamente.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: medium

---

### TC-09: Gerocultor NO puede leer tareas de otro usuario — Firestore Rule bloquea

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado. Documento `/tareas/tarea-002` tiene `userId: 'uid-coordinador-01'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con el contexto del gerocultor.
  2. Intentar leer `/tareas/tarea-002`.
  3. Observar si la operación es denegada.
- **Expected Result**:
  - La regla `allow read: if isResourceOwner() || hasAnyRole(['coordinador', 'administrador'])` deniega el acceso al gerocultor (no es `resourceOwner` ni tiene rol elevado).
  - La operación lanza `FirebaseError: Missing or insufficient permissions`.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: medium

---

### TC-10: Usuario no autenticado NO puede leer ninguna colección — Firestore Rule bloquea

- **Preconditions**: Firebase Emulator activo. Sin token de autenticación (`unauthenticatedContext`).
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` sin contexto de autenticación.
  2. Intentar leer `/residentes/res-001`, `/tareas/tarea-001`, `/usuarios/uid-gerocultor-01`.
  3. Observar si las operaciones son denegadas.
- **Expected Result**:
  - Todas las operaciones son denegadas por la función `isAuthenticated()`.
  - Cada intento lanza `FirebaseError: Missing or insufficient permissions`.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-11: Gerocultor no puede escribir en la colección de residentes — Firestore Rule bloquea

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado con Custom Claim `rol: 'gerocultor'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con el contexto del gerocultor.
  2. Intentar crear un nuevo documento en `/residentes` con `setDoc(...)`.
  3. Observar si la operación es denegada.
- **Expected Result**:
  - La regla `allow write: if hasAnyRole(['coordinador', 'administrador'])` deniega el acceso.
  - La operación lanza `FirebaseError: Missing or insufficient permissions`.
  - El gerocultor **no puede crear, modificar ni eliminar** residentes.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

## Unit Tests (Vitest)

### Router guard — `useAuthGuard` o `beforeEach` navigation guard

```typescript
// router/guards.spec.ts
describe('Vue Router RBAC guard', () => {
  it('should redirect gerocultor away from /admin/usuarios to /403', async () => {
    // Mockear useAuthStore con rol 'gerocultor'
    // Simular navegación a /admin/usuarios
    // Verificar que next() fue llamado con { path: '/403' } o { path: '/agenda' }
  })

  it('should redirect coordinador away from /admin/usuarios to /403', async () => {
    // Mockear useAuthStore con rol 'coordinador'
    // Simular navegación a /admin/usuarios
    // Verificar que next() fue llamado con redirect
  })

  it('should allow administrador to access /admin/usuarios', async () => {
    // Mockear useAuthStore con rol 'administrador'
    // Simular navegación a /admin/usuarios
    // Verificar que next() fue llamado sin redirect (next())
  })

  it('should redirect unauthenticated user to /login', async () => {
    // Mockear useAuthStore sin usuario autenticado
    // Simular navegación a /agenda
    // Verificar que next() fue llamado con { path: '/login' }
  })
})
```

### Firestore Rules — `@firebase/rules-unit-testing`

```typescript
// tests/firestore-rules/rbac.spec.ts
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gerocultores-emulator',
    firestore: {
      rules: readFileSync('code/firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('Firestore Rules — /residentes', () => {
  it('gerocultor cannot read /residentes (requires coordinador/admin)', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    await assertFails(
      db.collection('residentes').doc('res-001').get()
    )
  })

  it('coordinador can read /residentes', async () => {
    const db = testEnv
      .authenticatedContext('uid-coordinador-01', { rol: 'coordinador' })
      .firestore()
    await assertSucceeds(
      db.collection('residentes').doc('res-001').get()
    )
  })

  it('unauthenticated user cannot read /residentes', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      db.collection('residentes').doc('res-001').get()
    )
  })

  it('gerocultor cannot write to /residentes', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    await assertFails(
      db.collection('residentes').doc('res-nuevo').set({ nombre: 'Test' })
    )
  })
})

describe('Firestore Rules — /tareas', () => {
  it('gerocultor can read their own tarea (isResourceOwner)', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    // Seed: tarea-001 tiene userId = 'uid-gerocultor-01'
    await assertSucceeds(
      db.collection('tareas').doc('tarea-001').get()
    )
  })

  it('gerocultor cannot read another user\'s tarea', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    // tarea-002 tiene userId = 'uid-coordinador-01'
    await assertFails(
      db.collection('tareas').doc('tarea-002').get()
    )
  })
})
```

### Express middleware — `verifyAuth`

```typescript
// api/middleware/verifyAuth.spec.ts
import request from 'supertest'
import app from '../../app'

describe('verifyAuth middleware', () => {
  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/residents')
    expect(res.status).toBe(401)
  })

  it('should return 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/residents')
      .set('Authorization', 'Bearer token-invalido')
    expect(res.status).toBe(401)
  })

  it('should return 403 when gerocultor accesses admin endpoint', async () => {
    // Obtener token real del emulador con rol 'gerocultor'
    const gerocultorToken = await getEmulatorToken('uid-gerocultor-01', { rol: 'gerocultor' })
    const res = await request(app)
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${gerocultorToken}`)
    expect(res.status).toBe(403)
  })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Un gerocultor no puede acceder al panel de administración de usuarios | TC-01, TC-02, TC-04 (guard frontend + middleware API) | ⬜ Pending |
| CA-2: Un gerocultor solo ve los residentes que tiene asignados | TC-06, TC-11 (Firestore Rules); implícito en TC-05 contraste | ⬜ Pending |
| CA-3: Un coordinador puede ver todos los residentes y agendas | TC-05, TC-07, TC-08 | ⬜ Pending |
| CA-4: Intentar acceder a una ruta no autorizada retorna HTTP 403 | TC-04; TC-03 (→ 401 sin token) | ⬜ Pending |
| RNF-03/RNF-09: Sin token → 401; rol incorrecto → 403; Firestore Rules probadas | TC-03, TC-04, TC-06, TC-09, TC-10, TC-11 | ⬜ Pending |

---

## Automation Notes

- **Unit tests — Router guards** (Vitest + Vue Test Utils): `frontend/src/router/guards.spec.ts`
- **Unit tests — Firestore Rules** (`@firebase/rules-unit-testing`): `tests/firestore-rules/rbac.spec.ts`
  - Requieren emulador activo en localhost:8080 durante la ejecución de los tests
  - Ejecutar con: `firebase emulators:exec --only firestore "vitest run tests/firestore-rules"`
- **Integration tests — Express middleware** (Vitest + supertest): `api/middleware/verifyAuth.spec.ts`
  - Requieren Firebase Admin SDK configurado contra el emulador (`FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`)
- **E2E tests** (Playwright): `frontend/tests/e2e/rbac.spec.ts`
  - Cubren TC-01 y TC-02 (navegación con usuario real del emulador)
- **Manual only**: ninguno en este test plan — todos los casos son automatizables
- **Seed de datos**: crear un script de seed en `tests/fixtures/emulator-seed.ts` que pre-cargue usuarios y documentos de Firestore en el emulador antes de correr los tests

---

## Meta

- **User Story**: US-02
- **Requisito relacionado**: RF-02, RNF-03, RNF-09
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-07
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
