# Backlog Kanban — gerocultores-system

> Fuente de verdad del Planner. Actualizado: 2026-04-01.
> Stack: Vue 3 + Vite + TS + Tailwind + Pinia + Firebase Auth/Firestore EU + Express API wrapper + Firebase Hosting
> Deadline: 2026-05-18 | Sprints: Sprint-0 (scaffold + auth básica) → Sprint-6 (entrega final)
> **Sprint-0 replanned** 2026-04-01: sprint original (→ 2026-04-04) venció con 0 tareas. Nuevo período: 2026-04-01 → 2026-04-14.

<!-- sdd/switch-stack-to-vue-firebase TASKS delta -->

---

## Leyenda

| Campo | Valores |
|-------|---------|
| **Tamaño** | XS (~1h), S (~2h), M (~4h), L (~8h), XL (~2d) |
| **Prioridad** | P1 = crítico/bloqueante, P2 = importante, P3 = deseable |
| **Estado** | 🔲 Backlog · ✅ Ready · 🔄 In Progress · 👁 Review · ✔️ Done |

---

## Columnas Kanban

### ✔️ DONE

_Nada completado todavía._

---

### 🔄 IN PROGRESS

_Nada en progreso activo._

---

### 👁 REVIEW

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-REVERT-CHECK | — | Validar revert 114fd5d y merging de guardrails | Verificar completitud de archivos restaurados por revert 61c81a6; revisar y mergear manualmente `guardrails/patch-1` después de revisión; eliminar backup branch `recovery/before-revert-20260329204343` una vez confirmado. Ver `RECOVERY/revert-114fd5d-report.md`. | S | P1 | Sprint-0 |

---

### ✅ READY — Sprint-0 Replanned (2026-04-01 → 2026-04-14)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-S0-01 | — | Scaffold Vue 3 + TS con Vite | `npm create vite@latest frontend -- --template vue-ts`; validar HMR y estructura base | S | P1 | Sprint-0 |
| T-S0-02 | — | Instalar dependencias base | `tailwindcss`, `pinia`, `vue-router`, `axios` — configurar Tailwind con content paths Vue | S | P1 | Sprint-0 |
| T-S0-03 | — | Configurar Firebase project en consola + `.env.example` | Proyecto Firebase en región EU; `frontend/.env.example` y `api/.env.example` con todas las variables `VITE_FIREBASE_*` y `FIREBASE_*` | S | P1 | Sprint-0 |
| T-S0-04 | US-01 | Implementar login con Firebase Auth — LoginView + useAuthStore | `LoginView.vue` con formulario, `useAuthStore` Pinia, rutas `/login` y `/` con guard básico | M | P1 | Sprint-0 |
| T-S0-05 | — | Scaffold API Express — `/health` + middleware `verifyAuth` | `api/src/index.ts` con Express + `firebase-admin`; `GET /health`; middleware `verifyAuth` que valida token | M | P1 | Sprint-0 |
| T-S0-06 | — | Configurar Firebase Emulator Suite | `firebase.json`, `firestore.rules` base, `firebase emulators:start` funcional; frontend apunta al emulador en modo dev | S | P1 | Sprint-0 |
| T-S0-07 | US-01 | Test plan US-01 — verificar/completar `test-plan-US-01.md` | Verificar que `OUTPUTS/test-plans/test-plan-US-01.md` existe y cubre: login OK, credenciales incorrectas, sesión persistente, logout | XS | P1 | Sprint-0 |
| T-S0-08 | — | Deploy inicial a Firebase Hosting (rama develop) | `firebase deploy --only hosting`; app accesible en URL Firebase Hosting; `.firebaserc` configurado | M | P1 | Sprint-0 |

---

### ⏸ REPLANNED — Sprint-0 original (tareas del sprint anterior, caducado 2026-04-04)

> Estas tareas del Sprint-0 original (2026-03-29 → 2026-04-04) se archivan como replanned.
> Las absorbidas por el nuevo Sprint-0 están marcadas. Las restantes entran en Sprint-1.

