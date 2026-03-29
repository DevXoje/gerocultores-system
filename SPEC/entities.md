# Entities — Entidades del dominio

> Fuente canónica de los nombres, tipos y relaciones de las entidades del dominio.
> Los nombres de campo definidos aquí son **obligatorios** en código, API y base de datos.
> Cualquier alias o renombre es una violación del guardrail G04.
>
> Convención de tipos:
> - `string` — cadena de texto (UUID para IDs)
> - `string | null` — campo nullable
> - `Date` — fecha y hora ISO 8601 (UTC)
> - `boolean` — verdadero/falso
> - `enum` — conjunto cerrado de valores
>
> Los campos marcados con `<!-- RGPD: dato sensible -->` son de categoría especial
> según el art. 9 del RGPD. Solo pueden ser accedidos por usuarios autenticados con el rol apropiado.
>
> *Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*

---

## Usuario

Representa a cualquier persona con acceso al sistema (gerocultor, coordinador, administrador).

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `nombre` | `string` | sí | Nombre de pila |
| `apellidos` | `string` | sí | Apellidos |
| `email` | `string` | sí | Correo electrónico (usado como login) |
| `passwordHash` | `string` | sí | Hash de la contraseña (bcrypt) |
| `rol` | `enum('gerocultor', 'coordinador', 'administrador')` | sí | Rol del usuario |
| `activo` | `boolean` | sí | `true` si la cuenta está activa |
| `creadoEn` | `Date` | sí | Timestamp de creación |
| `ultimoAcceso` | `Date \| null` | no | Último inicio de sesión |

**Relaciones**:
- Un `Usuario` de rol `gerocultor` tiene asignados 0..N `Residente`.
- Un `Usuario` registra 0..N `Incidencia`.
- Un `Usuario` tiene 0..N `Tarea` en su agenda.

**Reglas de negocio**:
- El campo `email` debe ser único en el sistema.
- `passwordHash` nunca se envía al cliente.
- Un usuario con `activo = false` no puede autenticarse.

---

## Residente

Representa a una persona que vive en la residencia y recibe cuidados.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `nombre` | `string` | sí | Nombre de pila |
| `apellidos` | `string` | sí | Apellidos |
| `fechaNacimiento` | `Date` | sí | Fecha de nacimiento <!-- RGPD: dato sensible --> |
| `habitacion` | `string` | sí | Número o nombre de habitación |
| `foto` | `string \| null` | no | URL de la fotografía del residente <!-- RGPD: dato sensible --> |
| `diagnosticos` | `string` | no | Diagnósticos principales (texto libre) <!-- RGPD: dato sensible --> |
| `alergias` | `string` | no | Alergias conocidas <!-- RGPD: dato sensible --> |
| `medicacion` | `string` | no | Medicación activa y pautas <!-- RGPD: dato sensible --> |
| `preferencias` | `string` | no | Preferencias de cuidado y observaciones <!-- RGPD: dato sensible --> |
| `archivado` | `boolean` | sí | `true` si el residente ya no está activo (dado de baja) |
| `creadoEn` | `Date` | sí | Timestamp de creación del registro |
| `actualizadoEn` | `Date` | sí | Timestamp de última modificación |

**Relaciones**:
- Un `Residente` está asignado a 0..N `Usuario` (gerocultores).
- Un `Residente` tiene 0..N `Incidencia` en su historial.
- Un `Residente` tiene 0..N `Tarea` en su agenda.

**Reglas de negocio**:
- Un `Residente` con `archivado = true` no aparece en agendas activas pero su historial es consultable.
- Los campos `diagnosticos`, `alergias`, `medicacion` y `preferencias` son datos de categoría especial (RGPD art. 9); solo accesibles por usuarios autenticados con rol `gerocultor`, `coordinador` o `administrador`.

---

## Tarea

