# Design: dashboard-and-tasks-view

## Technical Approach

Split `DashboardView.vue` into two: a **hub** at `/dashboard` (widgets + "Ver todas") and a new **TasksView.vue** at `/tareas` powered by FullCalendar. Widget data comes from existing composables (`useAgendaHoy`, `useNotificaciones`, `useResidentes`). Calendar data comes from a new `useAllTareas` composable that wraps `tareasApi.getTareas()` without a date filter. All state flows through the existing `useTareasStore` (Pinia), extended with a `allTareas` array for the calendar's full dataset.

---

## Architecture Decisions

### Decision: FullCalendar package selection

**Choice**: `@fullcalendar/vue3` + `@fullcalendar/daygrid` + `@fullcalendar/timegrid` + `@fullcalendar/interaction`  
**Alternatives considered**: `v-calendar`, `vue-cal` — both lack the day/week/month view combination and Vue 3 support breadth that FullCalendar has  
**Rationale**: Official Vue 3 adapter (`@fullcalendar/vue3@^6.1`) exists and is stable. Daygrid = month/day views; Timegrid = week view with time slots; Interaction = click-to-open-panel. No other library covers all three view modes without significant custom work.

---

### Decision: Route path for TasksView

**Choice**: `/tareas` as the calendar route path  
**Alternatives considered**: `/calendar`, `/agenda` — proposal explicitly calls for `/tareas` (Spanish, user-facing)  
**Rationale**: Follows the proposal's explicit scope definition. Route name constant `TASKS_ROUTES` added to `route-names.ts`.

---

### Decision: `useTareasStore` state vs. separate store for calendar

**Choice**: Reuse `useTareasStore`, add `allTareas` state field  
**Alternatives considered**: New `useCalendarStore` — adds another store for just one feature  
**Rationale**: The existing store already handles `tareas[]`, loading, error. Adding `allTareas` (separate from the filtered `tareas` used by dashboard) keeps the store count flat. Composable `useAllTareas` writes to `allTareas`; `useAgendaHoy` keeps writing to `tareas` — they are independent arrays.

---

### Decision: Dashboard stays at `/dashboard`, NOT at `/`

**Choice**: Keep DashboardView at `/dashboard`  
**Rationale**: Current routes.ts mounts DashboardView at `DASHBOARD_ROUTES.path = '/dashboard'`. The root `/` redirects to login. Changing `/` to be the dashboard would require removing the `AUTH_ROUTES.LOGIN` redirect and restructuring auth guards. Safer to keep dashboard where it is and add `/tareas` as a sibling protected route.

---

## Data Flow

```
Firestore/Backend
    │
    ▼
tareasApi.getTareas({ /* no date filter */ })   ← infraestructura layer
    │
    ▼
useAllTareas (application/)                      ← new composable
    │
    ▼
useTareasStore.allTareas (Pinia)                ← added state field
    │
    ▼
TasksView.vue → FullCalendar.vue                ← presentation layer
    │
    ▼
TaskDetailPanel (slide-in on event click)
```

Widget data (Dashboard):
```
useAgendaHoy()  → tareasStore.tareas  → TasksSummaryWidget (count)
useNotificaciones() → unread critical → AlertsPreviewWidget (count)
useResidentes({ limit: 3 }) → residentes → RecentResidentsWidget (names)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `code/frontend/src/business/agenda/presentation/views/TasksView.vue` | **Create** | Full-page view with FullCalendar. Lazy-loaded route. |
| `code/frontend/src/business/agenda/presentation/components/TaskDetailPanel.vue` | **Create** | Slide-in panel for task details + state changes |
| `code/frontend/src/business/agenda/presentation/components/TareaFilterBar.vue` | **Create** | Collapsible filter controls (date range, tipo, estado) |
| `code/frontend/src/business/agenda/application/useAllTareas.ts` | **Create** | Composable fetching all tasks (no date filter), writes to `useTareasStore.allTareas` |
| `code/frontend/src/business/agenda/presentation/composables/useTareaFilters.ts` | **Create** | Manages filter state; returns `filteredAllTareas` computed |
| `code/frontend/src/business/agenda/presentation/stores/tareasStore.ts` | **Modify** | Add `allTareas` ref + `setAllTareas` / `clearAllTareas` mutations |
| `code/frontend/src/business/agenda/presentation/components/dashboard/` | **Create dir** | Widget components: `TasksSummaryWidget.vue`, `AlertsPreviewWidget.vue`, `RecentResidentsWidget.vue`, `DashboardWidgetGrid.vue` |
| `code/frontend/src/views/route-names.ts` | **Modify** | Add `TASKS_ROUTES = { all: '/tareas' }` |
| `code/frontend/src/router/routes.ts` | **Modify** | Add `TasksView` route with `meta: { requiresAuth: true }`, lazy import |
| `code/frontend/src/views/DashboardView.vue` | **Modify** | Remove task list (`.task-list` section); add widget grid + FAB. Retain header, greeting, quick-nav. |
| `code/frontend/src/main.ts` | **Modify** | Import FullCalendar CSS: `import '@fullcalendar/core/main.css'` + daygrid/timegrid styles |
| `package.json` (frontend) | **Modify** | Add `@fullcalendar/vue3@^6.1`, `@fullcalendar/core@^6.1`, `@fullcalendar/daygrid@^6.1`, `@fullcalendar/timegrid@^6.1`, `@fullcalendar/interaction@^6.1` |
| `openspec/changes/dashboard-and-tasks-view/design.md` | **Create** | This document |
| `OUTPUTS/technical-docs/design-source.md` | **Modify** | Add Stitch screen mapping for TasksView (MISSING per G10 — create screen before implementation) |

---

## Interfaces / Contracts

### `useAllTareas` composable

```typescript
// src/business/agenda/application/useAllTareas.ts
export function useAllTareas() {
  // Loads ALL tasks (no date filter) into store.allTareas
  async function cargarTodas(): Promise<void>
  // Returns reactive references from store
  const allTareas: Ref<TareaResponse[]>
  const isLoading: Ref<boolean>
  const error: Ref<string | null>
}
```

### `useTareaFilters` composable

```typescript
// src/business/agenda/presentation/composables/useTareaFilters.ts
export interface TareaFilters {
  dateRange: { start: string; end: string } | null  // ISO date strings
  tipo: TareaTipo | null
  estado: TareaEstado | null
}

