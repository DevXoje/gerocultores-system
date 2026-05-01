# Specs: dashboard-and-tasks-view

## Change Directory

`openspec/changes/dashboard-and-tasks-view/`

## New Capabilities

### task-calendar-view

**Spec file**: `openspec/specs/task-calendar-view/spec.md`  
**Stitch screen**: MISSING — placeholder required (see spec §6)

Full calendar interface at `/tareas` showing all user tasks with day/week/month views, filter bar, and task detail panel.

### dashboard-hub

**Spec file**: `openspec/specs/dashboard-hub/spec.md`  
**Stitch screen**: EXISTING (Caregiver Dashboard)

Enhanced Dashboard at `/` with widget previews (tasks count, alerts count, recent residents) and navigation links.

## Modified Capabilities

### daily-agenda

**Delta file**: `openspec/changes/dashboard-and-tasks-view/specs/daily-agenda-delta.md`

Full task list moved from Dashboard to `/tareas`. Dashboard shows widget previews instead. `useAgendaHoy` unchanged.

---

## Files in This Change

| File | Type | Capability |
|------|------|------------|
| `openspec/specs/task-calendar-view/spec.md` | Full spec | task-calendar-view |
| `openspec/specs/dashboard-hub/spec.md` | Full spec | dashboard-hub |
| `openspec/changes/dashboard-and-tasks-view/specs/daily-agenda-delta.md` | Delta spec | daily-agenda (modified) |
| `openspec/changes/dashboard-and-tasks-view/specs/README.md` | This file | — |

## G10 Status

| Vue View | Stitch Screen | Status |
|----------|---------------|--------|
| `TasksView.vue` | MISSING — placeholder in design-source.md required | Action required before implementation |
| `DashboardView.vue` | Caregiver Dashboard (existing) | ✅ Satisfied |