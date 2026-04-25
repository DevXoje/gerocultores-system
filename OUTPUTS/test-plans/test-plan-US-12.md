# Test Plan — US-12: Vista de agenda semanal

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-12 — Como gerocultor o administrador, quiero ver la agenda de la semana en una vista de calendario, para planificar y revisar la distribución de tareas.

---

## Scope

**Cubre**:
- Vista semanal: 7 días con tareas de cada día
- Click/tap en un día → detalle de ese día (agenda diaria — equivalente a US-03)
- Las tareas visibles dependen del rol y asignaciones (comportamiento heredado de US-03)
- Admin puede añadir o modificar tareas desde la vista semanal
- La vista semanal carga en menos de 2 segundos

**No cubre (out of scope)**:
- Creación de residentes (US-09) o asignación de tareas específicas (US-04 estado)
- Notificaciones (US-08)
- El comportamiento detallado de la agenda diaria (US-03 lo cubre)

**Stack implicado**: Vue 3 + `useAgendaStore` (Pinia) + Calendar component | Express API (`tareas.routes.ts`) | Firebase Firestore | Playwright (e2e) | Vitest (unit)

**G04 Compliance Note**: Entity field names from `SPEC/entities.md` — `Tarea`:
- `id`, `titulo`, `tipo`, `fechaHora`, `estado`, `notas`, `residenteId`, `usuarioId`, `creadoEn`, `actualizadoEn`, `completadaEn`
- Enum values: `tipo` → `'higiene'`, `'medicacion'`, `'alimentacion'`, `'actividad'`, `'revision'`, `'otro'`
- `estado` → `'pendiente'`, `'en_curso'`, `'completada'`, `'con_incidencia'`

