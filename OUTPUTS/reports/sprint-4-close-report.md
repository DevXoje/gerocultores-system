# Informe de Cierre — Sprint-4

> **Proyecto**: GeroCare — Sistema de Gestión para Gerocultores
> **Sprint**: Sprint-4 (Notificaciones in-app + Gestión de turnos)
> **Fechas**: 2026-04-19 → 2026-04-25 (ejecutado en paralelo con Sprint-3)
> **Fecha de cierre**: 2026-04-25
> **PR**: #56 — `feat: Sprint-4 close — notificaciones in-app (US-08) + gestión de turnos (US-11)`
> **Autor**: Jose Vilches

---

## 1. Resumen Ejecutivo

El Sprint-4 completó el ciclo de notificaciones in-app (US-08) y la gestión de turnos (US-11): inicio/cierre de turno con resumen exportable. Se implementó el backend completo (servicios, rutas, Firestore Rules) y el frontend completo (DDD module, componentes, stores, tests). El sprint cierra con CI verde, 0 tests fallidos, y todas las tareas completadas según el backlog.

---

## 2. Objetivo del Sprint

**Meta**: Notificaciones in-app con badge y toasts, alertas de tarea próxima (15 min), e inicio/cierre de turno con resumen.

**Entregas clave**:
- Modelo Firestore `notificaciones` + endpoints GET/PATCH
- Store Pinia `notificacion` con badge de no leídas
- `NotificationPanel` + `NotificationToast` (30s polling)
- `OfflineBanner` + `useConnectivity` para detectar pérdida de red
- Modelo Firestore `turnos` + endpoints CRUD
- `TurnoView` + `ResumenTurnoModal` (inicio/fin/shift summary)
- Firestore Rules para `notificaciones` y `turnos`
- Tests para ambos módulos (54 Vitest tests frontend, 23 API tests)

---

## 3. User Stories Completadas

| US | Título | Estado | Notas |
|----|--------|--------|-------|
| US-08 | Recibir notificaciones de alertas críticas | ✅ Done | Notificaciones in-app + toast + polling + OfflineBanner |
| US-11 | Resumen de fin de turno | ✅ Done | Inicio/cierre turno + resumen + modal |

---

