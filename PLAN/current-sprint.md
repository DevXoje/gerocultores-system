# Sprint Activo — Sprint-3

> **Sprint-3: Features US-04, US-05, US-06**
> Fechas: 2026-04-19 → 2026-05-02 (2 semanas)
> Deadline académico: 2026-05-18

> **Estado**: Activo. Deuda técnica Sprint-2 resuelta. Backend de US-05 y US-06 completado.

---

## Objetivo del Sprint

Implementar las tres user stories del núcleo funcional de GeroCare:
- **US-04**: Actualizar estado de una tarea (frontend)
- **US-05**: Consulta de ficha de residente
- **US-06**: Registro de incidencia

---

## Deuda Técnica — Estado Final (pre-Sprint-3)

| ID | Descripción | Estado |
|----|-------------|--------|
| DT-01, 02, 03, 04, 05, 06, 08, 09, 12, 14 | Múltiples items de deuda técnica, tests y CI | ✅ Resueltos (PR #20 al #48) |
| DT-07 | Smoke test automatizado post-deploy en CI | 🔲 Diferido (Sprint-4) |

---

## Work Items del Sprint-3

| ID | Tarea | US ref | Estado |
|----|-------|--------|--------|
| T-S3-01 | Frontend: conectar `TaskCard` con `PATCH /api/tareas/:id/estado` | US-04 | 🔲 PENDIENTE |
| T-S3-02 | Frontend: vista `ResidenteView` — ficha de residente | US-05 | 🔲 PENDIENTE |
| T-S3-03 | API: endpoint `GET /api/residentes/:id` | US-05 | ✅ COMPLETADO (PR #49) |
| T-S3-04 | Frontend: formulario de registro de incidencia | US-06 | 🔲 PENDIENTE |
| T-S3-05 | API: endpoint `POST /api/incidencias` | US-06 | ✅ COMPLETADO (PR #50) |
| T-S3-06 | Test plans US-05 y US-06 | US-05, US-06 | ✅ COMPLETADO (engram) |

---

## Notas del Sprint

- Todas las PRs usan **squash merge** a `master`.
- Commits: `feat(US-XX): descripción`.
- G10: toda vista nueva requiere pantalla Stitch referenciada en `OUTPUTS/technical-docs/design-source.md` (Añadidas en PR #48).
- G01: no implementar código sin US en SPEC/.
- `any` prohibido en TypeScript.
- Collection names siempre desde constante `COLLECTIONS`.

*Última actualización: 2026-04-19 — Backend de US-05 y US-06 completado.*
