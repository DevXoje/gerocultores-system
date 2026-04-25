# Test Plan — US-08: Recibir notificaciones de alertas críticas

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-08 — Como gerocultor, quiero recibir notificaciones cuando haya una incidencia crítica o una tarea urgente, para reaccionar a tiempo sin tener que estar revisando la app constantemente.

---

## Scope

**Cubre**:
- Registro de listener de notificaciones in-app al iniciar sesión
- Notificación in-app al registrase una incidencia de severidad `critica`
- Notificación in-app 15 minutos antes de una tarea programada (tarea próxima)
- Marcar notificación como leída
- Panel/lista de notificaciones del usuario
- Eliminación de notificaciones del sistema tras ser leídas o tras expiry

**No cubre (out of scope)**:
- Notificaciones push nativas (PWA / Service Worker) — fuera del alcance según SPEC delta (US-08 modificado CA-4)
- Configuración de preferencias de notificación por el usuario
- Notificaciones cross-device
- Notificaciones de email o SMS

**Stack implicado**: Vue 3 + `useNotificacionesStore` (Pinia) | Express API (`notificaciones.routes.ts` — futuro) | Firebase Firestore (`/usuarios/{uid}/notificaciones`) | Playwright (e2e) | Vitest (unit)

**G04 Compliance Note**: Entity field names from `SPEC/entities.md` — `Notificacion`:
- `id`, `usuarioId`, `tipo`, `titulo`, `mensaje`, `leida`, `referenciaId`, `referenciaModelo`, `creadaEn`
- Tipos válidos: `'incidencia_critica'`, `'tarea_proxima'`, `'traspaso_turno'`, `'sistema'`

