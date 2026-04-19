# Informe de Cierre — Sprint-2

> **Proyecto**: GeroCare — Sistema de Gestión para Gerocultores
> **Sprint**: Sprint-2 (Modelo de tareas, componente TaskCard, calidad de código)
> **Fechas planificadas**: 2026-04-12 → 2026-04-18
> **Fecha de cierre real**: 2026-04-18
> **Autor**: Jose Vilches

---

## 1. Resumen Ejecutivo

El Sprint-2 completó el núcleo funcional de la agenda diaria (US-03): modelo de dominio de `Tarea`, contrato de API, componente `TaskCard` con 16 tests unitarios, y seeds de desarrollo protegidos contra ejecución en producción. Paralelamente se estabilizó la cadena de CI/CD (workflows de GitHub Actions, Husky hooks, lint-staged y commitlint), que quedó completamente operativa al cierre del sprint. Se crearon y mergearon 6 PRs. El sprint cerró con 0 tests fallidos y CI verde en `develop`.

---

## 2. Objetivo del Sprint

**Meta**: Implementar el modelo de tareas y el componente TaskCard (US-03), añadir seeds de desarrollo, estabilizar la infraestructura de calidad de código (Husky + lint + CI) y dejar la base lista para la vista de agenda diaria en Sprint-3.

---

## 3. Resumen de User Stories

| US | Título | Estado | Notas |
|----|--------|--------|-------|
| US-03 | Consulta de agenda diaria | 🔄 Parcial | Modelo + contrato API + TaskCard completados; vista `/agenda` pasa a Sprint-3 |
| US-04 | Actualizar estado de una tarea | 🔲 Diferida | Endpoint PATCH pendiente de implementar en Sprint-3 |

> **Nota**: El alcance real del Sprint-2 se ajustó para priorizar la estabilización de CI/CD y la infraestructura de calidad. La vista de agenda y el PATCH de estado se mueven a Sprint-3 con la base ya construida.

---

