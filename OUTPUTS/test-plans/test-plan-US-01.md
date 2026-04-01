# Test Plan — US-01: Inicio de sesión

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-01 — Como gerocultor o coordinador, quiero iniciar sesión con mis credenciales, para acceder a mi agenda y los datos de los residentes de forma segura.

---

## Scope

**Cubre**:
- Renderizado y validación del formulario de login (Vue component + composable)
- Autenticación con Firebase Auth (email/password)
- Manejo de errores de credenciales incorrectas (sin revelar qué campo falla)
- Redirección al dashboard/agenda tras login exitoso
- Persistencia de sesión durante la sesión del navegador (gestionada por Firebase Auth SDK)
- Cierre de sesión e invalidación del token

**No cubre (out of scope)**:
- Registro de nuevos usuarios (solo admin puede crear cuentas — US-10)
- Recuperación de contraseña (fuera del MVP)
- Notificaciones push (US-08)
- Rol-based routing más allá de la redirección post-login (cubierto en US-02)

**Stack implicado**: Vue 3 + Firebase Auth SDK (cliente) + Express API `/auth/logout` + Firebase Admin SDK

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099)
- Usuario de test creado en el emulador:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor`
  - Email: `test.coordinador@example.com` / Password: `Test1234!` / Rol: `coordinador`
- Frontend corriendo: `cd frontend && npm run dev` (http://localhost:5173)
- La ruta `/login` es accesible sin autenticación
- La ruta `/agenda` requiere autenticación (redirect guard en Vue Router)

---

## Test Cases

### TC-01: Formulario de login muestra los campos correctos

- **Preconditions**: Usuario no autenticado. Navegar a `/login`.
- **Steps**:
  1. Abrir la URL `http://localhost:5173/login`.
  2. Observar el formulario renderizado.
- **Expected Result**:
  - Campo de email (`type="email"`) visible y enfocable.
  - Campo de contraseña (`type="password"`) visible con ocultación del texto.
  - Botón "Iniciar sesión" visible y activo.
  - No hay información de otros usuarios ni datos pre-rellenados.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-02: Login exitoso — gerocultor es redirigido a su agenda

- **Preconditions**: Usuario no autenticado en `/login`. Cuenta `test.gerocultor@example.com` activa en el emulador.
- **Steps**:
  1. Introducir email: `test.gerocultor@example.com`.
  2. Introducir contraseña: `Test1234!`.
  3. Pulsar "Iniciar sesión".
- **Expected Result**:
  - El usuario es redirigido a `/agenda` (o `/dashboard`) en menos de 3 segundos.
  - La URL cambia a la ruta post-login.
  - Se muestra el nombre del usuario autenticado en la UI.
  - No se muestra ningún mensaje de error.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-03: Login exitoso — coordinador es redirigido correctamente

- **Preconditions**: Usuario no autenticado en `/login`. Cuenta `test.coordinador@example.com` activa.
- **Steps**:
  1. Introducir email: `test.coordinador@example.com`.
  2. Introducir contraseña: `Test1234!`.
  3. Pulsar "Iniciar sesión".
- **Expected Result**:
  - El usuario es redirigido a la vista de coordinador (o agenda según diseño).
  - Custom claim `rol: 'coordinador'` disponible en el token.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

### TC-04: Credenciales incorrectas muestran error genérico (sin revelar qué campo falla)

- **Preconditions**: Usuario no autenticado en `/login`.
- **Steps**:
  1. Introducir email: `test.gerocultor@example.com`.
  2. Introducir contraseña incorrecta: `ContraseñaWrong!`.
  3. Pulsar "Iniciar sesión".
- **Expected Result**:
  - Se muestra un mensaje de error tipo "Credenciales incorrectas" o similar.
  - El mensaje **NO** especifica si el email o la contraseña son incorrectos.
  - El usuario permanece en `/login`.
  - Los campos del formulario no se limpian automáticamente.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-05: Email inexistente muestra error genérico (sin revelar información)

- **Preconditions**: Usuario no autenticado en `/login`.
- **Steps**:
  1. Introducir email inexistente: `noexiste@example.com`.
  2. Introducir cualquier contraseña.
  3. Pulsar "Iniciar sesión".
