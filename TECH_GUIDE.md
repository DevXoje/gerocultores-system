# TECH GUIDE — Convenciones técnicas

> El Developer Agent debe leer este archivo antes de generar cualquier código.
> El Reviewer Agent lo usa para validar que el código generado es consistente.
>
> **Stack activo**: Vue 3.5 + Vite 8 + TypeScript 6 + Tailwind CSS 4 + Pinia 3 (frontend) | Express 5.2 + Firebase Admin 13 + Firestore (backend)
> **ADRs de referencia**: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05

---

## 1. Convenciones de código

### 1.1 Nomenclatura

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Componentes Vue | PascalCase | `AgendaDiaria.vue`, `ResidenteCard.vue` |
| Composables | camelCase con prefijo `use` | `useAuth.ts`, `useAgenda.ts` |
| Stores Pinia | camelCase con prefijo `use` + sufijo `Store` | `useAuthStore.ts`, `useAgendaStore.ts` |
| Services | camelCase con sufijo `Service` | `tareaService.ts`, `residenteService.ts` |
| Tipos/Interfaces | PascalCase | `Residente`, `Tarea`, `IncidenciaSeveridad` |
| Variables/funciones | camelCase | `tareaActual`, `obtenerAgenda` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_TAREAS_POR_DIA` |
| Archivos de tipos | camelCase con sufijo `.types.ts` | `residente.types.ts` |
| Rutas Vue Router | kebab-case | `/agenda-diaria`, `/ficha-residente/:id` |

### 1.2 Estructura de carpetas

> **Frontend** sigue una arquitectura DDD (Domain-Driven Design). Ver sección 10 para la descripción detallada de cada capa.

```
code/
├── firebase.json           # Configuración Firebase (hosting, firestore, emulators)
├── firestore.rules         # Firestore Security Rules v2
├── .firebaserc             # Alias del proyecto Firebase
├── frontend/
│   ├── src/
│   │   ├── style.css           # ← Punto de entrada Tailwind CSS v4 (@import 'tailwindcss' + @theme tokens)
│   │   ├── assets/
│   │   │   └── styles/         # Resets globales, variables CSS adicionales
│   │   ├── business/           # ← Arquitectura DDD por módulo de dominio
│   │   │   ├── agenda/         #   Módulo de agenda/tareas
│   │   │   ├── auth/           #   Módulo de autenticación
│   │   │   ├── incidents/      #   Módulo de incidencias
│   │   │   ├── notification/   #   Módulo de notificaciones
│   │   │   ├── residents/      #   Módulo de residentes
│   │   │   ├── turno/          #   Módulo de gestión de turnos
│   │   │   ├── users/          #   Módulo de gestión de usuarios (admin)
│   │   │   └── {module}/
│   │   │       ├── domain/
│   │   │       │   ├── entities/       # TypeScript interfaces + Zod schemas
│   │   │       │   ├── value-objects/  # Primitivos de dominio inmutables
│   │   │       │   └── repositories/  # Interfaces de repositorio (puertos)
│   │   │       ├── application/        # Casos de uso (sin dependencias de framework)
│   │   │       ├── infrastructure/
│   │   │       │   ├── repositories/  # Implementaciones Firebase
│   │   │       │   ├── api/           # Clientes HTTP para la Express API
│   │   │       │   └── mappers/       # Datos Firebase → entidad de dominio
│   │   │       └── presentation/
│   │   │           ├── atoms/         # Button, Input, Badge...
│   │   │           ├── molecules/     # ResidentCard, IncidentRow...
│   │   │           ├── components/    # Componentes de la vista (composables + template)
│   │   │           ├── pages/ | views/ # Vista completa (una por ruta)
│   │   │           └── composables/   # Puente componentes ↔ stores/repos
│   │   ├── shared/
│   │   │   ├── ui/             # Atoms/molecules verdaderamente cross-módulo
│   │   │   ├── composables/    # Composables verdaderamente compartidos
│   │   │   ├── types/          # Tipos TypeScript compartidos
│   │   │   └── utils/          # Funciones utilitarias puras
│   │   ├── components/         # Componentes globales (OfflineBanner, etc.)
│   │   ├── stores/             # Solo estado global (auth, notificaciones). Estado de módulo va en business/{module}/
│   │   ├── router/             # Vue Router 4 — index.ts + guards.ts
│   │   ├── services/           # Clientes HTTP globales (apiClient.ts)
│   │   ├── App.vue             # AppShell: monta NotificationToast, NotificationPanel, OfflineBanner
│   │   └── main.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
└── api/
    ├── src/
    │   ├── controllers/        # Handlers HTTP (request → response)
    │   ├── middleware/         # verifyAuth, errorHandler, validateBody
    │   ├── routes/             # Express Router (index.ts + modular)
    │   ├── services/           # Lógica de negocio (acceso a Firestore)
    │   │   └── collections.ts  # ← Constante COLLECTIONS (G04 — nunca strings literales)
    │   └── types/              # Tipos compartidos (espejo de SPEC/entities.md)
    ├── app.ts                  # Configuración Express
    ├── server.ts               # Punto de entrada (puerto, listen)
    ├── package.json
    └── tsconfig.json
