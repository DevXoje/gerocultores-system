# Bootstrap de Entorno — Sistema de Gestión de Desarrollo

> **Qué es esto**: Runbook con 5 prompts listos para pegar en un agente de IA (GitHub Copilot,
> Claude, etc.) que generan el entorno completo de gestión de tu proyecto de software,
> de forma incremental y trazable.
>
> **Filosofía**: Mismo patrón que `personal-brand-system` — fuente de verdad única (`SPEC/`),
> agentes con responsabilidades separadas, guardrails no negociables, outputs trazables.
>
> **Tiempo estimado**: 30-40 minutos en total (primera ejecución completa).

---

## Antes de empezar: rellena las variables

Edita los valores de la segunda columna. A partir de la Fase 2 el agente ya los leerá de
los archivos que creó la Fase 1, pero necesitas pasárselos en el primer prompt manualmente.

| Variable            | Valor                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------|
| `PROJECT_NAME`      | `gerocultores-system` ← nombre de la carpeta del sistema                                     |
| `PROJECT_PATH`      | ← ruta absoluta del directorio padre donde se crea la carpeta                                |
| `SW_DESCRIPTION`    | App para gerocultores: agenda diaria, gestión de residentes e incidencias. Tablet y móvil.   |
| `TECH_STACK`        | ← rellena cuando lo decidas; puede quedar vacío en Fase 1                                    |
| `ACADEMIC_CYCLE`    | `DAW`                                                                                         |
| `DEADLINE`          | `2026-05-18`                                                                                  |
| `SOLO`              | `true`                                                                                        |

---

## FASE 1 — Crear estructura del entorno

> **Cuándo**: Una vez, al inicio. Antes de escribir una sola línea de código.
> **Qué produce**: Toda la estructura de carpetas, archivos base, definiciones de agentes
> y guardrails. Ningún archivo tiene datos reales todavía — solo schemas y plantillas.
> **Siguiente paso**: Rellenar las variables de la tabla anterior y pegar el prompt a continuación.

---

