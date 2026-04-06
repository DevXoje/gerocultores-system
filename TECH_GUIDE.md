# TECH GUIDE — Convenciones técnicas

> El Developer Agent debe leer este archivo antes de generar cualquier código.
> El Reviewer Agent lo usa para validar que el código generado es consistente.
>
> **Stack activo**: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia (frontend) | Express.js + Firebase Admin SDK + Firestore (backend)
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

```
code/
├── firebase.json           # Configuración Firebase (hosting, firestore, emulators)
├── .firebaserc             # Alias del proyecto Firebase
├── frontend/
│   ├── src/
│   │   ├── assets/             # Imágenes estáticas, fuentes
│   │   ├── components/
│   │   │   ├── atoms/          # Botones, inputs, badges (sin lógica de dominio)
│   │   │   ├── molecules/      # Combinaciones de atoms (tarjeta de tarea, etc.)
│   │   │   └── organisms/      # Secciones completas (agenda, formulario incidencia)
│   │   ├── composables/        # Lógica reutilizable (useAuth, useAgenda, etc.)
│   │   ├── router/             # Vue Router 4 — index.ts + guards.ts
│   │   ├── services/           # Axios calls a la Express API
│   │   ├── stores/             # Pinia stores (un store por dominio)
│   │   ├── types/              # Interfaces TypeScript (espejo de SPEC/entities.md)
│   │   ├── views/              # Vistas/páginas (una por ruta principal)
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
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

### 1.3 Convenciones de imports

- Usar imports absolutos con alias `@/` para el código de `code/frontend/src/`.
- Los tipos compartidos se importan desde `@/types/`.
- Los servicios **nunca** se importan directamente en componentes — siempre a través de un store o composable.

```typescript
// ✅ Correcto
import { useAuthStore } from '@/stores/useAuthStore'
import type { Residente } from '@/types/residente.types'

// ❌ Incorrecto
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

Cada dominio tiene su propio store. Estructura estándar:

```typescript
// stores/useAgendaStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tarea } from '@/types/tarea.types'
import { tareaService } from '@/services/tareaService'

export const useAgendaStore = defineStore('agenda', () => {
  // --- State ---
  const tareas = ref<Tarea[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // --- Getters ---
  const tareasPendientes = computed(() =>
    tareas.value.filter(t => t.estado === 'pendiente')
  )

  // --- Actions ---
  async function obtenerTareasHoy() {
    cargando.value = true
    error.value = null
    try {
      tareas.value = await tareaService.getTareasHoy()
    } catch (e) {
      error.value = 'Error al cargar las tareas'
    } finally {
      cargando.value = false
    }
  }

  return { tareas, cargando, error, tareasPendientes, obtenerTareasHoy }
})
```

### 2.2 Stores disponibles

| Store | Dominio | Responsabilidad |
|-------|---------|----------------|
| `useAuthStore` | Autenticación | Usuario actual, token, rol, login/logout |
| `useAgendaStore` | Agenda | Tareas del día, actualizaciones de estado |
| `useResidenteStore` | Residentes | Fichas, búsqueda, CRUD (coordinador) |
| `useIncidenciaStore` | Incidencias | Registro, historial, filtros |
| `useNotificacionStore` | Notificaciones | Alertas in-app, marcado como leído |

### 2.3 Reglas de estado

- El estado de la UI (modal abierto, tab activo) **no** va en Pinia — va en `ref` local del componente.
- El estado de carga (`cargando`) y error (`error`) siempre se incluyen en el store.
- Las acciones del store son siempre `async` y nunca propagan errores — los capturan y los guardan en `error`.

---

## 3. API y comunicación

**Referencia ADR**: ADR-02b, ADR-03b

### 3.1 Cliente HTTP (Axios)

Un único cliente Axios configurado con el token Firebase Auth:

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

### 3.2 Estructura de services

Los services encapsulan las llamadas HTTP. **Solo** los stores los llaman directamente.

