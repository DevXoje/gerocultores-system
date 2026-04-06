# Gerocultores System

> **Aplicación web para gerocultores**: agenda diaria, gestión de residentes y registro de incidencias.
> Stack: Vue 3 + TypeScript (frontend en `code/frontend`), Express + Firebase Admin (API en `code/api`), Firebase Hosting + Firestore.
> Proyecto académico DAW — desarrollado de forma individual.

---

## Estado del proyecto

| Componente                | Estado                        |
|---------------------------|-------------------------------|
| Estructura y scaffolding  | ✅ Bootstrap completado        |
| Requisitos (SPEC/)        | 🔲 Pendiente — entrevista Fase 3 |
| Backlog y sprints (PLAN/) | 🔲 Pendiente — Fase 4          |
| Decisiones técnicas (ADRs)| 🔲 Pendiente — Fase 5          |
| Código de la aplicación   | 🔲 Pendiente — stack por definir |
| Tests y cobertura         | 🔲 Pendiente                   |
| Documentación académica   | 🔲 Pendiente                   |

**Fecha de inicio**: 2026-03-28
**Entrega académica (deadline)**: **2026-05-18**

---

## Cambios recientes

### Código movido a `code/` (2026-04-04 · commit `a824948`)

El código de la aplicación fue reorganizado dentro de la carpeta `code/`:

```
code/
├── frontend/   ← Vue 3 + Vite + Tailwind CSS
└── api/        ← Express + Firebase Admin SDK
```

**Motivo**: separar el código de la aplicación del scaffolding de documentación y agentes (SPEC/, DECISIONS/, PLAN/, AGENTS/, etc.), facilitar el control de dependencias por proyecto y alinear con la configuración de Firebase Hosting (`"public": "frontend/dist"` en `code/firebase.json`).

> Si ves referencias a `frontend/` o `api/` sin el prefijo `code/` en scripts o documentación anteriores, considera obsoletas esas rutas.

---

## Prerrequisitos

Antes de empezar, asegúrate de tener instalado:

| Herramienta | Versión mínima | Instalación |
|-------------|---------------|-------------|
| **Node.js** | >= 16 | https://nodejs.org |
| **npm** | >= 8 (incluido con Node) | — |
| **Git** | cualquiera reciente | https://git-scm.com |
| **Firebase CLI** | >= 13 | `npm install -g firebase-tools` |
| **pnpm** | opcional | `npm install -g pnpm` |

> **Firebase CLI**: tras instalarla, autentica con `firebase login`.

---

## Setup local (entorno de desarrollo)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd gerocultores-system
```

### 2. Configurar variables de entorno

El repositorio incluye `.env.example` en la raíz con todas las variables necesarias.

**Frontend** — copia y rellena en `code/frontend/.env.local`:

```bash
cp .env.example code/frontend/.env.local
```

Variables a rellenar en `code/frontend/.env.local`:

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | API key del proyecto Firebase (consola Firebase → Configuración del proyecto) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain, p. ej. `tu-proyecto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage, p. ej. `tu-proyecto.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_API_URL` | URL base de la API local, por defecto `http://localhost:3000` |

**API** — copia y rellena en `code/api/.env`:

```bash
cp .env.example code/api/.env
```

Variables a rellenar en `code/api/.env`:

| Variable | Descripción |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase (igual que el frontend) |
| `FIREBASE_PRIVATE_KEY` | Clave privada de la service account (incluye `-----BEGIN...`) |
| `FIREBASE_CLIENT_EMAIL` | Email de la service account |
| `PORT` | Puerto en que escucha Express; por defecto `3000` |
| `CORS_ORIGIN` | Origen CORS permitido; por defecto `http://localhost:5173` |
| `NODE_ENV` | `development` en local, `production` en despliegue |

> **Service account**: descárgala desde la consola Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada.

### 3. Instalar dependencias

```bash
# Frontend
cd code/frontend && npm install

# API (vuelve a la raíz primero si es necesario)
cd ../../code/api && npm install
```

O desde la raíz, si prefieres:

```bash
(cd code/frontend && npm install) && (cd code/api && npm install)
```

### 4. Iniciar Firebase Emulator Suite

El emulador local simula Auth, Firestore y Hosting sin necesidad de conectarse a Firebase en la nube.

> **Importante**: los archivos `firebase.json` y `.firebaserc` están ahora en `code/`. Los comandos `firebase` deben ejecutarse desde ese directorio (o usar `--config` desde la raíz).

```bash
# Desde code/
cd code
firebase emulators:start --import emulators/ --export-on-exit
```

Puertos por defecto (configurados en `firebase.json`):