```
Eres un agente de setup para un sistema de gestión de desarrollo de software.
Tu única tarea en esta sesión es crear la estructura completa del sistema según las
instrucciones que siguen. Lee TODO el prompt antes de crear cualquier archivo.

Datos del proyecto:
- PROJECT_NAME: gerocultores-system
- PROJECT_PATH: [RELLENA CON TU RUTA]
- SW_DESCRIPTION: App para gerocultores: agenda diaria, gestión de residentes e
  incidencias. Uso ágil en tablet y móvil. Historial por residente y alertas de
  incidencias críticas.
- ACADEMIC_CYCLE: DAW
- DEADLINE: 2026-05-18

Crea la siguiente estructura de archivos bajo PROJECT_PATH/PROJECT_NAME.
Para cada archivo, usa el esquema de contenido especificado exactamente.

─────────────────────────────────────────────────────────────
ARCHIVO: README.md
─────────────────────────────────────────────────────────────
# [PROJECT_NAME] — Sistema de Gestión de Desarrollo

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
PROJECT_NAME/
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

*Inicializado: [FECHA DE HOY]*

─────────────────────────────────────────────────────────────
ARCHIVO: PROJECT_BRIEF.md
─────────────────────────────────────────────────────────────
# PROJECT BRIEF

> Visión, alcance y contexto del proyecto. Fuente de referencia para todos los agentes.
> Equivalente a GOALS.md en personal-brand-system.

## Descripción del software

[SW_DESCRIPTION]

## Contexto académico

- **Ciclo**: [ACADEMIC_CYCLE]
- **Entrega**: [DEADLINE]
- **Modalidad**: Proyecto individual

## Usuarios objetivo

TODO: describir los usuarios reales (gerocultores, coordinadores, administradores...)

## Problema que resuelve

TODO: en 2-3 frases, el dolor concreto que elimina esta app.

## Alcance del TFG (MVP académico)

TODO: lista de funcionalidades que entran en la entrega mínima viable académica.

## Alcance de producto real (si aplica)

TODO: qué añadiría este sistema si se convirtiera en producto.

## Stack técnico

TODO: tecnologías confirmadas tras la Fase 5 (ADRs de stack).

## Restricciones

- Entrega: [DEADLINE]
- Equipo: solo
- Restricciones técnicas: consultar SPEC/constraints.md

*Última actualización: [FECHA DE HOY]*

─────────────────────────────────────────────────────────────
ARCHIVO: TECH_GUIDE.md
─────────────────────────────────────────────────────────────
# TECH GUIDE — Convenciones técnicas

> El Developer Agent debe leer este archivo antes de generar cualquier código.
> El Reviewer Agent lo usa para validar que el código generado es consistente.

## 1. Convenciones de código

TODO: después de decidir el stack, documentar aquí:
- Nomenclatura de variables, funciones, componentes
- Estructura de carpetas del proyecto
- Convenciones de imports
- Estilo de comentarios

## 2. Gestión de estado

TODO: patrón de gestión de estado elegido y razón (referencia al ADR correspondiente).

## 3. API y comunicación

TODO: patrón de comunicación cliente-servidor, manejo de errores.

## 4. Testing

TODO: framework de tests, convenciones de nomenclatura de tests, coverage mínimo.

## 5. Seguridad y datos

- No almacenar datos sensibles de residentes en localStorage o sessionStorage.
- Toda PII (datos de residentes) debe pasar por la capa de autenticación.
- TODO: política de autenticación (referencia al ADR correspondiente).

## 6. Anti-patrones prohibidos

| Anti-patrón                          | Alternativa                              |
|--------------------------------------|------------------------------------------|
| Lógica de negocio en componentes UI  | Separar en servicios o composables       |
| Hardcodear IDs o rutas               | Usar constantes o variables de entorno   |
| Fetch sin manejo de errores          | Envolver en try/catch con tipo de error  |
| Componentes de más de 200 líneas     | Dividir en componentes más pequeños      |

*Última actualización: [FECHA DE HOY]*

─────────────────────────────────────────────────────────────
ARCHIVO: AGENTS/roles.md
─────────────────────────────────────────────────────────────
# AGENTS — Definición de roles

> Cada agente tiene una responsabilidad única y no puede excederla.
> La separación de responsabilidades hace el sistema predecible y auditable.

## COLLECTOR
**Propósito**: Extraer requisitos y contexto del proyecto mediante entrevista estructurada.
No interpreta, no diseña, no descarta.
**Prompt base**: PROMPTS/setup/interview_requirements.md
**Produce**: Notas brutas en LOGS/ para el Structurer.

## ARCHITECT
**Propósito**: Convertir decisiones técnicas en ADRs formales. Validar que el diseño
cumple los requisitos y constraints del proyecto.
**Prompt base**: PROMPTS/development/generate_adr.md
**Produce**: Archivos en DECISIONS/

## PLANNER
**Propósito**: Convertir SPEC/ en user stories priorizadas, backlog y sprints.
No añade scope — solo organiza lo que ya está en SPEC/.
**Prompt base**: PROMPTS/setup/plan_initial_backlog.md
**Produce**: PLAN/backlog.md y PLAN/current-sprint.md actualizados.

## DEVELOPER
**Propósito**: Implementar features siguiendo SPEC/, ADRs y TECH_GUIDE.md.
Genera código real en el repo del proyecto, no en este sistema.
**Prompt base**: PROMPTS/development/generate_feature.md
**Produce**: Código + notas de implementación para el Reviewer.

## REVIEWER
**Propósito**: Validar que el código implementado cumple SPEC/, TECH_GUIDE y guardrails.
Decide APPROVED | NEEDS_REVISION | BLOCKED.
**Prompt base**: PROMPTS/development/review_feature.md
**Produce**: Informe en LOGS/ + decisión por feature.

## TESTER
**Propósito**: Generar plan de tests y casos de prueba desde las user stories de SPEC/.
**Prompt base**: PROMPTS/testing/generate_tests.md
**Produce**: Archivos en OUTPUTS/test-plans/

## WRITER
**Propósito**: Generar documentación técnica y secciones de la memoria académica
a partir de SPEC/, DECISIONS/ y código existente.
**Prompt base**: PROMPTS/academic/write_memory_section.md
**Produce**: Archivos en OUTPUTS/academic/ y OUTPUTS/technical-docs/

─────────────────────────────────────────────────────────────
ARCHIVO: AGENTS/guardrails.md
─────────────────────────────────────────────────────────────
# AGENTS — Guardrails (restricciones no negociables)

> Aplican a todos los agentes sin excepción.

## G01 — Sin código sin requisito
Ningún Developer puede implementar algo que no tenga una user story o requisito
en SPEC/. Si falta el requisito, el Developer deve crear primero la user story
y esperar aprobación implícita antes de implementar.

## G02 — Sin decisión técnica sin ADR
Toda decisión técnica relevante (elección de framework, patrón de arquitectura,
estrategia de autenticación, política de datos) debe tener un ADR en DECISIONS/.
"Relevante" significa: si alguien pregunta "¿por qué X?", la respuesta no es obvia.

## G03 — Sin feature sin test plan
El Reviewer no puede aprobar una feature si no existe un documento en
OUTPUTS/test-plans/ que describa cómo se va a testear.

## G04 — Consistencia de entidades
Los nombres y tipos de los campos de las entidades del dominio deben ser
idénticos en SPEC/entities.md, SPEC/api-contracts.md y en el código.
No pueden existir aliases o renombres entre capas.

## G05 — Sin valores hardcodeados sensibles
Variables de entorno, claves de API, IDs de base de datos y URLs de producción
nunca van directamente en el código. El Developer debe usar variables de entorno
o archivos de configuración explícitos.

## G06 — Scope lock
El Developer y el Planner no pueden añadir features que no estén en SPEC/
sin una notificación explícita al desarrollador humano. Si detectan scope creep,
lo registran en LOGS/ y detienen la implementación.

## G07 — Sin deuda técnica oculta
Si el Developer toma un atajo técnico por time pressure, debe documentarlo en el
ADR correspondiente o en LOGS/. La deuda no documentada es deuda doble.

## G08 — Trazabilidad de commits
Cada feature implementada debe referenciar la user story correspondiente de SPEC/.
Formato recomendado en commits: "feat(US-XX): descripción"

## G09 — Cobertura académica
El Writer debe verificar que cada sección de la memoria del DAW tiene cobertura
en OUTPUTS/academic/ antes de marcar el pipeline académico como completo.
Referencia: lista de secciones requeridas en OUTPUTS/academic/README.md

─────────────────────────────────────────────────────────────
ARCHIVO: AGENTS/contracts.md
─────────────────────────────────────────────────────────────
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

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/README.md
─────────────────────────────────────────────────────────────
# SPEC — Fuente de verdad de requisitos

> Todo lo que existe en este directorio es verificable y acordado.
> Ningún agente puede generar código o documentación sin base en SPEC/.
> Equivalente a DATA/ en personal-brand-system.

## Reglas de este directorio

1. Solo requisitos acordados con el desarrollador humano.
2. Campos sin valor van como TODO: [descripción]. Nunca vacíos.
3. Las entidades de dominio son la única fuente canónica de nombres y tipos.
4. Toda modificación se registra en LOGS/CHANGELOG.md.

## Archivos

| Archivo          | Contenido                                      | Estado              |
|------------------|------------------------------------------------|---------------------|
| requirements.md  | Requisitos funcionales y no funcionales        | 🔲 Pendiente Fase 2 |
| user-stories.md  | Historias de usuario validadas con criterios   | 🔲 Pendiente Fase 3 |
| entities.md      | Entidades del dominio con campos y tipos       | 🔲 Pendiente Fase 2 |
| flows.md         | Flujos de usuario y de sistema                 | 🔲 Pendiente Fase 3 |
| api-contracts.md | Contratos de endpoints y schemas de respuesta  | 🔲 Pendiente Fase 5 |
| constraints.md   | Restricciones técnicas, académicas y negocio   | ✅ Inicializado     |

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/requirements.md
─────────────────────────────────────────────────────────────
# Requirements

> Fuente canónica de requisitos. Poblado en Fase 2 por el Structurer.
> No editar directamente — modificar solo a través del proceso Collector → Structurer.

## Requisitos funcionales

<!-- RF-01: plantilla
### RF-01 — [Nombre]
- **Descripción**: TODO
- **Actor**: TODO: Gerocultor | Coordinador | Administrador | Sistema
- **Prioridad**: TODO: Alta | Media | Baja
- **User Stories relacionadas**: TODO: US-XX
-->

TODO: poblar en Fase 2

## Requisitos no funcionales

<!-- RNF-01: plantilla
### RNF-01 — [Nombre]
- **Categoría**: TODO: Rendimiento | Seguridad | Usabilidad | Disponibilidad
- **Descripción**: TODO
- **Criterio de aceptación**: TODO: medible y verificable
-->

TODO: poblar en Fase 2

*Última actualización: [FECHA DE HOY] — inicialización*

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/user-stories.md
─────────────────────────────────────────────────────────────
# User Stories

> Historias de usuario validadas. Fuente de trabajo del Planner y del Developer.
> Formato: Como [actor], quiero [acción] para [beneficio].

<!-- Plantilla
### US-XX — [Nombre corto]
**Como** [actor], **quiero** [qué], **para** [para qué].

**Criterios de aceptación**:
- [ ] CA-1: TODO
- [ ] CA-2: TODO

**Requisitos relacionados**: RF-XX
**Priority**: TODO: Must | Should | Could
**Estado**: TODO: Backlog | In Progress | Done
-->

TODO: poblar en Fase 3 tras entrevista de requisitos.

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/entities.md
─────────────────────────────────────────────────────────────
# Entities — Entidades del dominio

> Fuente canónica de los nombres, tipos y relaciones de las entidades.
> Los nombres definidos aquí son obligatorios en código, API y base de datos.
> Cualquier alias o renombre es una violación del guardrail G04.

<!-- Plantilla de entidad
## [NombreEntidad]

| Campo     | Tipo     | Requerido | Descripción           |
|-----------|----------|-----------|-----------------------|
| id        | string   | sí        | Identificador único   |
| ...       | ...      | ...       | ...                   |

**Relaciones**:
- TODO: [NombreEntidad] tiene muchos [OtraEntidad]

**Reglas de negocio**:
- TODO: invariantes y validaciones
-->

TODO: poblar en Fase 2.

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/flows.md
─────────────────────────────────────────────────────────────
# Flows — Flujos de usuario y de sistema

> Descripción de los flujos principales. Fuente para el Developer y el Tester.

<!-- Plantilla
## [Nombre del flujo]

**Actor**: TODO
**Trigger**: TODO: qué inicia el flujo
**Precondición**: TODO: estado necesario antes de empezar

Pasos:
1. TODO
2. TODO
3. TODO

**Postcondición**: TODO: estado del sistema tras el flujo
**Flujos alternativos**: TODO: error states, caminos secundarios
-->

TODO: poblar en Fase 3.

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/api-contracts.md
─────────────────────────────────────────────────────────────
# API Contracts

> Contratos de los endpoints de la API. Fuente canónica para Developer y Tester.
> Debe ser consistente con SPEC/entities.md en nombres y tipos.

<!-- Plantilla de endpoint
## [MÉTODO] /ruta

**Descripción**: TODO
**Autenticación**: TODO: requerida | no requerida

**Request body** (si aplica):
```json
{
  "campo": "tipo"
}
```

**Response 200**:
```json
{
  "campo": "tipo"
}
```

**Response de error**:
| Código | Condición          |
|--------|--------------------|
| 400    | TODO               |
| 401    | TODO               |
| 404    | TODO               |
-->

TODO: poblar en Fase 5 tras definir el stack de API.

─────────────────────────────────────────────────────────────
ARCHIVO: SPEC/constraints.md
─────────────────────────────────────────────────────────────
# Constraints — Restricciones del proyecto

> Las restricciones son no negociables. El Architect y el Developer deben consultarlas
> antes de cualquier decisión técnica.

## Restricciones académicas (DAW)

- La entrega debe incluir una memoria técnica con los apartados requeridos por el ciclo.
- El proyecto debe demostrar uso de tecnologías web (frontend + backend o API).
- El código debe estar en un repositorio con historial de commits trazable.
- Deadline hard: 2026-05-18

## Restricciones de negocio

- El sistema debe funcionar en tablet y móvil (mínimo responsive; idealmente PWA o app web).
- Los datos de residentes son datos de salud — aplican restricciones de privacidad RGPD.
- La app debe poder funcionar en redes lentas (residencias sin fibra óptica).
- TODO: añadir restricciones adicionales tras la entrevista de requisitos.

## Restricciones técnicas

- TODO: versiones mínimas de navegadores o SO soportados.
- TODO: restricciones de hosting o despliegue.
- TODO: limitaciones de presupuesto para servicios cloud.

*Última actualización: [FECHA DE HOY]*

─────────────────────────────────────────────────────────────
ARCHIVO: DECISIONS/README.md
─────────────────────────────────────────────────────────────
# DECISIONS — Architecture Decision Records

> Registro de todas las decisiones técnicas relevantes del proyecto.
> Formato: ADR (Architecture Decision Record).

## Por qué documentar decisiones

Una decisión técnica no documentada se convierte en deuda de conocimiento.
Cuando el contexto cambia (o cuando el Developer es una IA), sin el ADR es imposible
saber si la decisión sigue siendo válida o si fue un compromiso temporal.

## Estados de un ADR

- **PROPOSED**: pendiente de revisión o de más información.
- **ACCEPTED**: decisión tomada y activa.
- **SUPERSEDED**: reemplazada por un ADR posterior (referencia cruzada).
- **DEPRECATED**: ya no aplica (por cambio de contexto o scope).

## Índice de ADRs

| ID     | Título                    | Estado   | Fecha      |
|--------|---------------------------|----------|------------|
| ADR-01 | ← primer ADR tras Fase 5  | PROPOSED | [FECHA]    |

## Cómo crear un ADR

Usar el prompt: PROMPTS/development/generate_adr.md
O copiar la plantilla: DECISIONS/adr-template.md

─────────────────────────────────────────────────────────────
ARCHIVO: DECISIONS/adr-template.md
─────────────────────────────────────────────────────────────
# ADR-XX — [Título de la decisión]

- **Estado**: PROPOSED | ACCEPTED | SUPERSEDED | DEPRECATED
- **Fecha**: YYYY-MM-DD
- **Contexto**: ← en una frase: qué problema obliga a tomar esta decisión

## Contexto

TODO: describir el contexto técnico o de negocio. Qué fuerzas están en juego.
Qué pasa si no se decide.

## Opciones consideradas

### Opción A — [Nombre]
TODO: descripción breve
- Pro: TODO
- Contra: TODO

### Opción B — [Nombre]
TODO: descripción breve
- Pro: TODO
- Contra: TODO

## Decisión

TODO: opción elegida y razón principal en 1-2 frases.

## Consecuencias

- TODO: qué se gana
- TODO: qué se sacrifica
- TODO: qué queda pendiente de validar

## Referencias
- SPEC/constraints.md → [constraint relacionado]
- ADR-XX (si reemplaza o relaciona)

─────────────────────────────────────────────────────────────
ARCHIVO: PLAN/backlog.md
─────────────────────────────────────────────────────────────
# Backlog

> Lista priorizada de work items. Fuente de verdad del Planner para sprints.
> Estados: Backlog | Ready | In Progress | Done | Cancelled

## Must Have (MVP académico)

| ID    | Historia / Tarea                        | Estimación | Estado  | Sprint |
|-------|-----------------------------------------|------------|---------|--------|
| US-01 | TODO: poblar en Fase 4                  | -          | Backlog | -      |

## Should Have (mejora del MVP)

| ID    | Historia / Tarea                        | Estimación | Estado  | Sprint |
|-------|-----------------------------------------|------------|---------|--------|

## Could Have (producto real)

| ID    | Historia / Tarea                        | Estimación | Estado  | Sprint |
|-------|-----------------------------------------|------------|---------|--------|

## Won't Have (fuera de scope)

| Idea                          | Razón de exclusión |
|-------------------------------|--------------------|
| TODO                          | TODO               |

*Última actualización: [FECHA DE HOY] — inicialización*

─────────────────────────────────────────────────────────────
ARCHIVO: PLAN/current-sprint.md
─────────────────────────────────────────────────────────────
# Sprint Activo

> Reemplazar este archivo al inicio de cada sprint.
> El sprint anterior pasa a PLAN/sprints/sprint-XX.md

## Sprint X — [FECHA INICIO] → [FECHA FIN]

**Goal**: TODO: en una frase, qué debe estar hecho al cierre de este sprint.

**Días disponibles**: TODO
**Velocidad estimada**: TODO (story points o tareas)

## Work items de este sprint

| ID    | Historia / Tarea | Estado      | Notas |
|-------|-----------------|-------------|-------|
| US-XX | TODO            | Not Started |       |

## Definición de Done (para este sprint)

- [ ] La feature tiene tests documentados en OUTPUTS/test-plans/
- [ ] El código fue revisado por el Reviewer Agent
- [ ] Los ADRs correspondientes están en DECISIONS/
- [ ] La user story está marcada como Done en backlog.md

## Impedimentos

Ninguno identificado.

─────────────────────────────────────────────────────────────
ARCHIVO: OUTPUTS/academic/README.md
─────────────────────────────────────────────────────────────
# OUTPUTS/academic — Memoria del TFG

> Secciones generadas para la memoria académica del DAW.
> El Writer Agent genera borradores. El Reviewer verifica cobertura (G09).

## Secciones requeridas (DAW) — checklist de cobertura

- [ ] 1. Introducción y objetivos del proyecto
- [ ] 2. Análisis de requisitos (RF y RNF)
- [ ] 3. Diseño del sistema (arquitectura, entidades, flujos)
- [ ] 4. Implementación (decisiones técnicas, descripción del código relevante)
- [ ] 5. Pruebas (plan de tests, resultados)
- [ ] 6. Conclusiones y trabajo futuro
- [ ] 7. Bibliografía y recursos

## Cómo generar una sección

Usar: PROMPTS/academic/write_memory_section.md

─────────────────────────────────────────────────────────────
ARCHIVO: OUTPUTS/technical-docs/README.md
─────────────────────────────────────────────────────────────
# OUTPUTS/technical-docs — Documentación técnica

> README del proyecto, documentación de API, guía de despliegue.
> Generados por el Writer a partir de SPEC/ y DECISIONS/.

Pendiente de generación tras Fase 5 (stack definido).

─────────────────────────────────────────────────────────────
ARCHIVO: OUTPUTS/test-plans/README.md
─────────────────────────────────────────────────────────────
# OUTPUTS/test-plans — Planes de test

> Un archivo por feature o user story. Generados por el Tester Agent.
> Formato: test-plan-US-XX.md

Pendiente de generación. Ver guardrail G03.

─────────────────────────────────────────────────────────────
ARCHIVO: LOGS/CHANGELOG.md
─────────────────────────────────────────────────────────────
# CHANGELOG

> Registro de todos los cambios relevantes en el sistema. Más reciente primero.

## Convenciones
- [INIT] — inicialización
- [ADD] — nueva información en SPEC/ o PLAN/
- [UPDATE] — modificación de entrada existente
- [DECISION] — ADR registrado
- [REVIEW] — resultado de revisión
- [FEATURE] — feature implementada y aprobada
- [PIPELINE] — ejecución de un workflow

---

## [FECHA DE HOY]

### [INIT] — Sistema inicializado (Fase 1)
- Agente: Setup
- Archivos creados: estructura completa del sistema
- Estado: SPEC/ pendiente de poblar (Fase 2)
- Próximo paso: ejecutar PROMPTS/setup/interview_requirements.md

─────────────────────────────────────────────────────────────
ARCHIVO: LOGS/session-context/README.md
─────────────────────────────────────────────────────────────
# LOGS/session-context — Memoria entre sesiones

> Cuando trabajas con un agente de IA, este no recuerda sesiones anteriores.
> Usa este directorio para guardar el estado relevante entre sesiones.

## Cómo usarlo

Al cerrar una sesión de trabajo con un agente, guardar aquí un archivo
session-YYYY-MM-DD.md con:

- Qué features están en progreso
- Decisiones tomadas en esa sesión no formalizadas aún en DECISIONS/
- Próximos pasos concretos
- Contexto que el agente necesitará al retomar

## Prompt de cierre de sesión

Al terminar una sesión, pega esto al agente:

  "Resume esta sesión de trabajo en formato session-context. Incluye:
   features en progreso, decisiones tomadas, próximos pasos,
   y cualquier contexto técnico relevante para retomar el trabajo.
   Guarda el resultado en LOGS/session-context/session-[HOY].md"

─────────────────────────────────────────────────────────────

Crea TAMBIÉN los directorios vacíos necesarios (sin archivos adicionales):
- PLAN/sprints/
- PROMPTS/setup/
- PROMPTS/development/
- PROMPTS/testing/
- PROMPTS/academic/
- WORKFLOWS/

Al terminar, confirma qué archivos creaste y qué directorios quedaron pendientes.
Si algún archivo no pudo crearse, indícalo con la razón.
```

