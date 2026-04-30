# Plan — Migración Español → Inglés (i18n-code)

> **Fecha**: 2026-04-30
> **Proyecto**: gerocultores-system
> **Objetivo**: Eliminar completamente el uso del español en nombres de variables, archivos, colecciones, funciones, entidades y strings de código.
> **Alcance**: `code/api/` + `code/frontend/` + `SPEC/`
> **Supuesto**: No hay datos en producción — no se requiere script de migración Firestore.
> **Tipo**: Refactorización / deuda técnica

---

## Motivación

El código actual usa español para:
- Nombres de colecciones Firestore (keys y valores)
- Nombres de archivos y directorios (`tarea.types.ts`, `incidencias.service.ts`)
- Nombres de entidades TypeScript y campos Firestore (`titulo`, `fechaNacimiento`, `resumenTraspaso`)
- Valores de enum almacenados en Firestore (`higiene`, `pendiente`, `caida`)
- Nombres de funciones, métodos, clases y composables (`getTareas`, `useIncidencias`, `openTurno`)
- Strings de UI en templates Vue (`'Pendiente'`, `'Buenos días'`)
- Mensajes de error (`'Token no provisto o inválido'`)

**Total identificado**: 150+ tokens en español.

---

## Fases

### Fase 1 — Renombrado de archivos y código (sin migración de datos)

> **Impacto**: Breaking en tiempo de compilación, no en datos. Solo renombra y refactoriza.

#### 1.1 — Collections (`collections.ts`)

**Archivo**: `code/api/src/services/collections.ts`

| Antes (key) | Antes (valor) | Después (key) | Después (valor) |
|-------------|---------------|---------------|-----------------|
| `usuarios` | `'users'` | `users` | `'users'` |
| `residentes` | `'residents'` | `residents` | `'residents'` |
| `tareas` | `'tasks'` | `tasks` | `'tasks'` |
| `incidencias` | `'incidences'` | *(deprecated)* | *(deprecated)* |
| `incidences` | `'incidences'` | `incidents` | `'incidences'` |
| `turnos` | `'shifts'` | `shifts` | `'shifts'` |
| `notificaciones` | `'notificaciones'` | `notifications` | `'notifications'` |

**Nota**: Agregar comment `// TODO(migration): remove after Firestore data migration` junto a los keys españoles deprecated.

#### 1.2 — Tipos de dominio (tipos Zod + interfaces)

**Archivos**:
- `code/api/src/types/tarea.types.ts` → `code/api/src/types/task.types.ts`
- `code/api/src/types/incidencia.types.ts` → `code/api/src/types/incident.types.ts`
- `code/api/src/types/turno.types.ts` → `code/api/src/types/shift.types.ts`
- `code/api/src/types/residente.types.ts` → `code/api/src/types/resident.types.ts`
- `code/api/src/types/notificacion.types.ts` → `code/api/src/types/notification.types.ts`

**Renombrar dentro de cada archivo**:

| Antes | Después |
|-------|---------|
| `TareaTipoEnum` | `TaskTypeEnum` |
| `TareaEstadoEnum` | `TaskStatusEnum` |
| `TareaDoc`, `TareaDocSchema` | `TaskDoc`, `TaskDocSchema` |
| `TareaResponse` | `TaskResponse` |
| `UpdateEstadoSchema` | `UpdateStatusSchema` |
| `UpdateEstadoDTO` | `UpdateStatusDTO` |
| `ListTareasQuery` | `ListTasksQuery` |
| `IncidenciaTipoEnum` | `IncidentTypeEnum` |
| `IncidenciaSeveridadEnum` | `IncidentSeverityEnum` |
| `IncidenciaDoc`, `IncidenciaDocSchema` | `IncidentDoc`, `IncidentDocSchema` |
| `IncidenciaResponse` | `IncidentResponse` |
| `CreateIncidenciaDTO` | `CreateIncidentDTO` |
| `TurnoTipoEnum` | `ShiftTypeEnum` |
| `TurnoDoc`, `TurnoDocSchema` | `ShiftDoc`, `ShiftDocSchema` |
| `TurnoResponse` | `ShiftResponse` |
| `TurnoResumen` | `ShiftSummary` |
| `OpenTurnoSchema` | `OpenShiftSchema` |
| `CloseTurnoSchema` | `CloseShiftSchema` |
| `OpenTurnoDTO` | `OpenShiftDTO` |
| `CloseTurnoDTO` | `CloseShiftDTO` |
| `ResidenteDoc`, `ResidenteDocSchema` | `ResidentDoc`, `ResidentDocSchema` |
| `ResidenteResponse` | `ResidentResponse` |
| `ResidenteIdParamSchema` | `ResidentIdParamSchema` |
| `ResidenteIdParam` | `ResidentIdParam` |
| `NotificacionTipoEnum` | `NotificationTypeEnum` |
| `NotificacionDoc`, `NotificacionDocSchema` | `NotificationDoc`, `NotificationDocSchema` |
| `NotificacionResponse` | `NotificationResponse` |
| `GetNotificacionesResult` | `GetNotificationsResult` |
| `GetNotificacionesQuery` | `GetNotificationsQuery` |

