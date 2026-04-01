# Metodología de Desarrollo

> **Borrador** — para la memoria académica DAW (puede integrarse en sección 1 o como sección propia antes del análisis de requisitos)  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: gerocultores-system — Agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-03-29 — sdd-init agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud**: ~420 palabras (objetivo: 300–500 palabras)

---

## Metodología de Desarrollo

El desarrollo de este proyecto se ha llevado a cabo siguiendo una metodología ágil e iterativa inspirada en Scrum, adaptada a las características de un proyecto individual con fecha de entrega fija. Esta elección se justifica por la necesidad de obtener funcionalidad entregable de forma progresiva, permitiendo validar el trabajo por partes y reducir el riesgo de llegar al final del proyecto con funcionalidades incompletas o no probadas.

### Organización por sprints

El trabajo se ha dividido en sprints de aproximadamente una semana de duración, cada uno con un objetivo concreto y un conjunto de historias de usuario a implementar. El Sprint 0 se dedicó íntegramente a la configuración del entorno: inicialización del repositorio, scaffolding del proyecto Vue + Vite, configuración de Firebase y la definición completa de los requisitos y la arquitectura. A partir del Sprint 1, cada sprint incluye una o más historias de usuario completas (desde el diseño hasta las pruebas), siguiendo la Definition of Done establecida en el backlog.

Los artefactos de planificación se mantienen en el directorio `PLAN/` del repositorio: `backlog.md` contiene el backlog priorizado con estimaciones en horas, `current-sprint.md` define el sprint activo con sus objetivos y criterios de finalización, y `tasks-summary.md` proporciona una vista detallada de cada tarea con criterios de aceptación y riesgo asociado.

### Spec-Driven Development (SDD)

Para la gestión de requisitos, diseño y decisiones técnicas, se ha aplicado un proceso estructurado denominado Spec-Driven Development (SDD). Antes de implementar cualquier funcionalidad, se crea o actualiza el artefacto de especificación correspondiente en el directorio `SPEC/`: requisitos funcionales y no funcionales, historias de usuario, modelo de entidades, contratos de la API y flujos de usuario. Las decisiones arquitectónicas relevantes se documentan formalmente en Registros de Decisiones de Arquitectura (ADR) en el directorio `DECISIONS/`.

Este enfoque garantiza la trazabilidad completa entre los requisitos del cliente (o del proyecto académico) y el código entregado, y facilita la generación de la memoria académica al mantener toda la documentación técnica organizada y accesible durante el desarrollo.

### Herramientas utilizadas

| Herramienta | Propósito |
|------------|-----------|
| Git + GitHub | Control de versiones; historial de commits trazables por US |
| Vue 3 + Vite + Pinia | Desarrollo del frontend (SPA) |
| Express | API REST (capa de negocio y seguridad) |
| Firebase Auth + Firestore | Autenticación y base de datos en la nube |
| Firebase Emulator Suite | Pruebas de Firestore Rules en local |
| Vitest | Tests unitarios de lógica de negocio |
| Playwright | Tests end-to-end de flujos críticos |
| Stitch (Google) | Diseño de prototipos y wireframes |
| Tailwind CSS | Sistema de estilos responsive (tablet/mobile first) |
| OpenCode + Claude | Asistencia IA para generación y revisión de artefactos SDD |

### Guardrails y calidad

Durante el desarrollo se aplican nueve guardrails (G01..G09) definidos en `AGENTS/guardrails.md`, que garantizan, entre otras cosas, que no se implemente código sin historia de usuario previa, que no existan secretos hardcodeados en el código, que cada decisión técnica relevante tenga un ADR y que cada funcionalidad tenga un plan de tests antes de ser aprobada en revisión.

---

> **Notas para la versión final**:
> - Añadir reflexión personal sobre la experiencia de trabajar con metodología ágil en solitario.
> - Mencionar si hubo reuniones con el tutor o iteraciones de revisión del diseño.
> - Concretar el número de sprints realizados y su duración real una vez se complete el proyecto.

---

*Borrador generado: 2026-03-29 — sdd-init agent — gerocultores-system*  
*Fuentes: PLAN/backlog.md, PLAN/current-sprint.md, SPEC/constraints.md, AGENTS.md*  
*Engram topic key: academic/metodologia*
