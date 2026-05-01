# Design: Alta de Residente (US-09)

## Technical Approach

Implement write operations (create, update, archive) for `Residente` documents in Firestore via REST API endpoints, with a corresponding Pinia store and Vue view for the admin dashboard. Follows existing `residentes.service.ts` patterns and Zod validation from `residente.types.ts`.

## Architecture Decisions

### Decision: Firestore collection path

**Choice**: Write to `/residents` (via `COLLECTIONS.residentes`) with server-generated UUID.
**Alternatives considered**: Custom ID format, subcollection per resident.
**Rationale**: `COLLECTIONS.residentes` already maps to `'residents'` (ADR-02b). Server-generated UUID avoids collision and matches existing US-05 pattern.

### Decision: Validation strategy

**Choice**: Zod schemas in `residente.types.ts` — `CreateResidenteSchema` (required fields only), `UpdateResidenteSchema` (partial), `ArchiveResidenteSchema` (empty body — archive action encoded in route).
**Alternatives considered**: Validation in controller with inline schemas.
**Rationale**: Schema-per-endpoint keeps types derived from Zod (`z.infer`), matches existing `ResidenteDocSchema` pattern, and enables precise error reporting per field.

### Decision: Archive as PATCH /:id/archive

**Choice**: Separate route `PATCH /api/residentes/:id/archive` that sets `archivado: true`.
**Alternatives considered**: PUT with full document; PATCH with `{ archivado: true }` on same endpoint as general updates.
**Rationale**: Archive is a specific business action with clear semantics. A dedicated route makes Firestore security rules easier to express and keeps the intent explicit. The spec requires it as a distinct endpoint.

### Decision: Firestore security rules

**Choice**: `request.auth != null && request.resource.data.archivado == false` for writes by admin only; gerocultor cannot write.
**Alternatives considered**: Path-based rules, custom claims checks.
**Rationale**: Matches SPEC's admin-only requirement. Firestore rules enforce at database level; the API layer enforces via `requireRole('admin')` as defense-in-depth.

## Data Flow

```
[Admin UI] ──POST /api/residentes──► [express] ──verifyAuth──► [requireRole('admin')]
                                              │
                                              ▼
                                      [ResidentesController]
                                              │
                                              ▼ (safeParse body)
                                      [CreateResidenteSchema]
                                              │
                                              ▼
                                      [ResidentesService.createResidente]
                                              │
                                              ▼
                                      [adminDb.collection('residents').add()]
                                              │
                                              ▼
                                      [docToResponse] ──► 201 { data: ResidenteResponse }

[Admin UI] ──PATCH /api/residentes/:id/archive──► [requireRole('admin')]
                                              │
                                              ▼
                                      [ResidentesService.archiveResidente]
                                              │
                                              ▼
                                      [adminDb.doc(id).update({ archivado: true, actualizadoEn })]
                                              │
                                              ▼
                                      [200 { data: updated }]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `code/api/src/types/residente.types.ts` | Modify | Add `CreateResidenteSchema`, `UpdateResidenteSchema`, `ArchiveResidenteSchema`; add `CreateResidenteDto`, `UpdateResidenteDto` |
| `code/api/src/services/residentes.service.ts` | Modify | Add `createResidente`, `updateResidente`, `archiveResidente`, `listResidentes` methods |
| `code/api/src/controllers/residentes.controller.ts` | Modify | Add `createResidente`, `updateResidente`, `archiveResidente`, `listResidentes` handlers |
| `code/api/src/routes/residentes.routes.ts` | Modify | Add POST `/`, PATCH `/:id`, PATCH `/:id/archive`, GET `/` routes with `requireRole('admin')` |
| `code/api/src/middleware/requireRole.ts` | No change | Already exists — used as-is |
| `code/frontend/src/business/residents/domain/entities/Residente.ts` | Create | Domain entity + Zod schema matching SPEC/entities.md field names |
| `code/frontend/src/business/residents/application/use-cases/useResidenteMutations.ts` | Create | `createResidente`, `updateResidente`, `archiveResidente` async operations |
| `code/frontend/src/business/residents/application/use-cases/useResidenteQueries.ts` | Create | `listResidentes`, `getResidenteById` (read ops) |
| `code/frontend/src/business/residents/presentation/stores/residente.store.ts` | Create | Pinia store: state (activeList, archivedList, isLoading), getters (activeCount), synchronous mutations only |
| `code/frontend/src/business/residents/presentation/views/ResidentsView.vue` | Create | Vue view for admin resident management (Stitch screen: `US-09-resident-records`) |
| `code/frontend/src/business/residents/presentation/components/ResidenteForm.vue` | Create | Form component for create/edit with BEM styling |
| `code/frontend/src/router/index.ts` | Modify | Add `/residents` route pointing to `ResidentsView.vue` |
| `firestore.rules` | Modify | Add write rules for `/residents`: admin-only for create/update/archive |

## Interfaces / Contracts

### Backend — Zod Schemas (`residente.types.ts`)

```typescript
export const CreateResidenteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().min(1, 'Los apellidos son requeridos'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  habitacion: z.string().min(1, 'La habitación es requerida'),
})

