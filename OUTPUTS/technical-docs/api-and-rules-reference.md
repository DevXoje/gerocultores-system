# API & Firestore Rules Reference

> Documento de referencia técnica para la API Express y las reglas de seguridad Firestore.
> Generado en Fase 5 (T-73). Mantener sincronizado con `SPEC/api-contracts.md` y `SPEC/entities.md`.
>
> **Fuentes canónicas**:
> - Rutas: `code/api/src/routes/`
> - Reglas: `code/firestore.rules`
> - Colecciones: `code/api/src/services/collections.ts`
> - Entidades: `SPEC/entities.md`

---

## API Reference

### Middleware de autenticación

Todos los endpoints protegidos pasan por:

| Middleware | Archivo | Efecto |
|------------|---------|--------|
| `verifyAuth` | `middleware/verifyAuth.ts` | Valida Firebase ID Token. Inyecta `req.user` con `{ uid, role }`. Rechaza con 401 si token inválido. |
| `requireRole(role)` | `middleware/requireRole.ts` | Requiere `req.user.role === role`. Rechaza con 403 si no. |

---

### Tabla de endpoints

| # | METHOD | PATH | AUTH | ROL | US | Descripción |
|---|--------|------|------|-----|----|-------------|
| 1 | GET | `/health` | ❌ No | — | US-13 | Health check. Devuelve `{ status, timestamp }` |
| 2 | GET | `/api/protected` | ✅ Sí | any | US-02 | Smoke-test de autenticación. Devuelve `{ status: 'authenticated' }` |
| 3 | GET | `/api/protected/admin-only` | ✅ Sí | `admin` | US-02 | Smoke-test de rol admin. Devuelve `{ status: 'admin-authorized' }` |
| 4 | GET | `/api/admin/users` | ✅ Sí | `admin` | US-10 | Lista todos los usuarios del sistema |
| 5 | POST | `/api/admin/users` | ✅ Sí | `admin` | US-10 | Crea un nuevo usuario |
| 6 | PATCH | `/api/admin/users/:uid/role` | ✅ Sí | `admin` | US-10 | Actualiza el rol de un usuario |
| 7 | PATCH | `/api/admin/users/:uid/disable` | ✅ Sí | `admin` | US-10 | Activa o desactiva una cuenta |
| 8 | GET | `/api/residentes/:id` | ✅ Sí | any | US-05 | Obtiene la ficha de un residente específico |
| 9 | GET | `/api/tareas` | ✅ Sí | any | US-03 | Lista tareas del usuario autenticado (con filtros opcionales) |
| 10 | GET | `/api/tareas/:id` | ✅ Sí | any | US-03 | Obtiene una tarea por ID |
| 11 | PATCH | `/api/tareas/:id/estado` | ✅ Sí | any | US-04 | Actualiza el estado de una tarea |
| 12 | POST | `/api/incidencias` | ✅ Sí | any | US-06 | Registra una nueva incidencia |
| 13 | GET | `/api/notificaciones` | ✅ Sí | any | US-08 | Lista notificaciones del usuario (params: `leida`, `limit`) |
| 14 | PATCH | `/api/notificaciones/:id/leida` | ✅ Sí | any | US-08 | Marca una notificación como leída |
| 15 | POST | `/api/turnos` | ✅ Sí | any | US-11 | Abre un nuevo turno. Body: `{ tipoTurno }` |
| 16 | GET | `/api/turnos/activo` | ✅ Sí | any | US-11 | Obtiene el turno activo del usuario (o null) |
| 17 | PATCH | `/api/turnos/:id/cierre` | ✅ Sí | any | US-11 | Cierra un turno activo. Body: `{ resumenTraspaso }` |
| 18 | GET | `/api/turnos/:id/resumen` | ✅ Sí | any | US-11 | Obtiene el resumen agregado de un turno |

**Total endpoints documentados: 18**

---

### Detalle por grupo de rutas

#### `/health` — Health Check (US-13)

```
GET /health
Auth: No requerida
Colección Firestore: ninguna
Respuesta 200: { status: "ok", timestamp: "<ISO8601>" }
```

#### `/api/protected` — Auth Smoke-Test (US-02)

```
GET /api/protected
Auth: verifyAuth
Colección Firestore: ninguna
Respuesta 200: { status: "authenticated" }

GET /api/protected/admin-only
Auth: verifyAuth + requireRole('admin')
Colección Firestore: ninguna
Respuesta 200: { status: "admin-authorized" }
```

#### `/api/admin/users` — Gestión de usuarios (US-10)

```
Middleware base: verifyAuth + requireRole('admin')
Colección Firestore: users  (via Firebase Admin Auth SDK)

GET /   → UsersController.listUsers
POST /  → UsersController.createUser
PATCH /:uid/role    → UsersController.updateUserRole
PATCH /:uid/disable → UsersController.disableUser
```

#### `/api/residentes` — Ficha de residente (US-05)

```
Middleware base: verifyAuth
Colección Firestore: residents

GET /:id → ResidentesController.getResidente
```

