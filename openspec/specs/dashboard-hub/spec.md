# Spec: dashboard-hub

**Capability**: dashboard-hub  
**Change**: dashboard-and-tasks-view  
**Status**: Draft  
**Author**: SDD orchestrator  
**Date**: 2026-05-01

---

## 1. Purpose

Enhanced `DashboardView.vue` (`/`) serves as a **navigation hub** instead of a task list view. It shows preview widgets with counts and deep-links to section detail views, replacing the embedded task list that previously lived there (which moves to `/tareas`).

**Linked US**: US-03 (daily agenda accessible here), US-08 (alerts), US-09 (residents), US-14 (create task).

---

## 2. User Interactions and Flows

### 2.1 Dashboard Load Flow

1. User authenticated → redirected to `/`.
2. Dashboard shows greeting header (existing).
3. Three widget cards render below header:
   - **Tareas hoy**: count + "Ver todas" link → `/tareas?fecha=hoy`
   - **Alertas críticas**: count of unread critical alerts + "Ver alertas" → `/notificaciones`
   - **Residentes recientes**: last 3 resident names + "Ver todos" → `/residentes`
4. Widgets load in parallel (separate composable calls).
5. FAB (floating action button) for quick task creation → `CreateTareaModal` (from crear-tarea change).

### 2.2 Widget Interaction

| Widget | Click action |
|--------|--------------|
| Tareas hoy — count | No action (info only) |
| Tareas hoy — "Ver todas" | `router.push(TASKS_ROUTES.all)` |
| Alertas — count | No action (info only) |
| Alertas — "Ver alertas" | `router.push(NOTIFICATION_ROUTES.panel)` |
| Residentes — name item | `router.push(RESIDENT_ROUTES.detail(residente.id))` |
| Residentes — "Ver todos" | `router.push(RESIDENT_ROUTES.list)` |

### 2.3 Auth Header (existing)

- User display name + avatar (from Firebase Auth `photoURL` or initials fallback)
- Logout button → `authService.signOut()` → redirect to login

---

## 3. Data Requirements

### 3.1 Composables

| Composable | Location | Responsibility |
|------------|----------|----------------|
| `useAgendaHoy` | EXISTING — `business/agenda/infrastructure/` | Already fetches today's tasks. Use to get `tareas.length`. |
| `useNotificaciones` | EXISTING — `business/notification/infrastructure/` | Get count of unread `incidencia_critica` notifications. |
| `useResidents` | EXISTING — `business/residents/presentation/composables/` | Get 3 most recently created residents (sorted by `creadoEn` desc). |

### 3.2 Widget Data Contract

| Widget | Query | Response shape |
|--------|-------|----------------|
| Tareas hoy | `useAgendaHoy().tareas` | `Tarea[]` → count = `.length` |
| Alertas | `useNotificaciones().unreadCritical` | `Notificacion[]` → count = `.length` |
| Residentes recientes | `useResidents().residentes` (limit 3) | `Residente[]` → first 3 by `creadoEn` |

---

## 4. Component Inventory

### 4.1 DashboardView.vue (modified)

**Path**: `src/views/DashboardView.vue`  
**Stitch screen**: Caregiver Dashboard — `OUTPUTS/design-exports/US-03-agenda-home__caregiver-dashboard__20260328.png` (EXISTING — no change needed).

**Before**: Embedded task list (full today's agenda).  
**After**: Widget grid (TasksSummaryWidget, AlertsPreviewWidget, RecentResidentsWidget) + FAB.

### 4.2 Widget Sub-components

All live in `src/business/dashboard/presentation/components/`:

| Component | Purpose |
|-----------|---------|
| `TasksSummaryWidget.vue` | Card with task count + "Ver todas" link |
| `AlertsPreviewWidget.vue` | Card with critical alert count + "Ver alertas" link |
| `RecentResidentsWidget.vue` | List of 3 resident names + "Ver todos" link |
| `DashboardWidgetGrid.vue` | Grid layout container (3 cards, responsive) |

### 4.3 DashboardGreeting.vue (existing, retained)

Shows personalized greeting + current date. No changes.

---

## 5. Edge Cases and Error States

| Scenario | Behavior |
|----------|----------|
| Widget data fails to load | Show skeleton placeholder with error icon; do not crash entire dashboard |
| Zero tasks today | Show "No hay tareas para hoy" in widget (still show "Ver todas" link) |
| Zero critical alerts | Show "Sin alertas" with no badge |
| Zero residents | Show "Sin residentes registrados" + link to create |
| Auth user without displayName | Fall back to email prefix as display name |

---

## 6. Stitch Screen (G10 Compliance)

**Status**: EXISTING — `DashboardView.vue` already references **Caregiver Dashboard** in `design-source.md` (line 63).

No change required to design-source.md for DashboardView itself.

---

## 7. Related Changes

- `daily-agenda` delta spec — US-03 agenda data accessible from `/tareas` (not embedded in Dashboard)
- `CreateTareaModal` from `crear-tarea` change integrated as FAB on Dashboard