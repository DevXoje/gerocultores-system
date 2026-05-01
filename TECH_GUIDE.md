# TECH GUIDE — Convenciones técnicas

> El Developer Agent debe leer este archivo antes de generar cualquier código.
> El Reviewer Agent lo usa para validar que el código generado es consistente.
>
> **Stack activo**: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia (frontend) | Express.js + Firebase Admin SDK + Firestore (backend)
> **ADRs de referencia**: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05, ADR-09

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

> **Frontend** sigue una arquitectura DDD (Domain-Driven Design) + Atomic Design (capa UI compartida). Ver secciones 3 y 10 para la descripción detallada de cada capa.

```
code/
├── firebase.json           # Configuración Firebase (hosting, firestore, emulators)
├── .firebaserc             # Alias del proyecto Firebase
├── frontend/
│   ├── src/
│   │   ├── ui/                    # ← Componentes UI genéricos (Atomic Design)
│   │   │   ├── atoms/              #   Primitivas: OfflineBanner, Button, Badge
│   │   │   ├── molecules/          #   Composiciones: AppDialog, SearchBar
│   │   │   └── organisms/          #   Composiciones complejas de atoms+molecules
│   │   ├── business/               # ← Arquitectura DDD por módulo de dominio
│   │   │   ├── residents/          #   Módulo de residentes
│   │   │   ├── agenda/             #   Módulo de agenda/tareas
│   │   │   ├── incidents/          #   Módulo de incidencias
│   │   │   └── {module}/
│   │   │       ├── domain/
│   │   │       │   ├── entities/       # TypeScript interfaces + Zod schemas
│   │   │       │   ├── value-objects/  # Primitivos de dominio inmutables
│   │   │       │   └── repositories/   # Interfaces de repositorio (puertos)
│   │   │       ├── application/        # Casos de uso (sin dependencias de framework)
│   │   │       ├── infrastructure/
│   │   │       │   ├── repositories/   # Implementaciones Firebase
│   │   │       │   └── mappers/        # Datos Firebase → entidad de dominio
│   │   │       └── presentation/
│   │   │           ├── components/     # Componentes DE dominio específico
│   │   │           ├── composables/    # Puente componentes ↔ stores/repos
│   │   │           └── stores/         # Estado del módulo (Pinia)
│   │   ├── composables/           # Composables verdaderamente compartidos
│   │   ├── views/                  # Vistas completas (una por ruta)
│   │   ├── infrastructure/         # API client, Firebase config
│   │   ├── router/                 # Vue Router 5 — index.ts + guards.ts
│   │   ├── assets/                 # Global CSS, variables, tokens
│   │   ├── App.vue
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
    │   └── types/              # Tipos compartidos (espejo de SPEC/entities.md)
    ├── app.ts                  # Configuración Express
    ├── server.ts               # Punto de entrada (puerto, listen)
    ├── package.json
    └── tsconfig.json
```

> **Regla de clasificación de componentes:** si un componente depende de entidades de dominio (`TareaResponse`, `Residente`, etc.) → vive en `business/{module}/presentation/components/`. Si es UI genérica reutilizable sin acoplamiento de dominio → vive en `ui/atoms` o `ui/molecules`.

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

Un único cliente Axios configurado con el token Firebase Auth:

```typescript
// infrastructure/apiClient.ts
import axios from 'axios'
import { auth } from '@/infrastructure/firebase/firebase'

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

### 3.2 Estructura de infrastructure

Los módulos de infrastructure encapsulan las llamadas HTTP y acceso a Firebase. **Solo** los composables de application los llaman directamente — nunca stores ni componentes Vue directamente.

```typescript
// infrastructure/tareas/tareas.api.ts
import apiClient from '@/infrastructure/apiClient'
import type { Tarea, ActualizarTareaDto } from '@/types/tarea.types'

