# Sprint Activo — Sprint-0

> **Sprint-0: Infraestructura Vue/Firebase + preparación de migración**
> Fechas: 2026-03-29 → 2026-04-04
> Próximo sprint: Sprint-1 (Auth + App Shell + deploy, 2026-04-05 → 2026-04-11)

<!-- sdd/switch-stack-to-vue-firebase TASKS delta -->

---

## Objetivo del Sprint

> **Al cierre del Sprint-0, el repositorio debe estar listo para iniciar features sobre Vue + Firebase:**
> frontend Vue + Vite operativo, Tailwind + Pinia configurados, proyecto Firebase en región EU,
> Express API wrapper scaffolded, Emulator Suite y tests de Firestore Rules funcionando,
> CI/CD verde y decisión de hosting documentada en ADR-04b.
> **Nadie debe escribir código de negocio hasta que este sprint esté Done.**

---

## Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Días disponibles** | 7 días (29 Mar → 4 Abr) |
| **Desarrolladores** | 1 (Jose Vilches) |
| **Velocidad estimada** | 16 tareas XS/S/M |
| **Tamaño total estimado** | ~5 días/persona de trabajo real |
| **Buffer** | ~2 días para decisiones de hosting y curva Firebase |

---

## Work Items del Sprint-0

| ID | Título | Tamaño | Estado | Notas |
|----|--------|--------|--------|-------|
| T-01 | Inicializar repositorio Git | XS | 🔲 PENDIENTE | Repo GitHub, `.gitignore`, README y convenciones de ramas/PR |
| T-02 | Scaffold Vite + Vue 3 + TS | S | 🔲 PENDIENTE | `npm create vite@latest frontend -- --template vue-ts` |
| T-03 | Configurar Tailwind CSS para Vue | S | 🔲 PENDIENTE | Tailwind/PostCSS y `frontend/src/assets/styles/main.css` |
| T-04 | Sistema base de componentes Tailwind/Atomic | S | 🔲 PENDIENTE | Atoms base: Button, Input, Card, Badge, Sheet/Drawer |
| T-05 | Configurar ESLint + Prettier + Husky | S | 🔲 PENDIENTE | Reglas para frontend/api, hooks pre-commit y format check |
| T-06 | Crear proyecto Firebase en región EU | S | 🔲 PENDIENTE | Firestore en `europe-west1` o `europe-west3`, Auth email/password |
| T-07 | Configurar Firebase client SDK | XS | 🔲 PENDIENTE | `frontend/src/lib/firebase.ts` + `frontend/.env.example` |
| T-09 | Configurar GitHub Actions CI | M | 🔲 PENDIENTE | Lint + type-check + build + tests frontend/api + rules |
| T-10 | Estructura monorepo frontend/api/shared | S | 🔲 PENDIENTE | Carpetas `frontend/`, `api/`, `tests/`, `shared/` |
| T-11 | Configurar Vue Router 4 | S | 🔲 PENDIENTE | Rutas `/login`, `/`, `/unauthorized`, fallback 404 |
| T-12 | Configurar Pinia por dominio | S | 🔲 PENDIENTE | Stores `auth`, `agenda`, `residente`, `incidencia`, `turno`, `notificacion` |
| T-88 | Evaluar Firebase Hosting vs opciones GCP | S | 🔲 PENDIENTE | Comparar Firebase Hosting, Cloud Run y variantes según ADR-04b |
| T-89 | TODO — Formalizar elección de hosting | XS | 🔲 PENDIENTE | Jose decide la opción y se actualiza ADR-04b; bloquea T-08 |
| T-90 | Scaffold Express API wrapper | M | 🔲 PENDIENTE | `api/src/index.ts`, middleware auth/error/rate limit, Admin SDK |
| T-91 | Configurar Firebase Emulator Suite | S | 🔲 PENDIENTE | Auth + Firestore emulator, `firebase.json`, `firestore.rules`, harness tests |
| T-92 | Integrar CI para Emulator + Rules | M | 🔲 PENDIENTE | Job dedicado que arranca emuladores y ejecuta tests automáticos |

---

## Definición de Done — Sprint-0 (infra + migration readiness)

Para que el Sprint-0 se considere completado, deben cumplirse **todos** los criterios:

- [ ] `npm run dev --workspace frontend` arranca sin errores
- [ ] `npm run build --workspace frontend` y `npm run build --workspace api` completan sin errores
- [ ] `npm run lint` pasa sin warnings ni errores en frontend y api
- [ ] `npm run test:rules` o equivalente ejecuta la suite de Firestore Rules contra Emulator Suite
- [ ] El proyecto Firebase existe en región EU (`europe-west1` o `europe-west3`)
- [ ] `frontend/src/lib/firebase.ts` y `api/src/services/firestore.ts` existen y leen variables de entorno
- [ ] La estructura monorepo `frontend/`, `api/`, `tests/`, `shared/` está creada
- [ ] GitHub Actions CI pasa en verde con jobs de lint, type-check, build y rules tests
- [ ] Existen `frontend/.env.example` y `api/.env.example` con todas las variables documentadas
- [ ] ADR-04b contiene la evaluación comparativa y la decisión de hosting queda registrada por Jose
- [ ] El scaffold Express expone healthcheck y middlewares base sin lógica de negocio
- [ ] No hay referencias activas a Supabase/Vercel/shadcn en el código de arranque ni en los archivos de setup

---

## Bloqueantes e Impedimentos

| # | Descripción | Impacto | Acción |
|---|-------------|---------|--------|
| 1 | Hosting aún no decidido (ADR-04b en DRAFT) | Bloquea T-08 y cualquier deploy real | Resolver T-88 y T-89 dentro de Sprint-0 |
| 2 | Firestore Rules aún sin suite de tests | Riesgo alto de romper RNF-09 y US-02 | Resolver T-91 y T-92 antes de Sprint-1 |

---

## Notas del Sprint

- **ADRs relacionados**: ADR-01b (Vue), ADR-02b (Firestore), ADR-03b (Firebase Auth), ADR-04b (hosting TBD). ADR-04b debe quedar actualizado antes de cerrar el sprint.
- **No se escribe código de negocio** en este sprint. Solo infraestructura, migración técnica y seguridad base.
- Los archivos `.env` reales **no se suben al repositorio**. Solo `.env.example` sin valores.
- La migración de Supabase → Firestore se trata como cambio arquitectónico: cualquier referencia antigua debe eliminarse del setup inicial.
- Los tests de Firestore Rules con Emulator Suite son obligatorios por RNF-09 y no se pueden diferir a Sprint-5.

---

## Próximo Sprint — Preview Sprint-1

**Objetivo**: Login/logout funcional, sesión persistente con Pinia/Firebase, RBAC con Rules + Express y App Shell lista para features.

**Tareas que entran en Sprint-1**: T-08, T-13 a T-23 y T-93.

*Última actualización: 2026-03-29 — Sprint-0 regenerado para sdd/switch-stack-to-vue-firebase*
