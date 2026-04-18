# Model: Tarea

> Firestore collection: `tareas`
> Source entity: `SPEC/entities.md` → **Tarea**
> US: US-03 (Consulta de agenda diaria), US-04 (Actualizar estado de una tarea)

---

## Document Schema

| Field | Firestore Type | Required | Description |
|-------|---------------|----------|-------------|
| `id` | auto (doc ID) | sí | Identificador único (Firestore document ID) |
| `titulo` | `string` | sí | Descripción breve de la tarea |
| `tipo` | `string` (enum) | sí | Categoría: `higiene`, `medicacion`, `alimentacion`, `actividad`, `revision`, `otro` |
| `fechaHora` | `Timestamp` | sí | Fecha y hora programada |
| `estado` | `string` (enum) | sí | Estado: `pendiente`, `en_curso`, `completada`, `con_incidencia` |
| `notas` | `string \| null` | no | Notas libres del gerocultor |
| `residenteId` | `string` (UUID) | sí | FK → `residentes/{id}` |
| `usuarioId` | `string` (UUID) | sí | FK → `usuarios/{uid}` |
| `creadoEn` | `Timestamp` | sí | Timestamp de creación (servidor) |
| `actualizadoEn` | `Timestamp` | sí | Timestamp de última modificación (servidor) |
| `completadaEn` | `Timestamp \| null` | no | Se asigna cuando `estado = 'completada'` |

---

## Firestore Path

```
/tareas/{tareaId}
```

**Design note**: The entity spec in `SPEC/entities.md` and design notes describe tareas
as a subcollection under `residentes` (e.g., `/residentes/{residenteId}/tareas`).
In Sprint-2 the root collection approach is used for simplicity (direct query without parent ID).
Migration to subcollection is deferred to Sprint-3 pending a full Firestore rules review.
This assumption is tracked as a known deviation.

---

## Example Documents

### Tarea pendiente

```json
{
  "id": "tarea-abc123",
  "titulo": "Higiene matutina — aseo personal",
  "tipo": "higiene",
  "fechaHora": "2026-04-20T08:00:00.000Z",
  "estado": "pendiente",
  "notas": null,
  "residenteId": "residente-uid-001",
  "usuarioId": "gerocultor-uid-001",
  "creadoEn": "2026-04-18T10:00:00.000Z",
  "actualizadoEn": "2026-04-18T10:00:00.000Z",
  "completadaEn": null
}
```

### Tarea completada

```json
{
  "id": "tarea-def456",
  "titulo": "Administración de medicación matutina",
  "tipo": "medicacion",
  "fechaHora": "2026-04-20T08:30:00.000Z",
  "estado": "completada",
  "notas": "Tomó toda la medicación sin incidencias.",
  "residenteId": "residente-uid-001",
  "usuarioId": "gerocultor-uid-001",
  "creadoEn": "2026-04-18T10:00:00.000Z",
  "actualizadoEn": "2026-04-20T08:45:00.000Z",
  "completadaEn": "2026-04-20T08:45:00.000Z"
}
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tareas` | List tareas (optional filters: `fecha`, `usuarioId`, `residenteId`) |
| `POST` | `/api/tareas` | Create a new tarea |
| `PATCH` | `/api/tareas/:id/estado` | Update tarea status |
| `PATCH` | `/api/tareas/:id/notas` | Add/update notes on a tarea |

All endpoints require a valid Firebase Auth token (`verifyAuth` middleware).

---

## Enum Values

### `tipo`

| Value | Description |
|-------|-------------|
| `higiene` | Personal hygiene task |
| `medicacion` | Medication administration |
| `alimentacion` | Assisted feeding/meals |
| `actividad` | Cognitive or physical activity |
| `revision` | Health/vitals review |
| `otro` | Other uncategorized task |

### `estado`

| Value | Description |
|-------|-------------|
| `pendiente` | Initial state — not started |
| `en_curso` | In progress |
| `completada` | Completed — `completadaEn` is set |
| `con_incidencia` | Completed with an associated incident |

---

## Business Rules

1. `estado` starts as `pendiente` on creation — not settable by client.
2. When `estado` transitions to `completada`, `completadaEn` is set by the server.
3. Only the assigned gerocultor (`usuarioId`) or an admin should be able to update a tarea (enforced in a future sprint's security rules).
4. `creadoEn` and `completadaEn` are server-assigned timestamps — never client-supplied.

---

*Last updated: 2026-04-18 — Sprint-2 T-24 implementation*