export const tareasApi = {
  async getTareasHoy(): Promise<Tarea[]> {
    const { data } = await apiClient.get<Tarea[]>('/tareas/hoy')
    return data.data
  },

  async actualizarEstado(id: string, dto: ActualizarTareaDto): Promise<Tarea> {
    const { data } = await apiClient.patch<Tarea>(`/tareas/${id}`, dto)
    return data.data
  }
}
```

### 3.3 Manejo de errores en la API (Express)

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

### 3.4 Autenticación en Express

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
| Unit | Vitest + Vue Test Utils | Composables, stores, use cases, domain entities, utils |
| E2E | Playwright | Flujos críticos de usuario (login, agenda, incidencias) |
| Manual | Guías en `OUTPUTS/test-plans/` | Casos de uso completos, UX táctil |

### 4.2 Convenciones de nomenclatura

- Tests unitarios: `nombreDelArtefacto.spec.ts` junto al archivo que testea (co-location).
- Tests E2E: `tests/e2e/nombreDelFlujo.spec.ts`.
- Describe por comportamiento: `describe('ResidentCard', () => { it('should display name when active', ...) })`.
- Usar `vi.mock` para mockear stores y repositorios en tests de composables.

### 4.3 Coverage mínimo (MVP)

| Capa | Coverage mínimo |
|------|----------------|
| `domain/` (entities, schemas, value-objects) | ≥ 80% líneas |
| `application/` (use cases) | ≥ 80% líneas |
| `presentation/composables/` | ≥ 70% líneas |
| `infrastructure/repositories/` | Todos los paths (mock de Firestore) |
| `presentation/molecules/` y `atoms/` | Smoke test + props principales |

### 4.4 Comandos de test

```bash
# Frontend — tests unitarios
cd code/frontend && npm run test

# Frontend — coverage
cd code/frontend && npm run test:coverage

# E2E (requiere servidor activo)
cd code/frontend && npx playwright test

# API — tests unitarios
cd code/api && npm run test
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

#### Canonical sources

Cada paquete tiene su propio `.env.example` — esa es la lista canónica de vars requeridas para ese paquete:

| Paquete | Archivo canonical | Vars |
|---------|------------------|------|
| Frontend | `code/frontend/.env.example` | `VITE_FIREBASE_*`, `VITE_API_URL` |
| API | `code/api/.env.example` | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`, vars de emuladores |

> El archivo `.env.example` en la raíz del proyecto (`/.env.example`) ha sido eliminado para evitar duplicación y confusión. Usar siempre el `.env.example` correspondiente al paquete.

#### Archivos y precedencia

```
# Frontend (Vite — vars en tiempo de build)
code/frontend/.env.example        # template documented (committed)
code/frontend/.env                # gitignored, valores reales (NO commit)
code/frontend/.env.local          # gitignored, overrides locales (NO commit)
code/frontend/.env.test           # gitignored, vars para tests E2E

# API (Node.js — vars en tiempo de ejecución)
code/api/.env.example             # template documentado (committed)
code/api/.env                     # gitignored, valores reales (NO commit)
code/api/.env.local               # gitignored, overrides locales (NO commit)
```

**Precedencia** (Vite y dotenv):
- Later files override earlier ones: `.env` → `.env.local` → `.env.{MODE}`
- Modo por defecto en `npm run dev` es `development`

#### G05 — No hardcoded secrets

> Ninguna variable de entorno aparece en el código fuente. Los archivos `.env` y `.env.local` están en `.gitignore` en ambos paquetes.

Vars sensibles (API keys, passwords, credenciales Firebase):
- **Jamás** hardcodearlas en el código
- Usar siempre `import.meta.env.VITE_*` (frontend) o `process.env.*` (api)
- `.env` con valores reales **nunca se comitea**

#### Vars de build vs runtime

| Prefijo | Cuándo se resuelve | Ejemplo |
|---------|-------------------|---------|
| `VITE_*` | Build-time (Vite) | `VITE_FIREBASE_API_KEY`, `VITE_API_URL` |
| `FIREBASE_*` | Runtime (Node.js) | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` |

#### Ejemplo de configuración local

**Frontend** (`code/frontend/.env.local`):
```
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=gerocultores.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gerocultores
VITE_FIREBASE_APP_ID=1:...:web:...
```