```

### 1.3 Convenciones de imports

- Usar imports absolutos con alias `@/` para el código de `code/frontend/src/`.
- Los tipos compartidos se importan desde `@/shared/types/` o desde la carpeta `domain/entities/` del módulo.
- Los componentes **nunca** importan stores o repositorios directamente — siempre a través de un composable de `presentation/composables/`.

```typescript
// ✅ Correcto — componente importa solo composable
import { useResidents } from '../composables/useResidents'
import type { Resident } from '../../domain/entities/resident.schema'

// ✅ Correcto — composable importa store y repo
import { useResidentsStore } from '@/stores/useResidentsStore'
import { FirebaseResidentRepository } from '../../infrastructure/repositories/FirebaseResidentRepository'

// ❌ Incorrecto — componente importa store directamente
import { useResidentsStore } from '@/stores/useResidentsStore'

// ❌ Incorrecto — componente importa servicio/repo directamente
import residenteService from '../../services/residenteService'
```

### 1.4 Estilo de comentarios

- **No** comentar qué hace el código — el código debe ser autoexplicativo.
- Comentar **por qué** se toma una decisión no obvia.
- Los TODOs llevan referencia: `// TODO(US-XX): descripción`.
- JSDoc solo en funciones públicas de services y composables.

---

## 2. Gestión de estado (Pinia)

**Referencia ADR**: ADR-01b

### 2.1 Patrón de store

Cada módulo de dominio tiene su propio store en `business/{module}/` si el estado es específico del módulo. Solo el estado verdaderamente global (autenticación, notificaciones globales) va en `src/stores/`.

**Regla crítica**: Los stores solo contienen estado + getters + mutaciones básicas. **Nunca** llaman a Firebase directamente ni contienen lógica de negocio — eso va en composables o casos de uso.

```typescript
// stores/useResidentsStore.ts  (o business/residents/store/useResidentsStore.ts)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Resident } from '@/business/residents/domain/entities/resident.schema'

export const useResidentsStore = defineStore('residents', () => {
  // --- State (solo estado reactivo) ---
  const residents = ref<Resident[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Getters (computed derivados del estado) ---
  const activeResidents = computed(() =>
    residents.value.filter(r => r.active)
  )

  // --- Mutations (mutaciones síncronas simples — sin lógica de negocio) ---
  function setResidents(data: Resident[]): void {
    residents.value = data
  }

  function updateResident(id: string, patch: Partial<Resident>): void {
    const idx = residents.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      residents.value[idx] = { ...residents.value[idx], ...patch }
    }
  }

  function setLoading(val: boolean): void {
    loading.value = val
  }

  function setError(msg: string | null): void {
    error.value = msg
  }

  return {
    residents,
    loading,
    error,
    activeResidents,
    setResidents,
    updateResident,
    setLoading,
    setError,
  }
})
```

### 2.2 Stores disponibles

| Store | Ubicación | Dominio | Responsabilidad |
|-------|-----------|---------|----------------|
| `useAuthStore` | `src/stores/` | Autenticación | Usuario actual, token, rol |
| `useResidentsStore` | `business/residents/` | Residentes | Lista, estado de carga |
| `useScheduleStore` | `business/schedule/` | Agenda | Tareas del día, actualizaciones |
| `useIncidentsStore` | `business/incidents/` | Incidencias | Registro, historial |
| `useNotificationsStore` | `src/stores/` | Notificaciones | Alertas globales in-app |

### 2.3 Reglas de estado

- El estado de la UI (modal abierto, tab activo) **no** va en Pinia — va en `ref` local del componente o composable.
- Los stores **nunca** hacen llamadas async a Firebase — eso es responsabilidad del composable.
- Los stores **nunca** contienen lógica de negocio — solo mutaciones de datos.
- Las acciones async viven en los composables de `presentation/composables/`.

---

## 3. API y comunicación

**Referencia ADR**: ADR-02b, ADR-03b

### 3.1 Cliente HTTP (Axios)

Un único cliente Axios configurado con el token Firebase Auth en `src/services/apiClient.ts`:

```typescript
// services/apiClient.ts
import axios from 'axios'
import { auth } from '@/firebase'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

// Interceptor: añade el token Firebase Auth en cada request
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
```