| ID | US | Título | Estado | Absorbe en |
|----|----|--------|--------|------------|
| T-01 | — | Inicializar repositorio Git | Absorbida | T-S0-01 (repo ya existe) |
| T-02 | — | Scaffold Vite + Vue 3 + TS | Absorbida | T-S0-01 |
| T-03 | — | Configurar Tailwind CSS para Vue | Absorbida | T-S0-02 |
| T-04 | — | Sistema base de componentes Tailwind/Atomic | Diferida | Sprint-1 |
| T-05 | — | Configurar ESLint + Prettier + Husky | Diferida | Sprint-1 |
| T-06 | — | Crear proyecto Firebase en región EU | Absorbida | T-S0-03 |
| T-07 | — | Configurar Firebase client SDK | Absorbida | T-S0-03 |
| T-09 | — | Configurar GitHub Actions CI | Diferida | Sprint-1 |
| T-10 | — | Estructura monorepo frontend/api/shared | Absorbida | T-S0-01 + T-S0-05 |
| T-11 | — | Configurar Vue Router 4 | Absorbida | T-S0-04 (parcialmente) |
| T-12 | — | Configurar Pinia por dominio | Absorbida | T-S0-04 (store auth) |
| T-88 | — | Evaluar Firebase Hosting vs opciones GCP | Simplificada | Firebase Hosting por defecto; ADR-04b en Sprint-1 |
| T-89 | — | Formalizar elección de hosting | Diferida | Sprint-1 via ADR-04b |
| T-90 | — | Scaffold Express API wrapper | Absorbida | T-S0-05 |
| T-91 | — | Configurar Firebase Emulator Suite | Absorbida | T-S0-06 |
| T-92 | — | Integrar CI para Emulator + Rules | Diferida | Sprint-1 |

---

### 🔲 BACKLOG

#### Sprint-1: Auth completa + App Shell + CI + deploy (2026-04-15 → 2026-04-25)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-04 | — | Sistema base de componentes Tailwind/Atomic | Diferida de Sprint-0: atoms/molecules base accesibles en `frontend/src/components/` | S | P1 | Sprint-1 |
| T-05 | — | Configurar ESLint + Prettier + Husky | Diferida de Sprint-0: reglas para frontend + api + hooks pre-commit | S | P1 | Sprint-1 |
| T-09 | — | Configurar GitHub Actions CI | Diferida de Sprint-0: lint + type-check + build + tests frontend/api y reglas | M | P1 | Sprint-1 |
| T-89 | — | Formalizar elección de hosting en ADR-04b | Diferida de Sprint-0: documentar la opción elegida en ADR-04b | XS | P1 | Sprint-1 |
| T-92 | — | Integrar CI para Emulator + Rules | Diferida de Sprint-0: job CI para levantar emuladores y ejecutar tests de reglas | M | P1 | Sprint-1 |
| T-08 | — | Configurar deploy listo en Firebase Hosting | Mueve el T-08 original: preparar deploy completo según ADR-04b | M | P1 | Sprint-1 |
| T-13 | US-01 | Pantalla de Login en Vue (completa) | `LoginView.vue` completa con validación, feedback accesible y tests | M | P1 | Sprint-1 |
| T-14 | US-01 | Integrar Firebase Auth (email/pass) completo | `signInWithEmailAndPassword`, manejo de token, persistencia Pinia | M | P1 | Sprint-1 |
| T-15 | US-01 | Logout y limpieza de sesión | `signOut`, limpieza Pinia, revocación de token | S | P1 | Sprint-1 |
| T-16 | US-01 | Persistencia de sesión con Pinia | `useAuthStore` + listeners Firebase `onAuthStateChanged` | M | P1 | Sprint-1 |
| T-17 | US-02 | Colección `usuarios` + custom claims | Bootstrap Firestore + claims de rol en Firebase Auth | M | P1 | Sprint-1 |
| T-18 | US-02 | Reglas Firestore + middleware Express RBAC | Defensa en profundidad Auth + Rules + Express | L | P1 | Sprint-1 |
| T-19 | US-02 | Guards de navegación Vue Router | Guards 401/403 basados en claims | M | P1 | Sprint-1 |
| T-20 | US-02 | Manejo de acceso no autorizado (403) | `UnauthorizedView.vue` y respuesta API consistente | S | P2 | Sprint-1 |
| T-21 | — | Layout principal (AppShell) | Vue + navegación responsive + rol visible | M | P1 | Sprint-1 |
| T-22 | — | Tema de diseño y tokens Tailwind | Paleta, tipografía y componentes mobile/tablet-first | S | P2 | Sprint-1 |
| T-23 | — | Página 404 Not Found | Adaptada a Vue Router | XS | P3 | Sprint-1 |
| T-93 | — | Diseñar mapeo Supabase → Firestore | Equivalencias tablas/colecciones, seeds demo e impacto sobre IDs y auditoría | M | P1 | Sprint-1 |