| Servicio | Puerto |
|----------|--------|
| Auth | 9099 |
| Firestore | 8080 |
| Hosting | 5000 |
| Emulator UI | 4000 |

> La **Emulator UI** en http://localhost:4000 permite inspeccionar datos de Firestore, usuarios de Auth, logs y más.

### 5. Arrancar el frontend (Vite dev server)

Abre una terminal nueva:

```bash
cd code/frontend
npm run dev
```

La app estará disponible en http://localhost:5173 (Vite).

> Si `VITE_API_URL` no está definida, el frontend no podrá llamar a la API. Asegúrate de que `code/frontend/.env.local` contiene `VITE_API_URL=http://localhost:3000`.

### 6. Arrancar la API (Express)

Abre otra terminal nueva:

```bash
cd code/api
npm run dev
```

La API Express escuchará en el puerto definido por `PORT` (por defecto `3000`).

> En modo `development`, la API conecta al emulador de Firestore en `localhost:8080`. Asegúrate de que el emulador esté corriendo **antes** de arrancar la API.

---

## Comandos útiles

### Frontend

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build
# → genera code/frontend/dist/ (el directorio que Firebase Hosting publica)

# Vista previa del build
npm run preview

# Type check sin emitir ficheros
npm run type-check

# Tests con Vitest
npm test
# o modo watch:
npm run test:watch

# Cobertura de tests
npm run test:coverage
```

### API

```bash
# Servidor de desarrollo (tsx watch — recarga en caliente)
npm run dev

# Compilar TypeScript
npm run build

# Arrancar desde el build compilado
npm start

# Type check
npm run type-check

# Tests (placeholder — pendiente configurar runner)
npm test
# → actualmente muestra "Error: no tests yet"; se actualizará cuando se configure Jest/Vitest en la API
```

### Firebase

> **Nota**: `firebase.json` y `.firebaserc` están en `code/`. Todos los comandos `firebase` deben ejecutarse desde `code/` (o usar `--config code/firebase.json` desde la raíz).

```bash
# Iniciar emuladores (desde code/)
cd code && firebase emulators:start --import emulators/ --export-on-exit

# Deploy a Firebase Hosting (requiere proyecto configurado en code/.firebaserc)
cd code && firebase deploy --only hosting
# IMPORTANTE: esto despliega frontend/dist/ — ejecuta `npm run build` en code/frontend antes

# Deploy completo (hosting + rules + etc.)
cd code && firebase deploy
```

---

## Build y deploy a Firebase Hosting

1. **Build del frontend**:
   ```bash
   cd code/frontend
   npm run build
   ```
   Esto genera `code/frontend/dist/` (configurado en `code/firebase.json` como `"public": "frontend/dist"`).

2. **Deploy a Hosting**:
   ```bash
   # Desde code/
   cd code && firebase deploy --only hosting
   ```
   > Requiere tener el proyecto Firebase configurado en `code/.firebaserc` y haber ejecutado `firebase login`.

3. **Verificar**:
   La URL de tu app aparecerá al final del output de `firebase deploy`.

---

## Tests

### Frontend

El frontend usa **Vitest** como test runner (configurado en `vite.config.ts`):

```bash
cd code/frontend
npm test               # ejecución única
npm run test:watch     # modo watch
npm run test:coverage  # cobertura
```

### API

Los tests de la API están **pendientes de configurar**. El comando `npm test` en `code/api` actualmente devuelve un error placeholder.

```bash
cd code/api
npm test
# → "Error: no tests yet" — pendiente añadir Jest o Vitest
```

> Una vez configurado, el comando permanecerá `npm test` para ser coherente con el frontend. Consulta `OUTPUTS/test-plans/` para los planes de test por user story.

---

## Flujo de trabajo y convenciones

### Conventional Commits

Todos los commits **deben** seguir el formato:

```
<tipo>(<scope>): <descripción corta>

[cuerpo opcional]

