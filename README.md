# gerocultores-system — Sistema de Gestión de Desarrollo

> Sistema agéntico local para gestionar el ciclo completo de desarrollo de software:
> desde requisitos hasta código, tests y documentación académica.
> Inspirado en la arquitectura de personal-brand-system.

## Propósito

Centraliza toda la información del proyecto en una fuente de verdad única (SPEC/)
y la transforma en artefactos concretos: código revisado, tests, documentación
técnica y memoria académica, usando agentes con responsabilidades separadas.

## Flujo operativo

[RAW INPUT]       [PROCESAMIENTO]          [OUTPUT]
     │                  │                     │
Entrevista  →   Collector Agent  →   SPEC/ (requisitos)
                       ↓
               Architect Agent  →   DECISIONS/ (ADRs)
                       ↓
                Planner Agent   →   PLAN/ (backlog + sprint)
                       ↓
               Developer Agent  →   código (en el repo del proyecto)
                       ↓
               Reviewer Agent   →   aprobación o lista de issues
                       ↓
                Tester Agent    →   OUTPUTS/test-plans/
                       ↓
                Writer Agent    →   OUTPUTS/academic/

## Arquitectura

```
gerocultores-system/
├── README.md
├── PROJECT_BRIEF.md        ← visión, alcance y posicionamiento
├── TECH_GUIDE.md           ← convenciones técnicas y de código
├── SPEC/                   ← fuente de verdad de requisitos
├── DECISIONS/              ← ADRs y decisiones técnicas
├── PLAN/                   ← backlog y sprints
├── OUTPUTS/                ← artefactos generados
├── PROMPTS/                ← prompts reutilizables por agente
├── AGENTS/                 ← definición del modelo agéntico
├── WORKFLOWS/              ← pipelines de ejecución
└── LOGS/                   ← trazabilidad de decisiones y cambios
```

## Estado del sistema

| Componente             | Estado              |
|------------------------|---------------------|
| Estructura base        | ✅ Inicializada     |
| SPEC/ (requisitos)     | 🔲 Pendiente Fase 2 |
| PLAN/ (backlog)        | 🔲 Pendiente Fase 4 |
| DECISIONS/ (ADRs)      | 🔲 Pendiente Fase 5 |
| OUTPUTS/academic/      | 🔲 Pendiente        |
| OUTPUTS/test-plans/    | 🔲 Pendiente        |

*Inicializado: 2026-03-28*
