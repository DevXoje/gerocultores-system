# Delta Spec: daily-agenda

**Capability**: daily-agenda (modified)  
**Change**: dashboard-and-tasks-view  
**Status**: Draft  
**Author**: SDD orchestrator  
**Date**: 2026-05-01

---

## 1. Summary of Changes

The `daily-agenda` capability (US-03) is **modified** to reflect that:

1. **Full task list no longer lives in Dashboard** — moved to `/tareas` (task-calendar-view).
2. **Daily agenda data** (today's tasks) remains accessible from Dashboard widget "Tareas hoy" via `useAgendaHoy`, and as a filtered view within `/tareas` when the date filter is set to today.
3. The existing `useAgendaHoy` composable continues to work — no breaking changes.

---

## 2. What Changed

### Before (existing behavior)

- `DashboardView.vue` rendered a full task list component (`AgendaList` or similar) showing all of today's tasks.
- Clicking a task opened the task detail (US-04 behavior).

### After (new behavior)

- `DashboardView.vue` shows **TasksSummaryWidget** (count + "Ver todas" link) instead of full task list.
- Full task list view is now at `/tareas` (task-calendar-view capability).
- Dashboard still uses `useAgendaHoy` to get the task count for the widget.
- Clicking a task in `/tareas` opens `TaskDetailPanel` (slide-in from right).

---

## 3. Data Requirements

No change to Firestore collections or queries.

| Composable | Usage |
|------------|-------|
| `useAgendaHoy` | Dashboard widget count (unchanged) |
| `useAllTareas` | `/tareas` full calendar (new — from task-calendar-view) |

`useAgendaHoy` remains the source for today's task list within the Dashboard context. The `/tareas` view uses `useAllTareas` (no date filter) and applies client-side date filtering to show today's tasks.

---

## 4. Component Changes

| Component | Action |
|-----------|--------|
| `DashboardView.vue` | Remove `<AgendaList>` or equivalent; add `<TasksSummaryWidget>` + `<DashboardWidgetGrid>` |
| `TasksView.vue` (new) | Add full task list with date filtering (day/week/month) |
| `useAgendaHoy` | No changes |
| `useAllTareas` (new) | New composable — query all tasks for current user |

---

## 5. Edge Cases

| Scenario | Behavior |
|----------|----------|
| User navigates directly to `/` | Dashboard shows widget previews, not full agenda |
| User navigates to `/tareas` with no filters | FullCalendar shows all tasks (no date restriction) |
| User on `/tareas` wants today-only view | Set date filter to today via calendar toolbar |
| Refresh `/` while viewing | Widget counts refresh normally |

---

## 6. Backward Compatibility

- `useAgendaHoy` is not modified — no breaking changes.
- Existing route `/` continues to work (auth guard unchanged).
- `/tareas` is a new route — no conflict.
- Existing tests for `useAgendaHoy` remain valid.