> **Nota**: en desarrollo, Vite proxea `/api/*` y `/health` a `http://localhost:3000`. No es necesario configurar manualmente la URL del backend.

### 3.2 Estructura de services en módulos

Los módulos frontend usan un cliente HTTP por módulo en `infrastructure/api/` en lugar de un service global. Solo los composables los llaman.

```typescript
// business/turno/infrastructure/api/turnoApi.ts
import apiClient from '@/services/apiClient'

export const turnoApi = {
  async getResumen(turnoId: string) {
    const { data } = await apiClient.get(`/api/turnos/${turnoId}/resumen`)
    return TurnoResumenSchema.parse(data)
  },
}
```

### 3.3 Rutas de la API

Todas las rutas Express están montadas bajo `/api/` o `/` (health check):

| Ruta | Método | US | Requiere auth |
|------|--------|-----|--------------|
| `/health` | GET | US-13 | No |
| `/api/protected` | GET | US-02 | Sí (cualquier rol) |
| `/api/admin/users` | GET | US-10 | Sí (`admin`) |
| `/api/admin/users` | POST | US-10 | Sí (`admin`) |
| `/api/admin/users/:uid/role` | PATCH | US-10 | Sí (`admin`) |
| `/api/admin/users/:uid/disable` | PATCH | US-10 | Sí (`admin`) |
| `/api/turnos` | POST | US-11 | Sí |
| `/api/turnos/activo` | GET | US-11 | Sí |
| `/api/turnos/:id` | PATCH | US-11 | Sí |
| `/api/turnos/:id/resumen` | GET | US-11 | Sí |
| `/api/notificaciones` | GET | US-08 | Sí |
| `/api/notificaciones/:id/leer` | PATCH | US-08 | Sí |

### 3.4 Manejo de errores en la API (Express)

- Todos los errores devuelven `{ error: string, code?: string }`.
- Los códigos HTTP siguen estándar REST: 200, 201, 400, 401, 403, 404, 500.
- El middleware `errorHandler` captura todos los errores no controlados.

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  res.status(500).json({ error: 'Internal server error' })
}
```

### 3.5 Autenticación en Express

El middleware `verifyAuth` valida el ID Token de Firebase y extrae el usuario:

```typescript
// middleware/verifyAuth.ts
import { admin } from '../firebase-admin'
import { Request, Response, NextFunction } from 'express'

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded  // { uid, email, rol (custom claim) }
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}
```

---

## 4. Testing

**Referencia ADR**: ADR-01b (framework decidido)

> **TDD es obligatorio**: escribir el test primero (RED), luego implementar (GREEN), luego refactorizar. Ver sección 10.7 para la metodología completa.

### 4.1 Frameworks

| Nivel | Framework | Uso |
|-------|-----------|-----|
| Unit | Vitest 4 + Vue Test Utils | Composables, stores, use cases, domain entities, utils |
| Integration | Vitest + Supertest | API routes, services con mocks de Firestore |
| Firestore Rules | Jest + `@firebase/rules-unit-testing` | Reglas de seguridad Firestore |
| E2E | Playwright | Flujos críticos de usuario (login, agenda, incidencias) |
| Manual | Guías en `OUTPUTS/test-plans/` | Casos de uso completos, UX táctil |

### 4.2 Convenciones de nomenclatura

- Tests unitarios: `nombreDelArtefacto.spec.ts` junto al archivo que testea (co-location).
- Tests E2E: `tests/e2e/nombreDelFlujo.spec.ts`.
- Describe por comportamiento: `describe('ResidentCard', () => { it('should display name when active', ...) })`.
- Usar `vi.mock` para mockear stores y repositorios en tests de composables.
- Usar `@pinia/testing` (`createTestingPinia`) para aislar stores en tests de componentes.

### 4.3 Coverage mínimo (MVP)

| Capa | Coverage mínimo |
|------|----------------|
| `domain/` (entities, schemas, value-objects) | ≥ 80% líneas |
| `application/` (use cases) | ≥ 80% líneas |
| `presentation/composables/` | ≥ 70% líneas |
| `infrastructure/repositories/` | Todos los paths (mock de Firestore) |
| `presentation/molecules/` y `atoms/` | Smoke test + props principales |

> **Nota**: La cobertura total del proyecto se sitúa ~72–73% (Sprint-4 final). Los módulos críticos (`domain/`, `application/`) deben superar el 80%.

### 4.4 Comandos de test

```bash
# Frontend — tests unitarios (modo run)
cd code/frontend && npm run test

# Frontend — modo watch
cd code/frontend && npm run test:watch

# Frontend — coverage
cd code/frontend && npm run test:coverage

# Frontend — E2E (requiere servidor activo)
cd code/frontend && npm run test:e2e

# API — tests unitarios
cd code/api && npm run test