Representa una tarea programada en la agenda de un gerocultor para un residente.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `titulo` | `string` | sí | Descripción breve de la tarea |
| `tipo` | `enum('higiene', 'medicacion', 'alimentacion', 'actividad', 'revision', 'otro')` | sí | Categoría de la tarea |
| `fechaHora` | `Date` | sí | Fecha y hora programada |
| `estado` | `enum('pendiente', 'en_curso', 'completada', 'con_incidencia')` | sí | Estado actual de la tarea |
| `notas` | `string \| null` | no | Notas libres añadidas por el gerocultor |
| `residenteId` | `string` (UUID) | sí | FK → `Residente.id` |
| `usuarioId` | `string` (UUID) | sí | FK → `Usuario.id` (gerocultor asignado) |
| `creadoEn` | `Date` | sí | Timestamp de creación |
| `actualizadoEn` | `Date` | sí | Timestamp de última modificación |
| `completadaEn` | `Date \| null` | no | Timestamp en que se marcó como completada |

**Relaciones**:
- Una `Tarea` pertenece a un `Residente`.
- Una `Tarea` está asignada a un `Usuario` (gerocultor).
- Una `Tarea` puede originar 0..1 `Incidencia` (cuando se marca `con_incidencia`).

**Reglas de negocio**:
- El `estado` inicial siempre es `pendiente`.
- Al marcar estado `completada`, se registra `completadaEn` con la hora del servidor.
- Solo el `Usuario` asignado o un `coordinador`/`administrador` puede modificar la tarea.

---

## Incidencia

Representa un evento o problema registrado sobre un residente durante su atención.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `tipo` | `enum('caida', 'comportamiento', 'salud', 'alimentacion', 'medicacion', 'otro')` | sí | Categoría de la incidencia |
| `severidad` | `enum('leve', 'moderada', 'critica')` | sí | Gravedad del evento <!-- RGPD: dato sensible --> |
| `descripcion` | `string` | sí | Descripción libre del evento <!-- RGPD: dato sensible --> |
| `residenteId` | `string` (UUID) | sí | FK → `Residente.id` |
| `usuarioId` | `string` (UUID) | sí | FK → `Usuario.id` (quien registra) |
| `tareaId` | `string \| null` (UUID) | no | FK → `Tarea.id` (si se origina desde una tarea) |
| `registradaEn` | `Date` | sí | Timestamp del servidor al registrar |

**Relaciones**:
- Una `Incidencia` pertenece a un `Residente` (historial).
- Una `Incidencia` fue registrada por un `Usuario`.
- Una `Incidencia` puede estar vinculada a una `Tarea`.

**Reglas de negocio**:
- `registradaEn` se asigna en el servidor; el cliente no puede modificarlo.
- El historial de incidencias es inmutable: no se pueden editar ni eliminar.
- Una incidencia de `severidad = 'critica'` dispara una `Notificacion` al coordinador.
- El campo `descripcion` es dato sensible (RGPD art. 9).

---

## Turno

Representa el turno de trabajo de un gerocultor en una fecha concreta.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `usuarioId` | `string` (UUID) | sí | FK → `Usuario.id` |
| `fecha` | `Date` | sí | Fecha del turno (solo fecha, sin hora) |
| `tipoTurno` | `enum('manyana', 'tarde', 'noche')` | sí | Franja horaria del turno |
| `inicio` | `Date` | sí | Hora de inicio del turno (timestamp) |
| `fin` | `Date \| null` | no | Hora de fin del turno (null si en curso) |
| `resumenTraspaso` | `string \| null` | no | Resumen generado al final del turno |
| `creadoEn` | `Date` | sí | Timestamp de creación |

**Relaciones**:
- Un `Turno` pertenece a un `Usuario` (gerocultor).
- Un `Turno` agrupa las `Tarea` e `Incidencia` de esa franja.

**Reglas de negocio**:
- Solo puede haber un turno activo (sin `fin`) por usuario.
- El `resumenTraspaso` se genera al cerrar el turno.

---

## Notificacion

