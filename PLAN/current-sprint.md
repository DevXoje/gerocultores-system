# Sprint Activo — Sprint-0 (Replanned)

> **Sprint-0: Scaffold del proyecto + autenticación básica**
> Fechas: 2026-04-01 → 2026-04-14 (2 semanas)
> Próximo sprint: Sprint-1 (Auth completa + App Shell + deploy, 2026-04-15 → 2026-04-25)

> **Estado**: Replanned el 2026-04-01. Sprint anterior (2026-03-29 → 2026-04-04) cerrado con 0 tareas completadas.

---

## Objetivo del Sprint

> **Al cierre del Sprint-0, el repositorio debe tener el scaffold del proyecto funcionando con autenticación básica:**
> frontend Vue 3 + TS corriendo con `npm run dev`, Firebase Auth operativo con pantalla de login,
> API Express con `/health` y middleware `verifyAuth`, Firebase Emulator Suite configurado localmente,
> y un primer deploy funcional a Firebase Hosting en rama `develop`.
> **Nadie debe escribir código de negocio hasta que este sprint esté Done.**

---

## Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Días disponibles** | 14 días (1 Abr → 14 Abr) |
| **Desarrolladores** | 1 (Jose Vilches) |
| **Tareas** | 8 tareas concretas |
| **Tamaño total estimado** | ~6 días/persona de trabajo real |
| **Buffer** | ~8 días para imprevistos y aprendizaje |

---

## Work Items del Sprint-0

| ID | Tarea | US ref | Estimación | Estado | Done criteria |
|----|-------|--------|------------|--------|---------------|
| T-S0-01 | `npm create vite@latest frontend -- --template vue-ts` — scaffold Vue 3 + TS | — | S (~2h) | 🔲 PENDIENTE | `npm run dev` arranca en `localhost:5173` sin errores; `npm run build` completa; estructura `frontend/src/` existe |
| T-S0-02 | Instalar dependencias: `tailwindcss`, `pinia`, `vue-router`, `axios` | — | S (~2h) | 🔲 PENDIENTE | `package.json` refleja las 4 dependencias; Tailwind genera estilos; Pinia y Vue Router importables |
| T-S0-03 | Configurar proyecto Firebase en consola + `frontend/.env.example` y `api/.env.example` | — | S (~2h) | 🔲 PENDIENTE | Proyecto Firebase existe en región EU (`europe-west1` o `europe-west3`); `.env.example` documenta todas las variables `VITE_FIREBASE_*` y `FIREBASE_*`; ningún secreto en el repo |
| T-S0-04 | Implementar US-01 (login con Firebase Auth) — `LoginView.vue` + `useAuthStore` (Pinia) | US-01 | M (~4h) | 🔲 PENDIENTE | Pantalla `/login` renderiza formulario; `signInWithEmailAndPassword` funciona contra emulador; store `auth` mantiene estado de sesión; ruta `/` redirige a `/login` si no autenticado |
| T-S0-05 | Scaffold API Express — `api/src/index.ts`, ruta `GET /health`, middleware `verifyAuth` | — | M (~4h) | 🔲 PENDIENTE | `GET /health` responde `200 { status: "ok" }`; `verifyAuth` rechaza peticiones sin token con `401`; `firebase-admin` inicializado desde variables de entorno |
| T-S0-06 | Configurar Firebase Emulator Suite — Auth + Firestore, `firebase.json`, `firestore.rules` | — | S (~2h) | 🔲 PENDIENTE | `firebase emulators:start` arranca Auth (puerto 9099) y Firestore (puerto 8080) sin errores; `firestore.rules` existe aunque sea permisiva; frontend apunta al emulador en modo dev |
| T-S0-07 | Test plan US-01 — verificar `OUTPUTS/test-plans/test-plan-US-01.md` y completar si falta | US-01 | XS (~1h) | 🔲 PENDIENTE | Archivo `OUTPUTS/test-plans/test-plan-US-01.md` existe y cubre escenarios: login OK, credenciales incorrectas, sesión persistente, logout |
| T-S0-08 | Deploy inicial a Firebase Hosting en rama `develop` | — | M (~4h) | 🔲 PENDIENTE | `firebase deploy --only hosting` ejecuta sin errores; app accesible en URL de Firebase Hosting; `.firebaserc` y `firebase.json` correctamente configurados |