#### Sprint-2: Agenda diaria + actualización de tareas (2026-04-12 → 2026-04-18)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-24 | US-03 | Modelo Firestore `tareas` + seeds | Reemplaza el T-24 original SQL por colección/subcolección Firestore y datos demo consistentes con SPEC | M | P1 | Sprint-2 |
| T-25 | US-03 | Firestore Rules para `tareas` | Reemplaza el T-25 original de RLS por reglas owner/coordinador con tests negativos y positivos | L | P1 | Sprint-2 |
| T-26 | US-03 | Store `agenda` + servicio `/api/tareas` | Reemplaza el T-26 original hook Query por Pinia + Axios + caché simple | M | P1 | Sprint-2 |
| T-27 | US-03 | Vista Agenda Diaria | Actualiza el T-27 original con `AgendaDiariaView.vue` y empty/loading states | M | P1 | Sprint-2 |
| T-28 | US-03 | Componente TaskCard | Mantiene el T-28 original adaptado a Vue + touch targets 44px | M | P1 | Sprint-2 |
| T-29 | US-03 | Highlight de tareas vencidas | Mantiene el T-29 original con estados visuales accesibles | S | P1 | Sprint-2 |
| T-30 | US-03 | Estrategia de refresh de agenda | Reemplaza el T-30 original de Supabase Realtime por polling/refetch controlado desde Express | S | P2 | Sprint-2 |
| T-31 | US-04 | Sheet para actualizar estado de tarea | Mantiene el T-31 original adaptado a Vue y flujo táctil | M | P1 | Sprint-2 |
| T-32 | US-04 | Acción `updateTareaEstado` con optimistic UI | Reemplaza el T-32 original Mutation por store/action Pinia + PATCH API | M | P1 | Sprint-2 |
| T-33 | US-04 | Campo de notas libre en tarea | Mantiene el T-33 original con persistencia en Firestore vía API | S | P1 | Sprint-2 |
| T-34 | US-04 | Auditoría `actualizadoEn/completadaEn` | Reemplaza el T-34 original por timestamps de servidor y trazabilidad de usuario | M | P1 | Sprint-2 |
| T-35 | US-12 | Vista Agenda Semanal básica | Mantiene el T-35 original usando Vue Router + store compartido | L | P3 | Sprint-2 |