**Stitch Screen**: `Daily Agenda - Care Management` (`projects/16168255182252500555/screens/9ef30860ae9e4a3fa1487d82e46137af`) — referenced from SPEC/user-stories.md US-12

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth:9099, Firestore:8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test:
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor` / UID: `uid-001`
  - `admin@example.com` / `Test1234!` / rol: `admin` / UID: `uid-admin`
- Seed de tareas en Firestore (7 días de la semana actual):
  - Lunes: T1 (`fechaHora: lunes 08:00`, `estado: completada`)
  - Lunes: T2 (`fechaHora: lunes 10:00`, `estado: pendiente`)
  - Martes: T3 (`fechaHora: martes 09:00`, `estado: pendiente`)
  - Miércoles: T4 (`fechaHora: miércoles 14:00`, `estado: en_curso`)
  - Jueves: T5 (`fechaHora: jueves 11:00`, `estado: pendiente`)
  - Viernes: T6 (`fechaHora: viernes 16:00`, `estado: pendiente`)
  - Sábado: T7 (`fechaHora: sábado 10:00`, `estado: pendiente`)
  - Domingo: T8 (`fechaHora: domingo 09:00`, `estado: pendiente`)
  - Todas asignadas a `uid-001`

---

## Test Cases

### TC-01: Vista semanal muestra los 7 días de la semana

- **Preconditions**: Gerocultor autenticado. Navegar a `/agenda/semanal`.
- **Steps**:
  1. Cargar la vista semanal.
  2. Verificar qué días se muestran.
- **Expected Result**:
  - Se muestran 7 columnas (una por día) o una vista de 7 filas/días.
  - Los días corresponden a la semana actual (Lunes → Domingo).
  - Las fechas de cada día son visibles (ej. "Lun 21", "Mar 22", etc.).
  - El día actual está resaltado visualmente.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-02: Cada día muestra las tareas programadas para ese día

- **Preconditions**: Same as TC-01. Tareas T1-T8 distributed across the week.
- **Steps**:
  1. Observar la distribución de tareas en la vista semanal.
- **Expected Result**:
  - Lunes muestra T1 y T2 (2 tareas).
  - Martes muestra T3 (1 tarea).
  - Miércoles muestra T4 (1 tarea).
  - Jueves muestra T5 (1 tarea).
  - Viernes muestra T6 (1 tarea).
  - Sábado muestra T7 (1 tarea).
  - Domingo muestra T8 (1 tarea).
  - Las tareas muestran: título (`titulo`), hora (`fechaHora`), color/tipo según `tipo`.
  - Las tareas completadas (`estado: completada`) se muestran con estilo diferenciado (ej. tachadas, opacidad reducida).
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-03: Click en un día abre la agenda diaria de ese día

- **Preconditions**: Gerocultor autenticado en la vista semanal.
- **Steps**:
  1. Hacer click/tap sobre el día "Martes".
  2. Observar la navegación o el panel que aparece.
- **Expected Result**:
  - El usuario navega a `/agenda?date=martes` (o equivalente con parámetro de fecha).
  - Se muestra la agenda diaria de ese día con todas sus tareas (T3 en este caso).
  - La vista es la misma que US-03 (comportamiento reutilizado).
  - Un botón de "Volver a semana" permite regresar a la vista semanal.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-04: Tarea vencida no completada se muestra con estilo de alerta

- **Preconditions**: Existe una tarea con `fechaHora` en el pasado y `estado: pendiente` (ej. T4 si ya pasó la hora).
- **Steps**:
  1. En la vista semanal, localizar la tarea vencida.
- **Expected Result**:
  - La tarea vencida y no completada se muestra con borde rojo, badge "Atrasada" o similar.
  - El estilo permite distinguirla de tareas normales y completadas.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-05: Gerocultor solo ve sus propias tareas en la vista semanal

- **Preconditions**: Gerocultor autenticado (`uid-001`). Tarea T9 pertenece a `uid-002`.
- **Steps**:
  1. Cargar la vista semanal.
  2. Verificar que no aparece T9 en ningún día.
- **Expected Result**:
  - Las 8 tareas de `uid-001` (T1-T8) aparecen según su día.
  - La tarea T9 (asignada a `uid-002`) NO aparece en ningún día.
  - El filtro por `usuarioId` es aplicado en la query a Firestore/API.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-06: Admin ve todas las tareas (de todos los gerocultores) en la vista semanal

- **Preconditions**: Admin autenticado. Existe al menos una tarea de `uid-001` y otra de `uid-002`.
- **Steps**:
  1. Como admin, cargar la vista semanal.
  2. Verificar si aparecen tareas de ambos gerocultores.
- **Expected Result**:
  - Admin puede ver las tareas de todos los gerocultores.
  - Puede haber necesidad de filtro por gerocultor (desplegable) si el volumen es alto.
  - La vista permite identificar visualmente qué tarea pertenece a quién (nombre del gerocultor o color).
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-07: Admin puede añadir tarea desde la vista semanal

- **Preconditions**: Admin autenticado. Vista semanal cargada.
- **Steps**:
  1. Hacer click en el botón "+" de un día concreto (ej. "Viernes").
  2. Rellenar el formulario de nueva tarea (título, tipo, hora, residente).
  3. Guardar.
- **Expected Result**:
  - Se crea una nueva tarea en Firestore en la subcolección del residente.
  - La tarea aparece inmediatamente en la ranura del viernes en la vista semanal.
  - La tarea tiene `usuarioId` asignada al gerocultor seleccionado en el formulario.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-08: Admin puede modificar una tarea desde la vista semanal

- **Preconditions**: Admin autenticado. Una tarea existe en la vista semanal.
- **Steps**:
  1. Hacer click sobre una tarea existente (T3, martes).
  2. Modificar la hora o el título.
  3. Guardar.
- **Expected Result**:
  - Firestore se actualiza con el nuevo `fechaHora` o `titulo`.
  - Si la hora cambia de día, la tarea se mueve al día correspondiente en la vista semanal.
  - El cambio se refleja sin necesidad de recargar.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-09: La vista semanal carga en menos de 2 segundos

- **Preconditions**: Gerocultor autenticado. Red normal.
- **Steps**:
  1. Medir el tiempo desde que se navega a `/agenda/semanal` hasta que la vista está completamente renderizada.
- **Expected Result**:
  - La vista semanal está lista en < 2 segundos (RNF-01 de SPEC).
  - Se muestra skeleton o indicador de carga mientras se esperan los datos.
- **Type**: e2e (Playwright — timing measurement)
- **Priority**: medium

---

### TC-10: Navegación entre semanas (anterior/siguiente)

- **Preconditions**: Gerocultor autenticado. Vista semanal cargada.
- **Steps**:
  1. Pulsar botón "Semana anterior".
  2. Observar los días que se muestran.
  3. Pulsar "Semana siguiente".
- **Expected Result**:
  - "Semana anterior" muestra la semana del lunes anterior al domingo actual.
  - "Semana siguiente" regresa a la semana actual y permite avanzar a futuras.
  - La navegación es fluida (sin flash de página en blanco).
  - Las tareas del nuevo rango de fechas se cargan.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

### TC-11: Empty state — semana sin tareas

- **Preconditions**: Gerocultor autenticado sin tareas para la semana actual.
- **Steps**:
  1. Navegar a la vista semanal.
- **Expected Result**:
  - Cada día muestra un estado vacío ("Sin tareas") o un icono.
  - No se muestran errores ni páginas en blanco.
  - Un mensaje general: "No tienes tareas programadas esta semana."
- **Type**: e2e (Playwright) | unit
- **Priority**: medium

---

### TC-12: Gerocultor no autenticado no puede ver la vista semanal

- **Preconditions**: Sin sesión activa.
- **Steps**:
  1. Navegar directamente a `/agenda/semanal` por URL.
- **Expected Result**:
  - Redirect a `/login`.
  - La vista no se renderiza.
  - No se hacen peticiones a Firestore con datos de tareas.
- **Type**: e2e (Playwright)
- **Priority**: high

---

## Unit Tests (Vitest)

### `useAgendaStore` — weekly view data shape

```typescript
// stores/useAgendaStore.spec.ts
describe('weekly view helpers', () => {
  it('groupTasksByDay returns tasks grouped by day key (YYYY-MM-DD)', () => {
    // Seed 8 tasks across 7 days
    // Call store.groupTasksByDay(tasks)
    // Assert result has 7 keys, each with array of tasks for that day
  })

  it('getWeekDates returns 7 dates starting from Monday of current week', () => {
    // Call store.getWeekDates('2026-04-20')
    // Assert returns array of 7 Date objects: Mon 20, Tue 21, ..., Sun 26
  })

  it('navigateWeek updates currentWeek start date', () => {
    // Store starts at week A
    // Call store.navigateWeek('next')
    // Assert currentWeek moves to week A+7 days
    // Call navigateWeek('prev')
    // Assert back to week A
  })

  it('fetchWeeklyTasks returns only tasks for the 7-day range', async () => {
    // Seed: 3 tasks this week, 2 next week, 1 last week
    // Call store.fetchWeeklyTasks(weekStartDate)
    // Assert only tasks within the week are returned
  })

  it('isOverdue computed property works across week view', () => {
    // Task with fechaHora in past and estado !== 'completada'
    // Assert isOverdue === true
    // Same task with estado === 'completada'
    // Assert isOverdue === false
  })
})
```

### `WeeklyAgendaView` component

```typescript
// views/WeeklyAgendaView.spec.ts
describe('WeeklyAgendaView', () => {
  it('renders 7 day columns', () => {
    // Mount with week data
    // Assert 7 day headers are present
  })

  it('highlights current day column', () => {
    // Mount
    // Assert today's column has visual highlight class
  })

  it('shows task count badge per day', () => {
    // Mount with tasks per day
    // Assert each day column shows count badge
  })

  it('navigates to daily view on day click', async () => {
    // Mount
    // Click on Tuesday column
    // Assert router navigates to /agenda?date=YYYY-MM-DD (Tuesday's date)
  })

  it('renders empty state for days with no tasks', () => {
    // Mount with a day that has no tasks
    // Assert empty state message/icon
  })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Vista semanal muestra 7 días con tareas | TC-01, TC-02 | ⬜ Pending |
| CA-2: Click en día muestra detalle (agenda diaria) | TC-03 | ⬜ Pending |
| CA-3: Admin puede añadir/modificar tareas desde semanal | TC-07, TC-08 | ⬜ Pending |
| Tareas vencidas no completadas se muestran con estilo de alerta | TC-04 | ⬜ Pending |
| Gerocultor ve solo sus tareas | TC-05 | ⬜ Pending |
| Admin ve todas las tareas | TC-06 | ⬜ Pending |
| Tiempo de carga < 2 segundos | TC-09 | ⬜ Pending |
| Navegación entre semanas | TC-10 | ⬜ Pending |
| Empty state para semana sin tareas | TC-11 | ⬜ Pending |
| No autenticado → redirect | TC-12 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/frontend/src/stores/useAgendaStore.spec.ts`, `code/frontend/src/views/WeeklyAgendaView.spec.ts`
- **E2E tests** (Playwright): `code/frontend/tests/e2e/weekly-agenda.spec.ts`
- **Visual tests**: puede usar capturas de pantalla para verificar que el layout del calendario semanal es correcto
- **Seed**: `tests/fixtures/emulator-seed.ts` con tareas distribuidas en los 7 días de la semana actual

---

## Meta

- **User Story**: US-12
- **Requisito relacionado**: RF-12
- **Prioridad**: Could
- **Guardrail**: G03 compliant ✅
- **G04 Field Names**: ✅ Complies with `SPEC/entities.md` — Tarea entity fields
- **Stitch Screen**: `Daily Agenda - Care Management` (US-12)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Draft