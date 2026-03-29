# API Contracts

> Contratos de los endpoints de la API. Fuente canónica para Developer y Tester.
> Debe ser consistente con SPEC/entities.md en nombres y tipos.

<!-- Plantilla de endpoint
## [MÉTODO] /ruta

**Descripción**: TODO
**Autenticación**: TODO: requerida | no requerida

**Request body** (si aplica):
```json
{
  "campo": "tipo"
}
```

**Response 200**:
```json
{
  "campo": "tipo"
}
```

**Response de error**:
| Código | Condición          |
|--------|--------------------|
| 400    | TODO               |
| 401    | TODO               |
| 404    | TODO               |
-->

TODO: poblar en Fase 5 tras definir el stack de API.

<!-- sdd/switch-stack-to-vue-firebase SPEC delta -->
## [GET] /api/residents
**Descripción**: Obtener la lista de residentes asignados al gerocultor autenticado.
**Autenticación**: requerida (Firebase Auth Token)

**Response 200**:
```json
{
  "data": [
    {
      "id": "res-123",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "habitacion": "101",
      "archivado": false
    }
  ]
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 401    | Token no provisto o inválido |
| 403    | Usuario no autorizado |

## [GET] /api/residents/:id
**Descripción**: Obtener detalles de un residente específico (incluye datos sensibles).
**Autenticación**: requerida (Firebase Auth Token)

**Response 200**:
```json
{
  "data": {
    "id": "res-123",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "habitacion": "101",
    "alergias": "Penicilina",
    "medicacion": "Ibuprofeno 600mg"
  }
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 401    | Token no provisto o inválido |
| 403    | El residente no está asignado al usuario |
| 404    | Residente no encontrado |

## [POST] /api/incidents
**Descripción**: Registrar una nueva incidencia para un residente.
**Autenticación**: requerida (Firebase Auth Token)

**Request body**:
```json
{
  "tipo": "caida",
  "severidad": "moderada",
  "descripcion": "El residente tropezó en el pasillo",
  "residenteId": "res-123",
  "tareaId": null
}
```

**Response 201**:
```json
{
  "data": {
    "id": "inc-456",
    "tipo": "caida",
    "severidad": "moderada",
    "descripcion": "El residente tropezó en el pasillo",
    "residenteId": "res-123",
    "usuarioId": "usr-789",
    "tareaId": null,
    "registradaEn": "2026-03-29T16:30:00Z"
  }
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 400    | Datos de entrada inválidos |
| 401    | Token no provisto o inválido |
| 403    | Usuario no tiene permisos sobre el residente |
<!-- fin delta -->