#### Sprint-3: Residentes + Incidencias + administración básica (2026-04-19 → 2026-04-25)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-36 | US-05 | Modelo Firestore `residentes` + seeds | Reemplaza el T-36 original SQL por colección `residentes` y payload RGPD-friendly | M | P1 | Sprint-3 |
| T-37 | US-05 | Reglas para residentes y asignaciones | Reemplaza el T-37 original por control de acceso con `ResidenteAsignacion`/array asignado | L | P1 | Sprint-3 |
| T-38 | US-05 | Store `residente` + endpoint detalle | Reemplaza el T-38 original hook por Pinia + `GET /api/residentes/:id` | S | P1 | Sprint-3 |
| T-39 | US-05 | Página Ficha de Residente | Mantiene el T-39 original en Vue y solo lectura para gerocultor | M | P1 | Sprint-3 |
| T-40 | US-05 | Enlace ficha desde TaskCard | Mantiene el T-40 original adaptado a Vue Router | XS | P1 | Sprint-3 |
| T-41 | US-09 | Formulario Crear Residente | Mantiene el T-41 original con validación coordinador/admin | M | P2 | Sprint-3 |
| T-42 | US-09 | Formulario Editar Residente | Mantiene el T-42 original con permisos y datos sensibles protegidos | M | P2 | Sprint-3 |
| T-43 | US-09 | Archivar residente | Mantiene el T-43 original usando `archivado=true` | S | P2 | Sprint-3 |
| T-44 | US-09 | Lista de Residentes | Mantiene el T-44 original con filtros activos/archivados | M | P2 | Sprint-3 |
| T-45 | US-06 | Modelo Firestore `incidencias` + endpoint create | Reemplaza el T-45 original SQL por subcolección `incidencias` y POST API | M | P1 | Sprint-3 |
| T-46 | US-06 | Rules de incidencias inmutables | Reemplaza el T-46 original por reglas que permitan crear/leer pero no editar ni borrar | M | P1 | Sprint-3 |
| T-47 | US-06 | Formulario Registrar Incidencia | Mantiene el T-47 original con flujo ≤ 5 taps | M | P1 | Sprint-3 |
| T-48 | US-06 | Acción `crearIncidencia` | Reemplaza el T-48 original Mutation por store/action Pinia + invalidación local | S | P1 | Sprint-3 |
| T-49 | US-06 | Incidencia crítica → notificación | Reemplaza el T-49 original trigger Supabase por servicio Express/Firebase | M | P1 | Sprint-3 |
| T-50 | US-07 | Store historial de incidencias | Reemplaza el T-50 original hook por Pinia + filtros/paginación | M | P1 | Sprint-3 |
| T-51 | US-07 | Página Historial de Incidencias | Mantiene el T-51 original adaptado a Vue | M | P1 | Sprint-3 |
| T-52 | US-10 | Panel Admin: gestión de usuarios | Actualiza el T-52 original para crear/desactivar cuentas en Firebase Auth + Firestore | L | P2 | Sprint-3 |
| T-53 | US-10 | Asignación de residentes a gerocultor | Mantiene el T-53 original con modelo Firestore/Rules consistente | M | P2 | Sprint-3 |

#### Sprint-4: Notificaciones + turnos + exclusiones de scope controladas (2026-04-26 → 2026-05-02)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-54 | US-08 | Modelo Firestore `notificaciones` | Reemplaza el T-54 original SQL por colección Firestore y endpoint de consulta | S | P2 | Sprint-4 |
| T-55 | US-08 | Store `notificacion` + badge | Reemplaza el T-55 original hook por Pinia + badge de no leídas | M | P2 | Sprint-4 |
| T-56 | US-08 | Panel y toasts in-app | Mantiene el T-56 original limitado a foreground/in-app | M | P2 | Sprint-4 |
| T-57 | US-08 | Alertas de tarea próxima (15 min) | Mantiene el T-57 original con lógica cliente/API sin service worker | M | P2 | Sprint-4 |
| T-58 | US-11 | Inicio/cierre de turno + base de resumen | Reemplaza el T-58 original de PWA por flujo `turnos` necesario para US-11 | M | P2 | Sprint-4 |
| T-59 | US-08 | BLOCKED — Push notifications PWA | El T-59 original queda bloqueado por RNF-10/G06: no implementar push de SO sin cambio de spec | XS | P3 | Sprint-4 |
| T-60 | — | BLOCKED — Caché offline de agenda | El T-60 original queda bloqueado por RNF-10/G06: no implementar service worker/offline cache | S | P3 | Sprint-4 |
| T-61 | — | BLOCKED — Cola offline de incidencias | El T-61 original queda bloqueado por RNF-10/G06: no implementar cola offline/IndexedDB | M | P3 | Sprint-4 |
| T-62 | — | Banner de conectividad requerida | Actualiza el T-62 original: informar pérdida de red sin ofrecer modo offline | S | P2 | Sprint-4 |
| T-63 | US-11 | Generar resumen de turno | Mantiene el T-63 original con datos de tareas/incidencias del turno | M | P2 | Sprint-4 |
| T-64 | US-11 | Exportar resumen a PDF/enlace | Mantiene el T-64 original sin dependencia de PWA | M | P3 | Sprint-4 |

