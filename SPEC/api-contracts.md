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

<!-- sdd/alta-residente SPEC delta -->
## [POST] /api/residentes
**Descripción**: Crear un nuevo residente (alta). Solo administradores.
**Autenticación**: requerida (Firebase Auth Token + rol `admin`)

**Request body**:
```json
{
  "nombre": "María",
  "apellidos": "García López",
  "fechaNacimiento": "1955-03-15",
  "habitacion": "201-A",
  "foto": null,
  "diagnosticos": "Diabetes tipo 2",
  "alergias": "Penicilina",
  "medicacion": "Metformina 850mg",
  "preferencias": "Prefiere ducha por las mañanas"
}
```

**Response 201**:
```json
{
  "data": {
    "id": "uuid-generado",
    "nombre": "María",
    "apellidos": "García López",
    "fechaNacimiento": "1955-03-15T00:00:00.000Z",
    "habitacion": "201-A",
    "foto": null,
    "diagnosticos": "Diabetes tipo 2",
    "alergias": "Penicilina",
    "medicacion": "Metformina 850mg",
    "preferencias": "Prefiere ducha por las mañanas",
    "archivado": false,
    "creadoEn": "2026-04-30T10:00:00.000Z",
    "actualizadoEn": "2026-04-30T10:00:00.000Z"
  }
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 400 | Campos obligatorios faltantes (`nombre`, `apellidos`, `fechaNacimiento`, `habitacion`) |
| 401 | Token no provisto o inválido |
| 403 | Usuario no es `admin` |

---

## [GET] /api/residentes
**Descripción**: Listar residentes con filtro opcional por estado de archivo.
**Autenticación**: requerida (cualquier rol: `admin` o `gerocultor`)

**Query params**:
| Parámetro | Tipo | Valores | Default |
|-----------|------|---------|---------|
| `filter` | `active \| archived \| all` | `active` | Filtra por `archivado === false` |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid-1",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "habitacion": "101",
      "archivado": false,
      "creadoEn": "2026-04-30T10:00:00.000Z",
      "actualizadoEn": "2026-04-30T10:00:00.000Z"
    }
  ]
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 401 | Token no provisto o inválido |

---

## [PATCH] /api/residentes/:id
**Descripción**: Actualizar campos de un residente existente. Solo administradores.
**Autenticación**: requerida (Firebase Auth Token + rol `admin`)

**Request body** (parcial — cualquier subconjunto de campos):
```json
{
  "diagnosticos": "Diabetes tipo 2",
  "alergias": "Penicilina",
  "medicacion": "Metformina 850mg",
  "preferencias": "Prefiere ducha por las mañanas"
}
```

**Response 200**:
```json
{
  "data": {
    "id": "uuid-1",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "fechaNacimiento": "1950-05-10T00:00:00.000Z",
    "habitacion": "101",
    "archivado": false,
    "creadoEn": "2026-04-30T10:00:00.000Z",
    "actualizadoEn": "2026-04-30T12:30:00.000Z"
  }
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 400 | Datos inválidos |
| 401 | Token no provisto o inválido |
| 403 | Usuario no es `admin` |
| 404 | Residente no encontrado |

---

## [PATCH] /api/residentes/:id/archive
**Descripción**: Archivar (dar de baja lógica) un residente activo. Solo administradores.
**Autenticación**: requerida (Firebase Auth Token + rol `admin`)

**Request body**: (vacío — la acción está codificada en la ruta)

**Response 200**:
```json
{
  "data": {
    "id": "uuid-1",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "archivado": true,
    "actualizadoEn": "2026-04-30T14:00:00.000Z"
  }
}
```

**Response de error**:
| Código | Condición |
|--------|-----------|
| 401 | Token no provisto o inválido |
| 403 | Usuario no es `admin` |
| 404 | Residente no encontrado |
<!-- fin delta -->
