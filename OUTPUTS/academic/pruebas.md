# 9. Pruebas

> **Estado**: Borrador — basado en cobertura real medida con Vitest (v8) al cierre del Sprint-2.
> **Autor**: Jose Vilches Sánchez
> **Proyecto**: GeroCare — Agenda digital para gerocultores
> **Centro**: CIPFP Batoi d'Alcoi
> **Última actualización**: 2026-04-18 — Sprint-2 completado

---

## 9.1 Estrategia de testing

La estrategia de testing del proyecto GeroCare se define en **ADR-07** y cubre tres niveles complementarios:

| Nivel | Herramienta | Alcance |
|-------|-------------|---------|
| **Tests unitarios y de componentes** | Vitest + @vue/test-utils | Lógica de negocio, middlewares, servicios, componentes Vue |
| **Tests de reglas Firestore** | @firebase/rules-unit-testing | Security Rules contra Firebase Emulator |
| **Tests E2E** | Playwright | Flujos de usuario completos en navegador |

El objetivo de cobertura definido en ADR-07 es **≥ 80%** en las capas `domain/` y `application/` del frontend, y en los middlewares y controladores del backend. Los tests E2E cubren los flujos críticos de usuario: inicio de sesión, consulta de agenda y registro de incidencia.

---

## 9.2 Tests unitarios — Backend

### Middlewares

Los dos middlewares de autenticación y autorización son los componentes más críticos del backend y los primeros en recibir cobertura completa.

**`verifyAuth.ts`** — Valida el ID Token de Firebase en cada petición. Los tests cubren: token válido con claims correctos, token ausente (401), token malformado (401), token de usuario deshabilitado (401), y el paso a `next()` cuando la verificación es exitosa.

**`requireRole.ts`** — Verifica que el usuario autenticado tiene el rol requerido. Los tests cubren: rol correcto (pasa a `next()`), rol incorrecto (403), usuario sin campo `role` en los claims (403), y la composición de múltiples roles (`requireRole('admin', 'gerocultor')`).

### Controladores

**`users.controller.ts`** — Los tests del controlador de usuarios cubren los cuatro endpoints de administración:
- `GET /api/admin/users`: lista de usuarios, respuesta paginada, manejo de error de Firestore.
- `POST /api/admin/users`: creación exitosa, validación de email inválido, password corto, rol desconocido.
- `PATCH /api/admin/users/:uid/role`: actualización exitosa, usuario no encontrado (404).
- `PATCH /api/admin/users/:uid/disable`: desactivación y reactivación exitosas.

### Resultados de cobertura — Backend

Medidos con `vitest --coverage` (proveedor v8) sobre `code/api/`:

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| `middleware/requireRole.ts` | 100% | 100% | 100% | 100% |
| `middleware/verifyAuth.ts` | 100% | 87.5% | 100% | 100% |
| `controllers/users.controller.ts` | 100% | 75% | 100% | 100% |
| **Total API** | **67.88%** | **54.28%** | **55.55%** | **69.15%** |

> El total global incluye ficheros auxiliares (`firebase.ts`, `collections.ts`, `server.ts`) que no tienen tests unitarios porque son puntos de entrada o configuración de infraestructura, no lógica de negocio. Los módulos de negocio propiamente dichos (middlewares + controlador) alcanzan el 100% de cobertura de statements.

---

## 9.3 Tests unitarios y de componentes — Frontend

### Store de autenticación (`useAuthStore`)

El store de Pinia para autenticación es el núcleo de la capa de estado del frontend. Los tests cubren:
- `init()`: restauración de sesión con usuario autenticado, restauración con usuario nulo, propagación del campo `role` desde los custom claims de Firebase.
- Patrón `holder` para evitar el error de TDZ con mocks síncronos de `onAuthStateChanged` (problema documentado en la sección 6.7).
- `logout()`: limpieza del estado de sesión tras llamar a `signOut`.

### Vista de gestión de usuarios (`UsersView`)

Los tests de componente de `UsersView.vue` cubren:
- Renderización de la tabla de usuarios con datos reactivos del composable `useUsers`.
- Apertura y cierre del modal de creación de usuario.
- Flujo completo de creación: validación del formulario, llamada al composable, mensaje de éxito.
- Estado de carga (`isLoading: true`): la tabla muestra un spinner en lugar de datos.
- Estado de error: se muestra el mensaje de error recibido de la API.