[pie de página opcional — referencia a US-XX]
```

| Tipo       | Cuándo usarlo                                     |
|------------|---------------------------------------------------|
| `feat`     | Nueva funcionalidad de la aplicación              |
| `fix`      | Corrección de bug                                 |
| `docs`     | Solo cambios de documentación                     |
| `chore`    | Tareas de mantenimiento (dependencias, config)    |
| `test`     | Añadir o modificar tests                          |
| `refactor` | Reestructuración sin cambio de comportamiento     |
| `style`    | Formato, espaciado (sin cambio de lógica)         |
| `perf`     | Mejoras de rendimiento                            |

**Ejemplos correctos:**

```bash
git commit -m "feat(US-01): añadir agenda diaria para gerocultores"
git commit -m "fix(US-03): corregir ordenación de incidencias por fecha"
git commit -m "docs: actualizar instrucciones de entorno local en README"
git commit -m "chore: actualizar dependencias de code/frontend"
```

> **Regla G08**: Todo commit de tipo `feat` **debe** incluir la referencia `US-XX` en el scope.
> Consulta el checklist completo en [`AGENTS.md`](AGENTS.md).

---

### Branching

| Tipo de rama       | Formato              | Ejemplo                      |
|--------------------|----------------------|------------------------------|
| Nueva funcionalidad| `feature/US-XX`      | `feature/US-01-agenda-diaria`|
| Corrección de bug  | `fix/US-XX`          | `fix/US-03-incidencias`      |
| Documentación      | `docs/<descripcion>` | `docs/readme-humano`         |
| Mantenimiento      | `chore/<descripcion>`| `chore/setup-entorno`        |

**Reglas:**
- `main` es la rama de entrega. **No se hace push directo a `main`**.
- Toda funcionalidad nueva parte de `main` (o `develop` si se usa) y se integra vía Pull Request.
- Los nombres de rama deben incluir el número de user story cuando aplique.

---

### Proceso de Pull Request (PR)

1. Crea una rama con el nombre adecuado desde `main`.
2. Implementa los cambios siguiendo las convenciones de [`TECH_GUIDE.md`](TECH_GUIDE.md) y los ADRs vigentes.
3. Asegúrate de que todos los commits referencian la US correspondiente.
4. Abre un PR hacia `main` con título descriptivo.
5. El PR **debe** pasar el checklist de revisión:

**Checklist resumido (humano):**

- [ ] El título o algún commit referencia una `US-XX` válida de `SPEC/user-stories.md`
- [ ] Existe un plan de tests en `OUTPUTS/test-plans/test-plan-US-XX.md`
- [ ] No hay credenciales, API keys ni datos sensibles en el código
- [ ] Los nombres de campo en el código coinciden con los de `SPEC/entities.md`
- [ ] Toda nueva funcionalidad es trazable a una entrada en `SPEC/`
- [ ] Si se tomó una decisión técnica, existe un ADR en `DECISIONS/`

> El checklist completo machine-readable (para GGA/agentes) está en [`AGENTS.md`](AGENTS.md).

---

## Troubleshooting

### El emulador no arranca

- Verifica que el Firebase CLI está actualizado: `firebase --version`
- Comprueba que el puerto no está ocupado: `lsof -i :8080` (Firestore), `lsof -i :9099` (Auth)
- Revisa los logs en la terminal donde corre `firebase emulators:start`
- La Emulator UI en http://localhost:4000 muestra errores de inicio

### La API no conecta a Firestore

- Asegúrate de que el emulador está corriendo **antes** de arrancar la API
- Verifica que `FIREBASE_PROJECT_ID` en `code/api/.env` coincide con el del emulador (`code/.firebaserc`)
- Inspecciona los logs de la API: `cd code/api && npm run dev` muestra stdout/stderr

### El frontend no puede llamar a la API

- Verifica que `VITE_API_URL` en `code/frontend/.env.local` apunta al puerto correcto (por defecto `http://localhost:3000`)
- Comprueba que `CORS_ORIGIN` en `code/api/.env` incluye `http://localhost:5173`
- Inspecciona la pestaña Red del navegador (DevTools) para ver el error HTTP

### Cambio en `.env` no se refleja

- Vite carga las variables de entorno en tiempo de build. Reinicia el servidor dev (`Ctrl+C` y `npm run dev`) tras modificar `code/frontend/.env.local`.
- La API con `tsx watch` recarga automáticamente, pero cambia en `.env` requieren reinicio manual.

---

## Estructura del proyecto

```
gerocultores-system/
├── README.md               ← este archivo (para humanos, en español)
├── AGENTS.md               ← instrucciones para agentes IA (en inglés, no editar)
├── PROJECT_BRIEF.md        ← visión, alcance y posicionamiento del producto
├── TECH_GUIDE.md           ← convenciones técnicas y de código
├── .env.example            ← plantilla de variables de entorno
├── code/
│   ├── firebase.json       ← configuración Firebase (hosting, emuladores)
│   ├── .firebaserc         ← alias del proyecto Firebase
│   ├── frontend/           ← Vue 3 + Vite + Tailwind CSS + TypeScript
│   │   ├── src/            ← código fuente Vue
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/                ← Express + Firebase Admin SDK + TypeScript
│       ├── src/            ← código fuente Express
│       └── package.json
├── SPEC/                   ← fuente de verdad de requisitos
│   ├── user-stories.md
│   ├── entities.md
│   ├── requirements.md
│   └── constraints.md
├── DECISIONS/              ← ADRs y decisiones técnicas
├── PLAN/                   ← backlog y sprints
│   ├── backlog.md
│   └── current-sprint.md
├── OUTPUTS/                ← artefactos generados
│   ├── test-plans/         ← planes de test por US
│   └── academic/           ← secciones de la memoria DAW
├── PROMPTS/                ← prompts reutilizables por agente
├── AGENTS/                 ← definición detallada del modelo agéntico
│   ├── roles.md
│   ├── guardrails.md
│   └── contracts.md
├── WORKFLOWS/              ← pipelines de ejecución de agentes
└── LOGS/                   ← trazabilidad de decisiones y cambios
```