**Enum values** (valores Zod):

| Antes | Después |
|-------|---------|
| `'higiene'` | `'hygiene'` |
| `'medicacion'` | `'medication'` |
| `'alimentacion'` | `'feeding'` |
| `'actividad'` | `'activity'` |
| `'revision'` | `'check'` |
| `'otro'` | `'other'` |
| `'pendiente'` | `'pending'` |
| `'en_curso'` | `'in_progress'` |
| `'completada'` | `'completed'` |
| `'con_incidencia'` | `'with_incident'` |
| `'caida'` | `'fall'` |
| `'comportamiento'` | `'behavior'` |
| `'salud'` | `'health'` |
| `'leve'` | `'mild'` |
| `'moderada'` | `'moderate'` |
| `'critica'` | `'critical'` |
| `'manyana'` | `'morning'` |
| `'tarde'` | `'afternoon'` |
| `'noche'` | `'night'` |
| `'incidencia_critica'` | `'critical_incident'` |
| `'tarea_proxima'` | `'upcoming_task'` |
| `'traspaso_turno'` | `'shift_handover'` |
| `'sistema'` | `'system'` |

**Entity field names** (campos dentro de los Zod schemas):

| Antes | Después |
|-------|---------|
| `titulo` | `title` |
| `fechaHora` | `scheduledAt` |
| `estado` | `status` |
| `notas` | `notes` |
| `creadoEn` | `createdAt` |
| `actualizadoEn` | `updatedAt` |
| `completadaEn` | `completedAt` |
| `nombre` | `firstName` |
| `apellidos` | `lastName` |
| `fechaNacimiento` | `birthDate` |
| `habitacion` | `room` |
| `diagnosticos` | `diagnoses` |
| `alergias` | `allergies` |
| `medicacion` | `medication` |
| `preferencias` | `preferences` |
| `archivado` | `archived` |
| `gerocultoresAsignados` | `assignedCaregivers` |
| `severidad` | `severity` |
| `descripcion` | `description` |
| `registradaEn` | `recordedAt` |
| `tipoTurno` | `shiftType` |
| `resumenTraspaso` | `handoverSummary` |
| `mensaje` | `message` |
| `leida` | `read` |
| `referenciaId` | `referenceId` |
| `referenciaModelo` | `referenceModel` |
| `creadaEn` | `createdAt` |

#### 1.3 — Servicios

**Archivos**:
- `code/api/src/services/tareas.service.ts` → `tasks.service.ts`
- `code/api/src/services/incidencias.service.ts` → `incidents.service.ts`
- `code/api/src/services/turno.service.ts` → `shift.service.ts`
- `code/api/src/services/residentes.service.ts` → `residents.service.ts`
- `code/api/src/services/notificacion.service.ts` → `notification.service.ts`
- `code/api/src/services/alertas.service.ts` → `alerts.service.ts`

**Renombrar dentro de cada archivo**:

| Antes | Después |
|-------|---------|
| `getTareas` | `getTasks` |
| `getTareaById` | `getTaskById` |
| `updateEstado` | `updateStatus` |
| `NotFoundError`, `ForbiddenError` | (mantener — convención error) |
| `IncidenciasService` | `IncidentsService` |
| `createIncidencia` | `createIncident` |
| `TurnoService` | `ShiftService` |
| `openTurno` | `openShift` |
| `closeTurno` | `closeShift` |
| `getTurnoActivo` | `getActiveShift` |
| `getResumen` | `getSummary` |
| `ConflictError` | (mantener) |
| `ResidentesService` | `ResidentsService` |
| `getResidenteById` | `getResidentById` |
| `NotificacionService` | `NotificationService` |
| `getNotificaciones` | `getNotifications` |
| `AlertasService` | `AlertsService` |
| `generateTareaProximaAlerts` | `generateUpcomingTaskAlerts` |

#### 1.4 — Controladores

**Archivos**:
- `code/api/src/controllers/tareas.controller.ts` → `tasks.controller.ts`
- `code/api/src/controllers/incidencias.controller.ts` → `incidents.controller.ts`
- `code/api/src/controllers/residentes.controller.ts` → `residents.controller.ts`

**Renombrar dentro de cada archivo**:

| Antes | Después |
|-------|---------|
| `listTareas` | `listTasks` |
| `getTarea` | `getTask` |
| `patchEstado` | `patchStatus` |
| `getAuthUser` | (mantener — contexto auth) |
| `createIncidencia` | `createIncident` |
| `getResidente` | `getResident` |

#### 1.5 — Rutas

**Archivos**:
- `code/api/src/routes/tareas.routes.ts` → `tasks.routes.ts`
- `code/api/src/routes/incidencias.routes.ts` → `incidents.routes.ts`
- `code/api/src/routes/turnos.routes.ts` → `shifts.routes.ts`
- `code/api/src/routes/residentes.routes.ts` → `residents.routes.ts`
- `code/api/src/routes/notificaciones.routes.ts` → `notifications.routes.ts`

**Renombrar segmentos de ruta**:

| Antes | Después |
|-------|---------|
| `PATCH /:id/cierre` | `PATCH /:id/close` |
| `/turnos/activo` | `/shifts/active` |
| `/:id/leida` | `/:id/read` |
| `/incidencias/nueva` (frontend) | `/incidents/new` |

#### 1.6 — Middleware

**Renombrar archivos si contiene naming español** (revisar `errorHandler.ts` y `requireRole.ts` — ya están en inglés).

#### 1.7 — Frontend: servicios API

- `code/frontend/src/services/tareas.api.ts` → `tasks.api.ts`
- Renombrar types: `TipoTarea` → `TaskType`, `EstadoTarea` → `TaskStatus`
- Renombrar constantes: `TIPO_OPTIONS` → `TYPE_OPTIONS`, `SEVERIDAD_OPTIONS` → `SEVERITY_OPTIONS`
- Renombrar DTOs: `CreateTareaDTO` → `CreateTaskDTO`, `UpdateTareaStatusDTO` → `UpdateTaskStatusDTO`

#### 1.8 — Frontend: stores Pinia

- `code/frontend/src/business/turno/presentation/stores/turno.store.ts` → `shift.store.ts`
- Renombrar estado: `turnoActivo` → `activeShift`, `historial` → `history`
- Renombrar acciones: `setTurnoActivo` → `setActiveShift`, `setHistorial` → `setHistory`
- Renombrar getters: `hasTurnoActivo` → `hasActiveShift`
- Renombrar: `updateResumenTraspaso` → `updateHandoverSummary`

#### 1.9 — Frontend: composables

- `code/frontend/src/business/incidents/presentation/composables/useIncidencias.ts` → `useIncidents.ts`
- Renombrar: `useIncidencias` → `useIncidents`
- Renombrar: `submitIncidencia` → `submitIncident`, `resetForm` → `resetForm`, `clearErrors` → `clearErrors`
- Renombrar interfaces: `IncidenciaFormState` → `IncidentFormState`, `FieldErrors` → `FieldErrors` (ya genérico)

#### 1.10 — Frontend: archivos de dominio incidents

- `code/frontend/src/business/incidents/domain/entities/incidencia.types.ts` → `incident.types.ts`
- `code/frontend/src/business/incidents/infrastructure/incidencias.api.ts` → `incidents.api.ts`

#### 1.11 — Frontend: vistas y componentes

