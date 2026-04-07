# PROMPTS/development/generate_feature.md — DEVELOPER Feature Prompt

> **Audience**: DEVELOPER agent
> **Trigger**: Starting implementation of a user story from SPEC/
> **Guardrails active**: G01, G03, G06, G08, G10

---

## Context to load before starting

1. Read the user story: `SPEC/user-stories.md` → find `US-XX`
2. Read entity definitions: `SPEC/entities.md`
3. Read API contracts (if applicable): `SPEC/api-contracts.md`
4. Read the technical guide: `TECH_GUIDE.md`
5. Read relevant ADRs in `DECISIONS/` for the stack being used

---

## 🎨 Paso 0 — Verificar fuente de verdad visual (OBLIGATORIO para vistas Vue)

Antes de escribir cualquier `.vue` o CSS:

1. Abre `OUTPUTS/technical-docs/design-source.md`
2. Localiza la fila de la vista que vas a implementar en la tabla "Vista ↔ Pantalla Stitch"
3. Abre el PNG correspondiente en `OUTPUTS/design-exports/`
4. Implementa fielmente ese diseño: colores, layout, tipografía, spacing
5. Si la vista no está en la tabla → STOP. Crea la pantalla en Stitch primero, expórtala y añade la fila a design-source.md

**Nunca inventes estilos. Stitch es la fuente de verdad visual (ADR-05).**

---

## Implementation steps

1. Confirm the test plan exists: `OUTPUTS/test-plans/test-plan-US-XX.md` (G03)
2. Confirm the user story is in `SPEC/user-stories.md` (G01)
3. Implement the feature following the SPEC and the Stitch design (G10)
4. Do NOT add any feature not listed in SPEC/ (G06)
5. Document any shortcuts taken in `LOGS/` or the relevant ADR (G07)

---

## Commit format (mandatory)

```
feat(US-XX): short description

[optional body — what was done and why]

Refs: US-XX
```

> G08: every `feat` commit MUST include the `US-XX` scope. See AGENTS.md Commit Convention.

---

## Output

Return an implementation note with:
- Files created / modified
- Any deviations from the spec (if none, say "None")
- Any technical debt logged
- Stitch screen reference used (Vista ↔ Pantalla mapping row)