---

## Roles y agentes

Este proyecto usa un sistema de agentes de IA con responsabilidades separadas:

| Agente      | Qué hace                                           |
|-------------|----------------------------------------------------|
| COLLECTOR   | Extrae requisitos mediante entrevista estructurada |
| ARCHITECT   | Documenta decisiones técnicas como ADRs            |
| PLANNER     | Organiza el backlog y los sprints desde SPEC/      |
| DEVELOPER   | Implementa funcionalidades siguiendo SPEC/ y ADRs  |
| REVIEWER    | Valida el código contra SPEC/ y las guardrails     |
| TESTER      | Genera planes de test desde las user stories       |
| WRITER      | Genera la memoria académica y docs técnicos        |

> Definición completa de cada rol: [`AGENTS/roles.md`](AGENTS/roles.md).
> [`AGENTS.md`](AGENTS.md) es **exclusivamente para consumo de agentes** y está en inglés.

---

## Seguridad y privacidad

> **Importante**: Esta aplicación maneja datos personales de residentes (PII).

- **Nunca** almacenar datos de residentes en `localStorage` o `sessionStorage`.
- Toda PII debe pasar por la capa de autenticación.
- No hardcodear credenciales, API keys ni URLs de producción en el código fuente.
- Usar variables de entorno para todos los valores sensibles (ver `.env.example`).
- Las políticas de autenticación, cifrado y cumplimiento RGPD se definirán mediante **ADRs** en `DECISIONS/`.

---

## Cómo contribuir

1. Haz fork del repositorio (si es externo) o crea una rama desde `main`.
2. Asegúrate de que la funcionalidad tiene una **user story** en `SPEC/user-stories.md`. Si no existe, créala primero.
3. Implementa siguiendo las convenciones de [`TECH_GUIDE.md`](TECH_GUIDE.md) y los ADRs vigentes.
4. Haz commits con el formato Conventional Commits (ver sección anterior).
5. Abre un Pull Request y completa el checklist de revisión.

**¿Tienes una idea o encontraste un bug?**
- Abre una issue en el repositorio.
- Si es una nueva funcionalidad, añade la user story en `SPEC/user-stories.md`.
- Si es una decisión técnica, el ARCHITECT creará un ADR en `DECISIONS/`.

---

## Links útiles

| Recurso | Ruta |
|---------|------|
| Guía técnica y convenciones de código | [`TECH_GUIDE.md`](TECH_GUIDE.md) |
| Visión y alcance del producto | [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) |
| Sprint actual | [`PLAN/current-sprint.md`](PLAN/current-sprint.md) |
| Planes de test por user story | [`OUTPUTS/test-plans/`](OUTPUTS/test-plans/) |
| Guardrails del sistema agéntico | [`AGENTS/guardrails.md`](AGENTS/guardrails.md) |
| Backlog del proyecto | [`PLAN/backlog.md`](PLAN/backlog.md) |

---

## FAQ

**¿Dónde están los ADRs (decisiones de arquitectura)?**
En `DECISIONS/`. Consulta `DECISIONS/README.md` para el índice.

**¿Dónde están las tareas y el backlog?**
En `PLAN/backlog.md` y `PLAN/current-sprint.md`.

**¿Dónde están las user stories?**
En `SPEC/user-stories.md`.

**¿Cómo ejecuto los agentes de IA?**
Los agentes se invocan mediante los prompts en `PROMPTS/`. Consulta `AGENTS.md` para ver qué agente usar en cada situación y `WORKFLOWS/` para los pipelines completos.

**¿Puedo añadir funcionalidades que no están en SPEC/?**
No directamente. Primero añade la user story en `SPEC/user-stories.md`, luego implementa. Guardrails G01 y G06 lo impiden.

**¿Dónde reporto una incidencia o propongo mejora?**
Abre una issue en el repositorio o añade la user story en `SPEC/user-stories.md`.

---

## Licencia y contacto

**Autor**: MacXoje — [dawxoje@gmail.com](mailto:dawxoje@gmail.com)
**Tipo**: Proyecto académico individual (DAW)
**Licencia**: Por definir — pendiente de ADR de licencia

---

*Última actualización: 2026-04-04*