Representa un aviso generado por el sistema para un usuario.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `usuarioId` | `string` (UUID) | sí | FK → `Usuario.id` (destinatario) |
| `tipo` | `enum('incidencia_critica', 'tarea_proxima', 'traspaso_turno', 'sistema')` | sí | Tipo de notificación |
| `titulo` | `string` | sí | Título breve de la notificación |
| `mensaje` | `string` | sí | Cuerpo del mensaje |
| `leida` | `boolean` | sí | `false` hasta que el usuario la marca como leída |
| `referenciaId` | `string \| null` | no | ID del objeto relacionado (incidencia, tarea...) |
| `referenciaModelo` | `string \| null` | no | Nombre del modelo referenciado (`Incidencia`, `Tarea`...) |
| `creadaEn` | `Date` | sí | Timestamp de creación |

**Relaciones**:
- Una `Notificacion` pertenece a un `Usuario`.
- Una `Notificacion` puede referenciar una `Incidencia` o una `Tarea`.

**Reglas de negocio**:
- Las notificaciones son de solo lectura para el usuario (solo puede marcarlas como leídas).
- Se generan automáticamente por el sistema (no por el usuario directamente).

---

## ResidenteAsignacion

Tabla de unión que asigna residentes a gerocultores.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | `string` (UUID) | sí | Identificador único |
| `residenteId` | `string` (UUID) | sí | FK → `Residente.id` |
| `usuarioId` | `string` (UUID) | sí | FK → `Usuario.id` (gerocultor) |
| `activaDesde` | `Date` | sí | Fecha desde la que está activa la asignación |
| `activaHasta` | `Date \| null` | no | Fecha de fin de asignación (null = activa) |

**Reglas de negocio**:
- Un gerocultor solo ve y actúa sobre los residentes que tiene en `ResidenteAsignacion` activa.

---

## Diagrama de relaciones (texto)

```
Usuario (1) ─────────────── (N) ResidenteAsignacion (N) ─── (1) Residente
   │                                                               │
   │ (1)                                                           │ (1)
   ├── (N) Tarea ──────────────────────────────────────────────── ┤
   │                                                               │
   ├── (N) Incidencia ──────────────────────────────────────────── ┤
   │                                                               │
   └── (N) Turno                                                   │
                                                                   │
Notificacion (N) ─── (1) Usuario                                   │
                                                                   │
Incidencia (N) ─── (1) Tarea (opcional)                            │
```

*Última actualización: 2026-03-29 — Fase sdd-spec*

<!-- sdd/switch-stack-to-vue-firebase SPEC delta -->
## Notas de Diseño Firestore
- **Colecciones Raíz**: `usuarios`, `residentes`, `turnos`, `notificaciones`
- **Subcolecciones**: `tareas` e `incidencias` anidadas dentro de `residentes` (Ej: `/residentes/{residenteId}/tareas`).
- **Mapeo IDs**: El `id` de las entidades será el ID del documento en Firestore.
- **Relaciones N:M (Asignaciones)**: La tabla `ResidenteAsignacion` se puede implementar como un array de `usuarioIds` dentro del documento del `residente` o una subcolección, para facilitar las reglas de seguridad.
- **Reglas de Seguridad (Firestore Rules)**:
  - `usuarios`: Lectura solo si `request.auth.uid == resource.id` (o si rol es admin).
  - `residentes`: Lectura solo si el `request.auth.uid` está en el array de `gerocultoresAsignados` o el rol del usuario es coordinador/admin.
  - `tareas` e `incidencias`: Lectura/Escritura basadas en el acceso al padre (`residente`).
- **Test Matrix de Reglas (Firestore)**:
  - *Escenario*: Gerocultor no autenticado lee residentes -> Denegado
  - *Escenario*: Gerocultor lee residente no asignado -> Denegado
  - *Escenario*: Gerocultor lee residente asignado -> Permitido
  - *Escenario*: Gerocultor actualiza perfil propio -> Permitido
  - *Escenario*: Coordinador lee cualquier residente -> Permitido
  - *Escenario*: Gerocultor escribe incidencia de severidad alta -> Permitido (dispara función en backend).
<!-- fin delta -->
