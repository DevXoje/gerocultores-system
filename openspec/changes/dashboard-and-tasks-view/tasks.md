# Tasks: dashboard-and-tasks-view

## Phase 1: Prerequisites (BLOCKERS — must complete before any implementation)

- [x] 1.1 **Create Stitch screen for TasksView** — Add `TasksView.vue` entry to `OUTPUTS/technical-docs/design-source.md` referencing the Stitch screen (US-12 + US-14). G10 blocker: implementation of TasksView CANNOT start until this is done.
- [x] 1.2 Install FullCalendar packages — `npm install @fullcalendar/vue3@^6.1 @fullcalendar/core@^6.1 @fullcalendar/daygrid@^6.1 @fullcalendar/timegrid@^6.1 @fullcalendar/interaction@^6.1` in `code/frontend/`

## Phase 2: Setup

- [x] 2.1 Import FullCalendar CSS in `code/frontend/src/main.ts` — add `import '@fullcalendar/core/main.css'` + daygrid/timegrid styles
- [x] 2.2 Add `@fullcalendar/vue3` and related packages to `code/frontend/package.json` (if not done in 1.2)

## Phase 3: Pinia Store Extension

- [x] 3.1 Extend `code/frontend/src/business/agenda/presentation/stores/tareasStore.ts` — add `allTareas` ref, `isLoadingAll` ref, `setAllTareas()` and `clearAllTareas()` mutations

## Phase 4: Composables

- [x] 4.1 Create `code/frontend/src/business/agenda/application/useAllTareas.ts` — composable calling `tareasApi.getTareas({})` (no date filter), writes to `store.allTareas`. Returns `{ allTareas, isLoading, error, cargarTodas }`
- [x] 4.2 Create `code/frontend/src/business/agenda/presentation/composables/useTareaFilters.ts` — manages filter state (`dateRange`, `tipo`, `estado`), returns `filteredAllTareas` computed, `setFilter`, `clearFilters`
- [x] 4.3 Write unit tests for `useTareaFilters` — test empty, single, and multiple active filters

## Phase 5: Dashboard Widgets

- [x] 5.1 Create `code/frontend/src/business/agenda/presentation/components/dashboard/DashboardWidgetGrid.vue` — responsive 3-card grid layout
- [x] 5.2 Create `code/frontend/src/business/agenda/presentation/components/dashboard/TasksSummaryWidget.vue` — card with task count + "Ver todas" link using `useAgendaHoy().tareas.length`
- [x] 5.3 Create `code/frontend/src/business/agenda/presentation/components/dashboard/AlertsPreviewWidget.vue` — card with unread critical alert count + "Ver alertas" link using existing `useNotificaciones`
- [x] 5.4 Create `code/frontend/src/business/agenda/presentation/components/dashboard/RecentResidentsWidget.vue` — list of 3 resident names + "Ver todos" link using existing `useResidentes`
- [x] 5.5 Write integration tests for widget grid — verify each widget renders its count

## Phase 6: DashboardView Modification

- [x] 6.1 Modify `code/frontend/src/views/DashboardView.vue` — remove `.task-list` section; add `<DashboardWidgetGrid>` with all three widgets; retain header, greeting, quick-nav
- [x] 6.2 Update `code/frontend/src/business/agenda/presentation/components/TaskCard.spec.ts` — remove or skip tests for task list section since it's now in TasksView

## Phase 7: TasksView — Core Components

- [x] 7.1 Create `code/frontend/src/business/agenda/presentation/components/TaskDetailPanel.vue` — slide-in panel with task data, state change buttons, notes. Named handlers for all DOM events (G11: `@click="handleClose"` not inline)
- [x] 7.2 Create `code/frontend/src/business/agenda/presentation/components/TareaFilterBar.vue` — collapsible filter bar (date range, tipo, estado) with `modelValue` prop and `update:modelValue` emit
- [x] 7.3 Write unit tests for `tareaToCalendarEvent` mapping — cover all `TareaTipo` × `TareaEstado` combinations

## Phase 8: TasksView — Calendar View

- [x] 8.1 Create `code/frontend/src/business/agenda/presentation/views/TasksView.vue` — full-page view hosting FullCalendar (day/week/month), filter bar, TaskDetailPanel. Uses `useAllTareas` and `useTareaFilters`. Lazy-loaded route.
- [x] 8.2 Write component tests for TasksView — verify FullCalendar renders with mock tareas, filter bar toggle works

## Phase 9: Routing

- [x] 9.1 Add `TASKS_ROUTES = { all: '/tareas' }` to `code/frontend/src/views/route-names.ts`
- [x] 9.2 Add TasksView lazy route to `code/frontend/src/router/routes.ts` — path `/tareas`, `meta: { requiresAuth: true }`, lazy import
- [x] 9.3 Update Dashboard widget "Ver todas" links to use `router.push(TASKS_ROUTES.all)`

## Phase 10: E2E / Integration

- [x] 10.1 Playwright E2E test — navigate `/dashboard` → widget counts visible → click "Ver todas" → `/tareas` loads calendar

---

**Total: 22 tasks across 10 phases**