#### Sprint-5: Testing + QA + documentación técnica (2026-05-03 → 2026-05-09)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-65 | — | Tests unitarios stores/services | Reemplaza el T-65 original de hooks Query por Vitest en Pinia/services frontend+api | L | P1 | Sprint-5 |
| T-66 | US-01,US-02 | Tests integración Auth + RBAC | Actualiza el T-66 original con Firebase Auth emulada, middleware Express y Firestore Rules | L | P1 | Sprint-5 |
| T-67 | US-03,US-04,US-06 | Tests E2E agenda → incidencia | Mantiene el T-67 original con Playwright sobre flujos críticos | L | P1 | Sprint-5 |
| T-68 | US-03 | Audit Lighthouse Performance | Mantiene el T-68 original con objetivo RNF-02/RNF-04 | M | P1 | Sprint-5 |
| T-69 | — | Audit Lighthouse Accessibility | Mantiene el T-69 original con objetivo RNF-05 | M | P1 | Sprint-5 |
| T-70 | — | Revisión responsive tablet + mobile | Mantiene el T-70 original con foco tablet-first RNF-01 | M | P1 | Sprint-5 |
| T-71 | — | Seeds demo con `@faker-js/faker` | Actualiza el T-71 original SQL por seeds Firestore/Auth y datos ficticios RGPD-safe | S | P1 | Sprint-5 |
| T-72 | — | Revisar y cerrar ADR-01b..04b | Actualiza el T-72 original para cerrar ADRs Firebase y documentar deudas técnicas reales | M | P2 | Sprint-5 |
| T-73 | — | Documentar API + Rules + migración | Actualiza el T-73 original: contratos Express, reglas Firestore y mapa Supabase→Firestore | M | P2 | Sprint-5 |
| T-74 | — | Actualizar TECH_GUIDE.md | Actualiza el T-74 original con convenciones Vue/Pinia/Express/Emulator | M | P2 | Sprint-5 |
| T-75 | — | Variables de entorno y setup local | Actualiza el T-75 original con `.env.example` para frontend/api/emulator y README | S | P2 | Sprint-5 |
| T-76 | — | Correcciones post-QA | Mantiene el T-76 original como buffer de bugs y ajuste final | M | P1 | Sprint-5 |