## 4. Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Duración real** | 2026-04-12 → 2026-04-18 |
| **Desarrolladores** | 1 (Jose Vilches) |
| **PRs abiertas** | 7 (PR #19, #20, #21, #22, #23, #24, y rama de resolución) |
| **PRs mergeadas en develop** | 6 (PR #19, #20/via #22, #21/via #22, #22, #23, #24) |
| **Tests automatizados — API** | 32 tests, 0 fallos |
| **Tests automatizados — Frontend** | 43 tests, 0 fallos |
| **Total tests automatizados** | 75 tests |
| **Fallos en test suite al cierre** | 0 |
| **Cobertura global API** | 67.88% stmts / 54.28% branch / 69.15% lines |
| **Cobertura global Frontend** | 84.31% stmts / 73.14% branch / 85.41% lines |

---

## 5. Trabajo Completado

### 5.1 Entregables funcionales

| Entregable | Ficheros clave | Estado |
|------------|---------------|--------|
| Modelo de dominio `Tarea` (tipos + Zod) | `code/api/src/types/tarea.types.ts`, `code/frontend/src/business/agenda/domain/entities/tarea.types.ts` | ✅ |
| Contrato API `GET /api/tareas` | `SPEC/api-contracts.md`, `code/api/src/routes/tareas.routes.ts` | ✅ |
| Servicio `tareas.service.ts` (list/create/update/addNote) | `code/api/src/services/tareas.service.ts` | ✅ |
| Controlador y rutas `/api/tareas` | `code/api/src/controllers/tareas.controller.ts`, `code/api/src/routes/index.ts` | ✅ |
| Componente `TaskCard` | `code/frontend/src/components/TaskCard/TaskCard.vue` | ✅ |
| Tests unitarios `TaskCard` (16 tests) | `code/frontend/src/components/TaskCard/TaskCard.spec.ts` | ✅ |
| Seeds de desarrollo (10 tareas ficticias) | `code/api/seeds/seed-tareas.ts` | ✅ |
| Test plan US-03 | `OUTPUTS/test-plans/test-plan-US-03.md` | ✅ |

### 5.2 Infraestructura de calidad

| Entregable | Ficheros clave | Estado |
|------------|---------------|--------|
| Husky + lint-staged + commitlint | `.husky/pre-commit`, `.husky/pre-push`, `.husky/commit-msg`, `commitlint.config.js` | ✅ |
| Documentación de hooks locales | `docs/HUSKY.md` | ✅ |
| Corrección workflow CI (working-directory + entryPoint) | `.github/workflows/firebase-hosting-pull-request.yml`, `.github/workflows/firebase-hosting-merge.yml` | ✅ |
| Corrección alias TypeScript en CI | `code/frontend/src/business/agenda/domain/entities/tarea.types.ts` | ✅ |
| Correcciones de lint/formato (ESLint + Prettier) | `TaskCard.spec.ts`, `tareas.api.ts`, otros | ✅ |

---

## 6. PRs del Sprint

| PR | Branch | Descripción | Estado |
|----|--------|-------------|--------|
| #19 | `fix/deploy-workflow` | Corrección workflow CI: working-directory + entryPoint para frontend | ✅ Mergeada |
| #20 | `chore/hooks-husky` | Husky + lint-staged + commitlint + docs/HUSKY.md | ✅ Mergeada (via #22) |
| #21 | `fix/ci-lint` | Corrección errores ESLint que bloqueaban CI | ✅ Mergeada (via #22) |
| #22 | `merge/resolution-2026-04-18-hooks-lint` | Rama de resolución: integra #20 y #21, resuelve conflictos | ✅ Mergeada |
| #23 | `fix/format-taskcard-etc` | Prettier sobre TaskCard y tareas.api | ✅ Mergeada |
| #24 | `fix/ci-alias-and-workdir` | Creación de tarea.types.ts faltante + ajuste workdir en workflow | ✅ Mergeada |

---

## 7. Flujo CI/CD al Cierre del Sprint

| Evento | Acción | Estado |
|--------|--------|--------|
| Pull Request a `develop` | Lint + Tests + Build en GitHub Actions | ✅ Activo |
| Merge a `develop` | Deploy automático al canal `staging` de Firebase Hosting | ✅ Activo |
| Merge a `master` | Deploy automático a producción (`live channel`) | ✅ Activo |
| Cada commit local | Pre-commit hook: ESLint sobre ficheros staged | ✅ Activo |
| Cada push | Pre-push hook: Suite de tests completa | ✅ Activo |
| Commit message | commitlint: validación de Conventional Commits | ✅ Activo |

---

## 8. Incidencias Resueltas

| # | Incidencia | Descripción | Resolución |
|---|------------|-------------|------------|
| 1 | Workflow CI ejecutaba npm en raíz | El workflow ejecutaba `npm ci` desde el directorio raíz en lugar de `code/frontend`, causando fallos de build | Añadido `working-directory: code/frontend` y corregido `entryPoint: ./code` en el action de Firebase (PR #19) |
| 2 | Errores de lint bloqueaban CI | `vi` no utilizado en `TaskCard.spec.ts` y uso de `any` implícito en `tareas.api.ts` | Corregidos en PR #21 |
| 3 | Problemas de formato (Prettier) | 3 ficheros con formato inconsistente bloqueaban el check de Prettier en CI | Aplicado `prettier --write` en PR #23 |
| 4 | Alias TypeScript (`@/`) no resuelto en CI | `tsc` no encontraba módulos importados con alias porque se ejecutaba desde el directorio raíz | Creado `tarea.types.ts` faltante y ajustado `working-directory` en workflow (PR #24) |
| 5 | Conflictos entre PRs paralelas (#20 y #21) | Ambas PRs modificaban los mismos ficheros y no podían mergearse independientemente | Creada rama de resolución explícita `merge/resolution-2026-04-18-hooks-lint` (PR #22) — patrón registrado como convención del proyecto |

---

## 9. Cobertura de Tests

### API — `code/api/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **67.88%** | **54.28%** | **55.55%** | **69.15%** |
| `controllers/users.controller.ts` | 100% | 75% | 100% | 100% |
| `middleware/verifyAuth.ts` | 84.61% | 83.33% | 100% | 84.61% |
| `middleware/requireRole.ts` | 96.29% | 100% | 100% | 96.29% |
| `routes/index.ts` | 90.9% | 100% | 66.66% | 90.9% |

> `services/firebase.ts` y `services/users.service.ts` están al 0% (excluidos del umbral) — requieren Firebase Admin Emulator según ADR-07.

### Frontend — `code/frontend/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **84.31%** | **73.14%** | **84.84%** | **85.41%** |
| `useAuthStore.ts` | 100% | 83.33% | 100% | 100% |
| `useLogin.ts` | 94.11% | 100% | 75% | 93.33% |
| `LoginPage.vue` | 92.3% | 87.5% | 75% | 92.3% |
| `useUsers.ts` | 91.11% | 60% | 100% | 95.23% |
| `UsersView.vue` | 93.54% | 71.87% | 90% | 96.42% |

---

## 10. Deuda Técnica al Cierre

| # | Descripción | Severidad | Sprint objetivo | Estado |
|---|-------------|-----------|----------------|--------|
| 1 | `useAuthGuard.ts` sin tests | Bajo | Sprint-3 | 🔲 Pendiente |
| 2 | `router/router.ts` navigation guards sin tests | Bajo | Sprint-3 | 🔲 Pendiente |
| 3 | `users.service.ts` sin tests (requiere emulator) | Medio | Sprint-3 | 🔲 Pendiente |
| 4 | Firestore Rules sin tests unitarios | Medio | Sprint-3 | ✅ Resuelto en PR #26 (post-sprint) |
| 5 | Referencias a rol legacy `coordinador` en tests | Bajo | Sprint-3 | ✅ Resuelto en PR #25 (post-sprint) |
| 6 | CI sin job para Firebase Emulator + rules tests | Medio | Sprint-3 | 🔲 Pendiente |
| 7 | Concurrencia en PATCH `/api/tareas/:id/estado` | Medio | Sprint-3 | 🔲 Pendiente |
| 8 | Staging smoke test automatizado post-deploy | Bajo | Sprint-3 | 🔲 Pendiente |

---

## 11. Próximos Pasos — Sprint-3

- [ ] Vista `/agenda` — integrar `TaskCard` con datos reales de la API (T-S3-01)
- [ ] Acción de cambio de estado → `PATCH /api/tareas/:id/estado` con protección de concurrencia (T-S3-02)
- [ ] Modelo Residente + servicio Firestore (T-S3-03)
- [ ] Endpoint `GET /api/residentes/:id` (T-S3-04)
- [ ] Vista `/residentes/:id` — ficha básica de residente (T-S3-05)
- [ ] Test plan US-05 (T-S3-06)
- [ ] CI job para Firebase Emulator + rules-unit-tests
- [ ] Implementar protección de concurrencia server-side (transacción Firestore)

---

*Generado: 2026-04-19 | Autor: Jose Vilches | Sprint-2 cerrado*
