# Test Plan — US-10: Gestión de cuentas de usuario (admin)

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-10 — Como admin, quiero gestionar las cuentas de usuario (crear, asignar rol, activar/desactivar), para controlar quién tiene acceso al sistema y con qué permisos.

---

## Scope

**Cubre**:
- Listado de todos los usuarios del sistema (email, displayName, role, disabled)
- Creación de nuevos usuarios (email + password + displayName + role)
- Cambio de rol de un usuario existente (`admin` ↔ `gerocultor`)
- Desactivación/activación de una cuenta de usuario
- Control de acceso: solo usuarios con rol `admin` pueden acceder a estas operaciones
- Rechazo de requests sin token o con token de usuario no-admin

**No cubre (out of scope)**:
- Eliminación permanente de usuarios (fuera del MVP)
- Recuperación de contraseña (fuera del MVP)
- Paginación del listado (no requerida en Sprint-1)

**Stack implicado**:
- Backend: Express API + Firebase Admin SDK (`listUsers`, `createUser`, `setCustomUserClaims`, `updateUser`)
- Frontend: Vue 3 + `useUsers` composable + `UsersView.vue`
- Middleware: `verifyAuth` + `requireRole('admin')`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en 9099, Firestore en 8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test en el emulador:
  - `admin@example.com` / `Test1234!` / rol: `admin`
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor`

---

## Test Cases

### TC-01: Listado de usuarios — admin autenticado obtiene lista completa

- **Preconditions**: Token válido de usuario con rol `admin`.
- **Steps**:
  1. `GET /api/admin/users` con `Authorization: Bearer <admin-token>`.
- **Expected Result**:
  - HTTP 200.
  - Array de usuarios con campos `uid`, `email`, `displayName`, `role`, `disabled`.
  - Todos los usuarios del emulador aparecen en la respuesta.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-02: Listado de usuarios — gerocultor recibe 403

- **Preconditions**: Token válido de usuario con rol `gerocultor`.
- **Steps**:
  1. `GET /api/admin/users` con token de gerocultor.
- **Expected Result**:
  - HTTP 403.
  - Body: `{ "error": "Forbidden" }` o similar.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-03: Listado de usuarios — sin token recibe 401

- **Preconditions**: Ninguna.
- **Steps**:
  1. `GET /api/admin/users` sin cabecera `Authorization`.
- **Expected Result**:
  - HTTP 401.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-04: Creación de usuario — admin crea nuevo gerocultor

- **Preconditions**: Token válido de admin.
- **Steps**:
  1. `POST /api/admin/users` con body:
     ```json
     { "email": "nuevo@example.com", "password": "Test1234!", "displayName": "Nuevo Gerocultor", "role": "gerocultor" }
     ```
- **Expected Result**:
  - HTTP 201.
  - Body contiene `uid` del nuevo usuario.
  - El usuario aparece en Firebase Auth del emulador.
  - Custom claim `role: 'gerocultor'` asignado.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-05: Creación de usuario — email duplicado retorna 409

- **Preconditions**: Token válido de admin. Email `gerocultor@example.com` ya existe.
- **Steps**:
  1. `POST /api/admin/users` con email `gerocultor@example.com`.
- **Expected Result**:
  - HTTP 409 o 400.
  - Mensaje de error indicando que el email ya está en uso.
- **Type**: unit (Vitest + supertest)
- **Priority**: medium

---

### TC-06: Creación de usuario — rol inválido retorna 400

- **Preconditions**: Token válido de admin.
- **Steps**:
  1. `POST /api/admin/users` con `"role": "coordinador"`.
- **Expected Result**:
  - HTTP 400.
  - Error de validación indicando rol no permitido.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-07: Cambio de rol — admin cambia gerocultor a admin

- **Preconditions**: Token válido de admin. Usuario `gerocultor@example.com` con rol `gerocultor`.
- **Steps**:
  1. `PATCH /api/admin/users/:uid/role` con `{ "role": "admin" }`.
- **Expected Result**:
  - HTTP 200.
  - Custom claim del usuario actualizado a `role: 'admin'`.
- **Type**: unit (Vitest + supertest)
- **Priority**: medium

---

### TC-08: Desactivación de usuario — admin desactiva una cuenta

- **Preconditions**: Token válido de admin. Usuario `gerocultor@example.com` activo.
- **Steps**:
  1. `PATCH /api/admin/users/:uid/disable` con `{ "disabled": true }`.
- **Expected Result**:
  - HTTP 200.
  - El usuario queda con `disabled: true` en Firebase Auth.
  - El usuario desactivado no puede autenticarse.
- **Type**: unit (Vitest + supertest)
- **Priority**: high

---

### TC-09: UsersView — muestra lista de usuarios al cargar

- **Preconditions**: Admin autenticado en la app. API devuelve lista de usuarios.
- **Steps**:
  1. Navegar a la vista de gestión de usuarios (`/admin/users`).
- **Expected Result**:
  - La tabla/lista muestra al menos un usuario.
  - Cada fila muestra email, displayName, role y estado (activo/desactivado).
- **Type**: unit (Vitest + Vue Test Utils) — mock de `useUsers`
- **Priority**: high

---

### TC-10: UsersView — estado de carga durante fetch

- **Preconditions**: Admin autenticado. API tarda en responder.
- **Steps**:
  1. Navegar a `/admin/users` con fetch en curso.
- **Expected Result**:
  - Se muestra un indicador de carga (spinner o skeleton).
  - La lista no aparece hasta que el fetch completa.
- **Type**: unit (Vitest + Vue Test Utils)
- **Priority**: medium

---

### TC-11: UsersView — estado de error si la API falla

- **Preconditions**: Admin autenticado. API devuelve 500.
- **Steps**:
  1. Navegar a `/admin/users` con API caída.
- **Expected Result**:
  - Se muestra un mensaje de error.
  - No se muestra lista vacía sin contexto.
- **Type**: unit (Vitest + Vue Test Utils)
- **Priority**: medium

---

## Unit Tests (Vitest)

### `requireRole` middleware

```typescript
// middleware/requireRole.spec.ts
describe('requireRole', () => {
  it('should call next() when user has required role')
  it('should return 403 when user has different role')
  it('should return 401 when req.user is not set')
})
```

### `UsersController`

```typescript
// controllers/users.controller.spec.ts
describe('UsersController', () => {
  it('listUsers — returns 200 with user array')
  it('createUser — returns 201 with uid on success')
  it('createUser — returns 400 on invalid role')
  it('updateUserRole — returns 200 on success')
  it('disableUser — returns 200 on success')
})
```

### `useUsers` composable

```typescript
// composables/useUsers.spec.ts
describe('useUsers', () => {
  it('fetches users on mount and sets users list')
  it('sets loading true during fetch')
  it('sets error on fetch failure')
  it('createUser calls API and refreshes list')
  it('updateRole calls PATCH endpoint')
  it('disableUser calls PATCH endpoint')
})
```

### `UsersView` component

```typescript
// views/UsersView.spec.ts
describe('UsersView', () => {
  it('renders user list when data is loaded')
  it('shows loading state during fetch')
  it('shows error message on failure')
  it('opens create user form on button click')
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Admin puede listar todos los usuarios | TC-01, TC-09 | ✅ Implemented |
| CA-2: No-admin recibe 403 | TC-02, TC-03 | ✅ Implemented |
| CA-3: Admin puede crear usuario con rol válido | TC-04, TC-05, TC-06 | ✅ Implemented |
| CA-4: Admin puede cambiar el rol de un usuario | TC-07 | ✅ Implemented |
| CA-5: Admin puede desactivar/activar una cuenta | TC-08 | ✅ Implemented |
| CA-6: UI muestra estado de carga y error | TC-10, TC-11 | ✅ Implemented |

---

## Automation Notes

- **Unit tests** (Vitest): co-located `.spec.ts` junto a cada fichero
- **E2E tests** (Playwright): `code/frontend/tests/e2e/admin-users.spec.ts` — pendiente Sprint-2
- **Firebase Emulator**: todos los tests de integración usan el emulador, nunca producción

---

## Meta

- **User Story**: US-10
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-18
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
