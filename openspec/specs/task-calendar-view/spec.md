# Spec: task-calendar-view

**Capability**: task-calendar-view  
**Change**: dashboard-and-tasks-view  
**Status**: Draft  
**Author**: SDD orchestrator  
**Date**: 2026-05-01

---

## 1. Purpose

Full calendar interface (`/tareas`) showing **all tasks** for the logged-in gerocultor across any date range. Replaces the "full task list" that was previously embedded in the Dashboard. Provides day/week/month views, click-to-detail, and filtering by date/type/status.

**Linked US**: US-03 (daily agenda accessible from here), US-12 (weekly view), US-14 (task creation).

---

## 2. User Interactions and Flows

### 2.1 Primary Flow — View Calendar

1. User navigates to `/tareas` (or clicks "Ver todas" from Dashboard widget).
2. FullCalendar renders with default view = day (today) and all user tasks loaded.
3. User can switch between day / week / month views via toolbar buttons.
4. User clicks on a calendar event → task detail panel slides in from right.
5. User can change task state (pendiente → en_curso → completada / con_incidencia) from the detail panel.
6. Changes persist to Firestore immediately.

### 2.2 Filter Flow

1. User expands the filter bar (date range, task type, status).
2. Selecting a filter re-queries Firestore and re-renders calendar events.
3. Active filters are reflected in the calendar title (e.g., "May 2026 — higiene").

### 2.3 Navigation from Dashboard

- Dashboard "Tasks Today" widget → `router.push(TASKS_ROUTES.all)` with `initialDate = today`.
- Dashboard "Recent Residents" widget → `router.push(RESIDENT_ROUTES.list)`.
- Dashboard "Alerts" widget → `router.push(NOTIFICATION_ROUTES.panel)`.

---

## 3. Data Requirements

### 3.1 Firestore Collections

```
/residentes/{residenteId}/tareas/{tareaId}
```

**Query**: `where('usuarioId', '==', currentUid)` — no date filter (calendar spans all dates).

### 3.2 Composables

| Composable | Location | Responsibility |
|-------------|----------|----------------|
| `useAllTareas` | NEW — `business/agenda/presentation/composables/useAllTareas.ts` | Fetch all tasks for current user (no date filter). Returns reactive `tareas`, `loading`, `error`. Reuses existing Firestore infrastructure from `infrastructure/` layer. |
| `useTareaFilters` | NEW — `business/agenda/presentation/composables/useTareaFilters.ts` | Manages filter state (dateRange, tipo, estado). Returns reactive filter object + `filteredTareas` computed. |
| `useTareaMutations` | EXISTING (from crear-tarea) | `updateTareaEstado()`, `addNota()` — already exists in `useTareas.ts` or `useTareaMutations.ts`. |

### 3.3 FullCalendar Data Format

FullCalendar expects events as `{ id, title, start, end, className, extendedProps }`.

| FC Field | Source |
|----------|--------|
| `id` | `tarea.id` |
| `title` | `tarea.titulo` |
| `start` | `tarea.fechaHora` (ISO string) |
| `end` | `tarea.fechaHora` + 30min (default duration) |
| `className` | CSS class derived from `tarea.tipo` and `tarea.estado` |
| `extendedProps.tarea` | full Tarea object for detail panel |

---

## 4. Component Inventory

### 4.1 TasksView.vue

**Path**: `src/business/agenda/presentation/views/TasksView.vue`  
**Stitch screen**: **MISSING** — placeholder created per G10 (see §6).

Full-page view hosting FullCalendar. Contains:
- `<FullCalendar>` with all plugin components
- Filter bar (collapsible)
- TaskDetailPanel (slide-in from right)
- Loading skeleton while fetching

**Props**: none (reads auth from composable).  
**Emits**: none (all actions are internal via composables).

### 4.2 TaskDetailPanel.vue

**Path**: `src/business/agenda/presentation/components/TaskDetailPanel.vue`  
**Purpose**: Slide-in panel showing full task data + state change buttons + notes.

| Prop | Type | Description |
|------|------|-------------|
| `tarea` | `Tarea` (entity) | Task to display |
| `open` | `boolean` | Visibility state |

**Emits**:
- `close` — panel dismissed
- `estadoChanged` — after successful state update

### 4.3 TareaFilterBar.vue

**Path**: `src/business/agenda/presentation/components/TareaFilterBar.vue`  
**Purpose**: Collapsible filter controls (date range, tipo, estado).

| Prop | Type | Description |
|------|------|-------------|
| `modelValue` | `TareaFilters` | Current filter state |
| `open` | `boolean` | Expanded/collapsed |

**Emits**:
- `update:modelValue` — filter changes

---

## 5. Edge Cases and Error States

| Scenario | Behavior |
|----------|----------|
| No tasks for user | FullCalendar shows empty grid with message "No hay tareas programadas" |
| Firestore error on load | Show inline error alert with retry button |
| Task clicked while loading another | Queue detail panel open after current load |
| Filter returns 0 results | Show "Ningún resultado para los filtros seleccionados" |
| Network offline | Show cached tasks (if any) + "Modo offline — cambios se sincronizarán" banner |
| Calendar event beyond 1 year | Render normally; FullCalendar handles range |
| Task with `fechaHora` in past | Display normally (no special treatment in calendar view) |

---

## 6. Stitch Screen (G10 Compliance)

**Status**: MISSING — no Stitch screen exists for `TasksView.vue` in `OUTPUTS/technical-docs/design-source.md`.

**Action required**: Create new screen in Stitch before implementation starts.

**Proposed Stitch screen details**:
- Label: `Tasks Calendar View`
- Reference: US-12 (weekly agenda) + US-14 (task creation)
- Project: `projects/16168255182252500555` (Dashboard - Care Home Mgmt)

**Placeholder reference added to `design-source.md`** upon spec finalization.

---

## 7. Routes

| Route | Path | Component | Auth |
|-------|------|-----------|------|
| `TASKS_ROUTES.all` | `/tareas` | `TasksView.vue` | Required (auth guard) |

Route constant added to `route-names.ts`:

```typescript
export const TASKS_ROUTES = {
  all: '/tareas',
} as const
```

---

## 8. Dependencies

- `@fullcalendar/vue3@^6.1`
- `@fullcalendar/core@^6.1`
- `@fullcalendar/daygrid@^6.1`
- `@fullcalendar/timegrid@^6.1`
- `@fullcalendar/interaction@^6.1`
- Existing Firestore infrastructure in `business/agenda/infrastructure/`