# API — tests de integración
cd code/api && npm run test:integration

# Firestore Rules (requiere emuladores activos)
cd code/tests/firestore-rules && npm test
```

---

## 5. Seguridad y datos

**Referencia ADR**: ADR-03b, ADR-04b (RGPD)

### 5.1 Reglas fundamentales

- **No** almacenar datos sensibles de residentes en `localStorage` o `sessionStorage`.
- **No** almacenar PII (Información de Identificación Personal) en el cliente más allá de la sesión activa.
- Toda PII de residentes pasa por la Express API (autenticada con Firebase Auth).
- El token Firebase Auth se mantiene en memoria (gestionado por el SDK de Firebase, no en localStorage).
- Las Firestore Rules son la última línea de defensa — deben mantenerse actualizadas.

### 5.2 Variables de entorno

**Frontend** (`code/frontend/.env.local`):
```
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

**API** (`code/api/.env`):
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> **G05**: Ninguna de estas variables aparece en el código fuente. Los archivos `.env` están en `.gitignore`.

### 5.3 RGPD

- Región Firestore: `europe-west1` (Bélgica) o `europe-west3` (Frankfurt). Confirmada en ADR-04b.
- Datos de residentes son datos de categoría especial (art. 9 RGPD) — acceso solo con autenticación.
- Los datos de test se generan con Faker.js — **nunca** datos reales de personas.

### 5.4 Firestore Security Rules

- Archivo: `code/firestore.rules` — rules_version `'2'`.
- **Patrón para campos opcionales**: usar `resource.data.keys().hasAll(['field']) ? resource.data['field'] : null` en lugar de acceder directamente a `resource.data.field` (lanza error si el campo no existe en Firestore Rules v2).
- Tests de reglas: `code/tests/firestore-rules/` con Jest + `@firebase/rules-unit-testing`.

---

## 6. Anti-patrones prohibidos

| Anti-patrón | Alternativa |
|-------------|-------------|
| Lógica de negocio en componentes Vue | Extraer a composable o caso de uso |
| Llamadas directas a Firestore desde el frontend | Usar la Express API (excepto listeners tiempo real explícitamente decididos) |
| Hardcodear IDs, rutas o claves de configuración | Usar `import.meta.env.VITE_*` o `process.env.*` |
| Fetch / Axios sin manejo de errores | Envolver en try/catch; composables capturan errores y actualizan el store |
| Componentes de más de 200 líneas | Dividir en componentes más pequeños siguiendo el Atomic Design del módulo |
| Importar stores directamente en componentes `.vue` | Siempre a través de un composable de `presentation/composables/` |
| Usar `v-html` con datos del servidor | Riesgo de XSS; escapar o sanitizar siempre |
| Queries Firestore sin índices en producción | Definir índices en `firestore.indexes.json` |
| Token Firebase en localStorage | El SDK lo gestiona en memoria automáticamente |
| Custom Claims actualizados sin forzar refresh del token | Forzar con `user.getIdToken(true)` después de cambiar claims |
| `any` en TypeScript | Usar `unknown` + narrowing explícito |
| Type assertions `as X` fuera de type guards | Crear función `assertIsX(val: unknown): asserts val is X` con Zod |
| Llamadas a Firebase dentro de un Pinia store | Mover al composable o caso de uso en `application/` |
| Clases Tailwind directamente en HTML del template | BEM en HTML + `@apply` en `<style scoped>` |
| `v-for` con índice como `:key` | Usar el `id` único de la entidad |
| Strings literales para nombres de colecciones Firestore | Usar siempre la constante `COLLECTIONS` de `services/collections.ts` |
| `@apply` en `<style scoped>` sin `@reference` | Añadir `@reference "../../../../style.css"` como primera línea del bloque `<style scoped>` |

---

## 7. Diseño e implementación UI

**Referencia ADR**: ADR-05

- La iteración visual principal ocurre en **Google Stitch** (incl. vía MCP en el IDE).
- Los **exports** (PNG/WebP/PDF) se versionan en `OUTPUTS/design-exports/` con la convención definida en [ADR-05](DECISIONS/ADR-05-stitch-design-source.md).
- La **tabla de trazabilidad** Stitch ↔ archivos ↔ historias/SPEC está en [OUTPUTS/technical-docs/design-source.md](OUTPUTS/technical-docs/design-source.md).
- Al implementar pantallas, alinear la UI con **SPEC/** (comportamiento, campos, flujos) y usar los exports como referencia visual.
- Si el diseño exige un cambio funcional, actualizar SPEC antes de tratar el diseño como cerrado (G06).

### 7.1 Tailwind CSS v4 — patrón `@reference` obligatorio

> **Tailwind CSS v4 rompe con v3**: ya no existe `tailwind.config.ts`. La configuración de tokens (colores, fuentes, breakpoints) se define en `src/style.css` mediante directivas `@theme {}`.

**Patrón obligatorio en `<style scoped>`**:

```css
/* TODA sección <style scoped> que use @apply debe empezar con @reference */
<style scoped>
@reference "../../../../style.css";   /* ← ajustar ruta relativa según profundidad */

