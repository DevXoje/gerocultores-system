# Verification Report — `alta-residente` (US-09)

**Change**: alta-residente
**Version**: openspec + Engram `sdd/alta-residente/spec` (id: 878)
**Mode**: hybrid — persisted to Engram AND filesystem

---

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 32 |
| Tasks complete | 26 |
| Tasks incomplete | 6 |

### Incomplete Tasks (Blocking)

- **Phase 4 (Firestore Security Rules)**: Tasks 4.1 and 4.2 NOT STARTED
  - No `firestore.rules` file found in project root
  - Archive constraint rules and gerocultor read rules not implemented
- **Phase 8 (Testing)**: 0 / 8 tests written
  - Phase 8 tasks all remain unchecked
  - Test plan (`OUTPUTS/test-plans/test-plan-US-09.md`) exists but no code implementing tests

### Completed Tasks

- Phase 1: 4/4 ✅ (types, schemas, DTOs)
- Phase 2: 4/4 ✅ (service layer — all 4 methods)
- Phase 3: 6/6 ✅ (controller handlers, routes with role guards)
- Phase 5: 3/3 ✅ (frontend domain entity, use cases, G04 check)
- Phase 6: 2/2 ✅ (Pinia store, composable wiring)
- Phase 7: 7/7 ✅ (Views, components, routes, nav links)

---

## Build & Tests Execution

**Build**: ❌ Failed — TypeScript compilation errors in both API and frontend

**API Build** (`cd code/api && npm run build`):
```
src/services/residentes.service.ts(108,36): error TS2339: Property 'errors' does not exist on type 'ZodError<...>'.
src/services/residentes.service.ts(192,48): error TS7006: Parameter 'e' implicitly has an 'any' type.
```
Root cause: Zod v3 uses `.issues` not `.errors` on `ZodError`. Service code accesses `.errors` which doesn't exist on the type.

**Frontend Build** (`cd code/frontend && npm run build`):
```
src/business/residents/presentation/stores/residentesStore.ts(82,15): error TS2339: Property 'residente' does not exist on type...
src/business/residents/presentation/stores/residentesStore.ts(97,15): error TS2339: Property 'residente' does not exist on type...
src/business/residents/presentation/stores/residentesStore.ts(112,15): error TS2339: Property 'residente' does not exist on type...
```
Root cause: `createResidente(dto)` returns `{ residente }`, `listResidentes(filter)` returns `{ residentes }` — but the API returns the flat array directly (`{ data: Residente[] }`). Store expects `.residente` and `.residentes` wrapper properties that don't exist on the API response shape.

**Tests**: ❌ 2 failed / 189 passed / 0 skipped
```
FAIL  src/services/residentes.service.spec.ts > admin with invalid body → throws Error with validation message
"Cannot read properties of undefined (reading 'map')"  ← ZodError.errors vs .issues

FAIL  src/services/residentes.service.spec.ts > admin with filter=active → returns only active residents
expected [2 items] to have length 1
```
Total: 16 test files, 191 tests

---

## Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Residente Creation: Admin with all mandatory fields | POST /api/residentes creates doc, returns 201 | `residentes.service.spec.ts` | ⚠️ PARTIAL — test exists but fails due to ZodError.errors bug |
| Residente Creation: Missing mandatory field | Returns 400 | (none found) | ❌ UNTESTED |
| Residente Creation: Gerocultor blocked | Returns 403 | (none found) | ❌ UNTESTED |
| Residente Editing: Admin updates RGPD fields | PATCH updates + preserves creadoEn | (none found) | ❌ UNTESTED |
| Residente Editing: Non-existent resident | Returns 404 | (none found) | ❌ UNTESTED |
| Residente Archival: Admin archives active | PATCH /archive sets archivado: true | (none found) | ❌ UNTESTED |
| Residente Archival: Excluded from agenda queries | Archived resident hidden in active queries | (none found) | ❌ UNTESTED |
| Residente Archival: History remains accessible | Archived resident detail still retrievable | (none found) | ❌ UNTESTED |
| Residente Listing: Active residents (default) | GET /api/residentes filter=active | `residentes.service.spec.ts` | ⚠️ PARTIAL — test fails (ZodError bug + filter logic bug) |
| Residente Listing: All residents | GET /api/residentes?filter=all | (none found) | ❌ UNTESTED |
| Residente Listing: Archived excluded from default | Default filter excludes archivado:true | (none found) | ❌ UNTESTED |

**Compliance summary**: 2/11 scenarios with passing test coverage (partial)

---

## Correctness (Static — Structural Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| G04 Field Consistency | ✅ Implemented | All field names in API types, frontend domain entity, and service layer match `SPEC/entities.md` exactly: `id`, `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`, `creadoEn`, `actualizadoEn` |
| POST /api/residentes | ✅ Implemented | `requireRole('admin')` on route, service validates body, returns 201 |
| PATCH /api/residentes/:id | ✅ Implemented | `requireRole('admin')`, service validates body, updates with actualizadoEn |
| PATCH /api/residentes/:id/archive | ✅ Implemented | `requireRole('admin')`, sets archivado: true and actualizadoEn |
| GET /api/residentes | ✅ Implemented | `filter` query param, order by creadoEn descending |
| Role guards (admin write ops) | ✅ Implemented | `requireRole('admin')` on all write routes |
| Residente listing filter | ✅ Implemented | `active` / `archived` / `all` query param |
| Firestore Security Rules | ❌ Missing | Phase 4 tasks not started, no firestore.rules changes |
| Frontend ResidentsView.vue | ✅ Implemented | Stitch reference present, admin-only routes wired |
| Frontend ResidenteForm.vue | ✅ Implemented | Stitch reference present, BEM styling, validation |
| G10 Stitch Reference | ✅ Implemented | Both `ResidentsView.vue` and `ResidenteForm.vue` cite `US-09-resident-records` |
| G05 No Hardcoded Secrets | ✅ Compliant | No credentials in source; env vars used; `.env.example` present |