export function useTareaFilters() {
  const filters = ref<TareaFilters>({ dateRange: null, tipo: null, estado: null })
  const filteredTareas = computed(() => /* filter store.allTareas by active filters */)
  function setFilter(key: keyof TareaFilters, value: unknown): void
  function clearFilters(): void
}
```

### TaskDetailPanel props/emits (G11 — named handlers)

```typescript
// TaskDetailPanel.vue
defineProps<{
  tarea: TareaResponse
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'estado-changed', id: string, estado: TareaEstado): void
}>()

// G11: @click handlers in template must use named functions (no inline)
function handleClose() { emit('close') }
function handleEstadoChange(estado: TareaEstado) { emit('estado-changed', props.tarea.id, estado) }
```

### FullCalendar event mapping

```typescript
// TareaResponse → FullCalendar EventInput
function tareaToCalendarEvent(tarea: TareaResponse): EventInput {
  return {
    id: tarea.id,
    title: tarea.titulo,
    start: tarea.fechaHora,
    end: addMinutes(new Date(tarea.fechaHora), 30), // default 30min duration
    className: `fc-event--${tarea.tipo} fc-event--${tarea.estado}`,
    extendedProps: { tarea },
  }
}
```

### Pinia store extension

```typescript
// tareasStore.ts — add to existing store
const allTareas = ref<TareaResponse[]>([])
const isLoadingAll = ref(false)

function setAllTareas(items: TareaResponse[]): void { allTareas.value = items }
function clearAllTareas(): void { allTareas.value = [] }
```

---

## Testing Strategy

| Layer | What to test | Approach |
|-------|-------------|----------|
| Unit | `tareaToCalendarEvent` mapping | `vitest` with `describe.each` over all `TareaTipo` × `TareaEstado` combos |
| Unit | `useTareaFilters` computed logic | Test filter combinations — empty, single, multiple active |
| Unit | `useAllTareas` loading/error branches | Mock `tareasApi.getTareas` |
| Integration | `TasksView` renders FullCalendar with events | `@vue/test-utils` + mock composable returning sample tareas |
| E2E | Navigate `/dashboard` → widget counts visible → click "Ver todas" → `/tareas` loads | Playwright test covering the full nav flow |

---

## Migration / Rollback

No data migration required — this is a frontend-only change.

**Rollback** (if needed):
1. Revert `routes.ts` — remove `/tareas` entry and lazy import
2. Revert `route-names.ts` — remove `TASKS_ROUTES`
3. Delete `TasksView.vue` and `components/` directory
4. Restore `DashboardView.vue` from git (task list section reverted)
5. Remove FullCalendar packages (`npm uninstall @fullcalendar/*`)
6. Revert `design-source.md` if Stitch screen was added

---

## Open Questions

- [ ] **Stitch screen MISSING**: `design-source.md` does not have a screen for `TasksView`. Proposal says "create screen in Stitch before implementation" — implementation is BLOCKED until G10 compliance is resolved.
- [ ] **Auth redirect decision**: Dashboard is currently at `/dashboard`. If the project owner wants Dashboard at root `/` instead, a separate ADR is needed to change the auth guard + redirect logic.
- [ ] **Filter query strategy**: Should `useTareaFilters` re-query Firestore on filter change, or rely on client-side filtering of `allTareas`? Client-side is simpler for now (all tasks already loaded). Revisit if `allTareas` grows large.