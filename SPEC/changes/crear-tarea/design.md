# Design: crear-tarea (US-14)

## Technical Approach

Implement `POST /api/tareas` as a new Express route that validates the request body, checks authorization (gerocultor can only create tasks for assigned residents), then writes a new Tarea to Firestore. The endpoint follows the existing controller → service pattern and maps service errors to appropriate HTTP status codes.

**Storage**: Tasks live in a Firestore subcollection under Residente: `/residentes/{residenteId}/tareas/{tareaId}`. This differs from the existing service's top-level `tasks` collection — a separate migration ADR will be needed for existing routes.

---

## Architecture Decisions

### Decision: Storage subcollection vs. top-level collection

**Choice**: Tarea stored as `/residentes/{residenteId}/tareas/{tareaId}` (subcollection of Residente)

**Alternatives considered**:
- Top-level `tasks` collection — already used by existing `getTareas()` and `updateEstado()` routes, but does not reflect the domain relationship (a Tarea belongs conceptually to a Residente) and makes authorization checks harder to express in Firestore rules

**Rationale**: Spec §5 explicitly defines this relationship. Subcollection enables Firestore security rules that express "gerocultor can only write tasks for residents they are assigned to" — a rule impossible to express cleanly with a top-level collection. The existing read routes will need a future migration to query across subcollections.

---

### Decision: Authorization check location

**Choice**: Authorization check in service layer (not Firestore rules alone)

**Alternatives considered**:
- Rely solely on Firestore rules — rules alone cannot check `gerocultoresAsignados` array membership because Firestore rules lack array-contains-any over subcollection parent fields
- Check in controller — service layer is preferred because it keeps business rules together with data access

**Rationale**: Gerocultor role restriction needs: (1) service fetches Residente doc, (2) checks `gerocultoresAsignados.includes(uid)`. Admin role skips this check entirely. This is business logic → service layer.

---

## Data Flow

```
POST /api/tareas
     │
     ▼
verifyAuth (middleware) ── 401 if no token
     │
     ▼
requireRole(['admin','gerocultor']) ── 403 if wrong role
     │
     ▼
TareasController.createTarea(req.body)
     │
     ▼
TareasService.createTarea(dto, requestingUid, requestingRole)
     │
     ├─ validate Zod schema ── 400 on failure
     │
     ├─ fetch Residente(residenteId) ── 400 if not found or archivado
     │
     ├─ if gerocultor: check residente.gerocultoresAsignados.includes(uid) ── 400 ACCESS_DENIED
     │
     ├─ fetch Usuario(usuarioId) ── 400 if not found or disabled
     │
     └─ adminDb.collection('residents').doc(id).collection('tasks').doc(uuid).set(...)
           │
           ▼
     TareaResponse (201)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `code/api/src/routes/tareas.routes.ts` | Modify | Add `router.post('/', controller.createTarea)` before the `router.use(verifyAuth)` line needs rethink — currently verifyAuth is applied globally. No change needed here; controller handles role check. |
| `code/api/src/controllers/tareas.controller.ts` | Create | `createTarea` method — parse body, call service, map errors |
| `code/api/src/services/tareas.service.ts` | Create | `createTarea(dto, uid, role)` — validate, authorize, write |
| `code/api/src/types/tarea.types.ts` | Modify | Add `CreateTareaSchema` Zod schema, export `CreateTareaDto` type |
| `code/api/src/middleware/requireRole.ts` | Create | Middleware factory `requireRole(...roles)` |

---

## Interfaces / Contracts

### Zod Input Schema (`CreateTareaSchema`)

```typescript
// code/api/src/types/tarea.types.ts
export const CreateTareaSchema = z.object({
  titulo: z.string().min(1, 'titulo es requerido').max(200).trim(),
  tipo: TareaTipoEnum,
  fechaHora: z.string().datetime({ message: 'fechaHora debe ser ISO8601 válido' }),
  residenteId: z.string().uuid('residenteId debe ser UUID válido'),
  usuarioId: z.string(),
  notas: z.string().max(2000).nullable().optional(),
})
export type CreateTareaDto = z.infer<typeof CreateTareaSchema>
```

Note: `usuarioId` is stored as a string path `usuarios/{uid}` in the spec, but the existing `TareaDocSchema` uses `usuarioId: z.string()` without path normalization. The service will store the raw value as provided.

### Controller Method

```typescript
// TareasController.createTarea
// Signature: (req: Request, res: Response) => Promise<void>
// Calls: tareasService.createTarea(dto, req.user.uid, req.user.role)
// Error mapping:
//   Zod error → 400 { error: 'VALIDATION_ERROR', field, message }
//   ResidenteNotFound / UsuarioNotFound / AccessDenied → 400
//   Firebase error → 500
// Success: 201 { data: TareaResponse }
```

### Service Method

```typescript
// TareasService.createTarea(dto: CreateTareaDto, requestingUid: string, requestingRole: UserRole): Promise<TareaResponse>
//
// Steps:
// 1. Parse and validate CreateTareaSchema → throw ZodError as 400
// 2. Fetch Residente doc → throw ResidenteNotFound as 400 if not found or archivado
// 3. If requestingRole === 'gerocultor':
//      if !residente.gerocultoresAsignados.includes(requestingUid) → throw AccessDenied as 400
// 4. Fetch Usuario doc → throw UsuarioNotFound as 400 if not found or disabled
// 5. Generate UUID with crypto.randomUUID()
// 6. Firestore setDoc at /residents/{residenteId}/tasks/{uuid} with:
//      { titulo, tipo, fechaHora, estado: 'pendiente', notas, residenteId, usuarioId,
//        creadoEn: serverTime, actualizadoEn: serverTime, completadaEn: null }
// 7. Return TareaResponse with id = `tasks/{uuid}`
```

### Firestore Write

```
Path: /residents/{residenteId}/tasks/{uuid}
uuid = crypto.randomUUID()
creadoPor = requestingUid (stored for audit)
```

---

## Error Handling

| Service error | HTTP Status | Response body |
|---|---|---|
| Zod validation failure | 400 | `{ error: 'VALIDATION_ERROR', field, message }` |
| `residenteId` not found or `archivado: true` | 400 | `{ error: 'RESIDENTE_NOT_FOUND', field: 'residenteId', message }` |
| `usuarioId` not found or `disabled: true` | 400 | `{ error: 'USUARIO_NOT_FOUND', field: 'usuarioId', message }` |
| Gerocultor not assigned to resident | 400 | `{ error: 'ACCESS_DENIED', field: 'residenteId', message }` |
| Firebase exception | 500 | `{ error: 'INTERNAL_ERROR', message: '...' }` |

---

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Zod schema: valid/invalid combos | Direct schema.parse() calls |
| Unit | Service: authorization logic (admin bypass, gerocultor assigned check) | Mock Firestore doc responses |
| Integration | Full endpoint: happy path + each error path | supertest agent against Express app with emulator Firestore |

---

## Migration / Rollout

No migration needed — new endpoint only. Existing routes continue to use top-level `tasks` collection until a future ADR addresses the data model migration.

---

## Open Questions

- [ ] `usuarioId` field in spec shows path format `usuarios/uid-123` but existing `TareaDocSchema` uses plain string. Confirm whether the API should accept/normalize path-format UIDs or store raw value. **Affected**: service normalization step.
- [ ] Existing `getTareas()` and `updateEstado()` use top-level `tasks` collection. Should a migration ADR be proposed to move all tarea operations to the subcollection model, or keep both data models in parallel?