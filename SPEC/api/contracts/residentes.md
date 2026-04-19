# API Contract: Residentes

> Delta spec — Sprint 3 (US-05)
> Canonical entity fields: SPEC/entities.md → Residente

---

## GET /api/residentes/:id

**US**: US-05 — Consulta de ficha de residente

### Auth

Requires valid Firebase ID token (`Authorization: Bearer <token>`).
Accessible to roles: `admin`, `gerocultor`.

### Path Parameters

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `id`      | string | yes      | Firestore document ID of the Residente |

### Success Response — 200 OK

```json
{
  "data": {
    "id": "string",
    "nombre": "string",
    "apellidos": "string",
    "fechaNacimiento": "string (ISO 8601)",
    "habitacion": "string",
    "foto": "string | null",
    "diagnosticos": "string | null",
    "alergias": "string | null",
    "medicacion": "string | null",
    "preferencias": "string | null",
    "archivado": "boolean",
    "creadoEn": "string (ISO 8601)",
    "actualizadoEn": "string (ISO 8601)"
  }
}
```

### Error Responses

| Status | Code        | When                              |
|--------|-------------|-----------------------------------|
| 401    | UNAUTHORIZED | Missing or invalid Bearer token   |
| 403    | FORBIDDEN    | Gerocultor is not in `gerocultoresAsignados` for this resident |
| 404    | NOT_FOUND    | No Residente with the given id    |
| 500    | (none)       | Unexpected server error           |

### Notes

- The fields `diagnosticos`, `alergias`, `medicacion`, `preferencias`, and `fechaNacimiento` are RGPD category-special data (art. 9). Only accessible to authenticated users with role `admin` or `gerocultor`.
- `foto` is a URL to the resident photo. Photo uploads are NOT implemented in this sprint (design-only until SPEC update).
- **Access control**: `admin` can access any resident. `gerocultor` can only access residents where their `uid` is present in the `gerocultoresAsignados` array stored in the Firestore document.
- `gerocultoresAsignados` is an internal field and is **never** returned in the API response.
