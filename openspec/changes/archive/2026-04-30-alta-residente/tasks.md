# Tasks: Alta de Residente (US-09)

## Phase 1: Foundation — Backend Types & Schemas

- [ ] 1.1 Add `CreateResidenteSchema` and `UpdateResidenteSchema` to `code/api/src/types/residente.types.ts` — extend Zod with required `nombre`, `apellidos`, `fechaNacimiento`, `habitacion` and optional RGPD fields (`foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`)
- [ ] 1.2 Add `CreateResidenteDto` and `UpdateResidenteDto` TypeScript types via `z.infer<>` in `code/api/src/types/residente.types.ts`
- [ ] 1.3 Add `ArchiveResidenteSchema` (empty body — archive action is route-encoded) in `code/api/src/types/residente.types.ts`
- [ ] 1.4 Add `ListResidentesQuerySchema` with optional `filter: z.enum(['active', 'archived', 'all'])` to `code/api/src/types/residente.types.ts`

## Phase 2: Backend — Service Layer

- [ ] 2.1 Add `createResidente(dto: CreateResidenteDto, createdByUid: string): Promise<ResidenteResponse>` to `ResidentesService` — calls `adminDb.collection('residents').add()` with `archivado: false`, `creadoEn`, `actualizadoEn` server timestamps; uses `docToResponse()` on result
- [ ] 2.2 Add `listResidentes(filter: 'active' | 'archived' | 'all'): Promise<ResidenteResponse[]>` to `ResidentesService` — applies `where('archivado', '==', false)` for active, no filter for all, ordered by `creadoEn` descending
- [ ] 2.3 Add `updateResidente(id: string, dto: UpdateResidenteDto): Promise<ResidenteResponse>` to `ResidentesService` — calls `.update()` with dto plus `actualizadoEn`; throws `NotFoundError` if doc missing
- [ ] 2.4 Add `archiveResidente(id: string): Promise<ResidenteResponse>` to `ResidentesService` — calls `.update({ archivado: true, actualizadoEn })`; throws `NotFoundError` if doc missing

## Phase 3: Backend — Controller & Routes

- [ ] 3.1 Add `createResidente` handler to `ResidentesController` — parse `CreateResidenteSchema`, call service, return 201 `{ data: ResidenteResponse }`
- [ ] 3.2 Add `listResidentes` handler to `ResidentesController` — parse query param, call service, return 200 `{ data: ResidenteResponse[] }`
- [ ] 3.3 Add `updateResidente` handler to `ResidentesController` — parse `UpdateResidenteSchema` + `ResidenteIdParamSchema`, call service, return 200
- [ ] 3.4 Add `archiveResidente` handler to `ResidentesController` — parse `ResidenteIdParamSchema`, call service, return 200
- [ ] 3.5 Mount `requireRole('admin')` on `POST /`, `PATCH /:id`, `PATCH /:id/archive` routes in `code/api/src/routes/residentes.routes.ts`; `GET /` allows both admin and gerocultor
- [ ] 3.6 Register new routes in `code/api/src/routes/index.ts` (if not already mounted)

## Phase 4: Firestore Security Rules

- [ ] 4.1 Add write rule to `firestore.rules`: allow `create`, `update` on `/residents` only if `request.auth != null && request.auth.token.role == 'admin'`; archive action sets `archivado == false` constraint on writes
- [ ] 4.2 Add rule that archived residents (`archivado == true`) are readable by any authenticated user (admin or gerocultor) but writable only by admin

## Phase 5: Frontend — Domain & Use Cases

- [ ] 5.1 Create `code/frontend/src/business/residents/domain/entities/Residente.ts` — TypeScript interface + Zod schema matching `SPEC/entities.md` field names exactly (G04): `id`, `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`, `creadoEn`, `actualizadoEn`
- [ ] 5.2 Create `useResidenteMutations.ts` composable — `createResidente(dto)`, `updateResidente(id, dto)`, `archiveResidente(id)` async functions calling the API
- [ ] 5.3 Create `useResidenteQueries.ts` composable — `listResidentes(filter)`, `getResidenteById(id)` async functions

## Phase 6: Frontend — Pinia Store

- [ ] 6.1 Create `residente.store.ts` Pinia store — state: `activeList: Residente[]`, `archivedList: Residente[]`, `isLoading: boolean`; getters: `activeCount`; mutations: `setActiveList`, `setArchivedList`, `addResidente`, `updateResidente`, `setLoading` — sync-only (no async in store)
- [ ] 6.2 Wire store to `useResidenteMutations` and `useResidenteQueries` — mutations call composables and call store mutations on success

## Phase 7: Frontend — Views & Components

- [ ] 7.1 Create `ResidentsView.vue` — admin resident management view (Stitch screen: `US-09-resident-records`); displays active/archived tabs, filter controls, link to create new
- [ ] 7.2 Create `ResidenteForm.vue` — reusable form for create/edit with validation; required fields: `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`; optional RGPD fields; uses BEM naming convention
- [ ] 7.3 Add route `/admin/residentes` → `ResidentsView.vue` in `code/frontend/src/router/index.ts` with admin guard
- [ ] 7.4 Add route `/admin/residentes/nuevo` → inline create form or `ResidentsView.vue` with create mode
- [ ] 7.5 Add route `/admin/residentes/:id/editar` → `ResidenteForm.vue` in edit mode

## Phase 8: Testing

- [ ] 8.1 Unit test: `CreateResidenteSchema` — valid payload parses, missing required field throws, extra fields stripped
- [ ] 8.2 Unit test: `ResidentesService.createResidente` — verify `add()` called with `archivado: false`, `creadoEn`, `actualizadoEn`
- [ ] 8.3 Unit test: `ResidentesService.archiveResidente` — verify `update()` called with `{ archivado: true, actualizadoEn }`
- [ ] 8.4 Integration test: `POST /api/residentes` — 201 with valid body, 400 with missing fields, 403 for gerocultor
- [ ] 8.5 Integration test: `PATCH /api/residentes/:id/archive` — 200 admin, 403 gerocultor, 404 non-existent id
- [ ] 8.6 Integration test: `GET /api/residentes?filter=active` — excludes archived residents; `?filter=all` returns all
- [ ] 8.7 Firestore rules test: admin write to `/residents` allowed, gerocultor write denied, un auth denied
- [ ] 8.8 Playwright E2E: TC-01 (admin create), TC-04 (archive), TC-08 (gerocultor blocked) against emulator

---

**Total: 32 tasks across 8 phases**

**Recommended order**: Phase 1 → 2 → 3 → 4 (backend first, rules second) → 5 → 6 → 7 (frontend in parallel with testing) → 8 (testing last)

**Open questions to resolve before apply**:
- `fechaNacimiento` — API accepts ISO string or Date? Design treats as ISO string in Zod.
- Firestore emulator test setup — `firebase.json` emulators config needs verification.