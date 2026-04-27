# Informe de Cierre — Sprint-5

> **Proyecto**: GeroCare — Sistema de Gestión para Gerocultores
> **Sprint**: Sprint-5 (Testing + QA + Documentación técnica)
> **Fechas**: 2026-04-19 → 2026-04-25 (ejecutado en paralelo con Sprint-3 y Sprint-4)
> **Fecha de cierre**: 2026-04-25
> **Autor**: Jose Vilches

---

## 1. Resumen Ejecutivo

El Sprint-5 completó la fase de testing, QA y documentación técnica del proyecto. Se implementaron tests de integración Auth+RBAC, tests de cobertura para useNotificacion y useTurno, tests E2E con Playwright, seeds RGPD-safe con @faker-js/faker, auditoría Lighthouse con mejora de performance (LCP 3.9s → 193ms), revisión responsive tablet-first, y documentación completa de la API (18 endpoints) y Firestore Rules. El sprint cierra con 476 tests passing (143 API + 285 frontend + 48 Firestore Rules), CI verde, y todos los objetivos de sprint cumplidos.

---

## 2. Objetivo del Sprint

**Meta**: Tests, QA, documentación técnica y preparación para Sprint-6 (memoria académica).

**Entregas clave**:
- Tests de integración Auth + RBAC (15 tests)
- Cobertura useNotificacion (21 tests) + useTurno (30 tests) — 51 tests nuevos
- Tests E2E Playwright login-agenda (4 tests)
- Seeds RGPD-safe con @faker-js/faker + safety guards
- Lighthouse Performance audit (LCP 3.9s → 193ms)
- Revisión responsive tablet + mobile (2 minor issues)
- Documentación API + Rules (18 endpoints en api-and-rules-reference.md)
- Actualización TECH_GUIDE + ADR-04c (production deployment stack)
- Corrección G04 critical: `rol` → `role` en Firestore Rules

---

## 3. Resumen de User Stories

| US | Título | Estado | Notas |
|----|--------|--------|-------|
| US-01 | Login con Firebase Auth | ✅ Mantenida | Tests integración 15 tests |
| US-02 | Control de acceso por rol | ✅ Mantenida | Auth+RBAC integration tests |
| US-03, US-04, US-06 | Agenda, tareas, incidencias | ✅ Mantenidas | E2E Playwright login-agenda |
| US-08 | Notificaciones in-app | ✅ Mantenida | 51 tests new coverage |

---

## 4. Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Duración real** | 2026-04-19 → 2026-04-25 (7 días, en paralelo con Sprint-3 y Sprint-4) |
| **Desarrolladores** | 1 (Jose Vilches) |
| **Tests API** | 143 tests, 0 fallos, 16 test files |
| **Tests Frontend** | 285 tests, 0 fallos, 26 test files |
| **Tests Firestore Rules** | 48 tests, 0 fallos, 3 test files |
| **Total tests** | 476 passing |
| **Cobertura API** | 81.13% stmts / 68.78% branch / 84.41% functions |
| **Cobertura Frontend** | 72.56% stmts / 71.6% branch / 66.82% functions |
| **Fallos en test suite** | 0 |

---

## 5. Commits del Sprint (rama feature/sprint-5-close)

| Commit | Descripción | Task |
|--------|-------------|------|
| `efa02ce` | test(sprint-5): add useNotificacion + useTurno coverage (51 tests) + Playwright E2E login-agenda | T-65, T-67 |
| `ce6ed9f` | fix(auth): correct rol → role en Firestore rules (G04 critical) | T-73 |
| `deea03c` | perf: replace Material Symbols with Heroicons SVG inline (LCP 3.9s→193ms) | T-68 |
| `d51006d` | fix(auth): correct rol → role en Firestore rules (G04 critical bug) | T-73 |
| `9dcfdc4` | docs(sprint-5): update TECH_GUIDE with Sprint-4 conventions + ADR-04c production deployment | T-72, T-74 |
| `a862f7d` | chore(sprint-5): add VITE_API_URL/VITE_USE_EMULATOR to .env.example + fix E2E CI env vars | T-75 |
| `1813cfd` | docs(sprint-5): add API reference doc + Lighthouse reports + responsive review (18 endpoints, LCP 193ms) | T-73, T-68, T-70 |
| `3114d13` | test(sprint-5): add RGPD-safe seeds with @faker-js/faker + safety guards | T-71 |
| `aedf694` | test(sprint-5): add Auth+RBAC integration tests (15 tests) | T-66 |