.mi-componente {
  @apply rounded-lg shadow-md p-4;
}
</style>
```

- **`@reference` es obligatorio** si el componente usa `@apply`. Sin él, Vite/build falla silenciosamente o `@apply` ignora los tokens del design system.
- La ruta en `@reference` debe ser **relativa** al archivo `.vue` (no alias `@/`).
- Tabla de rutas según profundidad del componente:

| Ubicación del componente | `@reference` |
|--------------------------|-------------|
| `src/App.vue` | `"./style.css"` |
| `src/components/*.vue` | `"../style.css"` |
| `src/business/{mod}/presentation/components/*.vue` | `"../../../../style.css"` |
| `src/business/{mod}/presentation/pages/*.vue` | `"../../../../style.css"` |
| `src/business/{mod}/presentation/views/*.vue` | `"../../../../style.css"` |

### 7.2 BEM naming

- **BEM naming para TODOS los atributos `class` en HTML**: patrón `block__element--modifier`.
- **Tailwind va en CSS, NO en HTML** — excepto en excepciones justificadas documentadas con `<!-- tailwind-exception: razón -->`.
- Patrón: clase BEM en HTML → en `<style scoped>` esa clase BEM usa `@apply` para estilos simples/repetitivos, CSS raw para estilos complejos/únicos.

```html
<!-- HTML — solo clases BEM -->
<div class="resident-card">
  <span class="resident-card__name resident-card__name--inactive">Juan García</span>
</div>
```

```css
/* <style scoped> — siempre con @reference primero */
<style scoped>
@reference "../../../../style.css";

.resident-card {
  @apply rounded-lg shadow-md p-4;
}
.resident-card__name {
  @apply text-sm font-medium text-gray-800;
}
.resident-card__name--inactive {
  @apply text-gray-400;
  text-decoration: line-through;          /* regla única → raw CSS */
  text-decoration-thickness: 2px;
}
</style>
```

- Usar `<style scoped>` en todos los componentes `.vue`.
- Estilos globales (resets, tokens) en `src/style.css` (archivo de entrada de Tailwind v4).
- Breakpoints principales: `sm` (640px — móvil grande), `md` (768px — tablet), `lg` (1024px — desktop).
- Target principal: tablet 10" en orientación portrait → diseñar mobile-first.

---

## 8. Comandos de desarrollo

### 8.1 Setup inicial

```bash
# Instalar dependencias del frontend
cd code/frontend && npm install

# Instalar dependencias de la API
cd code/api && npm install

# Instalar Firebase CLI (global)
npm install -g firebase-tools

# Login en Firebase
firebase login

# Iniciar Firebase emulators (Auth + Firestore) — desde code/
cd code && firebase emulators:start
```

### 8.2 Desarrollo local

```bash
# Frontend (Vite dev server en http://localhost:5173)
cd code/frontend && npm run dev

# API (Express en http://localhost:3000, tsx watch)
cd code/api && npm run dev

