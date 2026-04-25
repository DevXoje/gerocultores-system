# Test Plan — US-07: Historial de incidencias de un residente

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-07 — Como gerocultor o administrador, quiero consultar el historial de incidencias de un residente filtrado por fecha y tipo, para evaluar su evolución y detectar patrones.

---

## Scope

**Cubre**:
- Consulta del historial de incidencias de un residente específico
- Filtrado por rango de fechas y tipo de incidencia
- Visualización de cada entrada: fecha/hora, tipo, severidad, descripción, gerocultor que la registró
- Paginación o scroll infinito (máximo 20 registros por carga)
- Los datos son de solo lectura (no se puede editar el historial)
- Protección por rol: gerocultor y admin tienen acceso

**No cubre (out of scope)**:
- Creación de incidencias (US-06 — formulario de registro)
- Eliminación de incidencias (el historial es inmutable)
- Notificaciones push (US-08)
- Resumen de fin de turno (US-11)

**Stack implicado**: Vue 3 + `useIncidenciasStore` (Pinia) | Express API (`incidencias.routes.ts`) | Firebase Firestore (subcolección `/residentes/{residenteId}/incidencias`) | Playwright (e2e) | Vitest (unit)

**G04 Compliance Note**: Entity field names from `SPEC/entities.md` — `Incidencia`:
- `id`, `tipo`, `severidad`, `descripcion`, `residenteId`, `usuarioId`, `tareaId`, `registradaEn`
- No se usan aliases o renombres en los tests.

