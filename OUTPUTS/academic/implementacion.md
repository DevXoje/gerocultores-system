# 6. Fases de implementación técnica

> **Sprint-1 — Fundamentos: autenticación, gestión de usuarios y arquitectura base**
>
> Periodo: semanas 1–4 del desarrollo (abril 2026).
> Fuentes: `PLAN/current-sprint.md`, `DECISIONS/ADR-03b-authentication-firebase.md`, `DECISIONS/ADR-07-testing-strategy.md`.

---

## 6.1 Arquitectura del sistema

La arquitectura de GeroCare sigue un modelo cliente-servidor clásico con separación estricta de responsabilidades, adaptado al stack Firebase + Express + Vue 3.

### Backend (Express + Firebase Admin SDK)

El backend es un servidor Express escrito en TypeScript que actúa como capa de lógica de negocio entre el frontend y Firebase. Se organiza en cuatro capas:

| Capa | Responsabilidad | Carpeta |
|------|-----------------|---------|
| **Types** | Esquemas Zod + tipos TypeScript derivados | `src/types/` |
| **Services** | Lógica de negocio y acceso a Firestore vía Admin SDK | `src/services/` |
| **Controllers** | Capa HTTP: parseo de `req`, llamada a servicios, envío de `res` | `src/controllers/` |
| **Routes** | Definición de endpoints y encadenamiento de middlewares | `src/routes/` |

Esta separación garantiza que ninguna lógica de negocio resida en los controladores y que ninguna dependencia de Firebase se filtre fuera de la capa de servicios. La inicialización del SDK Admin se centraliza en `src/services/firebase.ts`, el único fichero del proyecto que importa `firebase-admin`.

### Frontend (Vue 3 DDD)

El frontend sigue una arquitectura de Diseño Orientado al Dominio (DDD) adaptada a Vue 3. Cada dominio funcional (autenticación, residentes, agenda, incidencias) se organiza bajo `src/business/{módulo}/` con cuatro subcarpetas:

```
src/business/{módulo}/
  domain/          — entidades, interfaces de repositorio (TypeScript puro, sin framework)
  application/     — casos de uso, composables de orquestación
  infrastructure/  — repositorios Firestore, clientes Axios
  presentation/    — componentes Vue, vistas, composables de UI, stores Pinia
```

Esta estructura evita el acoplamiento entre módulos: la única forma de comunicación entre dominios es a través de interfaces definidas en `domain/`. Los componentes Vue nunca importan directamente stores o repositorios; lo hacen siempre a través de composables.

---

## 6.2 Autenticación y autorización

La implementación de la autenticación en el Sprint-1 fue el bloque más crítico y el que más tiempo de diseño requirió. Se adoptó un modelo de seguridad en tres capas, según lo especificado en **ADR-03b**:

### Capa 1 — Firebase Auth (cliente)

El usuario se autentica mediante `signInWithEmailAndPassword` desde el SDK Web de Firebase. Tras el inicio de sesión, el SDK emite un ID Token JWT firmado que incluye los *custom claims* del usuario (en particular, el campo `role`).

### Capa 2 — Express middleware (API)

Todos los endpoints protegidos pasan por dos middlewares encadenados: `verifyAuth` (que valida el ID Token con el Admin SDK) y `requireRole` (que comprueba el rol del usuario). La implementación de `requireRole` es una *factory function* que devuelve un `RequestHandler` de Express:

```typescript
// src/middleware/requireRole.ts
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.['role'] as UserRole | undefined

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' })
      return
    }

    next()
  }
}
```

Este patrón de *factory* permite componer permisos de forma declarativa en cada ruta: `router.use(verifyAuth, requireRole('admin'))`. Los roles definidos en el sistema son `admin` y `gerocultor`.

### Capa 3 — Firestore Security Rules

Las reglas de Firestore constituyen la última línea de defensa: incluso si un cliente accediera directamente a Firestore sin pasar por la API, las reglas deniegan el acceso sin el rol adecuado. Las funciones auxiliares `isAdmin()`, `isAccountOwner()` e `isResourceOwner()` encapsulan la lógica de autorización a nivel de documento.

### Router guards en Vue

En el frontend, la protección de rutas se implementa en `src/business/auth/presentation/composables/useAuthGuard.ts`, que exporta una *factory function* `createAuthGuard()` registrada como `router.beforeEach`:

```typescript
// src/business/auth/presentation/composables/useAuthGuard.ts
export function createAuthGuard(): NavigationGuard {
  return (to) => {
    const auth = useAuthStore()

    if (to.meta['requiresAuth'] === true && auth.user === null) {
      return { name: AUTH_ROUTES.LOGIN.name }
    }

    const requiredRole = to.meta['requiresRole'] as UserRole | undefined
    if (requiredRole !== undefined && auth.role !== requiredRole) {
      if (to.name !== FORBIDDEN_ROUTES.name) {
        return { name: FORBIDDEN_ROUTES.name }
      }
    }
  }
}
```

Cada ruta protegida declara `meta: { requiresAuth: true }` y opcionalmente `meta: { requiresRole: 'admin' }`. El guard redirige a `/login` si el usuario no está autenticado, o a `/403` si no tiene el rol requerido.

---

## 6.3 Módulo de gestión de usuarios

La gestión de usuarios fue la primera funcionalidad implementada sobre la arquitectura de autenticación. Comprende tres componentes principales:

### API REST de administración de usuarios

El backend expone un conjunto de endpoints bajo `/api/users` que permiten listar, crear, editar y eliminar usuarios. Estos endpoints están protegidos con `verifyAuth + requireRole('admin')`, garantizando que solo administradores puedan acceder a ellos. Las operaciones sobre usuarios combinan Firebase Auth (para credenciales) con Firestore (para metadatos de perfil y rol).

### Composable `useUsers`

En el frontend, el composable `useUsers` (capa `application/`) encapsula las llamadas a la API a través del cliente Axios definido en `infrastructure/`. Expone un estado reactivo (`users`, `isLoading`, `error`) y las acciones necesarias (`fetchUsers`, `createUser`, `updateUser`, `deleteUser`). Los componentes Vue nunca llaman directamente a Axios; siempre pasan por este composable.

### Vista `UsersView`

La vista de administración de usuarios (`src/business/users/presentation/UsersView.vue`) presenta la lista de usuarios en una tabla con acciones de edición y eliminación. Utiliza componentes de UI reutilizables (formulario modal, confirmación de borrado) y sigue las convenciones BEM para los estilos, con clases Tailwind aplicadas exclusivamente vía `@apply` en la sección `<style scoped>`.

---

## 6.4 Decisiones técnicas relevantes

Durante el Sprint-1 se formalizaron tres decisiones de arquitectura que condicionan el resto del desarrollo:

**ADR-03b — Firebase Auth + Custom Claims + Express middleware**: La elección de Firebase Auth como sistema de autenticación simplifica la gestión de identidades al concentrar todo el ecosistema en un solo proveedor (Firebase). La alternativa de JWT autogestionado se descartó por el riesgo de bugs de seguridad y el coste de implementación en un proyecto con deadline ajustado.

**ADR-07 — Estrategia de testing (Vitest + Playwright + @firebase/rules-unit-testing)**: Se definió una estrategia de testing en tres niveles: tests unitarios con Vitest para la lógica de dominio y aplicación, tests de componentes con `@vue/test-utils`, y tests E2E con Playwright para los flujos completos. Adicionalmente, las Firestore Security Rules se validan con `@firebase/rules-unit-testing` ejecutado contra el emulador local. El objetivo de cobertura es ≥ 80% en las capas `domain/` y `application/`.

**Arquitectura DDD frontend**: Aunque no existe un ADR independiente para esta decisión, la estructura de carpetas DDD se derivó de ADR-01b (Vue 3 + TypeScript) y es la convención central del módulo frontend. La separación en cuatro capas (domain, application, infrastructure, presentation) es la regla más importante para mantener el código mantenible a medida que el proyecto crece.

---

## 6.5 Extractos de código representativos

### Inicialización del store de autenticación

El store de Pinia para autenticación (`useAuthStore`) incluye un método `init()` que se llama una sola vez desde `main.ts` antes de montar la aplicación. Esto garantiza que el estado de sesión se restaura correctamente al recargar la página:

```typescript
// src/business/auth/useAuthStore.ts
async function init(): Promise<void> {
  return new Promise((resolve) => {
    const holder: { unsubscribe?: () => void } = {}

    holder.unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult()
        const claimedRole = idTokenResult.claims['role']
        role.value = typeof claimedRole === 'string' ? claimedRole : null
        user.value = firebaseUser
      } else {
        user.value = null
        role.value = null
      }
      if (holder.unsubscribe) holder.unsubscribe()
      resolve()
    })
  })
}
```

El uso de un objeto `holder` para la función `unsubscribe` resuelve un problema de la Zona Muerta Temporal (TDZ): en entornos de test donde el mock de `onAuthStateChanged` invoca el callback de forma síncrona, la variable `unsubscribe` aún no está asignada en el momento en que el callback se ejecuta. El objeto `holder` como contenedor actúa como referencia estable que el callback puede leer más tarde.

---

## Problemas encontrados y soluciones

**Problema 1 — TDZ en tests del AuthStore**: Durante el desarrollo de los tests unitarios del store de autenticación, se detectó que los mocks síncronos de `onAuthStateChanged` provocaban un error de TDZ al intentar llamar a `unsubscribe()`. La solución fue introducir el patrón `holder` descrito anteriormente, que encapsula la referencia a la función en un objeto asignable antes de que el callback se ejecute.

**Problema 2 — Propagación del rol entre recargas**: El campo `role` de los custom claims no se incluye automáticamente en el estado inicial de `onAuthStateChanged`; es necesario llamar a `getIdTokenResult()` para recuperarlo. Esto implica una llamada asíncrona adicional en cada restauración de sesión, lo que se resuelve esperando a que `init()` resuelva antes de llamar a `app.mount()` en `main.ts`.

**Problema 3 — Colisión de nombres de colecciones**: Las colecciones de Firestore se nombraron inicialmente en español (`usuarios`, `tareas`, `residentes`) siguiendo la convención del dominio. En el Sprint-1 se decidió adoptar nombres en inglés (`users`, `tasks`, `residents`) como colecciones canónicas, manteniendo las colecciones en español como alias durante la migración de datos. Las Firestore Security Rules incluyen ambas colecciones con las mismas reglas de acceso hasta que se complete la migración en el Sprint-3.

---

*Última actualización: 2026-04-18 — Sprint-1 completado*