# Firebase emulators — desde code/
# Auth: 9099  |  Firestore: 8080  |  Emulator UI: http://localhost:4000
cd code && firebase emulators:start
```

> **Nota**: el frontend Vite proxea `/api/*` y `/health` a `http://localhost:3000`. No es necesario configurar CORS manualmente en desarrollo.

### 8.3 Build y despliegue

```bash
# Build del frontend (vue-tsc + vite build)
cd code/frontend && npm run build

# Build de la API (tsc)
cd code/api && npm run build

# Deploy completo a Firebase Hosting — desde code/
cd code && firebase deploy

# Deploy solo Hosting
cd code && firebase deploy --only hosting

# Deploy solo Firestore Rules
cd code && firebase deploy --only firestore:rules
```

### 8.4 Type checking y linting

```bash
# Frontend
cd code/frontend && npm run type-check   # vue-tsc --noEmit
cd code/frontend && npm run lint
cd code/frontend && npm run format:check

# API
cd code/api && npm run type-check        # tsc --noEmit
```

### 8.5 Path aliases

| Alias | Resuelve a | Configurado en |
|-------|-----------|---------------|
| `@/` | `code/frontend/src/` | `vite.config.ts` → `resolve.alias` |

> No existe alias `~/`. Usar `@/` para todos los imports absolutos del frontend.

---

## 9. Vue 3 Composition API — convenciones

### 9.1 Estructura de un componente

Los componentes son **dumb renderers** — toda la lógica va en composables. Los componentes **nunca** importan stores ni repositorios directamente.

```vue
<script setup lang="ts">
// 1. Imports de Vue core
import { computed } from 'vue'

// 2. Imports de composables — NUNCA stores o repos directamente
import { useResidents } from '../composables/useResidents'

// 3. Imports de tipos (desde domain/entities del módulo)
import type { Resident } from '../../domain/entities/resident.schema'

// 4. Props — siempre tipados con defineProps<{}>()
const props = defineProps<{
  resident: Resident
  readonly?: boolean
}>()

// 5. Emits — siempre tipados con defineEmits<{}>()
const emit = defineEmits<{
  select: [resident: Resident]
  deactivate: [id: string]
}>()

// 6. Composables — llamados al nivel superior (nunca en condicionales/loops)
const { deactivateResident } = useResidents()

// 7. Computed local — mínimo; la lógica real va en composables
const statusLabel = computed(() => props.resident.active ? 'Activo' : 'Inactivo')
</script>

<template>
  <!-- Template limpio, sin lógica compleja — usar composables/computed -->
  <div class="resident-card" @click="emit('select', resident)">
    <span class="resident-card__name" :class="{ 'resident-card__name--inactive': !resident.active }">
      {{ resident.fullName }}
    </span>
    <span class="resident-card__status">{{ statusLabel }}</span>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

/* BEM en HTML → @apply Tailwind en CSS */
.resident-card {
  @apply rounded-lg shadow-md p-4 cursor-pointer;
}
.resident-card__name {
  @apply text-sm font-medium text-gray-800;
}
.resident-card__name--inactive {
  @apply text-gray-400;
  text-decoration: line-through; /* raw CSS para reglas únicas/complejas */
}
.resident-card__status {
  @apply text-xs text-gray-500;
}
</style>
```

### 9.2 Reglas de la Composition API

- Usar siempre `<script setup lang="ts">` — Options API está **PROHIBIDA**.
- Los composables se llaman **al nivel superior** del `<script setup>` (no dentro de condicionales o loops).
- `v-for` siempre requiere `:key` con un identificador único (nunca el índice del array).
- `v-if` y `v-for` **no** van en el mismo elemento — usar `<template>` como wrapper.
- Props con `defineProps<{ ... }>()` — sin runtime props object.
- Emits con `defineEmits<{ ... }>()` — siempre declarados y tipados.
- **No** importar stores directamente en archivos `.vue` — siempre a través de un composable de `presentation/composables/`.

### 9.3 TypeScript estricto

- `strict: true` activado en `tsconfig.json`.
- **`any` está PROHIBIDO** — ESLint configurado con `"@typescript-eslint/no-explicit-any": "error"`.
- **Type assertions (`as X`) están PROHIBIDAS** — excepto dentro de funciones de type guard dedicadas con Zod.
- Si el tipo es desconocido, usar `unknown` con narrowing explícito.
- Los tipos de las entidades de dominio se derivan de los Zod schemas en `domain/entities/` y deben coincidir exactamente con `SPEC/entities.md` (G04).
- Usar el operador `satisfies` para validar objetos literales sin widening de tipo.

```typescript
// ✅ Correcto — Zod schema como fuente única de verdad
import { z } from 'zod'
export const ResidentSchema = z.object({ id: z.string(), name: z.string() })
export type Resident = z.infer<typeof ResidentSchema>  // tipo derivado del schema

// ✅ Correcto — unknown + narrowing
function handleError(e: unknown): string {
  if (e instanceof Error) return e.message
  return 'Error desconocido'
}

// ✅ Correcto — satisfies
const config = { maxPage: 20 } satisfies Partial<AppConfig>

// ❌ Prohibido — any
const data: any = fetchSomething()

// ❌ Prohibido — type assertion
const resident = rawData as Resident
```

---

## 10. Arquitectura Frontend — DDD por módulos

> **Referencia completa**: `AGENTS/frontend-specialist.md`
> Esta sección es el resumen normativo. El archivo del especialista contiene ejemplos de código completos.

### 10.1 Principio fundamental

El frontend sigue una arquitectura **Domain-Driven Design (DDD)** organizada por módulos de dominio. Cada módulo es autocontenido con sus propias capas: `domain/`, `application/`, `infrastructure/`, `presentation/`.

**Regla de dependencias** (estricta, sin excepciones):

```
presentation/pages
    ↓ (solo puede importar de)
presentation/composables
    ↓
stores (Pinia) + infrastructure/repositories
    ↓
application/ (use cases)
    ↓