| Antes | Después |
|-------|---------|
| `IncidentView.vue` | (mantener — `Incident` ya es inglés) |
| `IncidenceForm.vue` | (mantener — `Incidence` ya es inglés) |
| `IncidenciasResidenteView.vue` | `ResidentIncidentsView.vue` |
| `TurnoView.vue` | `ShiftView.vue` |
| `ResumenTurnoModal.vue` | `ShiftSummaryModal.vue` |
| `code/frontend/src/business/turno/` | `code/frontend/src/business/shift/` |

#### 1.12 — Strings de error en servicios y controladores

Todos los mensajes de error hardcodeados en español → inglés. Ver lista completa en el informe de diagnóstico.

#### 1.13 — UI strings en templates Vue

Traducir todos los strings visibles en español a inglés en:

- `TaskCard.vue`
- `TurnoView.vue`
- `ResumenTurnoModal.vue`
- `IncidentView.vue`
- `IncidenceForm.vue`
- `DashboardView.vue`
- `UsersView.vue`
- `IncidenciasResidenteView.vue`
- `RegisterPage.vue`
- `LoginPage.vue`

#### 1.14 — Actualizar imports en todos los archivos

Después de renombrar, actualizar todos los `import ... from '...'` que referencian archivos renombrados.

**Orden de ejecución**:
1. collections.ts
2. types/*.types.ts (backend)
3. services/*.service.ts
4. controllers/*.controller.ts
5. routes/*.routes.ts
6. middleware (si corresponde)
7. frontend types → services → stores → composables → views
8. SPEC/entities.md
9. SPEC/api-contracts.md
10. `OUTPUTS/technical-docs/design-source.md` ( Stitch references)

---

### Fase 2 — Actualizar SPEC/ + documentación

> **Impacto**: Documentación. G04 requiere que SPEC/entities.md sea la fuente canónica.

#### 2.1 — SPEC/entities.md

Actualizar todos los campos de entidad con nombres en español → inglés.
Actualizar enum values en las tablas.
**Importante**: Los enum values en `entities.md` DEBEN coincidir con los valores Zod en los tipos.

#### 2.2 — SPEC/api-contracts.md

Actualizar nombres de campos en request/response de cada endpoint.

#### 2.3 — `OUTPUTS/technical-docs/design-source.md`

Revisar y actualizar referencias a nombres de pantallas Stitch si corresponde.

---

## Estimación

| Fase | Tareas | Complejidad |
|------|--------|-------------|
| 1.1 | 1 archivo | Baja |
| 1.2 | 5 archivos | Alta (enum values + field names + renombrado) |
| 1.3 | 6 archivos | Media |
| 1.4 | 3 archivos | Baja |
| 1.5 | 5 archivos | Baja |
| 1.6 | 0-1 archivo | Muy baja |
| 1.7 | 1 archivo | Media |
| 1.8 | 1 archivo | Media |
| 1.9 | 1 archivo | Media |
| 1.10 | 2 archivos | Baja |
| 1.11 | 3-5 archivos/vistas | Media |
| 1.12 | ~10 archivos (error strings) | Baja |
| 1.13 | ~10 templates Vue | Media (esfuerzo UI) |
| 1.14 | Actualizar imports (glob) | Media |
| 2.1 | SPEC/entities.md | Baja |
| 2.2 | SPEC/api-contracts.md | Media |
| 2.3 | docs | Baja |

**Total estimado**: ~40 archivos a tocar, ~2-3 días de trabajo.

---

## Commit Convention

Cada commit debe ser atómico por fase o sub-fase:

```
refactor(i18n): rename COLLECTIONS keys to English
refactor(i18n): translate tarea.types.ts → task.types.ts
refactor(i18n): translate incident enum values
refactor(i18n): rename tareas service → tasks service
refactor(i18n): translate TaskCard UI strings
docs: update SPEC/entities.md field names
```

**Nota G11**: No usar `git push --no-verify` bajo ninguna circunstancia.

---

## Verificación

Después de cada sub-fase:
1. `npm run typecheck` (o `tsc --noEmit`) — verificar que no haya errores de tipo
2. `npm test` — verificar que los tests sigan pasando
3. Revisar que no queden strings en español en los archivos tocados (buscar con grep: `'[áéíóúñü]'`)