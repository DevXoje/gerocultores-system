# API Contract — POST /api/incidencias

**User Story**: US-06 — Registro de incidencia  
**Sprint**: sprint-3  
**Status**: implemented

---

## Endpoint

```
POST /api/incidencias
```

**Auth**: Required — valid Firebase Bearer token (both `admin` and `gerocultor` roles).

---

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <firebase-id-token>` |
| `Content-Type` | Yes | `application/json` |

### Body (JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tipo` | `enum` | Yes | `'caida' \| 'comportamiento' \| 'salud' \| 'alimentacion' \| 'medicacion' \| 'otro'` |
| `severidad` | `enum` | Yes | `'leve' \| 'moderada' \| 'critica'` |
| `descripcion` | `string` | Yes | Free-text description of the incident (min 1 char) |
| `residenteId` | `string` | Yes | FK → `Residente.id` |
| `tareaId` | `string \| null` | No | FK → `Tarea.id` (if incident originated from a task) |

**Example**:

```json
{
  "tipo": "caida",
  "severidad": "leve",
  "descripcion": "El residente se cayó al levantarse de la cama sin asistencia.",
  "residenteId": "resident-uuid-123",
  "tareaId": null
}
```

---

## Responses

### 201 Created

Incidencia successfully created and stored in Firestore (`incidences` collection).

```json
{
  "data": {
    "id": "auto-generated-firestore-id",
    "tipo": "caida",
    "severidad": "leve",
    "descripcion": "El residente se cayó al levantarse de la cama sin asistencia.",
    "residenteId": "resident-uuid-123",
    "usuarioId": "uid-of-authenticated-user",
    "tareaId": null,
    "registradaEn": "2026-04-19T10:00:00.000Z"
  }
}
```

> **Note**: `usuarioId` and `registradaEn` are always set server-side. The client cannot provide or override these values.

### 400 Bad Request — Validation Error

Returned when the request body fails Zod schema validation.

```json
{
  "error": "Datos inválidos",
  "code": "VALIDATION_ERROR",
  "details": {
    "tipo": ["Invalid enum value. Expected 'caida' | 'comportamiento' | 'salud' | 'alimentacion' | 'medicacion' | 'otro', received 'accidente'"]
  }
}
```

### 401 Unauthorized

Returned when no `Authorization` header is present or the token is invalid/expired.

```json
{
  "error": "Token no provisto o inválido",
  "code": "UNAUTHORIZED"
}
```

### 500 Internal Server Error

Returned when Firestore is unavailable or an unexpected error occurs.

```json
{
  "error": "Internal server error"
}
```

---

## Business Rules

- `registradaEn` is set **server-side** using `new Date().toISOString()` — the client cannot provide it.
- `usuarioId` is set to `req.user.uid` (the authenticated user) — the client cannot override it.
- `tareaId` defaults to `null` if not provided.
- The incidencia history is **immutable**: no edit or delete operations are supported.
- Both `admin` and `gerocultor` roles may create incidencias.

---

## Firestore Collection

Documents are stored in the root-level `incidences` collection (canonical key: `COLLECTIONS.incidences`).

**Document shape** (matches `IncidenciaDoc` in `src/types/incidencia.types.ts`):

```typescript
{
  tipo: IncidenciaTipo,
  severidad: IncidenciaSeveridad,
  descripcion: string,
  residenteId: string,
  usuarioId: string,       // set server-side from req.user.uid
  tareaId: string | null,
  registradaEn: string,    // ISO 8601, set server-side
}
```

---

*Last updated: 2026-04-19 — Sprint 3 (US-06 implementation)*