domain/ (entities, value-objects, repo interfaces)
```

**Ninguna capa puede importar de una capa superior.**

### 10.2 Responsabilidades por capa

| Capa | Qué hace | Qué NO puede hacer |
|------|---------|-------------------|
| `domain/entities/` | Define tipos TypeScript via Zod schemas | Importar Vue, Pinia, Firebase, presentación |
| `domain/repositories/` | Define interfaces de repositorio (puertos) | Contener implementación alguna |
| `application/` | Orquesta casos de uso con entidades + repos | Importar Vue, Pinia o componentes UI |
| `infrastructure/repositories/` | Implementa repos con Firebase/Firestore | Contener lógica de negocio |
| `infrastructure/api/` | Clientes HTTP para la Express API | Contener lógica de negocio |
| `infrastructure/mappers/` | Convierte datos Firebase ↔ entidades de dominio | Llamar Firebase directamente |
| `presentation/composables/` | Puente componentes ↔ stores/repos | Contener markup o ser importado por capas inferiores |
| `presentation/atoms/` y `molecules/` | Renderiza UI — puramente presentacional | Importar stores, repos o composables |
| `presentation/pages/` | Vistas de ruta — conecta composables a template | Acceder a stores o repos directamente |
| `stores/` (Pinia) | Estado reactivo + getters + mutaciones | Llamar Firebase, contener lógica de negocio |

### 10.3 Reglas TypeScript

1. **`any` está PROHIBIDO** — ESLint: `"@typescript-eslint/no-explicit-any": "error"`.
2. **Type assertions (`as X`) están PROHIBIDAS** — excepto dentro de funciones type guard con Zod.
3. **Zod es la fuente única de verdad para entidades de dominio** — los tipos se derivan con `z.infer<typeof Schema>`.
4. Todos los parámetros, tipos de retorno y props deben ser tipados explícitamente.
5. Usar `satisfies` para validar objetos literales sin widening.

```typescript
// Patrón correcto: schema → tipo → type guard
import { z } from 'zod'

export const ResidentSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  active: z.boolean(),
})

export type Resident = z.infer<typeof ResidentSchema>

export function assertIsResident(val: unknown): asserts val is Resident {
  ResidentSchema.parse(val)  // lanza ZodError si inválido
}
```

### 10.4 Reglas Vue 3

- Siempre `<script setup lang="ts">` — Options API está PROHIBIDA.
- Props: `defineProps<{ ... }>()` — sin runtime props.
- Emits: `defineEmits<{ ... }>()` — siempre tipados.
- **No** importar stores directamente en `.vue` — solo composables de `presentation/composables/`.
- Naming de archivos: PascalCase (`ResidentCard.vue`).

### 10.5 Reglas Pinia

- Stores: solo estado + getters + mutaciones síncronas.
- **Sin** acciones async que llamen Firebase — eso va en el composable o use case.
- Estado de módulo específico → `business/{module}/store/` o `business/{module}/presentation/`.
- Estado global (auth, notificaciones globales) → `src/stores/`.
- Naming: `use{Module}Store` (ej: `useResidentsStore`).

### 10.6 Reglas CSS / BEM

1. **HTML**: solo clases BEM (`block__element--modifier`).
2. **`<style scoped>`**: primera línea obligatoria `@reference "ruta/a/style.css"` (Tailwind v4).
3. Clases BEM mapean a Tailwind via `@apply` (simple) o raw CSS (complejo/único).
4. **Excepción documentada**: `<!-- tailwind-exception: razón -->` si es necesario Tailwind en HTML.
5. Estilos globales en `src/style.css` (tokens del design system) y `src/assets/styles/` (resets adicionales).

### 10.7 Colecciones Firestore

Las colecciones Firestore **nunca** se referencian con strings literales. Siempre usar la constante `COLLECTIONS`:

```typescript
// ✅ Correcto
import { COLLECTIONS } from '../services/collections'
const snapshot = await db.collection(COLLECTIONS.turnos).doc(id).get()

// ❌ Prohibido
const snapshot = await db.collection('shifts').doc(id).get()
```

**Mapa de colecciones actuales** (archivo `code/api/src/services/collections.ts`):

| Clave COLLECTIONS | Nombre Firestore | Entidad |
|-------------------|-----------------|---------|
| `usuarios` | `users` | Usuario |
| `residentes` | `residents` | Residente |
| `tareas` | `tasks` | Tarea |
| `incidences` | `incidences` | Incidencia |
| `turnos` | `shifts` | Turno |
| `notificaciones` | `notificaciones` | Notificación |

> **Nota**: `incidencias` es alias deprecated de `incidences`. Usar siempre `COLLECTIONS.incidences`.

### 10.8 TDD — Red → Green → Refactor

**TDD es obligatorio** para toda la lógica de dominio y composables.

```
PARA CADA TAREA:
1. ROJO   — Escribe el test que describe el comportamiento esperado.
            Ejecuta: confirma que FALLA (si pasa, el test es incorrecto).