```typescript
// services/tareaService.ts
import apiClient from './apiClient'
import type { Tarea, ActualizarTareaDto } from '@/types/tarea.types'

export const tareaService = {
  async getTareasHoy(): Promise<Tarea[]> {
    const { data } = await apiClient.get<Tarea[]>('/tareas/hoy')
    return data
  },

  async actualizarEstado(id: string, dto: ActualizarTareaDto): Promise<Tarea> {
    const { data } = await apiClient.patch<Tarea>(`/tareas/${id}`, dto)
    return data
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

### 4.1 Frameworks

| Nivel | Framework | Uso |
|-------|-----------|-----|
| Unit | Vitest + Vue Test Utils | Composables, stores, services, componentes |
| E2E | Playwright | Flujos críticos de usuario (login, agenda, incidencias) |
| Manual | Guías en `OUTPUTS/test-plans/` | Casos de uso completos, UX táctil |

### 4.2 Convenciones de nomenclatura

- Tests unitarios: `nombreDelArtefacto.spec.ts` junto al archivo que testea.
- Tests E2E: `tests/e2e/nombreDelFlujo.spec.ts`.
- Describe por comportamiento: `describe('useAuthStore', () => { it('should logout when token expires', ...) })`.

### 4.3 Coverage mínimo (MVP)

- Composables: ≥ 80%
- Stores (lógica de acciones): ≥ 70%
- Services: mocking de Axios, todos los paths (200, 4xx, 5xx)
- Componentes: smoke test + props principales

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

---

## 6. Anti-patrones prohibidos

| Anti-patrón | Alternativa |
|-------------|-------------|
| Lógica de negocio en componentes Vue | Separar en composables o stores |
| Llamadas directas a Firestore desde el frontend | Usar la Express API (excepto listeners tiempo real explícitamente decididos) |
| Hardcodear IDs, rutas o claves de configuración | Usar `import.meta.env.VITE_*` o `process.env.*` |
| Fetch / Axios sin manejo de errores | Envolver en try/catch; stores capturan errores |
| Componentes de más de 200 líneas | Dividir en componentes más pequeños (Atomic Design) |
| Importar services directamente en componentes | Siempre a través de un store o composable |
| Usar `v-html` con datos del servidor | Riesgo de XSS; escapar o sanitizar siempre |
| Queries Firestore sin índices en producción | Definir índices en `firestore.indexes.json` |
| Token Firebase en localStorage | El SDK lo gestiona en memoria automáticamente |
| Custom Claims actualizados sin forzar refresh del token | Forzar con `user.getIdToken(true)` después de cambiar claims |

---

## 7. Diseño e implementación UI

**Referencia ADR**: ADR-05

- La iteración visual principal ocurre en **Google Stitch** (incl. vía MCP en el IDE).
- Los **exports** (PNG/WebP/PDF) se versionan en `OUTPUTS/design-exports/` con la convención definida en [ADR-05](DECISIONS/ADR-05-stitch-design-source.md).
- La **tabla de trazabilidad** Stitch ↔ archivos ↔ historias/SPEC está en [OUTPUTS/technical-docs/design-source.md](OUTPUTS/technical-docs/design-source.md).
- Al implementar pantallas, alinear la UI con **SPEC/** (comportamiento, campos, flujos) y usar los exports como referencia visual.
- Si el diseño exige un cambio funcional, actualizar SPEC antes de tratar el diseño como cerrado (G06).

### 7.1 Tailwind CSS — convenciones

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

```vue
<script setup lang="ts">
// 1. Imports de Vue y librerías
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. Imports de stores y composables
import { useAuthStore } from '@/stores/useAuthStore'
import { useAgenda } from '@/composables/useAgenda'

// 3. Imports de tipos
import type { Tarea } from '@/types/tarea.types'

// 4. Props y emits
interface Props {
  tareaId: string
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), { readonly: false })
const emit = defineEmits<{ (e: 'actualizada', tarea: Tarea): void }>()

// 5. Store y composables
const authStore = useAuthStore()
const { tareas, obtenerTareasHoy } = useAgenda()

// 6. State local
const cargando = ref(false)

// 7. Computed
const esEditable = computed(() => !props.readonly && authStore.esCoordinador)

// 8. Lifecycle
onMounted(obtenerTareasHoy)
</script>

<template>
  <!-- Template limpio, sin lógica compleja -->
</template>
```

### 9.2 Reglas de la Composition API

- Usar siempre `<script setup lang="ts">`.
- No usar Options API ni la sintaxis `export default {}`.
- Los composables se llaman **al nivel superior** del `<script setup>` (no dentro de condicionales o loops).
- `v-for` siempre requiere `:key` con un identificador único (nunca el índice del array).
- `v-if` y `v-for` **no** van en el mismo elemento — usar `<template>` como wrapper.

### 9.3 TypeScript estricto

- `strict: true` activado en `tsconfig.json`.
- No usar `any` — si el tipo es desconocido, usar `unknown` y narrowing.
- Los tipos de las entidades de dominio están en `src/types/` y deben coincidir exactamente con `SPEC/entities.md` (G04).

---

*Última actualización: 2026-04-01 — Actualizado al stack Vue 3 + Firebase (ADR-01b, ADR-02b, ADR-03b)*
