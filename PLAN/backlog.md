# Backlog Kanban — gerocultores-system

> Fuente de verdad del Planner. Actualizado: 2026-03-29.
> Stack: Vue 3 + Vite + Tailwind + Pinia + Firebase Auth/Firestore + Express API wrapper + Hosting TBD
> Deadline: 2026-05-18 | Sprints: Sprint-0 (setup) → Sprint-6 (entrega final)

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

_Nada completado todavía — backlog regenerado para la migración Vue + Firebase._

---

### 🔄 IN PROGRESS

_Nada en progreso activo._

---

### 👁 REVIEW

_Nada en revisión._

---

### ✅ READY — Sprint-0 (listas para empezar)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-01 | — | Inicializar repositorio Git | Sin cambios sobre el T-01 original: repo, `.gitignore`, README y convenciones base sin secretos | XS | P1 | Sprint-0 |
| T-02 | — | Scaffold Vite + Vue 3 + TS | Actualiza el T-02 original: sustituye React 18 por Vue 3 + TypeScript y valida HMR | S | P1 | Sprint-0 |
| T-03 | — | Configurar Tailwind CSS para Vue | Actualiza el T-03 original para `frontend/` con content paths Vue y estilos base tablet-first | S | P1 | Sprint-0 |
| T-04 | — | Sistema base de componentes Tailwind/Atomic | Reemplaza el T-04 original (`shadcn/ui`) por atoms/molecules base accesibles en `frontend/src/components/` | S | P1 | Sprint-0 |
| T-05 | — | Configurar ESLint + Prettier + Husky | Amplía el T-05 original a frontend + api + reglas comunes de TypeScript | S | P1 | Sprint-0 |
| T-06 | — | Crear proyecto Firebase en región EU | Reemplaza el T-06 original de Supabase por Firebase Auth + Firestore en `europe-west1|3` | S | P1 | Sprint-0 |
| T-07 | — | Configurar Firebase client SDK | Reemplaza el T-07 original: crear `frontend/src/lib/firebase.ts` y `.env.example` con `VITE_FIREBASE_*` | XS | P1 | Sprint-0 |
| T-09 | — | Configurar GitHub Actions CI | Actualiza el T-09 original para lint + type-check + build + tests de frontend/api y reglas | M | P1 | Sprint-0 |
| T-10 | — | Estructura monorepo frontend/api/shared | Actualiza el T-10 original: estructura Vue + Express + tests + assets compartidos | S | P1 | Sprint-0 |
| T-11 | — | Configurar Vue Router 4 | Reemplaza el T-11 original de React Router por rutas base `/login`, `/`, `/unauthorized`, `404` | S | P1 | Sprint-0 |
| T-12 | — | Configurar Pinia por dominio | Reemplaza el T-12 original de TanStack Query por stores `auth`, `agenda`, `residente`, `incidencia`, `turno`, `notificacion` | S | P1 | Sprint-0 |
| T-88 | — | Evaluar Firebase Hosting vs opciones GCP | Nuevo bloqueante Sprint-0: comparar Firebase Hosting, Cloud Run y variantes según ADR-04b | S | P1 | Sprint-0 |
| T-89 | — | TODO — Formalizar elección de hosting | Nuevo bloqueante Sprint-0: documentar la opción elegida en ADR-04b; no implementa deploy hasta decisión explícita | XS | P1 | Sprint-0 |
| T-90 | — | Scaffold Express API wrapper | Nuevo: crear workspace `api/`, bootstrap Express + Admin SDK + middleware base | M | P1 | Sprint-0 |
| T-91 | — | Configurar Firebase Emulator Suite | Nuevo: emuladores Auth/Firestore + harness de tests para Firestore Rules | S | P1 | Sprint-0 |
| T-92 | — | Integrar CI para Emulator + Rules | Nuevo: añadir job de CI para levantar emuladores, ejecutar tests de reglas y publicar resultados | M | P1 | Sprint-0 |

---

### 🔲 BACKLOG

#### Sprint-1: Auth + App Shell + base de migración (2026-04-05 → 2026-04-11)