**Stitch Screen**: `Incidents Log - Serenity Care` (`projects/16168255182252500555/screens/6d605871fdb340a4903ad2402167875e`) — `OUTPUTS/design-exports/US-07-incidents-log__incidents-log-serenity-care__20260328.png`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth:9099, Firestore:8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test en emulador:
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor` / UID: `uid-001`
  - `admin@example.com` / `Test1234!` / rol: `admin` / UID: `uid-admin`
- Seed de incidencias en Firestore emulador:
  - `/residentes/res-001/incidencias/inc-001` — tipo: `caida`, severidad: `moderada`, `registradaEn: yesterday`
  - `/residentes/res-001/incidencias/inc-002` — tipo: `salud`, severidad: `critica`, `registradaEn: today`
  - `/residentes/res-001/incidencias/inc-003` — tipo: `caida`, severidad: `leve`, `registradaEn: 2 months ago`
  - `/residentes/res-002/incidencias/inc-004` — tipo: `comportamiento`, severidad: `moderada`

---

## Test Cases

### TC-01: Lista de incidencias de un residente ordenadas de más reciente a más antigua

- **Preconditions**: Usuario autenticado (gerocultor o admin). Residente `res-001` existe con al menos 2 incidencias (inc-001 y inc-002).
- **Steps**:
  1. Navegar a la vista de historial de incidencias de `res-001` (ruta `/residentes/res-001/incidencias`).
  2. Observar el orden de las entradas.
- **Expected Result**:
  - La incidencia más reciente (`registradaEn: today`) aparece primero.
  - Las entradas están ordenadas descending por `registradaEn` (más reciente → más antigua).
  - Cada entrada muestra: fecha/hora formateada, tipo, severidad (badge), descripción (truncada o completa), nombre del gerocultor (`usuarioId` → displayName).
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-02: Filtrado por rango de fechas

- **Preconditions**: Usuario autenticado. Residente `res-001` tiene incidencias de fechas variadas (ayer, hoy, hace 2 meses).
- **Steps**:
  1. En la vista de historial, aplicar filtro de fechas: `from: ayer`, `to: hoy`.
  2. Observar qué incidencias se muestran.
- **Expected Result**:
  - Solo se muestran las incidencias con `registradaEn` dentro del rango seleccionado.
  - `inc-002` (hoy) y `inc-001` (ayer) aparecen.
  - `inc-003` (2 meses atrás) NO aparece.
  - El filtro es inclusivo en ambos extremos (from <= registradaEn <= to).
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-03: Filtrado por tipo de incidencia

- **Preconditions**: Usuario autenticado. Residente `res-001` tiene incidencias de tipo `caida` (inc-001, inc-003) y `salud` (inc-002).
- **Steps**:
  1. En la vista de historial, seleccionar filtro de tipo: `caida`.
  2. Observar qué incidencias se muestran.
- **Expected Result**:
  - Solo las incidencias con `tipo === 'caida'` aparecen (inc-001 e inc-003).
  - La incidencia de tipo `salud` (inc-002) NO aparece.
  - El filtro puede combinarse con el filtro de fechas.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-04: Paginación / scroll infinito — no más de 20 registros por carga

- **Preconditions**: Usuario autenticado. Residente tiene más de 20 incidencias en Firestore (preparar seed con 22 entradas).
- **Steps**:
  1. Navegar a la vista de historial.
  2. Verificar el número de entradas cargadas inicialmente.
  3. Hacer scroll hasta el fondo de la lista.
  4. Verificar si se cargan más registros.
- **Expected Result**:
  - La primera carga muestra como máximo 20 registros.
  - Al hacer scroll al fondo, se cargan los siguientes (lazy load / infinite scroll).
  - Si no hay más registros, no se muestra indicador de carga adicional.
  - O bien: la lista es paginada con controles "Anterior / Siguiente" y máximo 20 por página.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-05:Vista de detalle de una incidencia — datos completos

- **Preconditions**: Usuario autenticado. Lista de incidencias visible con al menos una entrada.
- **Steps**:
  1. Pulsar/tap sobre una incidencia de la lista (ej. inc-002).
  2. Observar el panel de detalle o modal que se abre.
- **Expected Result**:
  - Se muestran todos los campos: `tipo`, `severidad`, `descripcion` completa (no truncada), `registradaEn` (timestamp del servidor), nombre del gerocultor que registró.
  - El campo `descripcion` muestra el texto completo (al menos 200 caracteres sin truncar).
  - Si la incidencia tiene `tareaId`, se muestra un enlace o referencia a la tarea origen.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-06: Usuario no autenticado no puede ver el historial — 401

- **Preconditions**: Sin sesión activa. Intentar acceder directamente a la ruta del historial.
- **Steps**:
  1. Cerrar sesión si la hay.
  2. Navegar directamente a `/residentes/res-001/incidencias` por URL.
- **Expected Result**:
  - El Vue Router guard redirige a `/login`.
  - No se produce ninguna petición a la API de incidencias con datos del historial.
  - Alternativamente, la API retorna 401 si se llama directamente.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-07: Gerocultor puede ver el historial de sus residentes asignados

- **Preconditions**: Gerocultor `uid-001` autenticado. `res-001` está asignado a `uid-001` (vía `ResidenteAsignacion`).
- **Steps**:
  1. Authenticate as gerocultor. Navigate to `/residentes/res-001/incidencias`.
- **Expected Result**:
  - HTTP 200. Lista de incidencias visible.
  - Los datos incluyen campos RGPD-sensibles (`descripcion`, `severidad`).
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-08: Gerocultor NO puede ver el historial de residentes no asignados

- **Preconditions**: Gerocultor `uid-001` autenticado. `res-002` NO está asignado a `uid-001`.
- **Steps**:
  1. Authenticate as gerocultor. Attempt to navigate to `/residentes/res-002/incidencias` or call API directly.
- **Expected Result**:
  - Firestore Security Rules deny read → error en UI (mensaje de acceso denegado o redirección).
  - API: HTTP 403 o Firebase error `Missing or insufficient permissions`.
- **Type**: e2e (Playwright) | unit (Firestore Rules)
- **Priority**: high

---

### TC-09: Admin puede ver el historial de cualquier residente

- **Preconditions**: Admin `uid-admin` autenticado. Cualquier residente (res-001 o res-002).
- **Steps**:
  1. Authenticate as admin. Navigate to `/residentes/res-002/incidencias`.
- **Expected Result**:
  - HTTP 200. Lista de incidencias visible.
  - Las reglas de Firestore permiten lectura a admin sin restriction de asignación.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-10: Historial es de solo lectura — no hay botones de edición

- **Preconditions**: Usuario autenticado (gerocultor o admin). Vista de historial visible.
- **Steps**:
  1. Inspeccionar la lista de incidencias y el panel de detalle.
  2. Buscar botones de editar o eliminar.
- **Expected Result**:
  - No existen botones para editar (`PUT`, `PATCH`) ni eliminar (`DELETE`) ninguna incidencia.
  - El historial es inmutable por diseño (RF-07 / SPEC/entities.md).
  - Si existe un panel de detalle, no hay acciones de modificación.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

## Unit Tests (Vitest)

### `useIncidenciasStore` — Pinia store

```typescript
// stores/useIncidenciasStore.spec.ts
describe('useIncidenciasStore', () => {
  it('fetchIncidencias returns sorted by registradaEn descending', async () => {
    // Seed Firestore with 3 incidencias
    // Call store.fetchIncidencias(residenteId)
    // Assert order: latest first
  })

  it('filters by date range correctly', async () => {
    // Set filterDates { from: yesterday, to: today }
    // Call fetchIncidencias
    // Assert only incidences within range are returned
  })

  it('filters by tipo correctly', async () => {
    // Set filterTipo: 'caida'
    // Call fetchIncidencias
    // Assert only tipo === 'caida' are returned
  })

  it('combines date and tipo filters (AND logic)', async () => {
    // Set filterDates and filterTipo simultaneously
    // Assert intersection of both filters
  })

  it('sets isLoading during fetch', async () => {
    // Verify isLoading = true at start, false at end
  })

  it('sets error on fetch failure', async () => {
    // Mock Firestore error
    // Assert error state is set
  })
})
```

### `IncidenciasList` component

```typescript
// components/IncidenciasList.spec.ts
describe('IncidenciasList', () => {
  it('renders empty state when no incidencias exist', () => {
    // Mount with empty array
    // Assert empty state message
  })

  it('renders each incidencia with correct fields', () => {
    // Mount with sample incidencia
    // Assert fechaHora, tipo badge, severidad badge, gerocultor name visible
  })

  it('shows severity badge with correct color', () => {
    // Test each severity: leve (green), moderada (yellow), critica (red)
  })

  it('opens detail panel on tap/click', async () => {
    // Mount with incidencia
    // Click first item
    // Assert detail panel opens
  })
})
```

### `useIncidencias` composable (API layer)

```typescript
// composables/useIncidencias.spec.ts
describe('useIncidencias', () => {
  it('calls GET /api/residentes/:id/incidencias with auth header')
  it('maps Firestore documents to Incidencia entity fields (G04 compliance)')
  it('throws on unauthorized (401)')
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Historial ordena más reciente → más antigua | TC-01 | ⬜ Pending |
| CA-2: Filtrado por rango de fechas | TC-02 | ⬜ Pending |
| CA-2: Filtrado por tipo de incidencia | TC-03 | ⬜ Pending |
| CA-3: Cada entrada muestra fecha/hora, tipo, severidad, descripción, gerocultor | TC-05 | ⬜ Pending |
| CA-4: Paginación / scroll infinito (≤ 20 por carga) | TC-04 | ⬜ Pending |
| CA-5: Historial es de solo lectura | TC-10 | ⬜ Pending |
| Auth: no session → redirect to login | TC-06 | ⬜ Pending |
| Auth: gerocultor ve residentes asignados | TC-07 | ⬜ Pending |
| Auth: gerocultor NO ve residentes no asignados | TC-08 | ⬜ Pending |
| Auth: admin ve cualquier residente | TC-09 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/frontend/src/stores/useIncidenciasStore.spec.ts`, `code/frontend/src/composables/useIncidencias.spec.ts`, `code/frontend/src/components/IncidenciasList.spec.ts`
- **E2E tests** (Playwright): `code/frontend/tests/e2e/incidencias-history.spec.ts`
- **Firestore Rules tests** (`@firebase/rules-unit-testing`): `tests/firestore-rules/incidencias-read.spec.ts`
- **Seed data**: script en `tests/fixtures/emulator-seed.ts` (ampliar para incluir incidencias)

---

## Meta

- **User Story**: US-07
- **Requisito relacionado**: RF-07
- **Guardrail**: G03 compliant ✅
- **G04 Field Names**: ✅ Complies with `SPEC/entities.md` — Incidencia entity fields
- **Stitch Screen**: `Incidents Log - Serenity Care` (US-07)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Draft