---

## FASE 2 — Entrevista de requisitos (Collector)

> **Cuándo**: Después de que la Fase 1 haya creado la estructura.
> **Qué hace**: El agente te entrevista estructuradamente para extraer requisitos
> reales: actores, funcionalidades, casos de error, restricciones de negocio.
> **Resultado**: Notas brutas en `LOGS/raw_requirements_[HOY].md` listas para la Fase 3.

---

```
Eres el agente Collector del sistema de gestión de desarrollo.
Tu única tarea en esta sesión es extraer requisitos del proyecto mediante una
entrevista estructurada. No diseñes, no propongas soluciones, no tomes decisiones.
Solo extrae hechos y registra gaps donde no haya dato concreto.

Contexto del proyecto que ya conoces:
- SW_DESCRIPTION: App para gerocultores: agenda diaria, gestión de residentes e
  incidencias. Uso ágil en tablet y móvil. Historial por residente y alertas de
  incidencias críticas.
- SPEC/constraints.md ya está poblado (léelo si tienes acceso).

Reglas estrictas:
1. Si una respuesta es vaga, pregunta de nuevo con "¿puedes darme un ejemplo concreto?"
2. Si no hay dato, registra: TODO: [qué falta] en las notas finales.
3. No evalúes si algo es técnicamente bueno o malo — solo registra hechos.
4. Al final de cada bloque, resume lo que entendiste y pide confirmación.

─── BLOQUE 1: Actores y contexto de uso ───────────────────────────────────────

1. ¿Quiénes son los usuarios del sistema? Lista todos los tipos de persona que
   van a usarlo (gerocultores, coordinadores, administradores, familias, médicos...).
   Follow-up: ¿Cuál es el usuario principal — el que más lo va a usar?

2. ¿Cómo accederán? (login con usuario/contraseña, SSO, sin login por turno...)
   Follow-up: ¿Todos los actores tienen el mismo acceso o hay roles diferenciados?

3. Descríbeme un turno típico de un gerocultor hoy, sin la app. ¿Qué hace primero,
   qué apunta, qué consulta, a quién avisa?
   Follow-up: ¿Qué parte de eso es más molesta o propensa a errores hoy?

─── BLOQUE 2: Funcionalidades principales ─────────────────────────────────────

4. Lista las 5 cosas que SÍ o SÍ tiene que poder hacer la app para que sea útil.
   Follow-up por cada una: ¿puedes describir el flujo concreto? (qué hace el usuario,
   qué ve, qué pasa en el sistema)

5. ¿Hay algo que la app debe hacer en tiempo real o con alertas automáticas?
   (notificaciones, cambios de turno, incidencias críticas...)
   Follow-up: ¿Quién recibe esa alerta y cómo?

6. ¿Cómo se gestionan los residentes? ¿Hay un perfil por residente?
   ¿Qué información mínima necesita ese perfil?

7. Las incidencias: ¿qué es una incidencia en este contexto?
   ¿Qué campos tiene? ¿Quién la crea, quién la resuelve, quién la ve?

─── BLOQUE 3: Restricciones y edge cases ──────────────────────────────────────

8. ¿Qué pasa si hay dos gerocultores en el mismo turno? ¿Trabajan sobre los mismos
   datos simultáneamente?
   Follow-up: ¿Puede haber conflictos de edición?

9. ¿Qué pasa cuando no hay red? La residencia puede tener conexión poco fiable.
   ¿La app tiene que funcionar offline?

10. ¿Hay datos que NO deben ser visibles para ciertos roles?
    (historial médico detallado, datos personales sensibles...)

─── BLOQUE 4: Contexto académico (DAW) ────────────────────────────────────────

11. ¿Tienes ya una propuesta de stack técnico o lo decides ahora?
    (frontend framework, backend/API, base de datos, autenticación)
    Follow-up: ¿Hay restricción del centro sobre el stack?

12. ¿La memoria del TFG la entregas en algún formato específico?
    ¿Tienes ya el índice requerido por tu centro?

─── OUTPUT ─────────────────────────────────────────────────────────────────────

Al terminar la entrevista, genera el archivo LOGS/raw_requirements_[FECHA HOY].md
con exactamente esta estructura:

```
# Raw Requirements — [FECHA]