#### `/api/tareas` — Agenda y tareas (US-03, US-04)

```
Middleware base: verifyAuth
Colección Firestore: tasks

GET /           → TareasController.listTareas    (US-03)
GET /:id        → TareasController.getTarea      (US-03)
PATCH /:id/estado → TareasController.patchEstado (US-04)
```

#### `/api/incidencias` — Registro de incidencias (US-06)

```
Middleware base: verifyAuth
Colección Firestore: incidences

POST / → IncidenciasController.createIncidencia
```

#### `/api/notificaciones` — Notificaciones (US-08)

```
Middleware base: verifyAuth
Colección Firestore: notificaciones

GET /           → NotificacionService.getNotificaciones
PATCH /:id/leida → NotificacionService.markAsRead
```

#### `/api/turnos` — Turnos y resumen de fin de turno (US-11)

```
Middleware base: verifyAuth
Colecciones Firestore: shifts, tasks, incidences (en resumen)

POST /              → TurnoService.openTurno
GET  /activo        → TurnoService.getTurnoActivo
PATCH /:id/cierre   → TurnoService.closeTurno
GET  /:id/resumen   → TurnoService.getResumen
```

---

## Firestore Rules Reference

> Fuente: `code/firestore.rules`

### Funciones de utilidad (helpers)

| Función | Descripción |
|---------|-------------|
| `isAuthenticated()` | `request.auth != null` |
| `hasRole(rol)` | Token claim `rol == rol` |
| `hasAnyRole(roles)` | Token claim `rol in roles` |
| `isGerocultor()` | `hasRole('gerocultor')` |
| `isAdmin()` | `hasRole('admin')` |
| `isAccountOwner(userId)` | `request.auth.uid == userId` |
| `isResourceOwner()` | Campo `userId` del doc == `request.auth.uid` |
| `get(field)` | Lectura segura de campo: evita `Null value error` en fields ausentes |

### Reglas por colección

| Colección | Clave COLLECTIONS | Operación | Quién puede |
|-----------|-------------------|-----------|-------------|
| `users` | `usuarios` | `read` | El propio usuario (`isAccountOwner`) |
| `users` | `usuarios` | `write` | Solo `admin` |
| `tasks` | `tareas` | `read` | Owner del doc (`isResourceOwner`) o `admin` |
| `tasks` | `tareas` | `update` | Owner del doc o `admin` |
| `tasks` | `tareas` | `create` | `gerocultor` o `admin` |
| `residents` | `residentes` | `read` | Solo `admin` ⚠️ ver nota |
| `residents` | `residentes` | `write` | Solo `admin` |
| `incidences` | `incidencias` / `incidences` | `create` | `gerocultor` o `admin` |
| `incidences` | `incidencias` / `incidences` | `read` | Cualquier usuario autenticado |
| `incidences` | `incidencias` / `incidences` | `update`, `delete` | ❌ Nadie (inmutable) |
| `notificaciones` | `notificaciones` | `read` | Owner (`usuarioId == uid`) o `admin` |
| `notificaciones` | `notificaciones` | `update` | Owner, solo campo `leida` |
| `notificaciones` | `notificaciones` | `create`, `delete` | ❌ Nadie (solo backend) |
| `shifts` | `turnos` | `read` | Owner (`usuarioId == uid`) o `admin` |
| `shifts` | `turnos` | `create` | Autenticado, si `usuarioId == uid` |
| `shifts` | `turnos` | `update` | Owner, solo si turno aún no tiene `fin` |
| `shifts` | `turnos` | `delete` | ❌ Nadie |

> ⚠️ **Nota sobre `residents`**: Las reglas Firestore solo permiten lectura de residentes a `admin`. Los gerocultores acceden a residentes **exclusivamente a través de la API Express** (que tiene su propia lógica de autorización), nunca directamente desde el cliente a Firestore. Esto es intencional: los datos de residentes son datos sensibles RGPD art. 9.

---

## Collection Naming Map

Mapa completo de constantes `COLLECTIONS` → nombre real en Firestore:

| Clave en código | Colección en Firestore | Entidad SPEC |
|-----------------|------------------------|--------------|
| `COLLECTIONS.usuarios` | `users` | `Usuario` |
| `COLLECTIONS.residentes` | `residents` | `Residente` |
| `COLLECTIONS.tareas` | `tasks` | `Tarea` |
| `COLLECTIONS.incidencias` | `incidences` | `Incidencia` *(deprecated key)* |
| `COLLECTIONS.incidences` | `incidences` | `Incidencia` *(key canónica)* |
| `COLLECTIONS.turnos` | `shifts` | `Turno` |
| `COLLECTIONS.notificaciones` | `notificaciones` | `Notificacion` |

> **Nota**: `incidencias` está marcada como `@deprecated` desde DT-09. Usar `incidences` en código nuevo.

