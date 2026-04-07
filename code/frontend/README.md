# gerocultores-system — Frontend

Modulo frontend del sistema de gestion para gerocultores. Permite planificar turnos diarios, gestionar residentes y registrar incidencias. Disenado para uso en tableta y movil, como parte del proyecto academico DAW 2025-2026.

---

## Stack y versiones

| Dependencia | Version | Rol |
|---|---|---|
| Vue | 3.5.32 | Framework principal (Composition API, `<script setup>`) |
| TypeScript | 6.0.2 | Tipado estatico (modo strict) |
| Vite | 8.0.5 | Bundler y servidor de desarrollo |
| Pinia | 3.0.4 | Estado global (contenedores de estado, sin async) |
| Vue Router | 5.0.4 | Enrutamiento SPA |
| Tailwind CSS | 4.2.2 | Utilidades CSS (solo via `@apply`, no clases inline) |
| Firebase | 12.11.0 | Autenticacion (Auth) y base de datos (Firestore) |
| Axios | 1.14.0 | Cliente HTTP para la API REST del backend |
| Vitest | 4.1.2 | Test runner |
| @vue/test-utils | 2.4.6 | Utilidades de prueba para componentes Vue |

---

## Prerrequisitos

- **Node.js** >= 22 (LTS recomendado)
- **npm** >= 10
- **Docker** — para levantar el emulador Firebase (ver seccion [Emulador Firebase](#emulador-firebase))

No se requiere instalar Firebase CLI de forma local; el emulador corre en un contenedor Docker gestionado desde `code/`.

---

## Configuracion inicial

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env.local
   ```

3. Rellenar `.env.local` con los valores del proyecto Firebase:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   En desarrollo, el frontend se conecta automaticamente a los emuladores locales (ver mas abajo). Estos valores pueden ser ficticios para desarrollo local, pero deben ser validos para que el SDK de Firebase inicialice correctamente.

   > **Nunca** commitear `.env.local`. Esta en `.gitignore`.

---

## Comandos

| Comando | Cuando usarlo |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Compilar para produccion (type-check + bundle) |
| `npm run preview` | Previsualizar el bundle de produccion localmente |
| `npm run type-check` | Verificar tipos TypeScript sin compilar |
| `npm run test` | Ejecutar todos los tests una vez |
| `npm run test:watch` | Ejecutar tests en modo watch (durante desarrollo) |
| `npm run test:coverage` | Ejecutar tests y generar informe de cobertura |

---

## Estructura del proyecto

El frontend sigue una arquitectura **DDD por modulo** dentro de `src/business/`. Cada modulo de dominio (p. ej. `auth`, `residents`, `scheduling`) tiene sus propias capas aisladas.

```
src/
├── main.ts                  # Punto de entrada: monta la app, registra plugins
├── App.vue                  # Componente raiz
├── style.css                # Estilos globales (Tailwind base + clases BEM compartidas)
├── assets/                  # Imagenes, iconos estaticos
├── router/                  # Definicion de rutas (Vue Router)
├── services/
│   └── firebase.ts          # Inicializacion de Firebase + conexion a emuladores en DEV
└── business/
    └── {modulo}/
        ├── domain/          # Entidades, value objects, interfaces de repositorio
        ├── application/     # Casos de uso, composables de logica de negocio
        ├── infrastructure/  # Repositorios Firestore, clientes Axios
        └── presentation/
            ├── components/  # Componentes Vue del modulo
            ├── composables/ # Composables de presentacion (acceso al store, logica UI)
            └── stores/      # Stores Pinia (solo estado, sin efectos asincrono directos)
```

**Regla de dependencias**: los componentes (`components/`) solo importan desde `presentation/composables/`. Nunca importan directamente de stores ni de repositorios.

**Alias de ruta**: `@/` apunta a `src/`. Usar siempre imports absolutos:

```ts
import { useScheduleComposable } from '@/business/scheduling/presentation/composables/useSchedule'
```

---

## Convenciones de codigo

### TypeScript

- Modo `strict` activado. Prohibido usar `any`.
- Prohibido dejar variables o parametros sin usar (`noUnusedLocals`, `noUnusedParameters`).
- Todos los archivos Vue usan `<script setup lang="ts">`.

### Componentes y CSS

- **BEM** para todos los nombres de clase HTML:
  ```html
  <div class="resident-card">
    <p class="resident-card__name">...</p>
    <span class="resident-card__badge resident-card__badge--critical">...</span>
  </div>
  ```
- **Tailwind via `@apply` en CSS**, nunca clases inline en el template:
  ```css
  /* correcto */
  .resident-card { @apply flex flex-col gap-2 p-4 rounded-lg; }

  /* incorrecto */
  <!-- <div class="flex flex-col gap-2 p-4 rounded-lg"> -->
  ```
- Un componente por archivo. Nombre en PascalCase.

### Stores (Pinia)

- Solo estado y getters. La logica asincrona va en los casos de uso (`application/`).
- Los composables de presentacion son la unica puerta de entrada al store desde los componentes.

---

## Testing

El objetivo de cobertura es **80% en `domain/` y `application/`**. Las capas de infraestructura y presentacion se prueban de forma selectiva.

```bash
# Ejecutar todos los tests
npm run test

# Modo watch (recomendado durante desarrollo de una feature)
npm run test:watch

# Cobertura (genera informe en coverage/)
npm run test:coverage
```

Los tests de dominio y aplicacion son TDD: se escribe el test antes que la implementacion. Los tests de componentes usan `@vue/test-utils` con `mount` o `shallowMount` segun la necesidad.

---

## Emulador Firebase

En modo desarrollo (`import.meta.env.DEV === true`), `src/services/firebase.ts` conecta automaticamente a los emuladores locales:

| Servicio | Puerto local |
|---|---|
| Firebase Auth | 9099 |
| Firestore | 8080 (mapeado desde 18080 en el host — ver nota) |
| Emulator UI | 4000 |

> **Nota de puerto**: en macOS, Docker Desktop ocupa el 8080 del host. El compose mapea `18080:8080`, por lo que Firestore escucha en `localhost:18080` externamente, pero el contenedor expone `8080` internamente. El frontend se conecta a `localhost:8080` porque el SDK se comunica directamente con el contenedor (bridge de Docker). Si experimentas problemas de conexion, revisar `code/docker-compose.emulators.yml`.

### Levantar los emuladores

Desde el directorio `code/`:

```bash
# Iniciar en segundo plano
docker compose -f docker-compose.emulators.yml up -d

# Reconstruir imagen y arrancar
docker compose -f docker-compose.emulators.yml up --build -d

# Detener
docker compose -f docker-compose.emulators.yml down
```

O usando el script de conveniencia en `code/`:

```bash
./start_emulators.sh           # up -d
./start_emulators.sh --build   # up --build -d
./start_emulators.sh --down    # down
```

Una vez arriba, la Emulator UI esta disponible en `http://localhost:4000`.

---

## Despliegue

```bash
npm run build
```

El comando ejecuta la verificacion de tipos (`vue-tsc -b`) y luego genera el bundle en `dist/`. El contenido de `dist/` es un sitio estatico listo para servir desde cualquier CDN o servidor HTTP.

Para previsualizar el bundle localmente antes de desplegar:

```bash
npm run preview
```