### Composable `useUsers`

Los tests del composable cubren:
- `fetchUsers()`: llamada al endpoint correcto, actualización del estado `users`, manejo de error de red.
- `createUser()`: petición POST con el DTO correcto, actualización optimista del estado local.
- `updateUserRole()` y `toggleUserDisabled()`: peticiones PATCH, actualización del usuario correspondiente en el array local.

### Componente `TaskCard`

El componente `TaskCard` es el primer componente de presentación compartida del proyecto. Sus 16 tests cubren:
- Renderización del título, nombre del residente y franja horaria para cada estado posible (`pendiente`, `en_curso`, `completada`, `con_incidencia`).
- Clase CSS de estado correcta según el valor de `tarea.estado`.
- Visibilidad del botón de acción y emisión del evento `@action` al pulsarlo.
- Ausencia de errores de consola con la prop `tarea` completa e incompleta.

### Resultados de cobertura — Frontend

Medidos con `vitest --coverage` (proveedor v8) sobre `code/frontend/`:

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| `useAuthStore` | 100% | 100% | 100% | 100% |
| `UsersView.vue` | 100% | 100% | 100% | 100% |
| `useUsers` composable | 100% | 100% | 100% | 100% |
| `TaskCard.vue` | 100% | 100% | 100% | 100% |
| **Total Frontend** | **84.31%** | **73.14%** | **84.84%** | **85.41%** |

> El total global incluye ficheros de configuración de Vue Router y el punto de entrada `main.ts` que no tienen tests. Los módulos de negocio (stores, composables, componentes) están en el 100%.

---

## 9.4 Resumen global de tests

| Tipo | N.º tests | Pasados | Fallidos | Cobertura (stmts) |
|------|-----------|---------|----------|-------------------|
| Unitarios — API (Vitest) | ~25 | 25 | 0 | 67.88% global / 100% en módulos de negocio |
| Componentes/Composables — Frontend (Vitest) | ~40 | 40 | 0 | 84.31% global / 100% en módulos de negocio |
| E2E (Playwright) | Pendiente Sprint-3 | — | — | — |
| Firestore Security Rules | Pendiente Sprint-3 | — | — | — |
| **Total** | **~65** | **~65** | **0** | **— (ver por capa)** |

---

## 9.5 Planes de prueba por historia de usuario

Cada historia de usuario implementada tiene un plan de prueba documentado en `OUTPUTS/test-plans/`:

| US | Título | Plan de prueba |
|----|--------|---------------|
| US-01 | Inicio de sesión | `test-plan-US-01.md` |
| US-02 | Control de acceso por rol | `test-plan-US-02.md` |
| US-03 | Consulta de agenda diaria | `test-plan-US-03.md` |
| US-04 | Actualizar estado de una tarea | `test-plan-US-04.md` |
| US-10 | Gestión de cuentas de usuarios | `test-plan-US-10.md` |
| US-13 | Health Check de la API | `test-plan-US-13.md` |

Los planes de prueba incluyen: escenarios positivos y negativos, criterios de aceptación medibles, pasos de reproducción manual, y referencia a los tests automatizados correspondientes.

---

## 9.6 Calidad de código y cobertura de CI

Además de los tests unitarios y de componentes, el proyecto aplica verificaciones de calidad de código en cada commit y pull request:

- **ESLint**: configurado con las reglas de Vue 3 + TypeScript. Ejecutado en pre-commit (Husky) y en el pipeline de CI (GitHub Actions).
- **Prettier**: formateado consistente de todos los ficheros `.ts`, `.vue` y `.json`. Verificado en CI con `prettier --check`.
- **TypeScript strict**: el flag `strict: true` del compilador garantiza que no existan tipos implícitos `any` ni asignaciones inseguras. El build de producción falla si TypeScript reporta errores.
- **commitlint**: cada mensaje de commit se valida contra la convención `feat(US-XX): descripción` definida en el guardrail G08 del proyecto.

Esta combinación de herramientas crea un muro de calidad en cuatro niveles: editor (ESLint en tiempo real), commit (pre-commit hook), push (pre-push hook), y pull request (CI en GitHub Actions). Un error de calidad no puede llegar a `develop` ni a `master` sin ser detectado en al menos uno de estos puntos.

---

*Última actualización: 2026-04-18 — Sprint-2 completado*
