# Proposal: crear-tarea

## Intent

Gerocultors and admins need the ability to create tasks (tareas) in the system agenda. Currently the contract `POST /api/tareas` is defined in `SPEC/api/contracts/tareas.md` and the frontend has `tareasApi.createTarea()` prepared but never called. No backend endpoint exists. This proposal covers the full creation flow: API endpoint, form UI, and integration from the weekly agenda view.

## Scope

### In Scope
- New user story US-XX for task creation (crear-tarea)
- Backend endpoint `POST /api/tareas` (controller + service, not yet implemented)
- Stitch screen for task creation form (G10 requirement — no UI without Stitch reference)
- Vue form component for task creation (triggered from weekly agenda FAB or action)
- Frontend `tareasApi.createTarea()` wiring (currently stub, needs integration)
- Rollback plan and success criteria

### Out of Scope
- Bulk task creation or editing
- Recurring tasks
- Task-associated notifications

## Capabilities

### New Capabilities
- `task-creation`: Allows gerocultors and admins to create tasks with title, type, scheduled time, resident, and optional notes.

### Modified Capabilities
- None

## Approach

**Backend**: Implement `POST /api/tareas` as a new Express route in `code/api/src/routes/tareas.ts`. Service validates `titulo`, `tipo` (enum), `fechaHora` (ISO8601), `residenteId` and `usuarioId` (must exist). Write to Firestore subcollection `/residentes/{residenteId}/tareas`. Initial `estado` is always `pendiente`. `creadoEn` and `actualizadoEn` set server-side.

**Frontend**: Create a `CreateTareaModal.vue` (or bottom-sheet on mobile/tablet). Triggered by FAB on `AgendaSemanalView.vue` (from US-12 CA-3). Uses existing `useTareas()` composable with `tareasApi.createTarea()`. On success, closes modal and refreshes the agenda list.

**Design**: Before coding the Vue component, create Stitch screen "Task Creation Form" with fields: título (text), tipo (select: hygiene/medicacion/alimentacion/actividad/revision/otro), fechaHora (datetime picker), residente (searchable select from assigned residents), usuarioId (pre-filled from current session), notas (optional textarea). Reference it in `design-source.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `code/api/src/routes/tareas.ts` | New | POST /api/tareas endpoint |
| `code/api/src/services/tareasService.ts` | New | Task creation business logic |
| `code/frontend/src/components/tareas/CreateTareaModal.vue` | New | Creation form component |
| `code/frontend/src/views/AgendaSemanalView.vue` | Modified | Add FAB to trigger creation modal |
| `code/frontend/src/composables/useTareas.ts` | Modified | Wire createTarea to API call |
| `SPEC/api/contracts/tareas.md` | Modified | Document POST endpoint (already exists at line 93 — update if needed) |
| `OUTPUTS/technical-docs/design-source.md` | Modified | Add Stitch screen reference |
| `SPEC/user-stories.md` | Modified | Add US-XX for crear-tarea |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stitch screen not ready before coding | Medium | Propose spec phase first to define screen requirements; developer waits for screen if needed |
| Firestore subcollection write rules | Low | Ensure Firestore rules allow gerocultor to write tasks under their assigned residents |
| Residente/Usuario existence not validated | Low | Service checks existence before writing; return 400 if not found |

## Rollback Plan

1. Remove `POST /api/tareas` route from `code/api/src/routes/tareas.ts`
2. Delete `code/api/src/services/tareasService.ts`
3. Delete `code/frontend/src/components/tareas/CreateTareaModal.vue`
4. Revert `AgendaSemanalView.vue` FAB addition (remove trigger)
5. Revert `useTareas.ts` — keep stub, remove API call
6. Revert `design-source.md` Stitch reference removal

## Dependencies

- Existing `POST /api/tareas` contract in `SPEC/api/contracts/tareas.md` (line 93)
- Stitch screen "Task Creation Form" must be created before Vue implementation (G10)
- Firestore rules: gerocultor can write to `/residentes/{residenteId}/tareas` only if assigned to that resident

## Success Criteria

- [ ] `POST /api/tareas` returns 201 with the created task and valid UUID
- [ ] Validation errors (missing fields, invalid tipo, non-existent residenteId/usuarioId) return 400 with descriptive message
- [ ] Vue form submits successfully and modal closes
- [ ] Created task appears in agenda weekly and daily views
- [ ] Stitch screen "Task Creation Form" exists in `design-source.md` before Vue coding starts
- [ ] `tareasApi.createTarea()` is called and no longer a dead stub