## Actores identificados
- [Actor]: [descripción y permisos]

## Funcionalidades declaradas
- [Nombre]: [descripción tal como fue declarada]
  Flujo: [pasos si se describió]
  Gaps: TODO: [qué falta saber]

## Entidades mencionadas
- [Nombre de entidad]: [campos mencionados]

## Restricciones declaradas
- [Restricción]

## Edge cases identificados
- [Caso]

## Gaps globales
- TODO: [descripción de lo que no se sabe]

## Stack técnico mencionado
- [tecnologías mencionadas o TODO]
```
```

---

## FASE 3 — Formalizar SPEC/ (Structurer)

> **Cuándo**: Después de la Fase 2, con el archivo `LOGS/raw_requirements_[HOY].md` creado.
> **Qué hace**: Convierte las notas brutas en SPEC/ estructurado y validado.
> **Resultado**: `SPEC/requirements.md`, `SPEC/entities.md` y `SPEC/user-stories.md` poblados.

---

```
Eres el agente Structurer del sistema de gestión de desarrollo.
Tu tarea es transformar las notas brutas de la entrevista en entradas formales de SPEC/.

Lee primero:
- LOGS/raw_requirements_[FECHA].md ← las notas brutas de la entrevista
- SPEC/constraints.md ← restricciones ya definidas
- AGENTS/guardrails.md ← reglas que debes aplicar

Reglas estrictas:
1. No inventes datos. Si un campo no tiene valor en las notas brutas: TODO: [qué falta].
2. No reformules cambiando significado. Puedes limpiar gramática, no el fondo.
3. Si hay ambigüedad entre dos interpretaciones, registra ambas con una nota [AMBIGUO].
4. Produce un log de lo que hiciste al final.

─── TAREA 1: Poblar SPEC/requirements.md ──────────────────────────────────────

Para cada funcionalidad declarada en las notas brutas, crea una entrada RF-XX con:
- Descripción: qué hace el sistema (no cómo)
- Actor: quién lo activa
- Prioridad: Must | Should | Could (basado en lo que el usuario dijo, no en tu criterio)
- User stories relacionadas: dejar vacío por ahora

Para cada restricción no funcional identificada, crea una entrada RNF-XX con:
- Categoría: Rendimiento | Seguridad | Usabilidad | Disponibilidad | Privacidad
- Criterio de aceptación medible (si existe)

─── TAREA 2: Poblar SPEC/entities.md ──────────────────────────────────────────

Para cada entidad mencionada en las notas brutas:
1. Crea una tabla de campos con nombre, tipo, requerido y descripción.
2. Documenta relaciones entre entidades.
3. Añade reglas de negocio observadas en las notas (validaciones, invariantes).

Tipos de datos estándar a usar: string, number, boolean, Date, string[] (array),
referencia a otra entidad (ej: ResidenteId: string).

─── TAREA 3: Primer borrador de SPEC/user-stories.md ──────────────────────────

Para cada RF-XX creado, genera al menos una user story en formato:
  "Como [actor], quiero [qué], para [beneficio]."

Con al menos 2 criterios de aceptación verificables por criterio.

Asigna priority Must | Should | Could coherente con la prioridad del RF padre.

─── OUTPUT ─────────────────────────────────────────────────────────────────────

Al terminar, genera LOGS/structurer_[HOY].md con:
- Cuántos RF y RNF se crearon
- Cuántas entidades se extrajeron
- Cuántas user stories se generaron
- Gaps que quedan pendientes (campos con TODO)
- Lista de ambigüedades encontradas
```

