# Proposal: dashboard-and-tasks-view

## Intent

Split the current Dashboard into two distinct views: a **hub with preview widgets** (`/`) and a **full calendar task view** (`/tareas`). Dashboard becomes a navigational starting point showing summaries; Tasks becomes the dedicated calendar interface for all tasks (US-03, US-12).

## Scope

### In Scope
- Enhanced `DashboardView.vue` with widget cards (tasks summary, alerts preview, recent residents) and "View all" link to `/tareas`
- New `TasksView.vue` with FullCalendar showing all user tasks
- New route `/tareas` in Vue Router (`code/frontend/src/router/routes.ts`)
- Route constant `TASKS_ROUTES` in `code/frontend/src/views/route-names.ts`
- FullCalendar (`@fullcalendar/vue3`) installation and configuration
- Stitch screen reference for new Tasks view

### Out of Scope
- FullCalendar on Dashboard (preview only — no calendar widget)
- Admin or multi-user features
- Push notifications (handled elsewhere)

## Capabilities

### New Capabilities
- `task-calendar-view`: Full calendar interface showing all tasks for the logged-in gerocultor, filterable by date/type/status. Linked to US-12 and US-14.
- `dashboard-hub`: Dashboard as a navigation hub with widget previews and deep-links to section detail views.

### Modified Capabilities
- `daily-agenda` (US-03): Dashboard no longer shows full task list — task list is replaced by a summary widget with "View all" link. Full task list moves to `/tareas`.

## Approach

**Dashboard (`/`)**: Retains today's greeting and auth header. Replaces the task list with a set of preview widgets:
- **Tasks Today widget**: count + "View all" link (no FullCalendar)
- **Alerts widget**: count of recent critical alerts
- **Recent Residents widget**: last 3 residents + link to resident list

Navigation links route to existing views (`/residentes`, `/incidencias`) and new `/tareas`.

**Tasks View (`/tareas`)**: New Vue view (DDD: `business/agenda/presentation/views/TasksView.vue`). FullCalendar with day/week/month views, all user tasks from Firestore. Click on event opens a task detail panel. Filters for date range, task type, and status. Reuses `useAgendaHoy`-style composables for data access.

**Stitch screen**: Tasks view references `Weekly Agenda` screen from `OUTPUTS/technical-docs/design-source.md` (US-12). If no exact match exists, a new screen will be created before implementation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `code/frontend/src/views/DashboardView.vue` | Modified | Widget previews + nav links; task list removed |
| `code/frontend/src/views/TasksView.vue` | New | FullCalendar task calendar view |
| `code/frontend/src/views/route-names.ts` | Modified | Add `TASKS_ROUTES` constant |
| `code/frontend/src/router/routes.ts` | Modified | Add `/tareas` route entry |
| `code/frontend/src/business/agenda/presentation/views/` | New dir | TasksView.vue location |
| `package.json` (frontend) | Modified | Add `@fullcalendar/vue3`, `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` |
| `OUTPUTS/technical-docs/design-source.md` | Modified | Add Tasks view ↔ Stitch screen mapping |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| FullCalendar Vue 3 compatibility issues | Low | Use `@fullcalendar/vue3` which officially supports Vue 3 |
| Stitch screen does not exist for Tasks view | Low | Create screen in Stitch before implementation (G10 compliance) |
| Firestore query for all tasks (not just today) needs new composable | Medium | Create `useAllTareas` composable reusing existing infrastructure layer |

## Rollback Plan

1. Revert `routes.ts` and `route-names.ts` to remove `/tareas` route
2. Delete `TasksView.vue` and its directory
3. Restore `DashboardView.vue` from git
4. Remove FullCalendar packages from `package.json` and run `npm uninstall`
5. Revert `design-source.md` if Stitch screen was added

## Dependencies

- `@fullcalendar/vue3@^6.1` (Vue 3 compatible, latest stable)
- Existing `business/agenda/infrastructure/` Firestore layer (reused, not rewritten)

## Success Criteria

- [ ] Dashboard shows 3 preview widgets with correct counts and working "View all" links
- [ ] `/tareas` renders FullCalendar with all user tasks
- [ ] Calendar events open task detail panel on click
- [ ] Filters (date/type/status) update calendar events
- [ ] Route `/tareas` protected by auth guard (requires authenticated user)
- [ ] G10 satisfied: TasksView references a Stitch screen from `design-source.md`
- [ ] All commits follow `feat(US-XX)` convention
