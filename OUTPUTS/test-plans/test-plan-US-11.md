# Test Plan — US-11: Resumen de fin de turno

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-11 — Como gerocultor, quiero generar un resumen de mi turno al terminarlo, para facilitar el traspaso al compañero del turno siguiente.

---

## Scope

**Cubre**:
- Generación del resumen: tareas completadas, tareas pendientes, incidencias registradas durante el turno
- Visualización en pantalla del resumen antes de cerrar el turno
- Exportación o compartición del resumen (PDF o enlace)
- El resumen queda guardado y es visible para el administrador y el turno siguiente
- El resumen está asociado al `Turno` del gerocultor

**No cubre (out of scope)**:
- Flujo completo de apertura/cierre de turno (Turno entity creation)
- Notificaciones push del resumen (US-08 covers the notification channel)
- Asignación de tareas entre turnos
- Generación automática de PDF en servidor (si es complexity отдельное)

**Stack implicado**: Vue 3 + `useTurnoStore` (Pinia) | Express API (`turnos.routes.ts`) | Firebase Firestore (`/turnos`) | Playwright (e2e) | Vitest (unit)

**G04 Compliance Note**: Entity field names from `SPEC/entities.md` — `Turno`:
- `id`, `usuarioId`, `fecha`, `tipoTurno`, `inicio`, `fin`, `resumenTraspaso`, `creadoEn`
- Tipos válidos: `'manyana'`, `'tarde'`, `'noche'`