> **Inconsistencia detectada (G04)**: `SPEC/entities.md` en la sección "Notas de Diseño Firestore" menciona las colecciones raíz como `usuarios`, `residentes`, `turnos`, `notificaciones` y subcolecciones `tareas` e `incidencias` anidadas dentro de `residentes`. Sin embargo, la implementación real usa colecciones **planas** (`users`, `residents`, `tasks`, `incidences`, `shifts`, `notificaciones`). La sección de notas en `SPEC/entities.md` corresponde a una propuesta anterior, no al diseño implementado. **Acción recomendada**: actualizar esa sección de `SPEC/entities.md` para reflejar la arquitectura de colecciones planas real.

---

## Migration Notes (Supabase → Firestore)

### Contexto histórico

El proyecto comenzó evaluando Supabase (PostgreSQL + Auth) como backend. Tras el ADR-02b y ADR-03b, se migró definitivamente a Firebase (Firestore + Firebase Auth). No hay código Supabase en producción.

### Referencias residuales de Supabase en documentación

| Archivo | Tipo de referencia | Estado |
|---------|-------------------|--------|
| `bootstrap_devproject.md` | Menciona Supabase como alternativa evaluada | ✅ Histórico — no requiere acción |
| `PLAN/backlog.md` | Referencia a decisión de migración | ✅ Histórico — no requiere acción |
| `PLAN/tasks-summary.md` | Tareas relacionadas con switch de stack | ✅ Histórico — no requiere acción |
| `SPEC/constraints.md` | Mención de Supabase como opción descartada | ✅ Histórico — no requiere acción |
| `DECISIONS/ADR-03b-authentication-firebase.md` | Documenta el rechazo de Supabase Auth | ✅ Histórico — canónico |
| `DECISIONS/ADR-02b-backend-firestore.md` | Documenta el rechazo de Supabase/PostgreSQL | ✅ Histórico — canónico |
| `DECISIONS/README.md` | Resumen del ADR process incluyendo la evaluación | ✅ Histórico — no requiere acción |
| `OUTPUTS/academic/` | Secciones de comparativa tecnológica | ✅ Académico — correcto mantenerlas |

### Mapa de equivalencias (Supabase → Firestore)

| Concepto Supabase | Equivalente Firebase |
|-------------------|---------------------|
| `supabase.auth.signIn` | `signInWithEmailAndPassword` (Firebase Auth) |
| `supabase.auth.user` | `onAuthStateChanged` / `getIdTokenResult` |
| Tabla `users` (PostgreSQL) | Colección `users` (Firestore) + Custom Claims |
| Row-Level Security (RLS) | Firestore Security Rules |
| `supabase.from('table').select()` | `adminDb.collection('name').get()` |
| Service Role Key | Firebase Admin SDK (env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) |
| PostgreSQL foreign keys | Referencias de ID por convención (no FK nativa en Firestore) |
| Supabase Edge Functions | Firebase Cloud Functions (no implementadas en este proyecto) |

---

## G04 Consistency Check

Verificación de consistencia entre `SPEC/entities.md`, `code/firestore.rules` y `COLLECTIONS`:

| Campo SPEC | Nombre en Firestore Rules | Nombre en COLLECTIONS | Estado |
|------------|---------------------------|-----------------------|--------|
| `Usuario.uid` | `request.auth.uid` (implícito) | `users` collection | ✅ OK |
| `Usuario.role` | `request.auth.token.rol` (Custom Claim) | — | ⚠️ Ver nota |
| `Tarea.usuarioId` | `resource.data.userId` en `tasks` | `tasks` | ✅ OK |
| `Notificacion.usuarioId` | `resource.data.usuarioId` en `notificaciones` | `notificaciones` | ✅ OK |
| `Turno.usuarioId` | `resource.data.usuarioId` en `shifts` | `shifts` | ✅ OK |
| `Turno.fin` | `resource.data.keys().hasAll(['fin'])` en `shifts` | `shifts` | ✅ OK |
| `Notificacion.leida` | `affectedKeys().hasOnly(['leida'])` en `notificaciones` | — | ✅ OK |

> ⚠️ **INCONSISTENCIA G04 CONFIRMADA — `role` vs `rol`**:
> - `SPEC/entities.md` define el campo como `role`
> - `requireRole.ts` lee `req.user?.['role']` (con 'e') — **correcto**
> - `firestore.rules` lee `request.auth.token.rol` (sin 'e') — **inconsistente**
>
> Si el Custom Claim se llama `role` (que es lo que escribe el backend y lo que espera `requireRole`), entonces todas las funciones `hasRole()`, `isAdmin()`, `isGerocultor()`, `hasAnyRole()` en las reglas Firestore **nunca serán true**. Esto significa que las reglas deniegan acceso a todos los usuarios en las colecciones que usan estas funciones (`users`, `tasks`, `residents`, `incidences`, `shifts`, `notificaciones`).
>
> **Acción correctiva**: cambiar `request.auth.token.rol` por `request.auth.token.role` en `code/firestore.rules`.

---

*Última actualización: 2026-04-25 — T-73, Fase 5*