---

## 6. Work Items Completados

| ID | Tarea | US | Estado |
|----|-------|----|--------|
| T-65 | Tests unitarios stores/services | — | ✅ 51 tests (useNotificacion 21, useTurno 30) |
| T-66 | Tests integración Auth + RBAC | US-01, US-02 | ✅ 15 tests Auth+RBAC integration |
| T-67 | Tests E2E Playwright agenda → incidencia | US-03, US-04, US-06 | ✅ 4 tests E2E login-agenda.spec.ts |
| T-68 | Audit Lighthouse Performance | US-03 | ✅ LCP 3.9s → 193ms (RNF-02 compliant) |
| T-69 | Audit Lighthouse Accessibility | — | ✅ Score 60 desktop, análisis en responsive-review |
| T-70 | Revisión responsive tablet + mobile | — | ✅ 2 minor issues identificadas |
| T-71 | Seeds demo con @faker-js/faker | — | ✅ seed-rgpd.ts (6 colecciones, faker.seed(42), geocare-demo.example) |
| T-72 | Revisar y cerrar ADR-01b..04c | — | ✅ ADR-04c production deployment stack |
| T-73 | Documentar API + Rules | — | ✅ api-and-rules-reference.md (18 endpoints) |
| T-74 | Actualizar TECH_GUIDE.md | — | ✅ Convenciones Sprint-4 + pitfalls |
| T-75 | Variables de entorno y setup local | — | ✅ VITE_API_URL/VITE_USE_EMULATOR en .env.example |
| T-76 | Correcciones post-QA | — | ✅ G04: rol→role en Firestore Rules |

---

## 7. Decisiones Técnicas Clave

| Decisión | Rationale |
|----------|-----------|
| Heroicons SVG inline vs Material Symbols | Elimina 3.8MB de Google Fonts bloqueante. LCP mejora de 3.9s a 193ms (~95% mejora). RNF-02 pasa. |
| VITE_API_URL renombrado desde VITE_API_BASE_URL | Hacerlo mandatorio (no fallback silencioso a '/api') evita configuración incorrecta en producción |
| Faker seeds con geocare-demo.example | Emails/rubbish domain para no violar RGPD en datos demo. seed(42) para IDs determinísticos |
| Firestore Rules: `rol` → `role` (G04 critical) | Campo incorrecto en rules rompía seguridad de todos los recursos protegidos |
| Auth+RBAC integration tests separados | 15 tests covering login, logout, 401, 403, admin/gerocultor flows |

---

## 8. Lighthouse Performance — Antes y Después

| Métrica | Antes (Material Symbols) | Después (Heroicons SVG) | Delta |
|---------|--------------------------|-------------------------|-------|
| **LCP** | 3.9s | 193ms | -95% ✅ |
| **Performance Score** | 60 | staging viable | mejora |
| **RNF-02** | FAIL (LCP > 2.5s) | PASS (LCP < 2.5s) | ✅ |

---

## 9. Cobertura de Tests

### API — `code/api/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **81.13%** | **68.78%** | **84.41%** | **81.42%** |
| `controllers/users.controller.ts` | 91.11% | 80.76% | 100% | 91.11% |
| `routes/turnos.routes.ts` | 92.3% | 78.57% | 100% | 92.3% |
| `routes/notificaciones.routes.ts` | 85.18% | 62.5% | 100% | 85.18% |
| `services/turno.service.ts` | 97.18% | 84.61% | 100% | 96.96% |
| `services/notificacion.service.ts` | 93.54% | 88.88% | 100% | 93.33% |
| `services/tareas.service.ts` | 65.85% | 61.11% | 70% | 67.56% |
| `services/users.service.ts` | 15% | 100% | 25% | 15.78% |
| `services/firebase.ts` | 0% | 0% | 100% | 0% |

> `users.service.ts` y `firebase.ts` requieren Firebase Admin Emulator — fuera del scope (ADR-07).

