# AGENTS — Contratos de inputs y outputs

## COLLECTOR
Input requerido: contexto de la sesión, prompt de entrevista activo.
Output garantizado: notas brutas en LOGS/, lista de gaps identificados.

## ARCHITECT
Input requerido: decisión técnica a documentar (contexto, opciones, criterios).
Input opcional: SPEC/constraints.md, ADRs existentes para coherencia.
Output garantizado: ADR en DECISIONS/ con estado PROPOSED | ACCEPTED | SUPERSEDED.

## PLANNER
Input requerido: SPEC/requirements.md o SPEC/user-stories.md actualizados.
Input opcional: velocidad estimada, restricciones de tiempo.
Output garantizado: PLAN/backlog.md actualizado, PLAN/current-sprint.md generado.

## DEVELOPER
Input requerido: user story de SPEC/, ADRs relevantes, TECH_GUIDE.md.
Input opcional: contexto de código existente, decisiones de sprint.
Output garantizado: código implementado + notas de implementación para Reviewer.
Output condicional: propuesta de ADR si tomó una decisión técnica durante la implementación.

## REVIEWER
Input requerido: código a revisar, user story asociada, guardrails.md.
Input opcional: ADRs relevantes, historial de reviews anteriores.
Output garantizado: decisión (APPROVED | NEEDS_REVISION | BLOCKED) + lista de issues.

## TESTER
Input requerido: user story o requisito de SPEC/
Output garantizado: plan de tests en OUTPUTS/test-plans/ con casos happy path + edge cases.

## WRITER
Input requerido: sección a redactar, fuentes en SPEC/ o DECISIONS/ o código.
Output garantizado: borrador en OUTPUTS/academic/ o OUTPUTS/technical-docs/.