**Stitch Screen**: `Caregiver Dashboard` (`projects/16168255182252500555/screens/4fc0ca8a7f1b44a6a6f628be60a8aef3`) — `OUTPUTS/design-exports/US-10-gestion-cuentas__caregiver-dashboard__20260328.png` (reused for US-11 summary section)

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth:9099, Firestore:8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test:
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor` / UID: `uid-001`
  - `admin@example.com` / `Test1234!` / rol: `admin` / UID: `uid-admin`
- Seed en Firestore:
  - `/turnos/turno-001` — `usuarioId: uid-001`, `tipoTurno: 'manyana'`, `inicio: today 08:00`, `fin: null` (turno activo en curso)
  - `/turnos/turno-002` — `usuarioId: uid-001`, `tipoTurno: 'manyana'`, `inicio: yesterday 08:00`, `fin: yesterday 15:00`, `resumenTraspaso: '...'`
  - `/residentes/res-001/tareas/tarea-001` — `estado: 'completada'`, `usuarioId: uid-001`
  - `/residentes/res-001/tareas/tarea-002` — `estado: 'pendiente'`, `usuarioId: uid-001`
  - `/residentes/res-001/incidencias/inc-001` — `usuarioId: uid-001`, `registradaEn: today 10:00`

---

## Test Cases

### TC-01: Generar resumen — muestra tareas completadas, pendientes e incidencias del turno

- **Preconditions**: Gerocultor autenticado con turno activo `turno-001` (sin `fin`). Hay 1 tarea completada, 1 pendiente, 1 incidencia registrada hoy.
- **Steps**:
  1. En el dashboard, pulsar "Cerrar turno" o "Generar resumen".
  2. Observar el contenido del resumen en pantalla.
- **Expected Result**:
  - El resumen muestra:
    - **Tareas completadas** (lista con título, residente, hora): `tarea-001` aparece.
    - **Tareas pendientes** (lista): `tarea-002` aparece.
    - **Incidencias registradas** (lista): `inc-001` aparece con tipo, severidad y hora.
  - Se indica el rango de tiempo del turno (`inicio` → `fin` o "en curso").
  - El resumen es coherente con los datos en Firestore para ese `usuarioId` y turno.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-02: El resumen se muestra en pantalla antes de confirmar el cierre

- **Preconditions**: Gerocultor autenticado con turno activo.
- **Steps**:
  1. Iniciar flujo de cierre de turno.
  2. Verificar que hay una pantalla/modal de confirmación que muestra el resumen.
- **Expected Result**:
  - El usuario puede revisar el resumen completo en pantalla antes de confirmar.
  - Hay un botón "Confirmar y cerrar turno" y un botón "Cancelar".
  - El resumen no se guarda en Firestore hasta que se confirma.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-03: Confirmar cierre — `fin` y `resumenTraspaso` se escriben en Firestore

- **Preconditions**: Gerocultor autenticado con turno activo `turno-001`. Resumen revisado en pantalla.
- **Steps**:
  1. Confirmar el cierre del turno.
  2. Leer el documento `turno-001` en Firestore.
- **Expected Result**:
  - `fin` tiene un timestamp del servidor (no null).
  - `resumenTraspaso` contiene un string con el resumen formateado (puede ser JSON o texto estructurado).
  - `actualizadoEn` (si existe) o `fin` refleja la hora del cierre.
  - El turno pasa a estado "cerrado" (ya no aparece como activo).
- **Type**: e2e (Playwright) | integration
- **Priority**: high

---

### TC-04: Resumen queda guardado — visible para administrador

- **Preconditions**: Admin autenticado. Turno `turno-002` (ayer) tiene `resumenTraspaso` populated.
- **Steps**:
  1. Como admin, navegar a la vista de turnos o historial de turnos.
  2. Localizar el turno de `gerocultor@example.com` de ayer.
  3. Abrir el resumen.
- **Expected Result**:
  - El `resumenTraspaso` del turno cerrado es visible para el admin.
  - El admin puede ver los resúmenes de todos los gerocultores.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-05: Resumen queda guardado — visible para el turno siguiente

- **Preconditions**: Turno `turno-001` acaba de cerrarse. Otro gerocultor inicia sesión para el turno siguiente.
- **Steps**:
  1. Authenticate as another gerocultor (`uid-002`) who is starting the next shift.
  2. Look for the traspaso summary from the previous shift.
- **Expected Result**:
  - El resumen del turno anterior aparece en el dashboard o en la vista de agenda.
  - Puede estar bajo una sección "Traspaso del turno anterior" o similar.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-06: Exportar/compartir resumen — botón de exportar presente

- **Preconditions**: Gerocultor autenticado. Resumen generado en pantalla.
- **Steps**:
  1. En la pantalla del resumen, buscar botones de exportar/compartir.
- **Expected Result**:
  - Hay un botón para exportar como PDF o generar un enlace compartible.
  - Al pulsar, se genera un PDF o se copia un enlace al portapapeles.
  - La exportación funciona sin errores.
- **Type**: e2e (Playwright) | manual
- **Priority**: medium

---

### TC-07: Turno sin incidencias — resumen muestra "Sin incidencias registradas"

- **Preconditions**: Gerocultor con turno activo pero SIN ninguna incidencia registrada durante el turno.
- **Steps**:
  1. Generar resumen de turno sin incidencias.
- **Expected Result**:
  - En la sección de incidencias del resumen se muestra texto: "Sin incidencias registradas durante este turno."
  - No se muestra una lista vacía sin contexto.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

### TC-08: Solo el propietario del turno puede cerrar su turno

- **Preconditions**: Gerocultor `uid-001` con turno activo `turno-001`. Otro gerocultor `uid-002` autenticado.
- **Steps**:
  1. Como `uid-002`, intentar acceder a la acción de cierre de turno de `uid-001` (por URL o manipulación).
- **Expected Result**:
  - La acción de cierre está protegida: solo el `usuarioId` del turno puede cerrarlo.
  - Firestore Security Rules no permiten escritura de `fin` o `resumenTraspaso` a otro usuario.
  - HTTP 403 si se llama directamente a la API.
- **Type**: e2e (Playwright) | unit (Firestore Rules)
- **Priority**: high

---

### TC-09: Gerocultor puede ver sus propios resúmenes de turnos anteriores

- **Preconditions**: Gerocultor autenticado. Tiene turnos cerrados en el pasado (ej. `turno-002`).
- **Steps**:
  1. En el dashboard o menú, acceder al historial de mis turnos.
  2. Localizar un turno cerrado del pasado.
  3. Abrir su resumen.
- **Expected Result**:
  - Los resúmenes de turnos propios son visibles.
  - No se pueden editar ni modificar (solo lectura).
- **Type**: e2e (Playwright)
- **Priority**: medium

---

## Unit Tests (Vitest)

### `useTurnoStore` — Pinia store

```typescript
// stores/useTurnoStore.spec.ts
describe('useTurnoStore', () => {
  it('generateResumen aggregates completadas, pendientes, incidencias for the turn', async () => {
    // Seed: 2 completadas, 1 pendiente, 1 incidencia
    // Call store.generateResumen('turno-001')
    // Assert returned object has: completadas: 2, pendientes: 1, incidencias: 1
  })

  it('closeTurno sets fin and resumenTraspaso in Firestore', async () => {
    // Mock updateDoc
    // Call store.closeTurno('turno-001', resumenObject)
    // Assert updateDoc called with { fin: <timestamp>, resumenTraspaso: <stringified-json> }
  })

  it('fetchTurnoActual returns the active turno (fin === null) for current user', async () => {
    // Seed: one active turno, one closed
    // Call store.fetchTurnoActual()
    // Assert returned turno has fin === null
  })

  it('fetchHistorial returns closed turnos only', async () => {
    // Seed: 2 closed, 1 active
    // Call store.fetchHistorial()
    // Assert only closed turnos are returned
  })
})
```

### Resumen view component

```typescript
// views/CierreTurnoView.spec.ts
describe('CierreTurnoView', () => {
  it('shows resumen preview before confirming close', async () => {
    // Mount with active turno and summary data
    // Assert summary sections are visible (completadas, pendientes, incidencias)
    // Assert Confirm and Cancel buttons are present
  })

  it('shows empty state for incidencias when none exist', () => {
    // Mount with empty incidencias array
    // Assert "Sin incidencias registradas" text
  })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Resumen incluye tareas completadas, pendientes, incidencias | TC-01, TC-07 | ⬜ Pending |
| CA-2: Resumen se ve en pantalla y se puede exportar/compartir | TC-02, TC-06 | ⬜ Pending |
| CA-3: Resumen queda guardado y es visible para admin y turno siguiente | TC-03, TC-04, TC-05 | ⬜ Pending |
| Turno sin incidencias muestra mensaje adecuado | TC-07 | ⬜ Pending |
| Solo propietario puede cerrar su turno | TC-08 | ⬜ Pending |
| Gerocultor ve sus propios resúmenes históricos | TC-09 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/frontend/src/stores/useTurnoStore.spec.ts`, `code/frontend/src/views/CierreTurnoView.spec.ts`
- **E2E tests** (Playwright): `code/frontend/tests/e2e/cierre-turno.spec.ts`
- **Firestore Rules tests** (`@firebase/rules-unit-testing`): `tests/firestore-rules/turno-close.spec.ts`
- **PDF export**: puede requerir mocks o integración con una librería client-side (jspdf, html2canvas)
- **Seed**: ampliar `tests/fixtures/emulator-seed.ts` para incluir turnos con y sin resumen

---

## Meta

- **User Story**: US-11
- **Requisito relacionado**: RF-11
- **Guardrail**: G03 compliant ✅
- **G04 Field Names**: ✅ Complies with `SPEC/entities.md` — Turno entity fields
- **Stitch Screen**: `Caregiver Dashboard` (US-11 — reuse from US-10 context)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Draft