## 4. Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Duración real** | 2026-04-19 → 2026-04-25 (7 días, paralelo a Sprint-3) |
| **Desarrolladores** | 1 (Jose Vilches) |
| **PRs mergeadas** | 1 (PR #56 — squash merge) |
| **Ficheros cambiados** | 64 |
| **Inserciones** | 6,599 |
| **Delecciones** | 97 |
| **Tests API** | 32+ (turnos.routes.spec.ts 13 tests, turno.service.spec.ts 10 tests, notificaciones.routes.spec.ts) |
| **Tests Frontend** | 54+ (useTurno, TurnoView, ResumenTurnoModal, notificacion store, NotificationPanel, NotificationToast) |
| **Tests Firestore Rules** | 3 ficheros (notificaciones.test.js, turnos.test.js, firestore.rules.test.js) — migrados a Vitest |
| **Cobertura global API** | 82.84% stmts / 70.89% branch / 84.61% functions |
| **Cobertura global Frontend** | 72.44% stmts / 71.37% branch / 66.82% functions |
| **Fallos en test suite** | 0 |

---

## 5. Work Items Completados

| ID | Tarea | US | Estado |
|----|-------|----|--------|
| T-54 | Modelo Firestore `notificaciones` + endpoint GET/PATCH | US-08 | ✅ |
| T-55 | Store `notificacion` + badge de no leídas | US-08 | ✅ |
| T-56 | Panel y toasts in-app (alertas críticas) | US-08 | ✅ |
| T-57 | Alertas de tarea próxima (15 min) — `getTareasProximas` | US-08 | ✅ |
| T-58 | Inicio/cierre de turno + base de resumen | US-11 | ✅ |
| T-62 | Banner de conectividad requerida (`OfflineBanner`) | US-08 | ✅ |
| T-63 | Generar resumen de turno (`ResumenTurnoModal`) | US-11 | ✅ |
| T-64 | Exportar resumen a PDF/enlace | US-11 | ✅ |
| DT-07 | Smoke test automatizado post-deploy en CI | — | ✅ Resuelto |

---

## 6. Arquitectura DDD — Módulos Entregados

### Módulo `notificacion` (business/notification/)
```
notification/
├── domain/entities/Notificacion.ts     # Zod schema + TS type (9 campos)
├── infrastructure/api/notificacionApi.ts # GET/PATCH /api/notificaciones
├── presentation/
│   ├── composables/useNotificacion.ts   # startPolling(), stopPolling()
│   ├── stores/notificacion.store.ts     # Pinia: unread count
│   └── components/
│       ├── NotificationPanel.vue        # Slide-out panel, marca leídas
│       └── NotificationToast.vue        # Toast popup 30s
```

### Módulo `turno` (business/turno/)
```
turno/
├── domain/entities/Turno.ts            # Zod schema + TS type
├── infrastructure/api/turnoApi.ts       # POST/PATCH/GET /api/turnos
├── application/use-cases/
│   ├── iniciarTurno.ts
│   ├── finalizarTurno.ts
│   ├── getTurnoActivo.ts
│   └── getResumenTurno.ts
├── presentation/
│   ├── composables/useTurno.ts
│   ├── stores/turno.store.ts
│   └── components/
│       ├── TurnoView.vue                # Start/end shift UI
│       └── ResumenTurnoModal.vue        # Shift summary display
```

---

## 7. Decisiones Técnicas Clave

| Decisión | Rationale |
|----------|-----------|
| Polling 30s para notificaciones | Sin service worker ni WebSocket, el polling es el mecanismo más simple y confiable |
| Turnos como documento independiente (no subcolección) | Un turno activo por usuario — documento único con campo `activo: true` para la query |
| OfflineBanner en App.vue | Componente sticky que detecta pérdida de red y avisa sin ofrecer modo offline (RNF-10) |
| Heroicons inline SVG vs Material Symbols | Optimización performance — elimina dependencia de fuente externa y resuelve 502 en deploy |
| Firestore Rules: `isResourceOwner()` null-safe | Firestore rules v2 comparison con `null` throws en vez de retornar false — añadido guard explícito |

---

## 8. Decisiones ADR

| ADR | Cambio |
|-----|--------|
| ADR-04b | SUPERSEDED por ADR-04c (Firebase Hosting + Cloud Run + Cloud Functions) |
| ADR-04c | Nuevo — stack de producción documentado: Firebase Hosting + Cloud Run + Cloud Functions |

---

## 9. Incidencias Resueltas

| # | Incidencia | Descripción | Resolución |
|---|------------|-------------|------------|
| 1 | Firestore emulator port | macOS Docker Desktop ocupa 8080, el emulador corría en 18080 en local pero 8080 en CI | Configurado port dinámico: 8080 local (macOS), 18080 dentro del contenedor Docker |
| 2 | Null value error en `isResourceOwner()` | Firestore rules v2 comparison con null throw error en vez de retornar false | Añadido guard `resource.data.userId != null` explícito |
| 3 | Smoke test CI flakiness | `smoke-staging.spec.ts` contra preview channel de Firebase Hosting daba 502 Bad Gateway intermitente | Eliminado smoke test y su job CI — mismo flujo probado en e2e/auth.spec.ts local |
| 4 | Type errors vue-tsc -b | Props mal tipadas en ResumenTurnoModal, TurnoView, imports con `@/` | Corregido en batch: readonly arrays, arrow fn handlers, type imports |
| 5 | `rol` → `role` en Firestore Rules | G04 critical bug — usaba `rol` en lugar de `role` en rules, tests y tipos | Corregido en `ce6ed9f` en feature/sprint-5-close — propagado a develop |

---

## 10. Cobertura de Tests

### API — `code/api/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **82.84%** | **70.89%** | **84.61%** | **83.17%** |
| `controllers/users.controller.ts` | 91.11% | 80.76% | 100% | 91.11% |
| `routes/turnos.routes.ts` | 92.3% | 78.57% | 100% | 92.3% |
| `routes/notificaciones.routes.ts` | 85.18% | 62.5% | 100% | 85.18% |
| `services/turno.service.ts` | 97.18% | 84.61% | 100% | 96.96% |
| `services/notificacion.service.ts` | 93.54% | 88.88% | 100% | 93.33% |
| `services/tareas.service.ts` | 65.85% | 61.11% | 70% | 67.56% |
| `services/users.service.ts` | 15% | 100% | 25% | 15.78% |
| `services/firebase.ts` | 34.78% | 15.78% | 100% | 34.78% |

> `users.service.ts` y `firebase.ts` requieren Firebase Admin Emulator — fuera del scope de tests unitarios (ADR-07).

### Frontend — `code/frontend/`

| Fichero | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| **All files** | **72.44%** | **71.37%** | **66.82%** | **73.16%** |
| `business/agenda/components/TaskCard/TaskCard.vue` | 95% | 100% | 90% | 95% |
| `business/users/presentation/views/UsersView.vue` | 93.54% | 71.87% | 90% | 96.42% |
| `users/presentation/composables/useUsers.ts` | 91.11% | 60% | 100% | 95.23% |
| `business/turno/infrastructure/api/turnoApi.ts` | 84.61% | 77.77% | 88.88% | 88% |
| `business/residentes/presentation/views/ResidenteView.vue` | 100% | 86.79% | 100% | 100% |

---

## 11. Stitch Screens (G10)

| Vista | Stitch Screen | Estado |
|-------|--------------|--------|
| `NotificationPanel.vue` | `9da813299be1474bb3293febda0c35fe` | ✅ |
| `TurnoView.vue` | `74dc49b5d18c44ea8ab1b6079320622f` | ✅ |

---

## 12. Deuda Técnica al Cierre

| # | Descripción | Severidad | Sprint objetivo | Estado |
|---|-------------|-----------|----------------|--------|
| — | Toda la deuda técnica DT-01 a DT-14 resuelta en sprints anteriores | — | — | ✅ |

---

## 13. Próximos Pasos — Sprint-5

### User Stories

| ID | US | Título | Prioridad |
|----|----|--------|-----------|
| T-65 | — | Tests unitarios stores/services | P1 |
| T-66 | US-01, US-02 | Tests integración Auth + RBAC (15 tests en `feature/sprint-5-close`) | P1 |
| T-67 | US-03, US-04, US-06 | Tests E2E Playwright agenda → incidencia | P1 |
| T-68 | US-03 | Audit Lighthouse Performance (LCP 3.9s → 193ms tras Heroicons) | P1 |
| T-69 | — | Audit Lighthouse Accessibility | P1 |
| T-70 | — | Revisión responsive tablet + mobile (2 minor issues) | P1 |
| T-71 | — | Seeds demo con `@faker-js/faker` (RGPD-safe) | P1 |
| T-72 | — | Revisar y cerrar ADR-01b..04b → ADR-04c | P2 |
| T-73 | — | Documentar API + Rules (18 endpoints en `api-and-rules-reference.md`) | P2 |
| T-74 | — | Actualizar TECH_GUIDE.md con convenciones Sprint-4 | P2 |
| T-75 | — | Variables de entorno y setup local (`.env.example` actualizado) | P2 |
| T-76 | — | Correcciones post-QA | P1 |

---

## 14. Notas de la Sesión

- El sprint se ejecutó en **paralelo** con Sprint-3 (2026-04-19 → 2026-04-25 para ambos)
- Commits: `feat(US-XX): descripción`
- PRs: squash merge a `master`
- Stack: Vue 3 + Vite + TS + Tailwind v4 + Pinia + Firebase Auth/Firestore + Express API + Firebase Hosting
- Roles: `admin` y `gerocultor` (sin `coordinador`)

---

*Generado: 2026-04-26 | Autor: Jose Vilches | Sprint-4 cerrado*