# Test Plan — US-03: Consulta de agenda diaria

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-03 — Como gerocultor, quiero ver mi agenda del día actual al iniciar sesión, para saber qué tareas tengo pendientes, en qué orden y para qué residente.

## 1. Acceptance Criteria to Cover
- **Viewing daily agenda**: The caregiver must be able to view their tasks for the current day.
- **Empty state**: If no tasks exist for the current date, show an appropriate empty state ("No tienes tareas para hoy").
- **Loading state**: Display a visual loading indicator while fetching tasks.
- **Error handling**: Handle gracefully when API fails or connection drops (show error message + retry button).
- **Filtering by date**: By default, only tasks corresponding to the *current date* are loaded.
- **assignedTo behavior**: A user must ONLY see tasks assigned to them (`usuarioId` matches). 
- **Highlight overdue tasks**: Any task with `fechaHora < now()` and `estado !== 'completada'` must be visually highlighted as overdue.
- **TaskCard interactions**: User can interact with the TaskCard to toggle the completion status. The UI must reflect the new status immediately.
- **Security checks**: Unauthorized users cannot view the tasks (401/403). Only authenticated `gerocultor` or `admin` can query the endpoints/DB.

---

## 2. Test Environment & Setup

- **Backend / Database**: Run against Firebase Emulator Suite (`firebase emulators:start`).
- **Required Environment Variables**:
  - `VITE_USE_FIREBASE_EMULATOR=true`
  - `VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`
  - `VITE_FIRESTORE_EMULATOR_HOST=localhost:8080`
- **Commands**:
  - Unit Tests: `npm run test:unit` (Vitest)
  - API Tests: `npm run test:api` (Vitest/Supertest)
  - E2E Tests: `npm run test:e2e` (Playwright)

---

## 3. Seed Data Mapping (from `feature/t24-model`)

We will use the following 10 seed tasks from the `tareas` collection logic.  
**Users:** `gerocultor1` (uid-001), `gerocultor2` (uid-002)

| ID | Title | User | Date/Time | Status | Test Case Mapping |
|----|-------|------|-----------|--------|-------------------|
| T1 | Higiene matutina | gerocultor1 | Today 08:00 | pendiente | Overdue check / Toggle complete |
| T2 | Adm. medicación | gerocultor1 | Today 08:30 | completada | Already completed view |
| T3 | Desayuno asistido | gerocultor1 | Today 09:00 | en_curso | In-progress view |
| T4 | Estimulación cog. | gerocultor2 | Today 10:00 | pendiente | assignedTo behavior (hidden from 1) |
| T5 | Constantes vitales| gerocultor2 | Today 11:00 | pendiente | assignedTo behavior |
| T6 | Almuerzo asistido | gerocultor1 | Today 13:00 | pendiente | Future task / normal view |
| T7 | Med. mediodía | gerocultor2 | Today 13:30 | pendiente | assignedTo behavior |
| T8 | Higiene vespertina| gerocultor2 | Today 16:00 | pendiente | assignedTo behavior |
| T9 | Paseo en jardín | gerocultor1 | Tomorrow 10:00 | pendiente | Date filtering (hidden for Today) |
| T10| Rev. médica semanal| gerocultor1 | Tomorrow 09:00| pendiente | Date filtering (hidden for Today) |

---

## 4. Test Cases

### 4.1 Unit Tests (Frontend - Vitest)
**Estimated effort: 2 hours**

- **TC-U1: Agenda Store Loading State**: Verify `useAgendaStore` correctly sets `isLoading` to true during fetch and false after.
- **TC-U2: Empty State Render**: Render `AgendaView` with empty array of tasks. Assert "No tienes tareas para hoy" is visible.
- **TC-U3: Date Filtering logic**: Verify local sorting function sorts tasks chronologically by `fechaHora`.
- **TC-U4: Overdue Highlight logic**: Provide task `T1` with time in the past. Assert `isOverdue` computed property returns true. Provide `T2` (completed), assert false. Provide `T6` (future), assert false.
- **TC-U5: Task Toggle Action**: Mock `toggleTaskCompletion` API call. Verify that store optimistic update changes task `T1` to `completada`.

### 4.2 API / Contract Tests
**Estimated effort: 1.5 hours**

- **TC-A1: Fetch Today's Tasks**: Call `GET /api/tareas?usuarioId=uid-001&date=today`. Verify response includes T1, T2, T3, T6. Does NOT include T4, T5, T7, T8 (other user) nor T9, T10 (tomorrow).
- **TC-A2: Security Check - Unauthorized**: Call `GET /api/tareas` without Auth token. Expect `401 Unauthorized`.
- **TC-A3: Security Check - Cross-user Fetch**: Authenticate as `gerocultor1` but call `GET /api/tareas?usuarioId=uid-002`. Expect `403 Forbidden`.
- **TC-A4: Negative - Invalid Date Param**: Call `GET /api/tareas?date=invalid-date`. Expect `400 Bad Request`.
- **TC-A5: Negative - Missing Fields**: Call `POST /api/tareas` omitting `fechaHora` (to verify creation boundary constraints if applicable, though primarily read-focused for this US).

### 4.3 E2E Tests (Playwright)
**Estimated effort: 3 hours**

- **TC-E1: Happy Path - Login to Agenda**: 
  1. Login as `gerocultor1`.
  2. Navigate to `/agenda` automatically.
  3. Verify Tasks T1, T2, T3, T6 are displayed in correct chronological order.
  4. Verify loading skeleton appears briefly before tasks load.
- **TC-E2: Overdue Visuals**:
  1. On `/agenda`, verify T1 ("Higiene matutina") has the red border/icon indicating it is overdue.
  2. Verify T2 ("Adm. medicación") shows as grey/checked.
- **TC-E3: Toggle Task Completion**:
  1. Click the checkmark on Task T1.
  2. Verify UI updates immediately to "completada".
  3. Reload page. Verify T1 remains "completada" (persistence check).
- **TC-E4: Empty Agenda**:
  1. Login as a new user with 0 tasks.
  2. Navigate to `/agenda`.
  3. Verify empty state illustration and text.
- **TC-E5: Error Recovery**:
  1. Block network requests to Firestore/API using Playwright `route.abort()`.
  2. Navigate to `/agenda`.
  3. Verify error message toast/banner appears.
  4. Unblock network and click "Retry". Verify tasks load correctly.

---

## 5. Estimations Summary

| Test Level | Scope | Effort |
|------------|-------|--------|
| Unit (Vitest) | Vue Components & Pinia Stores | 2.0 hrs |
| API | Endpoints, Filters, AuthZ | 1.5 hrs |
| E2E (Playwright)| Critical User Journeys | 3.0 hrs |
| **Total** | | **6.5 hrs** |