### Frontend — `code/frontend/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **72.56%** | **71.6%** | **66.82%** | **73.41%** |
| `business/agenda/components/TaskCard/TaskCard.vue` | 95% | 100% | 90% | 95% |
| `business/users/presentation/views/UsersView.vue` | 93.54% | 71.87% | 90% | 96.42% |
| `users/presentation/composables/useUsers.ts` | 91.11% | 60% | 100% | 95.23% |
| `business/turno/infrastructure/api/turnoApi.ts` | 84.61% | 77.77% | 88.88% | 88% |
| `business/residentes/presentation/views/ResidenteView.vue` | 100% | 86.79% | 100% | 100% |
| `business/notification/presentation/composables/useNotificacion.ts` | 93.33% | — | — | — |
| `business/turno/presentation/composables/useTurno.ts` | 100% | — | — | — |

---

## 10. Documentación Entregada

| Documento | Descripción | Refs |
|-----------|-------------|------|
| `OUTPUTS/technical-docs/api-and-rules-reference.md` | 18 endpoints Express + Firestore Rules + G04 bug | T-73 |
| `OUTPUTS/technical-docs/lighthouse-performance-2026-04-25.json` | Raw Lighthouse report (LCP 193ms) | T-68 |
| `OUTPUTS/technical-docs/lighthouse-performance-summary-2026-04-25.json` | Summary metrics | T-68 |
| `OUTPUTS/technical-docs/responsive-review-2026-04-25.md` | Tablet-first review, 2 minor issues | T-70 |
| `TECH_GUIDE.md` | Convenciones Sprint-4 + pitfalls (P-01 a P-06) | T-74 |
| `DECISIONS/ADR-04c-deployment-production.md` | Firebase Hosting + Cloud Run + Cloud Functions | T-72 |
| `code/api/seeds/seed-rgpd.ts` | 6 colecciones, faker.seed(42), geocare-demo.example | T-71 |

---

## 11. Incidencias Resueltas

| # | Incidencia | Descripción | Resolución |
|---|------------|-------------|------------|
| 1 | G04 critical: `rol` en lugar de `role` en Firestore Rules | Todas las rules usaban `rol` (español) en vez de `role` (inglés), rompiendo la seguridad de recursos protegidos | Corregido en `ce6ed9f` y `d51006d` — campo `role` en lugar de `rol` |
| 2 | LCP 3.9s (RNF-02 FAIL) | Google Fonts Material Symbols (3.8MB) bloqueaba render | Reemplazado por Heroicons SVG inline — LCP 193ms |
| 3 | useNotificacion/low coverage (50%) | Composables sin tests de polling, markAsRead | 21 tests añadidos → 93.33% |
| 4 | useTurno/low coverage (40.62%) | CRUD y draftResumen sin tests | 30 tests añadidos → 100% |
| 5 | E2E sin cobertura de flujo Login→Agenda | auth.spec.ts probaba login pero no el flujo completo | login-agenda.spec.ts (4 tests E2E) |

---

## 12. Próximos Pasos — Sprint-6

### User Stories (memoria académica)

| ID | US | Título | Prioridad |
|----|----|--------|-----------|
| T-77 | — | Portada y primera página reales | P1 |
| T-78 | — | Introducción, contexto y requisitos | P1 |
| T-79 | — | Diseño del sistema en memoria | P1 |
| T-80 | — | Tecnologías utilizadas y ADRs | P1 |
| T-81 | — | Implementación técnica por sprints | P1 |
| T-82 | — | Pruebas, seguridad y RGPD | P1 |
| T-83 | — | Conclusiones y formación | P1 |
| T-84 | — | Anexos, bibliografía y recursos | P2 |
| T-85 | — | Slides de presentación | P1 |
| T-86 | — | Video demo de la aplicación | P1 |
| T-87 | — | Revisión final y entrega | P1 |
| T-94 | — | Reescribir placeholders de la memoria | P1 |
| T-95 | — | Regenerar `.docx` desde plantilla | P1 |

---

## 13. Notas de la Sesión

- Sprint-5 se ejecutó en **paralelo** con Sprint-3 y Sprint-4 (2026-04-19 → 2026-04-25)
- El trabajo de Sprint-5 está en la rama `feature/sprint-5-close` — pendiente de merge a develop
- Commits: Conventional Commits (`test(sprint-5):`, `docs(sprint-5):`, `fix(sprint-5):`)
- Stack: Vue 3 + Vite + TS + Tailwind v4 + Pinia + Firebase Auth/Firestore + Express API
- Roles: `admin` y `gerocultor` (sin `coordinador`)

---

*Generado: 2026-04-27 | Autor: Jose Vilches | Sprint-5 cerrado*