| ID | US | Título | Descripción | Tamaño | Prioridad | Sprint |
|----|----|--------|-------------|--------|-----------|--------|
| T-08 | — | Configurar deploy inicial tras decisión de hosting | Actualiza y mueve el T-08 original desde Sprint-0: preparar deploy según T-89 y ADR-04b | M | P1 | Sprint-1 |
| T-13 | US-01 | Pantalla de Login en Vue | Actualiza el T-13 original con `LoginView.vue`, validación y feedback accesible | M | P1 | Sprint-1 |
| T-14 | US-01 | Integrar Firebase Auth (email/pass) | Reemplaza el T-14 original de Supabase Auth por `signInWithEmailAndPassword` y manejo de token | M | P1 | Sprint-1 |
| T-15 | US-01 | Logout y limpieza de sesión | Actualiza el T-15 original con `signOut`, limpieza Pinia y revocación/invalidación definida por backend | S | P1 | Sprint-1 |
| T-16 | US-01 | Persistencia de sesión con Pinia | Reemplaza el T-16 original (`AuthContext`) por `useAuthStore` + listeners Firebase | M | P1 | Sprint-1 |
| T-17 | US-02 | Colección `usuarios` + custom claims | Reemplaza el T-17 original (`profiles`) por bootstrap Firestore + claims de rol | M | P1 | Sprint-1 |
| T-18 | US-02 | Reglas Firestore + middleware Express RBAC | Reemplaza el T-18 original de RLS por defensa en profundidad Auth + Rules + Express | L | P1 | Sprint-1 |
| T-19 | US-02 | Guards de navegación Vue Router | Reemplaza el T-19 original (`ProtectedRoute`) por guards 401/403 basados en claims | M | P1 | Sprint-1 |
| T-20 | US-02 | Manejo de acceso no autorizado (403) | Mantiene el T-20 original con `UnauthorizedView.vue` y respuesta API consistente | S | P2 | Sprint-1 |
| T-21 | — | Layout principal (AppShell) | Actualiza el T-21 original para Vue + navegación responsive + rol visible | M | P1 | Sprint-1 |
| T-22 | — | Tema de diseño y tokens Tailwind | Actualiza el T-22 original con paleta, tipografía y componentes mobile/tablet-first | S | P2 | Sprint-1 |
| T-23 | — | Página 404 Not Found | Mantiene el T-23 original adaptado a Vue Router | XS | P3 | Sprint-1 |
| T-93 | — | Diseñar mapeo Supabase → Firestore | Nuevo: definir equivalencias de tablas/colecciones, seeds demo e impacto sobre IDs y auditoría | M | P1 | Sprint-1 |

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
| Sprint-0 | 2026-03-29 → 2026-04-04 | Infraestructura Vue/Firebase + hosting decision + emuladores | T-01..T-12 (sin T-08) + T-88..T-92 | ~5d |
| Sprint-1 | 2026-04-05 → 2026-04-11 | Auth funcional + App Shell + deploy listo + mapeo migración | T-08, T-13..T-23, T-93 | ~6d |
| Sprint-2 | 2026-04-12 → 2026-04-18 | Agenda diaria + actualización de tareas | T-24..T-35 | ~6d |
| Sprint-3 | 2026-04-19 → 2026-04-25 | Residentes + Incidencias + administración básica | T-36..T-53 | ~8d |
| Sprint-4 | 2026-04-26 → 2026-05-02 | Notificaciones + turnos + control de scope | T-54..T-64 | ~5d |
| Sprint-5 | 2026-05-03 → 2026-05-09 | Tests + QA + documentación técnica | T-65..T-76 | ~6d |
| Sprint-6 | 2026-05-10 → 2026-05-18 | Memoria académica + presentación + cierre | T-77..T-87 + T-94..T-95 | ~5d |
| **TOTAL** | | | **95 tareas** | **~41d persona** |

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

*Última actualización: 2026-03-29 — Kanban regenerado para sdd/switch-stack-to-vue-firebase*