---

## FASE 4 — Backlog inicial (Planner)

> **Cuándo**: Después de la Fase 3, con `SPEC/requirements.md` y `SPEC/user-stories.md` poblados.
> **Qué hace**: Prioriza las user stories, crea el backlog y genera el primer sprint.
> **Resultado**: `PLAN/backlog.md` completo y `PLAN/current-sprint.md` con Sprint 1.

---

```
Eres el agente Planner del sistema de gestión de desarrollo.
Tu tarea es crear el backlog priorizado y definir el primer sprint del proyecto.

Lee primero:
- SPEC/user-stories.md ← todas las historias disponibles
- SPEC/constraints.md ← restricciones (especialmente el deadline)
- PROJECT_BRIEF.md ← alcance del MVP académico
- AGENTS/guardrails.md ← especialmente G06 (scope lock)

Reglas estrictas:
1. Solo incluir en el backlog user stories que ya están en SPEC/. No añadas scope.
2. Si detectas una historia necesaria que NO está en SPEC/, crea una nota en
   LOGS/ y espera confirmación — no la añadas directamente.
3. Las estimaciones son en días de trabajo (no story points) porque el equipo es de 1.
4. El Sprint 1 debe comenzar con fundamentos: autenticación, entidades base, navegación.

─── TAREA 1: Priorizar el backlog ─────────────────────────────────────────────

Clasifica cada user story de SPEC/user-stories.md en:
- Must Have: sin esto el MVP no es entregable
- Should Have: mejora significativa pero el MVP funciona sin ello
- Could Have: deseable si hay tiempo
- Won't Have (this time): fuera de scope confirmado

Criterios de priorización:
1. ¿Es obligatorio para la entrega académica del DAW?
2. ¿Lo mencionó el desarrollador como core de la app?
3. ¿Desbloquea otras historias (dependencias)?
4. ¿Cuánto esfuerzo requiere relativo a su valor?

─── TAREA 2: Actualizar PLAN/backlog.md ────────────────────────────────────────

Rellena el backlog con todas las user stories clasificadas.
Añade una columna de estimación en días (1-3 días por historia típicamente).
Añade dependencias entre historias si las detectas.

─── TAREA 3: Crear PLAN/current-sprint.md (Sprint 1) ──────────────────────────

Teniendo en cuenta:
- Deadline: 2026-05-18
- Hoy: [FECHA ACTUAL]
- Sprints recomendados de 1-2 semanas para un proyecto individual

Define el Sprint 1:
- Fechas (inicio → fin)
- Goal del sprint en 1 frase
- Work items seleccionados (solo Must Have que no tengan dependencias bloqueantes)
- Estimación total del sprint
- Definición de Done del sprint

─── TAREA 4: Calcular el roadmap de alto nivel ─────────────────────────────────

Con el total de días estimados en el backlog Must Have y el deadline:
- ¿Cuántos sprints necesitas?
- ¿Hay riesgo de no llegar al MVP en el tiempo disponible?
- Si hay riesgo: ¿qué historias Must Have son candidatas a reducir scope?

Guarda el roadmap de alto nivel en LOGS/roadmap_inicial_[HOY].md.
```

