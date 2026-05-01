# Delta Spec: crear-tarea

**Change**: crear-tarea  
**Author**: SDD orchestrator (automatic)  
**Date**: 2026-04-30  
**Status**: Draft → Spec  

---

## 1. User Story

### US-14 — Crear tarea

**Como** gerocultor o administrador, **quiero** crear una tarea en la agenda indicando título, tipo, fecha/hora, residente y notas opcionales, **para** planificar las actividades de atención de forma estructurada.

**Criterios de aceptación**:
- [ ] CA-1: El formulario de creación pide: título (texto libre), tipo (select: higiene/medicación/alimentación/actividad/revisión/otro), fecha y hora (datetime), residente (select de residentes asignados), usuario (autocompletado desde sesión actual).
- [ ] CA-2: Los campos título, tipo, fechaHora, residenteId y usuarioId son obligatorios; si falta alguno, el API devuelve 400 con mensaje descriptivo.
- [ ] CA-3: Si `residenteId` no existe o no pertenece a un residente activo, el API devuelve 400.
- [ ] CA-4: Si `usuarioId` no corresponde a un usuario activo en el sistema, el API devuelve 400.
- [ ] CA-5: La tarea se crea con `estado = pendiente` (nunca `en_curso`, `completada` ni `con_incidencia`).
- [ ] CA-6: `creadoEn` y `actualizadoEn` son generados por el servidor (no aceptados del cliente).
- [ ] CA-7: El API responde con 201 y el recurso creado completo (incluido `id` generado) en menos de 500 ms.
- [ ] CA-8: El gerocultor solo puede crear tareas para residentes que tiene asignados (validación de acceso).

**Requisitos relacionados**: RF-03, RF-12  
**Prioridad**: Must  
**Estado**: In Progress  
**Depends on**: Stitch screen "Task Creation Form" (G10)  
**US precedent**: US-04 (Actualizar estado de una tarea) — comparte el mismo flujo de datos y薄的 validación

---

## 2. API Contract

### `POST /api/tareas` — Create Task

**Path**: `/api/tareas`  
**Auth required**: Yes (Bearer token, rol `gerocultor` o `admin`)  
**Content-Type**: `application/json`

#### 2.1 Request Body