#### Sprint-6: Memoria académica + presentación + cierre (2026-05-10 → 2026-05-18)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-77 | — | Portada y primera página reales | Actualiza el T-77 original: metadatos Jose Vilches Sánchez / ANDRES MARTOS GAZQUEZ / CIPFP Batoi / 2025-2026 | S | P1 | Sprint-6 |
| T-78 | — | Introducción, contexto y requisitos | Actualiza el T-78 original con stack Vue/Firebase y trazabilidad a SPEC | M | P1 | Sprint-6 |
| T-79 | — | Diseño del sistema en memoria | Actualiza el T-79 original con arquitectura Vue + Express + Firestore + diagramas | M | P1 | Sprint-6 |
| T-80 | — | Tecnologías utilizadas y ADRs | Actualiza el T-80 original sustituyendo React/Supabase por Vue/Pinia/Firebase | M | P1 | Sprint-6 |
| T-81 | — | Implementación técnica por sprints | Actualiza el T-81 original con narrativa Sprint-0..Sprint-6 y decisiones reales | M | P1 | Sprint-6 |
| T-82 | — | Pruebas, seguridad y RGPD | Actualiza el T-82 original con evidencias de Playwright, Vitest y Emulator Rules | M | P1 | Sprint-6 |
| T-83 | — | Conclusiones y formación | Actualiza el T-83 original con datos cuantitativos y aprendizajes | S | P1 | Sprint-6 |
| T-84 | — | Anexos, bibliografía y recursos | Actualiza el T-84 original con referencias, anexos API y recursos finales | S | P2 | Sprint-6 |
| T-85 | — | Slides de presentación | Mantiene el T-85 original alineado con arquitectura y demo final | M | P1 | Sprint-6 |
| T-86 | — | Video demo de la aplicación | Actualiza el T-86 original eliminando referencias a PWA/offline | M | P1 | Sprint-6 |
| T-87 | — | Revisión final y entrega | Mantiene el T-87 original con checklist de entrega final | S | P1 | Sprint-6 |
| T-94 | — | Reescribir placeholders de la memoria | Nuevo: reemplazar referencias antiguas a React/Supabase y completar checklist de `OUTPUTS/academic/README.md` | M | P1 | Sprint-6 |
| T-95 | — | Regenerar `.docx` desde plantilla | Nuevo: generar documento final desde la plantilla establecida con metadatos académicos correctos | S | P1 | Sprint-6 |

---

## Resumen por Sprint

| Sprint | Fechas | Objetivo Principal | Tareas | Tamaño total est. |
|--------|--------|-------------------|--------|-------------------|
| Sprint-0 | 2026-04-01 → 2026-04-14 | Scaffold Vue 3 + TS + Firebase Auth básica + Emulators + deploy | T-S0-01..T-S0-08 | ~3d |
| Sprint-1 | 2026-04-15 → 2026-04-25 | Auth completa + RBAC + App Shell + CI + ADR-04b + deploy producción | T-04,T-05,T-08,T-09,T-13..T-23,T-89,T-92,T-93 | ~8d |
| Sprint-2 | 2026-04-26 → 2026-05-02 | Agenda diaria + actualización de tareas | T-24..T-35 | ~6d |
| Sprint-3 | 2026-05-03 → 2026-05-09 | Residentes + Incidencias + administración básica | T-36..T-53 | ~8d |
| Sprint-4 | 2026-05-10 → 2026-05-12 | Notificaciones + turnos + control de scope | T-54..T-64 | ~5d |
| Sprint-5 | 2026-05-13 → 2026-05-15 | Tests + QA + documentación técnica | T-65..T-76 | ~6d |
| Sprint-6 | 2026-05-16 → 2026-05-18 | Memoria académica + presentación + cierre | T-77..T-87 + T-94..T-95 | ~5d |
| **TOTAL** | | | **~98 tareas** | **~41d persona** |

---

## Won't Have (fuera de scope del proyecto DAW)

| Idea | Razón de exclusión |
|------|-------------------|
| App móvil nativa (React Native / Flutter) | Fuera del scope DAW; la SPA responsive cubre el requisito mobile |
| PWA completa con push nativas y modo offline | Excluido explícitamente por RNF-10 y guardrail G06 |
| Módulo de facturación / gestión económica | No requerido en propuesta aprobada |
| Integración con HIS/EHR externos | Complejidad excesiva para proyecto individual |
| Chat en tiempo real entre gerocultores | Nice-to-have, no hay US que lo requiera |
| Portal para familiares de residentes | Podría ser US futura; actualmente no hay requisito formal |
| Multi-tenancy (varias residencias) | Arquitectura más compleja; una residencia es suficiente para el MVP |
| IA/ML para predicción de incidencias | Fuera del scope técnico del DAW |

---

*Última actualización: 2026-04-01 — Sprint-0 replanned; tareas originales movidas a estado "replanned"*
