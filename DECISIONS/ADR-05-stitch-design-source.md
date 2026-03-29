# ADR 05: Stitch como fuente de diseño visual y exports en repositorio

## Status
ACCEPTED

## Context
El proyecto necesita una fuente de verdad **visual** para pantallas y sistema de diseño, alineada con el deadline DAW y el trabajo con agentes de IA (MCP Stitch en Cursor). Sin convención explícita, el riesgo es divergencia entre mockups, código y SPEC, o capturas con datos sensibles mezclados con el repositorio.

## Decision
1. **Google Stitch** es la herramienta autorizada para iterar diseños (proyectos, pantallas, variantes, design system de referencia).
2. Los **exports estáticos** (imágenes o PDF) se versionan en el repositorio bajo `OUTPUTS/design-exports/`, con nombres normalizados.
3. La **trazabilidad** Stitch ↔ archivos locales ↔ historias/requisitos se mantiene en `OUTPUTS/technical-docs/design-source.md`.
4. **SPEC/** (incl. `entities.md`, `user-stories.md`, `flows.md`, `api-contracts.md`) sigue siendo la fuente de verdad de **comportamiento y dominio**. Si un diseño en Stitch implica un cambio funcional, se actualiza SPEC antes o junto con el código (guardrail G06).

## Naming convention (exports)
Archivos bajo `OUTPUTS/design-exports/`:

```
US-XX-short-slug__stitch-screen-label__YYYYMMDD.ext
```

- `US-XX`: historia de usuario principal asociada (o `SPEC` si es transversal, p. ej. design system).
- `short-slug`: kebab-case breve (ej. `daily-agenda`).
- `stitch-screen-label`: etiqueta legible de la pantalla en Stitch, normalizada a kebab-case.
- `YYYYMMDD`: fecha del export o de la revisión de diseño a la que corresponde la captura.
- `ext`: preferible **`.webp`** o **`.png`**; **`.pdf`** opcional para entregables de memoria.

Ejemplo: `US-12-daily-agenda__shift-handoff__20260328.webp`

## Alternatives considered
- **Solo Stitch en la nube (sin exports en git)**  
  - Pro: menos peso en el repo.  
  - Contra: memoria DAW y revisiones dependen de acceso externo y del historial de Stitch.
- **Figma u otra herramienta como fuente única**  
  - Pro: estándar en industria.  
  - Contra: no es la herramienta ya integrada vía MCP en el flujo actual del proyecto.

## Rationale
Stitch + exports en git combina iteración rápida con **evidencia versionada** para tribunal y para agentes (Reviewer/Writer). La convención de nombres une diseño, US y fecha sin ambigüedad.

## Consequences and migration notes
- **Repositorio**: crecimiento por binarios; si el volumen aumenta mucho, valorar **Git LFS** (documentado en `OUTPUTS/design-exports/README.md`).
- **Privacidad**: solo datos **ficticios** en mockups y capturas; nunca PII real de residentes (coherente con ADR-04 y RGPD).
- **No commitear** claves API, tokens ni `.env` junto a diseños.

## Policy de actualización de exports
- **Por defecto**: ante un cambio relevante de diseño en Stitch, añadir un **nuevo** archivo con un `YYYYMMDD` actualizado (o sufijo `_r2`, `_r3` si varios exports el mismo día) y actualizar `design-source.md`.
- **Reemplazo in-place** del mismo nombre solo si se documenta explícitamente en `design-source.md` (motivo + fecha).

## Acceptance criteria
- [x] Existe al menos un export en `OUTPUTS/design-exports/` que siga la convención de nombres.
- [x] `OUTPUTS/technical-docs/design-source.md` referencia ese export y el proyecto/pantalla Stitch correspondientes.
- [x] `TECH_GUIDE.md` enlaza este ADR y las rutas anteriores.
- [x] Estado del ADR pasado a **ACCEPTED** cuando se cumplan los criterios anteriores.

## Referencias
- [ADR-01](ADR-01-frontend.md) — stack frontend y PWA.
- [ADR-04](ADR-04-deployment-rgpd.md) — RGPD y despliegue.
- `SPEC/constraints.md`, `SPEC/user-stories.md`, `SPEC/flows.md`