- **Expected Result**:
  - Se muestra el mismo mensaje de error genérico que TC-04.
  - **NO** se muestra "El email no existe" ni variantes.
  - El usuario permanece en `/login`.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-06: Persistencia de sesión — token gestionado por Firebase Auth SDK

- **Preconditions**: Usuario `test.gerocultor@example.com` acaba de hacer login.
- **Steps**:
  1. Recargar la página (`F5` / `Cmd+R`).
  2. Observar si la sesión persiste.
- **Expected Result**:
  - El usuario sigue autenticado después de recargar.
  - No se redirige a `/login`.
  - El token NO está en `localStorage` en texto plano (Firebase Auth SDK lo gestiona internamente).
- **Type**: manual (inspección DevTools > Application > Storage)
- **Priority**: high

---

### TC-07: Cerrar sesión invalida el token y redirige a /login

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado en la app.
- **Steps**:
  1. Pulsar el botón "Cerrar sesión" en la UI.
  2. Intentar acceder directamente a `/agenda` por URL.
- **Expected Result**:
  - El usuario es redirigido a `/login`.
  - El token de Firebase Auth es revocado (Firebase SDK llama a `signOut`).
  - Acceder a `/agenda` redirige a `/login` (Vue Router guard activo).
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-08: Formulario de login — validación HTML5 antes de enviar

- **Preconditions**: Usuario no autenticado en `/login`.
- **Steps**:
  1. Dejar el campo email vacío.
  2. Intentar pulsar "Iniciar sesión".
- **Expected Result**:
  - El formulario no se envía.
  - Se muestra validación nativa o custom indicando campo requerido.
  - No se hace ninguna llamada a Firebase Auth.
- **Type**: unit (Vitest + Vue Test Utils) | e2e
- **Priority**: medium

---

### TC-09: Login — estado de carga durante petición a Firebase Auth

- **Preconditions**: Usuario no autenticado en `/login`.
- **Steps**:
  1. Rellenar formulario con credenciales correctas.
  2. Pulsar "Iniciar sesión".
  3. Observar la UI durante la espera de respuesta.
- **Expected Result**:
  - El botón muestra estado de carga (spinner o texto "Cargando...").
  - El botón está deshabilitado mientras la petición está en curso.
  - Evita double-submit.
- **Type**: unit (Vitest + Vue Test Utils) | manual
- **Priority**: medium

---

## Unit Tests (Vitest)

### `useAuthStore` — Login action

```typescript
// stores/useAuthStore.spec.ts
describe('useAuthStore', () => {
  it('should set user on successful login', async () => { ... })
  it('should set error on failed login without revealing field', async () => { ... })
  it('should clear user and token on logout', async () => { ... })
  it('should set cargando=true during login and false after', async () => { ... })
})
```

### `LoginView` component

```typescript
// views/LoginView.spec.ts
describe('LoginView', () => {
  it('should render email and password fields', () => { ... })
  it('should disable submit button while loading', () => { ... })
  it('should show generic error message on auth failure', () => { ... })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Formulario muestra campos email y contraseña | TC-01, TC-08 | ⬜ Pending |
| CA-2: Credenciales incorrectas → error genérico sin revelar campo | TC-04, TC-05 | ⬜ Pending |
| CA-3: Credenciales correctas → redirigido a agenda del día | TC-02, TC-03 | ⬜ Pending |
| CA-4: Sesión persiste (token gestionado por Firebase Auth SDK) | TC-06 | ⬜ Pending |
| CA-5: Cerrar sesión invalida el token en el servidor | TC-07 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `frontend/src/stores/useAuthStore.spec.ts`, `frontend/src/views/LoginView.spec.ts`
- **E2E tests** (Playwright): `frontend/tests/e2e/login.spec.ts`
- **Manual only**: TC-06 (inspección de `localStorage` en DevTools), TC-09 (timing visual)
- **Firebase Emulator**: los tests E2E y de integración usan el emulador, nunca el proyecto de producción

---

## Meta

- **User Story**: US-01
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-01
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
