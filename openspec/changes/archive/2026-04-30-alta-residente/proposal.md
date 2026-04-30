# Proposal: alta-residente

## Intent

Enable administrators to create, edit, and archive Residente records in Firestore via a REST API endpoint and Vue frontend. The system already has `GET /residentes/:id` (US-05) and read-only access; this change adds write operations (create, update, archive) with role-based enforcement.

## Scope

### In Scope
- **API**: `POST /api/residentes` (create), `PATCH /api/residentes/:id` (update), `PATCH /api/residentes/:id/archive` (archive toggle)
- **Service**: `ResidentesService.createResidente`, `.updateResidente`, `.archiveResidente`
- **Controller**: `ResidentesController.create`, `.update`, `.archive`
- **Zod schema**: `ResidenteCreateSchema`, `ResidenteUpdateSchema` (extends types in `residente.types.ts`)
- **Frontend store**: `useResidentesStore` — `createResidente`, `updateResidente`, `archiveResidente`, `fetchResidentes` (with filter)
- **Vue views**: `ResidentsView.vue` (listado), `ResidenteForm.vue` (alta/edición)
- **Firestore security rules**: allow create/update/archive only for `role = admin`
- **Route guard**: Vue Router guard blocks `/admin/residentes/*` for `gerocultor` role

### Out of Scope
- Residente-to-gerocultor assignment (US-10)
- Residente deletion (hard delete)
- Historial incidencia view (US-07)
- Foto upload (future enhancement)

## Capabilities

### New Capabilities
- `residente-create`: Admin creates new Residente with mandatory fields (`nombre`, `apellidos`, `fechaNacimiento`, `habitacion`) + optional RGPD fields
- `residente-edit`: Admin updates any Residente field including RGPD-sensitive fields
- `residente-archive`: Admin soft-deletes a Residente (sets `archivado: true`) without removing history
- `residente-list`: Paginated listing of residentes with filter (`active | archived | all`)

### Modified Capabilities
- None

## Approach

- **API layer**: Express controller parses request, validates with Zod, calls service, returns `201/200` or error. Auth via `verifyAuth` + `requireRole('admin')` middleware.
- **Service layer**: Business logic in `ResidentesService`. Firestore write with auto-generated `id` (UUID), `creadoEn`, `actualizadoEn`, `archivado: false`. Archive sets `archivado: true`, `actualizadoEn`.
- **Frontend**: Pinia store wraps Firestore SDK directly (`addDoc`, `updateDoc`, `query` with `where archivado === false` filter). Components use the store actions.
- **Validation**: Zod schemas derived from `SPEC/entities.md` field names — G04 compliance enforced.
- **Rollback**: Delete Firestore document by ID (no migration needed for soft-delete).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `code/api/src/routes/residentes.routes.ts` | Modified | Add `POST`, `PATCH`, `PATCH /:id/archive` routes |
| `code/api/src/controllers/residentes.controller.ts` | New | HTTP handlers for create/update/archive |
| `code/api/src/services/residentes.service.ts` | Modified | Add `createResidente`, `updateResidente`, `archiveResidente` |
| `code/api/src/types/residente.types.ts` | Modified | Add `ResidenteCreateSchema`, `ResidenteUpdateSchema` |
| `code/api/src/middleware/requireRole.ts` | Modified | Ensure `requireRole` factory exists (from AGENTS/backend-specialist.md) |
| `code/frontend/src/stores/useResidentesStore.ts` | Modified | Add CRUD actions + filtered fetch |
| `code/frontend/src/views/admin/ResidentsView.vue` | New | Listado con filtros activo/archivado |
| `code/frontend/src/components/admin/ResidenteForm.vue` | New | Formulario alta/edición |
| `firestore.rules` | Modified | Allow create/update/archive only for `role = admin` |
| `SPEC/entities.md` | None | Already has Residente entity (G04 verified) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Zod schema drift from `SPEC/entities.md` | Low | Cross-check field names before writing types; G04 enforced by reviewer |
| Firestore Rules conflict with API auth | Low | Test both API and direct Firestore access with emulator |
| Frontend form state diverges from API payload | Medium | Shared Zod schema used in both layers (types extracted from Zod) |

## Rollback Plan

- **API**: Revert routes to `GET /:id` only. Rollback = remove POST/PATCH handlers from controller, delete service methods.
- **Frontend**: Revert store actions; UI reverts to read-only (existing US-05 behavior preserved).
- **Firestore**: Manual deletion of test documents via Firebase console. No data migration required for soft-delete.
- **Firestore Rules**: Revert to previous `.read` rules (create/update already blocked for non-admin).

## Dependencies

- Firebase Admin SDK initialized in `services/firebase.ts`
- `verifyAuth` middleware + `requireRole` guard already in place (ADR-03b)
- Firestore emulator for local testing
- Stitch screen `US-09-resident-records` already exists (G10 satisfied)

## Success Criteria

- [ ] `POST /api/residentes` returns `201` with created document when admin creates a resident
- [ ] `POST /api/residentes` returns `403` when gerocultor attempts create
- [ ] `PATCH /api/residentes/:id` updates document and sets `actualizadoEn`
- [ ] `PATCH /api/residentes/:id/archive` sets `archivado: true`
- [ ] GET residentes filtered by `archivado === false` excludes archived residents
- [ ] TC-01 through TC-10 pass (Playwright e2e + Vitest unit)
- [ ] G04 field name consistency verified: all field names match `SPEC/entities.md` exactly