---

## Definición de Done — Sprint-0

Para que el Sprint-0 se considere completado, deben cumplirse **todos** los criterios:

- [ ] `npm run dev` en `code/frontend/` arranca sin errores en `localhost:5173`
- [ ] `npm run build` en `code/frontend/` completa sin errores
- [ ] Pantalla `/login` funcional contra Firebase Auth Emulator
- [ ] Store Pinia `auth` mantiene estado de sesión entre rutas
- [ ] `GET /health` en la API Express responde `200`
- [ ] Middleware `verifyAuth` rechaza peticiones sin token (`401`)
- [ ] `firebase emulators:start` arranca Auth + Firestore sin errores
- [ ] `OUTPUTS/test-plans/test-plan-US-01.md` existe y está completo
- [ ] App desplegada en Firebase Hosting (rama `develop`)
- [ ] `code/frontend/.env.example` y `code/api/.env.example` documentan todas las variables necesarias
- [ ] No hay secretos ni credenciales reales en el repositorio

---

## Bloqueantes e Impedimentos

| # | Descripción | Impacto | Acción |
|---|-------------|---------|--------|
| 1 | Decisión de hosting pendiente (ADR-04b en DRAFT) | Bloquea T-S0-08 parcialmente | Usar Firebase Hosting como opción por defecto; formalizar ADR-04b en Sprint-1 |

---

## Notas del Sprint

- **ADRs relacionados**: ADR-01b (Vue), ADR-02b (Firestore), ADR-03b (Firebase Auth), ADR-04b (hosting).
- **Sprint replanned**: El Sprint-0 original (2026-03-29 → 2026-04-04) venció con 0 tareas completadas. Este replanning prioriza tareas concretas y ejecutables sobre infraestructura abstracta.
- Las tareas T-01 a T-92 del backlog original que no entraron en este Sprint-0 replanned se mueven a estado `replanned` y serán reabsorbidas en sprints posteriores según prioridad.
- Los archivos `.env` reales **no se suben al repositorio**. Solo `.env.example` sin valores.
- T-S0-07 reconoce que el test plan de US-01 puede ya existir; si existe, solo verificar y completar.

---

## Tareas del Sprint-0 original → replanned

Las siguientes tareas del sprint anterior fueron marcadas como `replanned` y absorbidas en el backlog general:

| ID original | Título | Motivo |
|-------------|--------|--------|
| T-01 | Inicializar repositorio Git | Absorbido en T-S0-01 (repo ya existe) |
| T-03 | Configurar Tailwind CSS para Vue | Absorbido en T-S0-02 |
| T-04 | Sistema base de componentes Tailwind/Atomic | Diferido a Sprint-1 |
| T-05 | Configurar ESLint + Prettier + Husky | Diferido a Sprint-1 |
| T-09 | Configurar GitHub Actions CI | Diferido a Sprint-1 |
| T-10 | Estructura monorepo frontend/api/shared | Absorbido en T-S0-01 y T-S0-05 |
| T-11 | Configurar Vue Router 4 | Absorbido en T-S0-04 (parcialmente) |
| T-12 | Configurar Pinia por dominio | Absorbido en T-S0-04 (store auth) |
| T-88 | Evaluar Firebase Hosting vs opciones GCP | Simplificado: usar Firebase Hosting por defecto |
| T-89 | Formalizar elección de hosting | Diferido a Sprint-1 via ADR-04b |
| T-91 | Configurar Firebase Emulator Suite | Absorbido en T-S0-06 |
| T-92 | Integrar CI para Emulator + Rules | Diferido a Sprint-1 |

---

## Próximo Sprint — Preview Sprint-1

**Objetivo**: Auth completa (RBAC + guards), App Shell, ESLint/Husky, CI GitHub Actions, ADR-04b cerrado.

**Tareas que entran en Sprint-1**: T-08, T-13..T-23, T-93, T-05, T-09, T-89, T-92 y las tareas replanned no absorbidas en Sprint-0.

*Última actualización: 2026-04-01 — Sprint-0 replanned (sprint original caducó con 0 tareas completadas)*