2. VERDE  — Implementa el mínimo código para hacer pasar el test.
            Ejecuta: confirma que PASA.
3. REFACTOR — Limpia sin cambiar comportamiento.
              Ejecuta: confirma que sigue PASANDO.
```

- Test runner: `vitest` — comando: `cd code/frontend && npm run test`.
- Tests unitarios: co-ubicados (`resident.spec.ts` junto a `resident.ts`).
- Tests E2E: `tests/e2e/{feature}.spec.ts`.
- Mocking en composables: `vi.mock` para store y repositorio.
- Para stores Pinia en tests de componentes: `createTestingPinia` de `@pinia/testing`.
- Coverage mínimo: 80% en `domain/` y `application/`, 70% en `presentation/composables/`.

---

## 11. Common Pitfalls

Errores frecuentes detectados durante el desarrollo. **Leer antes de escribir código**.

### P-01 — `@apply` sin `@reference` (Tailwind v4 build failure)

**Síntoma**: Las clases de `@apply` son ignoradas o Vite lanza error en build. Los estilos compilados no incluyen las utilidades de Tailwind.

**Causa**: Tailwind CSS v4 no inyecta automáticamente su CSS en bloques `<style scoped>`. Sin `@reference`, el `@apply` no puede resolver las utilidades del design system.

**Solución**: añadir `@reference "ruta/a/style.css"` como primera línea del bloque `<style scoped>`.

```css
/* ✅ Correcto — siempre la primera línea */
<style scoped>
@reference "../../../../style.css";

.mi-bloque {
  @apply rounded-lg p-4;
}
</style>

/* ❌ Falla silenciosamente en build */
<style scoped>
.mi-bloque {
  @apply rounded-lg p-4;
}
</style>
```

### P-02 — `any` en TypeScript

**Síntoma**: ESLint error `@typescript-eslint/no-explicit-any`.

**Causa**: El proyecto tiene `strict: true` y `no-explicit-any: error`. El tipo `any` desactiva completamente el type checking.

**Solución**: usar `unknown` con narrowing explícito o tipos genéricos.

```typescript
// ❌ Prohibido
function parseData(data: any) { ... }

// ✅ Correcto
function parseData(data: unknown) {
  if (typeof data === 'object' && data !== null) { ... }
}
```

### P-03 — Strings literales para nombres de colecciones Firestore

**Síntoma**: discrepancias entre colecciones en código y reglas de Firestore; errores difíciles de rastrear al renombrar colecciones.

**Causa**: los nombres reales de colecciones difieren del nombre semántico del dominio (ej: `turnos` en dominio → `shifts` en Firestore).

**Solución**: siempre importar y usar `COLLECTIONS` de `code/api/src/services/collections.ts`.

### P-04 — Firestore Rules v2: acceso a campo opcional sin `keys().hasAll()`

**Síntoma**: la regla de Firestore lanza un error en runtime si el campo no existe en el documento.

**Causa**: en Firestore Rules v2, acceder a `resource.data.campo` cuando `campo` no existe en el documento lanza una excepción de evaluación (a diferencia de v1 que devolvía `null`).

**Solución**:

```javascript
// ❌ Lanza error si 'fin' no existe en el documento
allow update: if resource.data.fin == null;

// ✅ Patrón seguro con keys().hasAll()
allow update: if !resource.data.keys().hasAll(['fin']);

// ✅ Patrón helper para leer campo opcional
function getField(data, field) {
  return data.keys().hasAll([field]) ? data[field] : null;
}
```

### P-05 — Notificaciones polling antes de autenticación

**Síntoma**: requests `401` repetidas a `/api/notificaciones` antes de que el usuario haga login, visibles en los logs de consola.

**Causa**: si el polling de notificaciones se inicia en `App.vue` sin verificar el estado de autenticación, se realizan requests no autenticadas.

**Solución**: iniciar el polling solo después de confirmar que `useAuthStore().user` está disponible (listener `onAuthStateChanged`).

### P-06 — Lint errors por imports sin usar en test files

**Síntoma**: ESLint reporta `no-unused-vars` en archivos `.spec.ts`.

**Causa**: al refactorizar tests, es fácil dejar imports `ref`, `Mock`, `beforeEach` etc. sin usar.

**Solución**: revisar `npm run lint` antes de hacer commit. Usar `npm run lint:fix` para correcciones automáticas.

---

*Última actualización: 2026-04-25 — Sprint-4 completo: añadido @reference obligatorio (Tailwind v4), COLLECTIONS pattern, infrastructure/api layer, scripts actualizados, Common Pitfalls, colecciones Firestore canónicas (ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05)*