```json
{
  "titulo": "Aseo matutino",
  "tipo": "higiene",
  "fechaHora": "2026-04-18T09:00:00Z",
  "residenteId": "550e8400-e29b-41d4-a716-446655440001",
  "usuarioId": "usuarios/uid-123",
  "notas": "Prestar especial atención a la piel sensible"
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `titulo` | `string` | **sí** | 1–200 caracteres, no vacío ni solo espacios |
| `tipo` | `enum` | **sí** | Uno de: `higiene`, `medicacion`, `alimentacion`, `actividad`, `revision`, `otro` |
| `fechaHora` | `string` (ISO8601) | **sí** | Fecha futura o actual, zona UTC, parseable por `new Date()` |
| `residenteId` | `string` (UUID) | **sí** | Debe existir documento en `/residentes/{id}` con `archivado = false` |
| `usuarioId` | `string` (UUID) | **sí** | Debe existir documento en `/usuarios/{uid}` con `disabled = false` |
| `notas` | `string \| null` | no | Hasta 2000 caracteres; `null` equivale a omitir |

#### 2.2 Responses

**`201 Created`** — Tarea creada correctamente
```json
{
  "data": {
    "id": "tareas/uuid-generado",
    "titulo": "Aseo matutino",
    "tipo": "higiene",
    "fechaHora": "2026-04-18T09:00:00Z",
    "estado": "pendiente",
    "notas": "Prestar especial atención a la piel sensible",
    "residenteId": "550e8400-e29b-41d4-a716-446655440001",
    "usuarioId": "usuarios/uid-123",
    "creadoEn": "2026-04-30T12:00:00Z",
    "actualizadoEn": "2026-04-30T12:00:00Z",
    "completadaEn": null
  }
}
```

**`400 Bad Request`** — Fallo de validación (campos requeridos, tipo, formato de fecha, existencia de entidades)

Cuerpo en cada caso:

| Código | Causa | Ejemplo |
|--------|-------|---------|
| `VALIDATION_ERROR` | Campo requerido ausente o vacío | `{"error": "VALIDATION_ERROR", "message": "El campo 'titulo' es requerido", "field": "titulo"}` |
| `INVALID_ENUM` | Valor de `tipo` no válido | `{"error": "INVALID_ENUM", "message": "El campo 'tipo' debe ser uno de: higiene, medicacion, alimentacion, actividad, revision, otro", "field": "tipo"}` |
| `INVALID_DATETIME` | `fechaHora` no es ISO8601 válido | `{"error": "INVALID_DATETIME", "message": "El campo 'fechaHora' debe ser una fecha ISO8601 válida", "field": "fechaHora"}` |
| `RESIDENTE_NOT_FOUND` | `residenteId` no existe o está archivado | `{"error": "RESIDENTE_NOT_FOUND", "message": "El residente especificado no existe o no está activo", "field": "residenteId"}` |
| `USUARIO_NOT_FOUND` | `usuarioId` no existe o está desactivado | `{"error": "USUARIO_NOT_FOUND", "message": "El usuario especificado no existe o está desactivado", "field": "usuarioId"}` |
| `ACCESS_DENIED` | Gerocultor intenta crear tarea para residente no asignado | `{"error": "ACCESS_DENIED", "message": "No tienes acceso a este residente", "field": "residenteId"}` |

**`401 Unauthorized`** — Token ausente o inválido
```json
{"error": "UNAUTHORIZED", "message": "Token de autenticación requerido"}
```

**`403 Forbidden`** — Rol no permitido (solo `gerocultor` o `admin`)
```json
{"error": "FORBIDDEN", "message": "Rol insuficiente para crear tareas"}
```

---

## 3. Scenarios

### Happy Path

| Escenario | pasos | resultado esperado |
|----------|-------|-------------------|
| SP-1: Gerocultor crea tarea válida | 1. Auth con token válido (gerocultor)<br>2. POST /api/tareas con body completo<br>3. Residente asignado al gerocultor | 201 + tarea con `id` generado, `estado=pendiente`, timestamps del servidor |
| SP-2: Admin crea tarea para cualquier residente | 1. Auth con token admin<br>2. POST /api/tareas<br>3. Residente NO necesariamente asignado al admin | 201 (admin no tiene restricción de residente) |
| SP-3: Crear tarea sin notas | 1. Body sin campo `notas` | 201 + `notas: null` en respuesta |

### Error Paths

| Escenario | pasos | resultado esperado |
|----------|-------|-------------------|
| SE-1: Campo requerido faltante | POST sin `titulo` | 400 + `VALIDATION_ERROR` en `titulo` |
| SE-2: `tipo` inválido | `tipo: "invalid"` | 400 + `INVALID_ENUM` en `tipo` |
| SE-3: `fechaHora` malformado | `fechaHora: "not-a-date"` | 400 + `INVALID_DATETIME` en `fechaHora` |
| SE-4: `residenteId` inexistente | UUID que no existe en Firestore | 400 + `RESIDENTE_NOT_FOUND` en `residenteId` |
| SE-5: `residenteId` archivado | Residente con `archivado: true` | 400 + `RESIDENTE_NOT_FOUND` (residente inactivo) |
| SE-6: `usuarioId` inexistente | UID no existe en `usuarios` | 400 + `USUARIO_NOT_FOUND` en `usuarioId` |
| SE-7: `usuarioId` desactivado | Usuario con `disabled: true` | 400 + `USUARIO_NOT_FOUND` (usuario inactivo) |
| SE-8: Gerocultor crea tarea para residente no asignado | Auth gerocultor, `residenteId` de otro gerocultor | 400 + `ACCESS_DENIED` en `residenteId` |
| SE-9: Sin token | Sin `Authorization` header | 401 + `UNAUTHORIZED` |
| SE-10: Token de usuario desactivado | Token válido pero `disabled: true` en Firestore | 401 + `UNAUTHORIZED` |
| SE-11: Rol no gerocultor/admin | Token con otro rol | 403 + `FORBIDDEN` |

---

## 4. Affected Entities

### Tarea (existing entity — modified)
- New field behavior: `id` generated server-side (Firestore auto-ID), `creadoEn`/`actualizadoEn` set server-side, `estado` forced to `pendiente`, `completadaEn` forced to `null`.

### Residente (existing entity — read-only check)
- Service verifies `residenteId` exists and `archivado = false` before writing Tarea.
- Relationship: `Residente → (1) → Tareas` (subcollection `/residentes/{id}/tareas`)

### Usuario (existing entity — read-only check)
- Service verifies `usuarioId` exists and `disabled = false` before writing Tarea.
- Relationship: `Usuario → (1) → Tareas`

---

## 5. Technical Notes

### Storage
Tarea se guarda en subcolección de Residente: `/residentes/{residenteId}/tareas/{tareaId}`  
Firestore document ID = `tareaId` (UUID generado con `crypto.randomUUID()`)

### Firestore Security Rules (required for this change)
El endpoint `POST /api/tareas` escribe en `/residentes/{residenteId}/tareas`. Las reglas deben permitir:
- `admin`: write a cualquier `/residentes/*/tareas`
- `gerocultor`: write a `/residentes/{residenteId}/tareas` solo si el gerocultor tiene asignación activa a ese residente (`residente.gerocultoresAsignados` incluye su UID)

### Auth token validation
El middleware de Express verifica el token Firebase ID en el header `Authorization: Bearer <token>`. Extrae `uid` y `role` del token (custom claims). Pasa `uid` y `role` al handler.

---

## 6. Integration Points

| File | Action |
|------|--------|
| `code/api/src/routes/tareas.ts` | Add `POST /api/tareas` route |
| `code/api/src/services/tareasService.ts` | New service: `createTarea(data)` |
| `code/api/src/middleware/auth.ts` | Ensure token validation and role extraction |
| `code/frontend/src/components/tareas/CreateTareaModal.vue` | New Vue component (bottom-sheet) |
| `code/frontend/src/views/AgendaSemanalView.vue` | Add FAB trigger → modal |
| `code/frontend/src/composables/useTareas.ts` | Wire `createTarea()` → API call |
| `code/frontend/src/api/tareasApi.ts` | Ensure `createTarea()` calls `POST /api/tareas` (currently stub) |
| `SPEC/api/contracts/tareas.md` | Update POST contract (lines 92–135) with above details |
| `OUTPUTS/technical-docs/design-source.md` | Add Stitch screen reference (G10) |

---

## 7. Rollback Plan

1. Remove `POST /api/tareas` from `code/api/src/routes/tareas.ts`
2. Delete `code/api/src/services/tareasService.ts`
3. Delete `code/frontend/src/components/tareas/CreateTareaModal.vue`
4. Remove FAB trigger from `AgendaSemanalView.vue`
5. Revert `useTareas.ts` — keep stub, remove API call
6. Revert `tareasApi.ts` — restore stub
7. Revert `design-source.md` — remove Stitch screen reference

---

## 8. Dependencies

- Stitch screen "Task Creation Form" must exist in `design-source.md` before Vue coding starts (G10)
- Firestore rules for `/residentes/{id}/tareas` subcollection must allow gerocultor write for assigned residents
- `tareasApi.createTarea()` currently stub, must be wired before frontend coding

---

## 9. Success Criteria

- [ ] `POST /api/tareas` returns 201 with created task and valid UUID
- [ ] All validation errors (missing fields, invalid tipo, non-existent residenteId/usuarioId, resident not assigned) return 400 with descriptive error code and field
- [ ] `estado` always starts as `pendiente` regardless of client input
- [ ] `creadoEn` and `actualizadoEn` are server-set, not client-provided
- [ ] Stitch screen "Task Creation Form" exists in `design-source.md` before Vue implementation
- [ ] `tareasApi.createTarea()` is called and no longer a dead stub
- [ ] Gerocultor can only create tasks for assigned residents