---

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Firestore collection path `/residents` | ✅ Yes | `COLLECTIONS.residentes` maps to `'residents'` |
| Zod schemas for validation | ✅ Yes | `CreateResidenteSchema`, `UpdateResidenteSchema`, `ArchiveResidenteSchema` all present |
| Archive as PATCH /:id/archive (separate route) | ✅ Yes | Route is `router.patch('/:id/archive', ...)` separate from general PATCH /:id |
| Admin-only for create/update/archive | ✅ Yes | `requireRole('admin')` on POST, PATCH /:id, PATCH /:id/archive |
| Service uses `docToResponse()` pattern | ✅ Yes | Service reuses the existing `docToResponse()` helper |
| Frontend Pinia store is sync-only (no async) | ⚠️ Deviation | Store contains `async` functions (`fetchResidentes`, `createResidente`, etc.) that call use cases directly — violates frontend-specialist.md rule that stores should be sync-only. This was a design decision made during apply but is not reflected in design.md |
| Frontend use cases in `domain/` layer | ✅ Yes | `CreateResidenteUseCase.ts`, `ListResidentesUseCase.ts`, etc. in `business/residents/domain/` |

---

## Issues Found

### CRITICAL (must fix before archive)

1. **Build FAIL — API ZodError `.errors` doesn't exist**
   - File: `code/api/src/services/residentes.service.ts` lines 108, 192
   - Zod v3 `ZodError` has `.issues` not `.errors` — `parsed.error.errors.map` should be `parsed.error.issues.map`
   - This causes runtime crash: "Cannot read properties of undefined (reading 'map')"

2. **Build FAIL — Frontend store expects wrapper property `.residente` that API doesn't return**
   - File: `code/frontend/src/business/residents/presentation/stores/residentesStore.ts` lines 82, 97, 112
   - Use cases `createResidente(dto)` returns `{ residente: Residente }` but API response is `{ data: Residente }` directly
   - Same issue for `updateResidente` and `archiveResidente`
   - Fix: Store should call the API client directly OR use cases need to unwrap the `{ data }` wrapper

3. **Build FAIL — Frontend unused imports in store**
   - File: `code/frontend/src/business/residents/presentation/stores/residentesStore.ts`
   - Lines 16, 18, 19: `createResidente`, `updateResidente`, `archiveResidente` imported from domain use cases but never used (store calls `listResidentes` instead)
   - `ResidenteFilter` declared but never used in `ResidentsView.vue` line 22

### WARNING (should fix)

4. **Phase 8 (Testing) — 0 / 8 tests written**
   - Phase 8 tasks in tasks.md are all unchecked
   - Test plan exists but no test code implementing any TC-01 through TC-10
   - Integration tests `residentes.service.integration.spec.ts` exist but archive route not tested

5. **Phase 4 (Firestore Rules) — NOT started**
   - Tasks 4.1 and 4.2 not implemented
   - No `firestore.rules` modifications found
   - Archive constraint (`archivado == false`) and gerocultor read rules missing

6. **Test FAIL — `admin with filter=active` test fails**
   - File: `code/api/src/services/residentes.service.spec.ts` line 312
   - Expected 1 active resident, got 2
   - Suggests `listResidentes('active')` query is not properly filtering by `archivado === false`

7. **Design deviation — Pinia store has async functions**
   - `residentesStore.ts` contains `async` functions (`fetchResidentes`, `createResidente`, etc.)
   - Violates frontend-specialist.md rule: stores are state-only, async in composables/use cases
   - This was a conscious decision but not documented in design.md

### SUGGESTION (nice to have)

8. **Frontend store unused imports** — `createResidente`, `updateResidente`, `archiveResidente` imported from domain use cases but store methods shadow them with store's own async wrappers that call `listResidentes`

9. **Route registration** — Need to verify `residentes.routes.ts` is mounted in `code/api/src/routes/index.ts`

10. **Schema inconsistency** — `fechaNacimiento` is typed as `Date` in SPEC/entities.md but Zod schema uses `z.string()` with ISO regex. This is a known open question in design.md but should be resolved.

---

## Phase 8 Test Status

| Task | Description | Status |
|------|-------------|--------|
| 8.1 | Unit test: `CreateResidenteSchema` validation | ❌ Pending |
| 8.2 | Unit test: `ResidentesService.createResidente` | ❌ Pending |
| 8.3 | Unit test: `ResidentesService.archiveResidente` | ❌ Pending |
| 8.4 | Integration test: `POST /api/residentes` | ❌ Pending |
| 8.5 | Integration test: `PATCH /api/residentes/:id/archive` | ❌ Pending |
| 8.6 | Integration test: `GET /api/residentes?filter=active` | ❌ Pending |
| 8.7 | Firestore rules test | ❌ Pending |
| 8.8 | Playwright E2E (emulator) | ❌ Pending |

**Completed**: 0 / 8 | **Pending**: 8 / 8

---

## Verdict

**FAIL** — Build does not pass. TypeScript compilation fails in both API and frontend.

The implementation is structurally sound (correct route structure, role guards, G04 field consistency, Stitch references) but contains type-level bugs that prevent compilation. The Phase 8 tests are entirely unimplemented, and Phase 4 (Firestore rules) is not started.

The two failing API service tests are directly caused by the same `.errors` vs `.issues` Zod bug that blocks the build.

**Immediate action required**: Fix ZodError access pattern in service + fix API response unwrapping in frontend store.
