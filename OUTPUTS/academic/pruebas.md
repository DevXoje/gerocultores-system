# 9. Pruebas

> **Estado**: En progreso — basado en cobertura real medida con Vitest (v8) durante el Sprint-3.
> **Autor**: Jose Vilches Sánchez
> **Proyecto**: GeroCare — Agenda digital para gerocultores
> **Centro**: CIPFP Batoi d'Alcoi
> **Última actualización**: 2026-04-19 — Backend US-05 y US-06 completado

---

## 9.1 Estrategia de testing

La estrategia de testing del proyecto GeroCare se define en **ADR-07** y cubre tres niveles complementarios:

| Nivel | Herramienta | Alcance |
|-------|-------------|---------|
| **Tests unitarios y de componentes** | Vitest + @vue/test-utils | Lógica de negocio, middlewares, componentes Vue |
| **Tests de integración de API** | Supertest + Vitest | Controladores HTTP, middlewares de auth y rutas |
| **Tests de servicios y reglas Firestore** | @firebase/rules-unit-testing + Firebase Emulator | Lógica de base de datos, transacciones y Security Rules |
| **Tests E2E** | Playwright | Flujos de usuario completos en navegador |

El objetivo de cobertura definido en ADR-07 es **≥ 80%**. Se ha priorizado que **ningún código de negocio interactúe con producción durante los tests**; todo el acceso a base de datos en integración se realiza contra la **Firebase Emulator Suite**.

---

## 9.2 Tests de Backend (API)

Durante el Sprint-3 se ha saldado la deuda técnica de testing del backend, estableciendo una arquitectura de pruebas en dos capas:

### Capa 1: Tests de Controlador (HTTP) con Supertest

Se han implementado tests de nivel de controlador aislando la capa de servicio (mediante mocks `vi.mock`). Esto permite testear exclusivamente el enrutamiento, los códigos de estado HTTP, la validación de payloads con **Zod** y el cumplimiento de permisos sin levantar una base de datos.

Endpoints cubiertos con Supertest:
- **Tareas (`/api/tareas`)**: `GET /`, `GET /:id`, `PATCH /:id/estado`. Se validan 401 (sin token), 404 (no encontrado) y 403 (intento de un gerocultor de modificar una tarea ajena).
- **Usuarios (`/api/admin/users`)**: `GET /`, `POST /`, `PATCH /:id/role`, `PATCH /:id/disable`. Se valida rigurosamente el middleware `requireRole` (403 si no es admin) y la validación Zod de emails y roles (400).
- **Residentes e Incidencias**: `GET /api/residentes/:id` y `POST /api/incidencias`.

> *Mock Inteligente de Auth*: Para los tests HTTP, se diseñó un mock inteligente de `verifyAuth` que intercepta una cabecera inyectada (`x-test-role`) para simular peticiones de distintos roles sin necesidad de generar tokens JWT reales.

### Capa 2: Tests de Integración con Firebase Emulator

La capa de servicios (`.service.ts`) interactúa directamente con Firebase Admin SDK. En lugar de mockear Firestore (lo cual oculta errores de consultas o transacciones), se han implementado tests de integración que se conectan al **Firebase Emulator**.

Características de estos tests (`*.integration.spec.ts`):
- **Aislamiento de configuración**: Utilizan un archivo de configuración dedicado `vitest.integration.config.ts` y variables de entorno (`FIRESTORE_EMULATOR_HOST`) inyectadas en tiempo de inicialización.
- **Transacciones y Concurrencia**: En `tareas.service.integration.spec.ts`, se testea explícitamente que dos llamadas simultáneas a `updateEstado` sobre el mismo documento se resuelven correctamente gracias a las transacciones de Firestore.
- **Cobertura completa de servicios**: Cubren operaciones reales de lectura/escritura en `users`, `tasks`, `residents` e `incidences`.

---

## 9.3 Tests unitarios y de componentes — Frontend

### Store de autenticación (`useAuthStore`)

El store de Pinia para autenticación es el núcleo de la capa de estado del frontend. Los tests cubren:
- `init()`: restauración de sesión con usuario autenticado, restauración con usuario nulo, propagación del campo `rol` desde los custom claims de Firebase.
- Patrón `holder` para evitar el error de TDZ con mocks síncronos de `onAuthStateChanged`.
- `logout()`: limpieza del estado de sesión tras llamar a `signOut`.

### Vistas y Composables

Los tests cubren:
- **`UsersView.vue`**: Renderización de tabla, modales, y manejo de estado de carga/error.
- **`useUsers`**: Llamadas a endpoints de administración, actualización optimista local y manejo de error.
- **`TaskCard.vue`**: Renderización condicionada al estado de la tarea (colores, botones visibles) y emisión del evento `@action`.

---

## 9.4 Resumen global de tests

Al cierre del backend de los Sprints 2 y 3, el estado de la suite de pruebas es el siguiente:

| Tipo de Test | N.º tests | Pasados | Herramienta / Contexto |
|--------------|-----------|---------|------------------------|
| **Unitarios & HTTP (API)** | ~115 | 115 | Vitest + Supertest + Zod |
| **Integración (Servicios API)** | 35 | 35 | Vitest + Firebase Emulator |
| **Reglas de Seguridad (Firestore)** | 26 | 26 | `@firebase/rules-unit-testing` |
| **Componentes (Frontend)** | ~60 | 60 | Vitest + Vue Test Utils |
| **Total Automatizado** | **~236** | **236** | — |

> **Nota de Deuda Técnica:** Todos los tests de integración y reglas de Firestore se ejecutan localmente contra el Emulador. El job de CI en GitHub Actions ha sido actualizado para soportar Node.js 24 y Java 21, permitiendo la ejecución automatizada del emulador en el pipeline.

---

## 9.5 Planes de prueba por historia de usuario

Cada historia de usuario implementada tiene un plan de prueba formal documentado en la carpeta `OUTPUTS/test-plans/`, que define los criterios de aceptación y los escenarios manuales/automatizados.

| US | Título | Test Plan |
|----|--------|-----------|
| US-01 | Inicio de sesión | `test-plan-US-01.md` |
| US-02 | Control de acceso por rol | `test-plan-US-02.md` |
| US-03 | Consulta de agenda diaria | `test-plan-US-03.md` |
| US-04 | Actualizar estado de una tarea | `test-plan-US-04.md` |
| US-05 | Consulta de ficha de residente | `test-plan-US-05.md` |
| US-06 | Registro de incidencia | `test-plan-US-06.md` |
| US-10 | Gestión de cuentas de usuarios | `test-plan-US-10.md` |
| US-13 | Health Check de la API | `test-plan-US-13.md` |

Los planes de prueba incluyen: escenarios de *happy path*, casos límite (*edge cases*), estados de error (ej. 403 Forbidden por permisos), e instrucciones de *seeding* en el Emulador.

---

*Última actualización: 2026-04-19 — Sprint-3: Backend US-05 y US-06 completado*