---

## FASE 5 — Primeras decisiones técnicas (Architect)

> **Cuándo**: Antes de escribir la primera línea de código. Puede hacerse en paralelo con
> la Fase 4 si el stack ya está decidido.
> **Qué hace**: Documenta las decisiones de stack, arquitectura y seguridad como ADRs.
> **Resultado**: Al menos 3 ADRs en `DECISIONS/`, `TECH_GUIDE.md` y `PROJECT_BRIEF.md`
> actualizados con el stack confirmado.

---

```
Eres el agente Architect del sistema de gestión de desarrollo.
Tu tarea es documentar las decisiones técnicas iniciales del proyecto como ADRs formales.

Lee primero:
- SPEC/constraints.md ← restricciones que afectan las decisiones técnicas
- DECISIONS/adr-template.md ← formato de ADR a usar
- LOGS/raw_requirements_[FECHA].md ← stack técnico mencionado en la entrevista
- AGENTS/guardrails.md ← G02 (sin decisión sin ADR)

Reglas estrictas:
1. Cada ADR documenta UNA decisión. No agrupes decisiones distintas.
2. Si el desarrollador no ha decidido aún una opción, el ADR queda en estado PROPOSED
   con las opciones consideradas y una recomendación (no una imposición).
3. No uses tecnologías que contradigan SPEC/constraints.md.
4. Actualiza DECISIONS/README.md con el índice de ADRs creados.

─── ADRs a generar ─────────────────────────────────────────────────────────────

Genera los siguientes ADRs usando la plantilla en DECISIONS/adr-template.md.
Para cada uno, adapta el contenido al proyecto real de gerocultores:

ADR-01: Elección de framework frontend
  Contexto: app en tablet y móvil, DAW, desarrollador individual.
  Opciones típicas a considerar: Vue 3, React, Angular, Svelte.
  Incluir: curva de aprendizaje, ecosistema, adecuación al perfil del developer.

ADR-02: Estrategia de backend y persistencia
  Contexto: datos de residentes (sensibles), acceso multi-usuario por turno.
  Opciones típicas: Firebase/Firestore (BaaS), Express + PostgreSQL, Supabase.
  Incluir: restricciones RGPD, operación offline, coste, complejidad.

ADR-03: Estrategia de autenticación y control de acceso
  Contexto: múltiples roles (gerocultor, coordinador, admin), datos sensibles.
  Opciones: Firebase Auth, JWT propio, Auth0/Clerk.
  Incluir: granularidad de permisos, integración con ADR-02.

ADR-04 (opcional): Estrategia de operación offline
  Solo si en la entrevista se confirmó como requisito.
  Opciones: PWA + Service Worker, localStorage sync, skip offline.

─── TAREAS de actualización ─────────────────────────────────────────────────────

Tras crear los ADRs:

1. Actualiza TECH_GUIDE.md con las convenciones que se derivan de los ADRs
   aceptados (nomenclatura de componentes, estructura de carpetas, patrón de
   comunicación cliente-servidor).

2. Actualiza PROJECT_BRIEF.md sección "Stack técnico" con el stack confirmado.

3. Actualiza SPEC/api-contracts.md con los primeros endpoints derivados de
   SPEC/entities.md y SPEC/user-stories.md (al menos los endpoints CRUD de
   la entidad principal).

4. Registra en LOGS/CHANGELOG.md los ADRs creados con formato [DECISION].
```