**Stitch Screen**: `Critical Alerts - Serenity Care` (`projects/16168255182252500555/screens/6e70d605ff3c4b20acd4b3b405782c08`) — `OUTPUTS/design-exports/US-08-alerts__critical-alerts-serenity-care__20260328.png`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth:9099, Firestore:8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test:
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor` / UID: `uid-001`
  - `admin@example.com` / `Test1234!` / rol: `admin` / UID: `uid-admin`
- Seed en Firestore:
  - `/usuarios/uid-001/notificaciones/notif-001` — tipo: `tarea_proxima`, `leida: false`
  - `/usuarios/uid-001/notificaciones/notif-002` — tipo: `incidencia_critica`, `leida: true`
  - `/usuarios/uid-001/notificaciones/notif-003` — tipo: `sistema`, `leida: false`

---

## Test Cases

### TC-01: Sesión activa — listener de notificaciones se registra automáticamente

- **Preconditions**: Usuario `gerocultor@example.com` acaba de iniciar sesión. Firestore tiene notificaciones para este usuario.
- **Steps**:
  1. Iniciar sesión con `gerocultor@example.com`.
  2. Observar la UI tras la carga completa del dashboard.
- **Expected Result**:
  - El store `useNotificacionesStore` inicia un listener en Firestore (`onSnapshot` o similar) sobre la subcolección `/usuarios/{uid}/notificaciones`.
  - El icono/badged de notificaciones en el header muestra el count de no leídas (ej. badge con "2" si hay 2 no leídas).
  - La lista de notificaciones (al abrir el panel) refleja las notificaciones en Firestore.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-02: Al registrar incidencia `critica`, se genera notificación `incidencia_critica`

- **Preconditions**: Gerocultor autenticado. Residente `res-001` existe. Incidencia con severidad `critica` va a ser registrada (US-06).
- **Steps**:
  1. Registrar una incidencia (via US-06 flow) con `severidad: 'critica'`.
  2. Verificar en Firestore que se creó un documento en `/usuarios/{uid-admin}/notificaciones`.
  3. Observar la UI del admin (si está logueado).
- **Expected Result**:
  - Se crea una `Notificacion` en Firestore:
    - `usuarioId: uid-admin` (destinatario)
    - `tipo: 'incidencia_critica'`
    - `titulo: 'Incidencia crítica registrada'`
    - `mensaje: 'El gerocultor {nombre} ha registrado una incidencia crítica para el residente {nombreResidente}'`
    - `referenciaId: <incidenciaId>`
    - `referenciaModelo: 'Incidencia'`
    - `leida: false`
    - `creadaEn: <timestamp servidor>`
  - Si el admin está logueado, el badge de notificaciones se actualiza con el nuevo count.
  - La notificación aparece en el panel de notificaciones.
- **Type**: e2e (Playwright) | integration (Firestore)
- **Priority**: high

---

### TC-03: Tarea a 15 minutos — se genera notificación `tarea_proxima`

- **Preconditions**: Gerocultor autenticado. Existe una tarea programada para 15 minutos en el futuro (`fechaHora = now + 15min`).
- **Steps**:
  1. Esperar (o adelantar el reloj del cliente) hasta que la tarea esté a 15 minutos de su hora.
  2. Esperar 1 minuto adicional.
  3. Verificar en Firestore si se creó una notificación.
- **Expected Result**:
  - Se crea una `Notificacion`:
    - `tipo: 'tarea_proxima'`
    - `titulo: 'Tarea próxima en 15 minutos'`
    - `mensaje: '{tituloTarea} — {nombreResidente} — {horaProgramada}'`
    - `leida: false`
  - La notificación aparece en el panel del gerocultor.
  - El badge de no leídas se incrementa.
- **Type**: e2e (Playwright — puede usar clock manipulation o wait)
- **Priority**: medium

---

### TC-04: Marcar notificación como leída

- **Preconditions**: Gerocultor autenticado con al menos una notificación no leída (`notif-001` con `leida: false`).
- **Steps**:
  1. Abrir el panel de notificaciones.
  2. Localizar `notif-001`.
  3. Marcar como leída (click en "Marcar como leída", checkbox, o swipe).
  4. Verificar en Firestore que `leida: true`.
- **Expected Result**:
  - El documento `notif-001` en Firestore tiene `leida: true`.
  - La UI refleja el cambio: la notificación pierde el estilo "no leída" (fondo, badge, etc.).
  - El count del badge de no leídas en el header decrementa.
  - La actualización es persistente tras recarga.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-05: Panel de notificaciones muestra todas las notificaciones del usuario

- **Preconditions**: Usuario autenticado con 3 notificaciones de distintos tipos (TC-01 seed).
- **Steps**:
  1. Abrir el panel de notificaciones.
  2. Listar todas las entradas visibles.
- **Expected Result**:
  - Se muestran las 3 notificaciones: `notif-001` (`tarea_proxima`), `notif-002` (`incidencia_critica`, ya leída), `notif-003` (`sistema`).
  - Las no leídas aparecen antes o con estilo diferenciado.
  - Cada notificación muestra: icono/tipo, título, mensaje (truncado), timestamp relativo (ej. "hace 5 min").
- **Type**: e2e (Playwright) | unit
- **Priority**: medium

---

### TC-06: Usuario no autenticado no recibe notificaciones

- **Preconditions**: Sin sesión activa.
- **Steps**:
  1. Intentar acceder al panel de notificaciones por URL directa.
- **Expected Result**:
  - Redirect a `/login`.
  - No se realiza ningún listener de Firestore para notificaciones.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-07: Gerocultor solo ve sus propias notificaciones

- **Preconditions**: Dos usuarios (gerocultor y admin) autenticados en diferentes sesiones. Cada uno tiene notificaciones distintas.
- **Steps**:
  1. Como gerocultor, abrir el panel de notificaciones.
  2. Verificar que NO aparecen las notificaciones del admin.
- **Expected Result**:
  - El listener de Firestore está limitado a `/usuarios/{gerocultorUid}/notificaciones`.
  - Las notificaciones de otros usuarios (admin, otros gerocultores) no son visibles.
- **Type**: unit (Firestore Rules)
- **Priority**: high

---

### TC-08: Tiempo de respuesta de notificación en UI — menos de 2s tras registro de incidencia

- **Preconditions**: Admin logueado. Gerocultor está por registrar incidencia crítica.
- **Steps**:
  1. Cronometrar: gerocultor guarda incidencia con severidad `critica`.
  2. Cronometrar: admin ve la notificación en su panel/badge.
- **Expected Result**:
  - La notificación aparece en la UI del admin en menos de 2 segundos desde que se guardó en Firestore.
  - El badge se actualiza sin necesidad de recargar la página.
- **Type**: e2e (Playwright — timing measurement)
- **Priority**: medium

---

## Unit Tests (Vitest)

### `useNotificacionesStore` — Pinia store

```typescript
// stores/useNotificacionesStore.spec.ts
describe('useNotificacionesStore', () => {
  it('starts listener on mount (when authenticated)', async () => {
    // Set authenticated user
    // Mount store
    // Assert onSnapshot was called on the user's notificaciones subcollection
  })

  it('cleans up listener on unmount', async () => {
    // Init store then unmount
    // Assert unsubscribe was called
  })

  it('markAsRead updates leida to true and syncs to Firestore', async () => {
    // Seed notif-001 with leida: false
    // Call store.markAsRead('notif-001')
    // Assert Firestore updateDoc called with { leida: true }
    // Assert store state updated
  })

  it('unreadCount getter returns only notificaciones where leida === false', async () => {
    // Seed: 2 unread, 1 read
    // Assert unreadCount === 2
  })

  it('sortedByCreadaEn descending — newest first', async () => {
    // Seed with timestamps
    // Assert first notification is most recent
  })
})
```

### Notification Badge component

```typescript
// components/NotificationBadge.spec.ts
describe('NotificationBadge', () => {
  it('shows count of unread notifications', () => {
    // Mount with unreadCount: 3
    // Assert badge displays "3"
  })

  it('shows nothing when unreadCount is 0', () => {
    // Mount with unreadCount: 0
    // Assert badge is not visible or shows "0" without alert style
  })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Incidencia `critica` → notificación in-app a gerocultores del turno | TC-02, TC-08 | ⬜ Pending |
| CA-2: Tarea a 15 min → aviso visible | TC-03 | ⬜ Pending |
| CA-3: Marcar como leída | TC-04 | ⬜ Pending |
| CA-4: Notificaciones in-app (no push nativo) | TC-01, TC-05 | ⬜ Pending |
| Listener registrado al iniciar sesión | TC-01 | ⬜ Pending |
| Usuario solo ve sus propias notificaciones | TC-07 | ⬜ Pending |
| No autenticado → redirect login | TC-06 | ⬜ Pending |
| Tiempo de respuesta < 2s | TC-08 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/frontend/src/stores/useNotificacionesStore.spec.ts`, `code/frontend/src/components/NotificationBadge.spec.ts`
- **E2E tests** (Playwright): `code/frontend/tests/e2e/notificaciones.spec.ts`
- **Integration tests**: Firestore listener verification with `@firebase/rules-unit-testing`
- **Clock manipulation**: Playwright `clock.install()` para adelantar tiempo y probar notificaciones de tarea próxima sin esperar 15 minutos reales

---

## Meta

- **User Story**: US-08
- **Requisito relacionado**: RF-08
- **Guardrail**: G03 compliant ✅
- **G04 Field Names**: ✅ Complies with `SPEC/entities.md` — Notificacion entity fields
- **Stitch Screen**: `Critical Alerts - Serenity Care` (US-08)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Draft