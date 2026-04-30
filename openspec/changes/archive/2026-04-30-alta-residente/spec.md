# Delta Spec — Residente (alta-residente)

> Change: `alta-residente` (US-09)
> Mode: hybrid — persists to Engram (`sdd/alta-residente/spec`) AND filesystem
> Test Plan: `OUTPUTS/test-plans/test-plan-US-09.md` — TC-01 through TC-10 exist (do not rewrite)
> G04 Compliance: All field names match `SPEC/entities.md` — Residente entity exactly

---

## ADDED Requirements

### Requirement: Residente Creation

The system SHALL allow administrators to create a new `Residente` document in Firestore via `POST /api/residentes`.

The request body MUST include all four mandatory fields: `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`. The system SHALL reject requests missing any of these with HTTP 400 and a validation error message per field.

On successful creation, the system SHALL return HTTP 201 with the created document's `id` and all assigned fields (`archivado: false`, `creadoEn`, `actualizadoEn` set by the server).

Non-admin users SHALL receive HTTP 403 on any create attempt.

#### Scenario: Admin creates residente with all mandatory fields

- GIVEN an authenticated admin user
- WHEN the admin sends `POST /api/residentes` with `{nombre: "María", apellidos: "García López", fechaNacimiento: "1955-03-15", habitacion: "201-A"}`
- THEN the system creates a Firestore document in `/residentes` with a server-generated UUID `id`
- AND `archivado` is set to `false`
- AND `creadoEn` and `actualizadoEn` are set to the server timestamp
- AND HTTP 201 is returned with `{id, nombre, apellidos, fechaNacimiento, habitacion, archivado, creadoEn, actualizadoEn}`

#### Scenario: Admin creates residente — missing mandatory field

- GIVEN an authenticated admin user
- WHEN the admin sends `POST /api/residentes` with `{nombre: "María", apellidos: "García López"}` (missing `fechaNacimiento` and `habitacion`)
- THEN the system returns HTTP 400 with validation errors indicating which mandatory fields are missing
- AND no Firestore document is created

#### Scenario: Gerocultor attempts to create residente

- GIVEN an authenticated gerocultor user
- WHEN the gerocultor sends `POST /api/residentes`
- THEN the system returns HTTP 403
- AND no Firestore document is created

---

### Requirement: Residente Editing

The system SHALL allow administrators to update any field of an existing `Residente` document via `PATCH /api/residentes/:id`.

The request body MAY include any subset of fields. The `actualizadoEn` field SHALL be set to the server timestamp on every update. The `creadoEn` and `id` fields MUST NOT be modified.

On successful update, the system SHALL return HTTP 200 with the updated document.

Non-admin users SHALL receive HTTP 403 on any update attempt. Requests for non-existent residents SHALL return HTTP 404.

#### Scenario: Admin updates RGPD-sensitive fields

- GIVEN an authenticated admin user and an existing `Residente` document with id `res-001`
- WHEN the admin sends `PATCH /api/residentes/res-001` with `{diagnosticos: "Diabetes tipo 2", alergias: "Penicilina", medicacion: "Metformina 850mg"}`
- THEN the Firestore document `/residentes/res-001` is updated with the new values
- AND `actualizadoEn` reflects the current server timestamp
- AND `creadoEn` and `id` remain unchanged
- AND HTTP 200 is returned with the full updated document

#### Scenario: Admin updates non-existent residente

- GIVEN an authenticated admin user
- WHEN the admin sends `PATCH /api/residentes/non-existent-id`
- THEN the system returns HTTP 404 with `NotFoundError`

---

### Requirement: Residente Archival

The system SHALL allow administrators to archive an active `Residente` (set `archivado: true`) without removing the document or its history via `PATCH /api/residentes/:id/archive`.

Archiving a resident SHALL NOT remove or modify the resident's existing `Tarea` or `Incidencia` records. The `actualizadoEn` field SHALL be set to the server timestamp when archiving.

A resident with `archivado: true` SHALL NOT appear in agenda queries that filter by `archivado === false`. A resident with `archivado: true` SHALL remain accessible for historical record consultation.

#### Scenario: Admin archives active residente

- GIVEN an authenticated admin user and an active `Residente` document with id `res-001` (`archivado: false`)
- WHEN the admin sends `PATCH /api/residentes/res-001/archive`
- THEN the system sets `archivado: true` and `actualizadoEn` to the current server timestamp
- AND HTTP 200 is returned with the updated document

#### Scenario: Archived residente excluded from active agendas

- GIVEN a `Residente` document with `archivado: true` and existing `Tarea` records
- WHEN a gerocultor queries the agenda
- THEN the resident's tareas are NOT included in the results
- AND the resident is excluded from resident selection dropdowns in agenda creation flows

#### Scenario: Archived residente history remains accessible

- GIVEN an authenticated admin or gerocultor and an archived `Residente` document with id `res-002`
- WHEN the user requests the resident's detail or incidence history
- THEN the full resident record is returned including all historical data
- AND the response indicates the resident is archived

---

### Requirement: Residente Listing with Archive Filter

The system SHALL provide a filtered listing of `Residente` documents via `GET /api/residentes` with an optional query parameter `filter` with values `active` (default), `archived`, or `all`.

By default (`filter=active`), the listing SHALL return only residents where `archivado === false`.

When `filter=all`, the listing SHALL return all residents regardless of archive status.

The listing SHALL return documents ordered by `creadoEn` descending.

#### Scenario: Admin lists active residents (default)

- GIVEN an authenticated admin user
- WHEN the admin sends `GET /api/residentes` (no filter parameter)
- THEN the system returns only residents where `archivado === false`
- AND the results are ordered by `creadoEn` descending

#### Scenario: Admin lists all residents including archived

- GIVEN an authenticated admin user
- WHEN the admin sends `GET /api/residentes?filter=all`
- THEN the system returns all residents regardless of `archivado` status
- AND archived residents are identifiable by `archivado: true`

#### Scenario: Archived residents excluded from default listing

- GIVEN there exists at least one resident with `archivado: true`
- WHEN any user sends `GET /api/residentes` without the `all` filter
- THEN no resident with `archivado: true` appears in the response

---

## Field Name Consistency (G04)

All API request/response fields and Firestore document fields MUST use the exact names from `SPEC/entities.md` — Residente entity:

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` (UUID) | yes |
| `nombre` | `string` | yes |
| `apellidos` | `string` | yes |
| `fechaNacimiento` | `Date` | yes |
| `habitacion` | `string` | yes |
| `foto` | `string \| null` | no |
| `diagnosticos` | `string` | no |
| `alergias` | `string` | no |
| `medicacion` | `string` | no |
| `preferencias` | `string` | no |
| `archivado` | `boolean` | yes |
| `creadoEn` | `Date` | yes |
| `actualizadoEn` | `Date` | yes |

No aliases. No renames. Field names MUST match exactly across API, service, and Firestore.

---

## Test Coverage Reference

Test plan exists at `OUTPUTS/test-plans/test-plan-US-09.md` — TC-01 through TC-10.

| Capability | Test Cases | Status |
|-----------|-----------|--------|
| Create residente | TC-01, TC-02 | Existing |
| Edit residente | TC-03 | Existing |
| Archive residente | TC-04, TC-06 | Existing |
| Archivado excluded from agendas | TC-05 | Existing |
| Listado with indicator | TC-07 | Existing |
| Gerocultor blocked | TC-08, TC-09 | Existing |
| RGPD field access | TC-10 | Existing |

No test cases have been rewritten. This spec references the existing test plan.