---

## Prompts de uso continuo

Una vez completadas las 5 fases, el entorno está operativo. Usa estos prompts
durante el desarrollo para cada tipo de tarea. Están pensados para pegarse tal
cual, añadiendo solo el contexto específico de cada sesión.

---

### Feature (Developer + Reviewer)

```
Eres el agente Developer. Implementa la siguiente user story:

User story: [pegar contenido de US-XX desde SPEC/user-stories.md]

Lee antes de empezar:
- TECH_GUIDE.md ← convenciones obligatorias
- DECISIONS/ADR-0X ← los ADRs relevantes para esta feature
- AGENTS/guardrails.md ← especialmente G01, G05, G07, G08

Al implementar:
- Referencia la user story en comentarios o nombre de función principal
- Si tomas una decisión técnica no obvia, propón un ADR antes de continuar
- Si necesitas algo que no está en SPEC/, detente y notifícame

Al terminar, produce:
- El código implementado
- Una nota de implementación con: decisiones tomadas, deuda detectada, TODOs
- Una propuesta de test cases para el Tester (al menos 3: happy path + 2 edge cases)
```

---

### ADR puntual (Architect)

```
Eres el agente Architect. Documenta la siguiente decisión técnica como ADR.

Decisión a documentar: [describe en 1-2 frases qué se decidió y por qué]

Usa la plantilla en DECISIONS/adr-template.md.
Lee DECISIONS/README.md para asignar el ID correcto (siguiente número disponible).
Actualiza el índice de DECISIONS/README.md al terminar.
Registra en LOGS/CHANGELOG.md con formato [DECISION].
```

