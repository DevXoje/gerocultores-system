# API Contract: Tareas

**Base Path:** `/api/tareas`  
**Schema Reference:** [Tarea Schema](../../models/tareas.md) (and canonical definitions in `SPEC/entities.md`)

## Authentication & Authorization
- **Headers:** All endpoints require `Authorization: Bearer <Firebase_ID_Token>`.
- **Authorization:** 
  - `admin` can access all tasks.
  - `gerocultor` can only access tasks assigned to their `uid` or for residents assigned to them.

---

## Endpoints

### 1. List Tasks
`GET /api/tareas`

Retrieves a list of tasks. Allows filtering by date, assignee, and status.

**Query Parameters:**
- `date` (string, optional): ISO8601 date format (`YYYY-MM-DD`). Filters tasks by `fechaHora` matching this date.
- `assignedTo` (string, optional): The `usuarioId` (UID) of the gerocultor.
- `status` (string, optional): One of `pendiente`, `en_curso`, `completada`, `con_incidencia`.

**Validation Rules:**
- `date` must be a valid ISO8601 date.
- `status` must be a valid enum value.
- `assignedTo` must be an existing user UID (existence checked by service).

**Responses:**
- `200 OK`
  ```json
  {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "titulo": "Administrar medicación",
        "tipo": "medicacion",
        "fechaHora": "2026-04-18T08:00:00Z",
        "estado": "pendiente",
        "notas": null,
        "residenteId": "res-uuid-456",
        "usuarioId": "user-uid-123",
        "creadoEn": "2026-04-17T10:00:00Z",
        "actualizadoEn": "2026-04-17T10:00:00Z",
        "completadaEn": null
      }
    ],
    "meta": {
      "total": 1
    }
  }
  ```
- `400 Bad Request` (Invalid query parameter format)
- `401 Unauthorized` (Missing or invalid token)

---

### 2. Get Task by ID
`GET /api/tareas/:id`

Retrieves a single task by its unique identifier.

**Path Parameters:**
- `id` (string, required): The UUID of the task.

**Responses:**
- `200 OK`
  ```json
  {
    "data": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Administrar medicación",
      "tipo": "medicacion",
      "fechaHora": "2026-04-18T08:00:00Z",
      "estado": "pendiente",
      "notas": null,
      "residenteId": "res-uuid-456",
      "usuarioId": "user-uid-123",
      "creadoEn": "2026-04-17T10:00:00Z",
      "actualizadoEn": "2026-04-17T10:00:00Z",
      "completadaEn": null
    }
  }
  ```
- `403 Forbidden` (User does not have access to this task)
- `404 Not Found` (Task does not exist)

---

### 3. Create Task
`POST /api/tareas`

Creates a new task.

**Request Body:**
```json
{
  "titulo": "Aseo matutino",
  "tipo": "higiene",
  "fechaHora": "2026-04-18T09:00:00Z",
  "residenteId": "res-uuid-456",
  "usuarioId": "user-uid-123",
  "notas": "Prestar especial atención a la piel"
}
```

**Validation Rules:**
- `titulo`, `tipo`, `fechaHora`, `residenteId`, `usuarioId` are required.
- `tipo` must be one of: `higiene`, `medicacion`, `alimentacion`, `actividad`, `revision`, `otro`.
- `fechaHora` must be a valid ISO8601 datetime.
- `residenteId` and `usuarioId` must point to existing records (existence checked by service).

**Responses:**
- `201 Created`
  ```json
  {
    "data": {
      "id": "new-uuid-789",
      "titulo": "Aseo matutino",
      "tipo": "higiene",
      "fechaHora": "2026-04-18T09:00:00Z",
      "estado": "pendiente",
      "notas": "Prestar especial atención a la piel",
      "residenteId": "res-uuid-456",
      "usuarioId": "user-uid-123",
      "creadoEn": "2026-04-18T08:00:00Z",
      "actualizadoEn": "2026-04-18T08:00:00Z",
      "completadaEn": null
    }
  }
  ```
- `400 Bad Request` (Validation error)

---

### 4. Update Task Status
`PATCH /api/tareas/:id/status`

Updates only the status of a specific task.

**Request Body:**
```json
{
  "estado": "completada"
}
```

**Validation Rules:**
- `estado` is required and must be one of: `pendiente`, `en_curso`, `completada`, `con_incidencia`.
- If `estado` is `completada`, the server automatically sets `completadaEn` to the current timestamp.

**Responses:**
- `200 OK`
- `400 Bad Request` (Invalid status)
- `403 Forbidden`
- `404 Not Found`

---

### 5. Update Task (Partial)
`PATCH /api/tareas/:id`

Partially updates task fields (e.g., rescheduling or reassigning).

**Request Body:**
```json
{
  "fechaHora": "2026-04-18T10:30:00Z",
  "usuarioId": "new-user-uid"
}
```

**Validation Rules:**
- Read-only fields (`id`, `creadoEn`, `actualizadoEn`, `completadaEn`) cannot be updated.
- `fechaHora` must be ISO8601 if provided.
- `tipo` must be valid enum if provided.
- `usuarioId` and `residenteId` must exist if provided.

**Responses:**
- `200 OK`
- `400 Bad Request`
- `404 Not Found`

---

### 6. Add Task Notes
`POST /api/tareas/:id/notes`

Appends or updates notes for a task without changing its status.

**Request Body:**
```json
{
  "notas": "El residente rehusó la medicación inicialmente."
}
```

**Validation Rules:**
- `notas` is required and must be a string.

**Responses:**
- `200 OK`
- `400 Bad Request`
- `404 Not Found`