**API** (`code/api/.env`):
```
FIREBASE_PROJECT_ID=gerocultores
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@gerocultores.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FIRESTORE_EMULATOR_HOST=localhost:18080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

#### Credenciales E2E (Playwright)

Las vars de test E2E (`E2E_USER`, `E2E_PASS`, `PLAYWRIGHT_TEST_BASE_URL`) **no van en `.env` ni `.env.local`**. Se suministran via secrets de CI o archivo `.env.test` gitignored. Ver `playwright.config.ts` para la configuración completa.

### 5.3 RGPD

- Región Firestore: `europe-west1` (Bélgica) o `europe-west3` (Frankfurt). Confirmada en ADR-04b.
- Datos de residentes son datos de categoría especial (art. 9 RGPD) — acceso solo con autenticación.
- Los datos de test se generan con Faker.js — **nunca** datos reales de personas.

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

---

## 7. Diseño e implementación UI

**Referencia ADR**: ADR-05

- La iteración visual principal ocurre en **Google Stitch** (incl. vía MCP en el IDE).
- Los **exports** (PNG/WebP/PDF) se versionan en `OUTPUTS/design-exports/` con la convención definida en [ADR-05](DECISIONS/ADR-05-stitch-design-source.md).
- La **tabla de trazabilidad** Stitch ↔ archivos ↔ historias/SPEC está en [OUTPUTS/technical-docs/design-source.md](OUTPUTS/technical-docs/design-source.md).
- Al implementar pantallas, alinear la UI con **SPEC/** (comportamiento, campos, flujos) y usar los exports como referencia visual.
- Si el diseño exige un cambio funcional, actualizar SPEC antes de tratar el diseño como cerrado (G06).

### 7.1 Tailwind CSS — convenciones BEM

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
/* <style scoped> — BEM → Tailwind via @apply */
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
```

- Usar `<style scoped>` en todos los componentes `.vue`.
- Estilos globales (resets, variables CSS, tokens) en `src/assets/styles/`.
- Usar el sistema de diseño definido en `tailwind.config.ts` (colores, tipografía, breakpoints).
- Breakpoints principales: `sm` (640px — móvil grande), `md` (768px — tablet), `lg` (1024px — desktop).
- Target principal: tablet 10" en orientación portrait → diseñar mobile-first.
- No usar clases de Tailwind para lógica de negocio visual (ej: mostrar/ocultar con `hidden` según estado de negocio → usar `v-if`/`v-show`).

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

# API (Express en http://localhost:3000)
cd code/api && npm run dev

# Firebase emulators (Auth: 9099, Firestore: 8080, Emulator UI: 4000) — desde code/
cd code && firebase emulators:start
```

### 8.3 Build y despliegue

```bash
# Build del frontend
cd code/frontend && npm run build

# Build de la API
cd code/api && npm run build

# Deploy completo a Firebase Hosting + Functions (si aplica) — desde code/
cd code && firebase deploy

# Deploy solo Hosting
cd code && firebase deploy --only hosting

# Deploy solo Firestore Rules
cd code && firebase deploy --only firestore:rules
```

### 8.4 Type checking

```bash
cd code/frontend && npm run type-check
cd code/api && npx tsc --noEmit
```

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

*Última actualización: 2026-05-01 — Actualizado al stack Vue 3 + Firebase + DDD frontend + ADR-09 (ui/Atomic Design)*

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
| `infrastructure/mappers/` | Convierte datos Firebase ↔ entidades de dominio | Llamar Firebase directamente |
| `presentation/composables/` | Puente componentes ↔ stores/repos | Contener markup o ser importado por capas inferiores |
| `ui/atoms/` y `ui/molecules/` | UI genérica cross-módulo — puramente presentacional | Importar stores, repos o entidades de dominio |
| `business/{bc}/presentation/components/` | Componentes DE dominio específico | Importar de otros bounded contexts |
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
2. **`<style scoped>`**: clases BEM mapean a Tailwind via `@apply` (simple) o raw CSS (complejo/único).
3. **Excepción documentada**: `<!-- tailwind-exception: razón -->` si es necesario Tailwind en HTML.
4. Estilos globales en `src/assets/styles/` (reset, tokens, tipografía).

### 10.7 TDD — Red → Green → Refactor

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
- Coverage mínimo: 80% en `domain/` y `application/`, 70% en `presentation/composables/`.