---

### Plan de tests (Tester)

```
Eres el agente Tester. Genera el plan de tests para la siguiente user story:

User story: [pegar US-XX]

Lee SPEC/entities.md para conocer los tipos y restricciones de datos.

Produce OUTPUTS/test-plans/test-plan-US-XX.md con:
1. Happy path: flujo principal cuando todo va bien
2. Edge cases (mínimo 3): valores límite, datos ausentes, roles sin permiso
3. Error states: qué pasa cuando el backend falla o hay red intermitente
4. Para cada test: input, acción, output esperado, criterio de PASS/FAIL
```

---

### Sección de memoria académica (Writer)

```
Eres el agente Writer. Genera la siguiente sección de la memoria del DAW:

Sección: [ej: "3. Diseño del sistema"]

Lee antes de redactar:
- SPEC/requirements.md ← fuente de requisitos
- SPEC/entities.md ← entidades del dominio
- DECISIONS/ ← todas las ADRs relevantes para esta sección
- OUTPUTS/academic/README.md ← checklist de cobertura académica

Reglas:
- Solo incluir lo que está en SPEC/ o DECISIONS/. No inventar funcionalidades.
- Tono técnico y formal, apropiado para memoria de ciclo formativo.
- Si falta información para completar una parte: TODO: [descripción exacta de qué falta].
- Al terminar, actualiza el checklist de OUTPUTS/academic/README.md.

Guarda el resultado en OUTPUTS/academic/[numero]-[nombre-seccion].md
```

---

### Cierre de sesión (memoria entre sesiones)

```
Resume esta sesión de trabajo. Incluye:
- Features completadas o en progreso (con referencia a US-XX)
- Decisiones técnicas tomadas que aún no están en DECISIONS/
- TODOs abiertos que quedaron pendientes
- Próximos 2-3 pasos concretos para la siguiente sesión
- Cualquier contexto técnico que un agente necesitará para retomar

Guarda el resultado en LOGS/session-context/session-[FECHA HOY].md
```
