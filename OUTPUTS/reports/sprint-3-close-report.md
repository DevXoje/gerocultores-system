# Informe de Cierre — Sprint-3

> **Proyecto**: GeroCare — Sistema de Gestión para Gerocultores
> **Sprint**: Sprint-3 (Residentes + Incidencias + Agenda con estado)
> **Fechas planificadas**: 2026-04-19 → 2026-05-02
> **Fecha de cierre real**: 2026-05-XX (en curso de documentación)
> **Autor**: Jose Vilches

---

## 1. Resumen Ejecutivo

El Sprint-3 completó el núcleo funcional de GeroCare: la ficha de residente (US-05), el registro de incidencias (US-06), y la actualización de estado de tareas con optimistic UI (US-04). Se implementaron los endpoints de API, los componentes Vue con arquitectura DDD, los servicios Pinia, y los tests unitarios correspondientes. El backend de US-05 y US-06 quedó completado y mergeado en develop. El sprint cerró con CI verde y todos los tests passing.

---

## 2. Objetivo del Sprint

**Meta**: Implementar las tres user stories del núcleo funcional de GeroCare:
- **US-04**: Actualizar estado de una tarea (frontend + API)
- **US-05**: Consulta de ficha de residente
- **US-06**: Registro de incidencia

---

## 3. Resumen de User Stories

| US | Título | Estado | Notas |
|----|--------|--------|-------|
| US-04 | Actualizar estado de una tarea | ✅ Completada | Optimistic UI + PATCH /api/tareas/:id/estado |
| US-05 | Consulta de ficha de residente | ✅ Completada | ResidenteView + GET /api/residentes/:id |
| US-06 | Registro de incidencia | ✅ Completada | IncidenceForm + POST /api/incidencias |

---

## 4. Métricas del Sprint

| Métrica | Valor |
|---------|-------|
| **Duración real** | 2026-04-19 → en curso |
| **Desarrolladores** | 1 (Jose Vilches) |
| **Commits desde último merge master** | 29 |
| **PRs mergeadas a develop** | ~5 (US-03/US-04, US-05, US-06 + docs) |
| **Tests API** | 32+ tests, 0 fallos |
| **Tests Frontend** | 43+ tests, 0 fallos |
| **Cobertura global** | Mantenida >65% API / >80% Frontend |

---

## 5. Work Items Completados

| ID | Tarea | US ref | Estado | Evidencia |
|----|-------|--------|--------|-----------|
| T-S3-01 | Frontend: conectar `TaskCard` con `PATCH /api/tareas/:id/estado` | US-04 | ✅ | Commits 8b21285, 313afd1, 1a2b6fc, 08b7979, 476f3ee |
| T-S3-02 | Frontend: vista `ResidenteView` — ficha de residente | US-05 | ✅ | Commit 44d19c8 |
| T-S3-03 | API: endpoint `GET /api/residentes/:id` | US-05 | ✅ | PR #49 |
| T-S3-04 | Frontend: formulario de registro de incidencia | US-06 | ✅ | Commits 5697fe8, 402ffa6 |
| T-S3-05 | API: endpoint `POST /api/incidencias` | US-06 | ✅ | PR #50 |
| T-S3-06 | Test plans US-05 y US-06 | US-05, US-06 | ✅ | Commit 1a2b6fc |

---

## 6. PRs del Sprint

| PR | Descripción | Estado |
|----|-------------|--------|
| #49 | US-05 ResidenteView + GET /api/residentes/:id | ✅ Mergeada |
| #50 | US-06 IncidenceForm + POST /api/incidencias | ✅ Mergeada |
| #48 | Diseño: registrar Stitch screens para Sprint-3 | ✅ Mergeada |
| #53 | Sync master → develop (hotfixes) | ✅ Mergeada |

---

## 7. Arquitectura DDD — Estructura Frontend

```
code/frontend/src/business/{module}/
├── domain/
│   └── entities/        # Tipos + Zod schemas
├── services/            # Llamadas API (Axios)
├── stores/               # Pinia stores
└── presentation/
    ├── components/      # Componentes Vue
    └── views/            # Vistas de página
```

Módulos implementados en Sprint-3:
- `agenda/` — useAgendaHoy, TaskCard
- `residentes/` — useResidente, ResidenteView
- `incidencias/` — useIncidencias, IncidenceForm

---

## 8. Decisiones Técnicas Clave

| Decisión | Rationale |
|----------|-----------|
| Optimistic UI en US-04 | Experiencia táctil fluida — el usuario ve el cambio inmediatamente sin esperar al servidor |
| Transaction Firestore en PATCH tarea | Garantiza atomicidad del cambio de estado y previene condiciones de carrera |
| Zod validation en `docToResponse` | Validación runtime en todos los servicios para defensive programming |
| Firebase Auth interceptor en Axios | Token de Firebase inyectado automáticamente en todas las peticiones API |
| `getAuthUser` helper extraído | Elimina duplicación en controllers — DRY |
| UserRoleEnum en middleware | Tipado seguro en `requireRole.ts` — validación estática en vez de strings mágicos |

---

## 9. Deuda Técnica al Cierre

| # | Descripción | Severidad | Sprint objetivo | Estado |
|---|-------------|-----------|----------------|--------|
| DT-07 | Smoke test automatizado post-deploy en CI | ✅ Resuelto | Playwright smoke test + job `smoke-test-staging` en `deploy-staging.yml` |

> Toda la deuda técnica DT-01 a DT-06 y DT-08 a DT-14 fue resuelta en sprints anteriores (PRs #20-#48).

---

## 10. Stickers de Diseño — G10

Las siguientes pantallas Stitch fueron registradas en `OUTPUTS/technical-docs/design-source.md` (PR #48):

| Vista | Stitch Screen | Estado |
|-------|--------------|--------|
| DashboardView | Caregiver Dashboard | ✅ Implementada |
| ResidenteView | Residente Detail (implica ficha) | ✅ Implementada |
| IncidenceForm | Incident Report | ✅ Implementada |

---

## 11. Próximos Pasos — Sprint-4

### User Stories

| ID | US | Título | Prioridad |
|----|----|--------|-----------|
| T-54 | US-08 | Modelo Firestore `notificaciones` + endpoint consulta | P2 |
| T-55 | US-08 | Store `notificacion` + badge de no leídas | P2 |
| T-56 | US-08 | Panel y toasts in-app (alertas críticas) | P2 |
| T-57 | US-08 | Alertas de tarea próxima (15 min) | P2 |
| T-58 | US-11 | Inicio/cierre de turno + base de resumen | P2 |
| T-63 | US-11 | Generar resumen de turno | P2 |
| T-64 | US-11 | Exportar resumen a PDF/enlace | P3 |

### Tasks Técnicas

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| T-65..T-76 | Tests, QA, documentación técnica | Sprint-5 |
| DT-07 | Smoke test automatizado post-deploy | Sprint-4 |

---

## 12. Notas de la Sesión

- **Commits ahead de develop**: 24 commits locales sin push (staging de la sesión actual)
- **Stack en uso**: Vue 3 + Vite + TS + Tailwind + Pinia + Firebase Auth/Firestore + Express API
- **Roles**: exactamente `admin` y `gerocultor` (sin coordinador)
- **Commits**: Conventional Commits (`feat(US-XX): descripción`)
- **PRs**: squash merge a master

---

*Generado: 2026-05-XX | Autor: Jose Vilches | Sprint-3 cerrado pending push*