export const UpdateResidenteSchema = CreateResidenteSchema.partial().extend({
  foto: z.string().nullable().optional(),
  diagnosticos: z.string().nullable().optional(),
  alergias: z.string().nullable().optional(),
  medicacion: z.string().nullable().optional(),
  preferencias: z.string().nullable().optional(),
})

export type CreateResidenteDto = z.infer<typeof CreateResidenteSchema>
export type UpdateResidenteDto = z.infer<typeof UpdateResidenteSchema>
```

### Backend — API Response

All responses follow `{ data: T }` or `{ error: string, code?: string }` shape.

| Endpoint | Method | Auth | Request Body | Response |
|---|---|---|---|---|
| `/api/residentes` | POST | admin | `CreateResidenteDto` | 201 + `ResidenteResponse` |
| `/api/residentes` | GET | admin/gerocultor | `?filter=active\|archived\|all` | 200 + `ResidenteResponse[]` |
| `/api/residentes/:id` | PATCH | admin | `UpdateResidenteDto` | 200 + `ResidenteResponse` |
| `/api/residentes/:id/archive` | PATCH | admin | (empty) | 200 + `ResidenteResponse` |

### Frontend — Store (Pinia)

```typescript
// state
activeList: Residente[]     // archivado === false
archivedList: Residente[]   // archivado === true
isLoading: boolean

// getters
activeCount: number

// mutations (sync only)
setActiveList(list: Residente[]): void
setArchivedList(list: Residente[]): void
addResidente(residente: Residente): void
updateResidente(id: string, patch: Partial<Residente>): void
setLoading(loading: boolean): void
```

### Frontend — Composable contract

```typescript
// useResidenteMutations
async function createResidente(dto: CreateResidenteDto): Promise<Residente>
async function updateResidente(id: string, dto: UpdateResidenteDto): Promise<Residente>
async function archiveResidente(id: string): Promise<Residente>

// useResidenteQueries
async function listResidentes(filter: 'active' | 'archived' | 'all'): Promise<Residente[]>
async function getResidenteById(id: string): Promise<Residente>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `ResidentesService.createResidente` | Vitest + `vi.mock` on `firebase.ts`; verify Firestore `add()` called with correct fields including `archivado: false`, `creadoEn`, `actualizadoEn` |
| Unit | `ResidentesService.archiveResidente` | Verify `update()` called with `{ archivado: true, actualizadoEn }` |
| Integration | `POST /api/residentes` with valid/invalid body | Supertest + mocked service; assert 201/400 |
| Integration | `PATCH /api/residentes/:id/archive` auth | Supertest — admin gets 200, gerocultor gets 403 |
| E2E | Full create → edit → archive flow | Playwright against emulator |

## Migration / Rollout

No migration required. New fields (`archivado`, `creadoEn`, `actualizadoEn`) are server-set on create; existing residents without these fields are unaffected by reads but will receive them on first update.

## Open Questions

- [ ] `fechaNacimiento` in SPEC/entities.md is `Date` type but spec says ISO string — confirm whether API accepts ISO string or Date format (currently treating as ISO string in Zod schema)
- [ ] Firestore emulator test setup — is there a `firebase.json` with emulators configured, or should this be added?