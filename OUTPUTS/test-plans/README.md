# OUTPUTS/test-plans — Planes de test

> Un archivo por user story. Generados por el Tester Agent.
> Formato: `test-plan-US-XX.md`
>
> **G03 — No feature sin test plan**: El Reviewer no puede aprobar una US sin su plan de tests correspondiente.

---

## Cobertura de test plans

| US  | Archivo                              | Estado |
|-----|--------------------------------------|--------|
| US-01 | `test-plan-US-01.md` — Login          | ✅ Listo |
| US-02 | `test-plan-US-02.md` — Control acceso | ✅ Listo |
| US-03 | `test-plan-US-03.md` — Agenda diaria   | ✅ Listo |
| US-04 | `test-plan-US-04.md` — Estado tarea    | ✅ Listo |
| US-05 | `test-plan-US-05.md` — Ficha residente | ✅ Listo |
| US-06 | `test-plan-US-06.md` — Registro incidencia | ✅ Listo |
| US-07 | `test-plan-US-07.md` — Historial incidencias | ✅ Listo |
| US-08 | `test-plan-US-08.md` — Notificaciones   | ✅ Listo |
| US-09 | `test-plan-US-09.md` — Alta residente   | ✅ Listo |
| US-10 | `test-plan-US-10.md` — Gestión usuarios | ✅ Listo |
| US-11 | `test-plan-US-11.md` — Resumen turno    | ✅ Listo |
| US-12 | `test-plan-US-12.md` — Agenda semanal   | ✅ Listo |
| US-13 | `test-plan-US-13.md` — Health check    | ✅ Listo |

**Cobertura**: 13/13 US con test plan. G03 satisfecho.

---

## Formato de cada archivo

Cada `test-plan-US-XX.md` contiene:
- **Casos de prueba** con ID, descripción, precondiciones, pasos, resultado esperado
- **Cobertura de criterios de aceptación** (CA de `SPEC/user-stories.md`)
- **Tipos de prueba**: unitarias, integración, E2E según corresponda

---

## Generación de un nuevo test plan

Usar el skill `sdd-verify` o invocar el prompt `PROMPTS/testing/generate_tests.md` con la US correspondiente.

---

*Última actualización: 2026-04-25 — README corregido*
