# Sprint Activo — Sprint-6

> **Sprint-6: Memoria académica + Presentación + Cierre**
> **Fechas**: 2026-04-26 → 2026-05-18
> **Deadline académico**: 2026-05-18

> **Estado**: En curso. Sprint-3, Sprint-4 y Sprint-5 cerrados.

---

## Objetivo del Sprint

Memoria académica DAW (GeroCare), slides de presentación y video demo:
- **T-77**: Portada y primera página reales (Jose Vilches / ANDRES MARTOS GAZQUEZ / CIPFP Batoi / 2025-2026)
- **T-78..T-84**: Secciones de la memoria (introducción, diseño, tecnologías, implementación, pruebas, conclusiones)
- **T-85**: Slides de presentación
- **T-86**: Video demo de la aplicación
- **T-87**: Revisión final y entrega
- **T-94**: Reescribir placeholders de la memoria (stack Vue/Firebase, no React/Supabase)
- **T-95**: Regenerar `.docx` desde plantilla con metadatos correctos

---

## Deuda Técnica — Estado Final (pre-Sprint-6)

| ID | Descripción | Estado |
|----|-------------|--------|
| DT-01..DT-14 | Toda la deuda técnica de Sprint-0 a Sprint-5 | ✅ Resuelta |
| — | Ninguna deuda técnica pendiente | — |

---

## Estado de Sprint-5 (cerrado)

| Métrica | Valor |
|---------|-------|
| **Duración real** | 2026-04-19 → 2026-04-25 |
| **Tests** | 476 total (143 API + 285 FE + 48 Firestore Rules), 0 fallos |
| **Cobertura API** | 81.13% stmts / 68.78% branch / 84.41% functions |
| **Cobertura Frontend** | 72.56% stmts / 71.6% branch / 66.82% functions |
| **Lighthouse LCP** | 3.9s → 193ms (RNF-02 ✅) |
| **Docs** | api-and-rules-reference.md, lighthouse reports, responsive review |
| **ADRs** | ADR-04c production deployment |

---

## Notas del Sprint

- Todas las PRs usan **squash merge** a `master`.
- Commits: `feat(US-XX): descripción`.
- G10: toda vista nueva requiere pantalla Stitch referenciada en `OUTPUTS/technical-docs/design-source.md`.
- G01: no implementar código sin US en SPEC/.
- `any` prohibido en TypeScript.
- Roles: exactamente `admin` y `gerocultor` (sin `coordinador`).
- Memoria: Checklist en `OUTPUTS/academic/README.md` — ninguna sección puede tener placeholders del stack antiguo.

*Última actualización: 2026-04-27 — Sprint-5 cerrado; Sprint-6 en curso.*