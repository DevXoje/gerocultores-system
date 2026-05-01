# Tasks: crear-tarea (US-14)

## Phase 1: Backend — Types & Schema

- [ ] 1.1 Add `CreateTareaSchema` to `code/api/src/types/tarea.types.ts` — Zod schema with titulo (1–200 chars), tipo (TareaTipoEnum), fechaHora (ISO8601 datetime), residenteId (UUID), usuarioId (string), notas (nullable, max 2000). Export `CreateTareaDto` type.
- [ ] 1.2 Verify `requireRole.ts` middleware already exists at `code/api/src/middleware/requireRole.ts` (it does — no action needed).

## Phase 2: Backend — Service

- [ ] 2.1 Create `code/api/src/services/tareas.service.ts` method `createTarea(dto, requestingUid, requestingRole)`: validate CreateTareaSchema → fetch Residente doc → 400 if not found or archivado → if gerocultor: check `gerocultoresAsignados.includes(uid)` → fetch Usuario doc → 400 if not found or disabled → `crypto.randomUUID()` → `adminDb.collection('residents').doc(residenteId).collection('tasks').doc(uuid).set(...)` → return TareaResponse with `id = 'tasks/{uuid}'`, `estado = 'pendiente'`, server timestamps.
- [ ] 2.2 Add custom error classes `ResidenteNotFound`, `UsuarioNotFound`, `AccessDenied` to `code/api/src/services/tareas.service.ts` (with `statusCode = 400`).

## Phase 3: Backend — Controller & Route

- [ ] 3.1 Add `createTarea` method to `code/api/src/controllers/tareas.controller.ts`: parse body with CreateTareaSchema → call service → map errors (ZodError→400, ResidenteNotFound→400, UsuarioNotFound→400, AccessDenied→400) → return 201 `{ data: TareaResponse }`.
- [ ] 3.2 Register `POST /api/tareas` route in `code/api/src/routes/tareas.routes.ts` with `verifyAuth` + `requireRole('admin','gerocultor')` middleware on the POST line (before `router.use(verifyAuth)` which applies to GET routes only — or split the router).

## Phase 4: Backend — Testing

- [ ] 4.1 Write unit tests in `code/api/src/services/tareas.service.spec.ts` for `createTarea`: happy path (admin creates task), gerocultor creates for assigned resident → 201, gerocultor creates for unassigned resident → AccessDenied 400, residente not found → ResidenteNotFound 400, usuario not found → UsuarioNotFound 400, invalid Zod input → validation errors.
- [ ] 4.2 Write unit tests in `code/api/src/controllers/tareas.controller.spec.ts` for `createTarea`: 201 happy path, 400 validation error, 401 missing auth, 403 wrong role.

## Phase 5: Frontend — API Wiring

- [ ] 5.1 Verify `tareasApi.createTarea()` at `code/frontend/src/infrastructure/tareas/tareas.api.ts` already calls `POST /tareas` (it does at line 91 — no stub, already wired). No action needed.

## Phase 6: Frontend — Modal Component

- [ ] 6.1 Create Stitch screen "Task Creation Form" in `OUTPUTS/technical-docs/design-source.md` referencing the modal fields (título, tipo select, fechaHora picker, residente select, usuarioId pre-filled, notas textarea). G10 requirement before Vue coding.
- [ ] 6.2 Create `code/frontend/src/components/tareas/CreateTareaModal.vue`: script setup with `defineEmits<{ close: [] }>()`, form fields bound to local reactive refs, `tareasApi.createTarea()` call on submit, emit `close` on success, error handling. Use Tailwind via `@apply` in `<style scoped>` (BEM classes).
- [ ] 6.3 Add FAB trigger to `code/frontend/src/views/DashboardView.vue` that opens CreateTareaModal (note: `AgendaSemanalView.vue` for US-12 does not exist yet — using DashboardView as integration point per US-03).

## Phase 7: Frontend — Composables Wiring

- [ ] 7.1 Create `useTareas` composable at `code/frontend/src/composables/useTareas.ts` (or directory): expose `createTarea(data)` that calls `tareasApi.createTarea()` and returns the response. Update CreateTareaModal to use it instead of calling the API directly.

## Phase 8: Integration Verification

- [ ] 8.1 Run `npm test` in `code/api/` — all service and controller tests must pass.
- [ ] 8.2 Run `npm test` in `code/frontend/` — all tests must pass (Vitest).
- [ ] 8.3 Manual smoke-test: `POST /api/tareas` with valid admin token → 201 + task id; without token → 401; wrong role → 403; missing titulo → 400 VALIDATION_ERROR.

## Phase 9: Documentation

- [ ] 9.1 Confirm `SPEC/api/contracts/tareas.md` POST contract (lines 92–135) reflects all error codes from spec (ACCESS_DENIED, RESIDENTE_NOT_FOUND, USUARIO_NOT_FOUND, VALIDATION_ERROR, INVALID_ENUM, INVALID_DATETIME).
- [ ] 9.2 Add `US-14` entry to `SPEC/user-stories.md` referencing crear-tarea delta spec.
