# Objetivos del Proyecto

> **Borrador** — sección de objetivos (integrada en la Introducción o como sección propia)  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: GeroCare — Agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-03-29 — sdd-init agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Nota de integración**: Estos objetivos pueden incluirse al final de la sección 1 (Introducción) o bien como un subapartado 1.3 independiente.

---

## Objetivo General

Desarrollar una aplicación web para gerocultores que permita gestionar la agenda diaria de cuidados, consultar las fichas de los residentes y registrar incidencias de manera rápida, segura y accesible desde dispositivos táctiles (tablet y móvil), en el contexto de una residencia de mayores de tamaño mediano.

---

## Objetivos Específicos

### OE-01 — Digitalizar la agenda diaria de cuidados
Implementar una vista de agenda diaria que muestre las tareas ordenadas cronológicamente, con su estado (pendiente / en curso / completada / con incidencia), el residente asociado y la posibilidad de actualizar el estado con una mínima cantidad de interacciones táctiles (máximo 3 taps para completar una tarea).

*Relacionado con*: RF-03, RF-04, US-03, US-04

### OE-02 — Gestionar la información de los residentes con cumplimiento RGPD
Proporcionar acceso controlado por rol a las fichas de los residentes, que incluyan datos de salud categorizados como especiales según el art. 9 del RGPD (diagnósticos, alergias, medicación), garantizando que únicamente el personal autorizado pueda visualizar o editar esta información.

*Relacionado con*: RF-05, RF-09, US-05, US-09, RNF-03, RNF-09

### OE-03 — Registrar y consultar incidencias de forma trazable
Desarrollar un flujo de registro de incidencias que complete el proceso en 5 interacciones o menos en tablet, con marca de tiempo automática, identificación del usuario registrador y vinculación al historial del residente; con la posibilidad de filtrar por fecha y tipo.

*Relacionado con*: RF-06, RF-07, US-06, US-07

### OE-04 — Implementar autenticación y control de acceso mediante Firebase
Integrar Firebase Authentication como sistema de autenticación y definir Firestore Security Rules que implementen control de acceso basado en roles (RBAC) para los tres roles del sistema: Gerocultor, Coordinador y Administrador, validado mediante la Firebase Emulator Suite.

*Relacionado con*: RF-01, RF-02, RNF-03, RNF-09, US-01, US-02

### OE-05 — Desarrollar la aplicación siguiendo metodología ágil y prácticas profesionales
Aplicar una metodología de desarrollo iterativo por sprints, utilizando control de versiones (Git + GitHub), pruebas automatizadas (Vitest para tests unitarios, Playwright para E2E) y especificación formal de requisitos, diseño y decisiones técnicas, de acuerdo con las exigencias del proyecto final del ciclo DAW.

*Relacionado con*: RNF-08, G01..G09 (guardrails del proyecto), PLAN/backlog.md

---

## Alcance del MVP (entrega académica)

Las siguientes funcionalidades forman parte del MVP para la entrega del 18 de mayo de 2026:

**Incluidas (Must/Should)**:
- US-01: Inicio de sesión con Firebase Auth
- US-02: Control de acceso por rol (Firestore Rules)
- US-03: Agenda diaria del gerocultor
- US-04: Actualizar estado de una tarea
- US-05: Ficha de residente (solo lectura para Gerocultor)
- US-06: Registro de incidencia
- US-07: Historial de incidencias por residente
- US-09: Alta y gestión de residentes (Coordinador)
- US-10: Gestión de cuentas de usuarios (Administrador)
- US-11: Resumen de fin de turno

**Fuera del alcance (Could / excluidas por decisión)**:
- US-08: Notificaciones push nativas (CA-4) — PWA/Service Workers excluidos (RNF-10)
- US-12: Vista de agenda semanal — prioridad baja, incluida si hay margen de tiempo
- US-08: Notificaciones in-app (CA-1, CA-2, CA-3) — incluidas como Should

---

> **Notas para la versión final**:
> - Verificar que los OE cubren todas las US Must del backlog.
> - Ampliar OE-05 con referencia específica a la metodología SDD usada en el proyecto.
> - Si US-08 notificaciones in-app se implementa, actualizar OE-03 o añadir OE-06.

---

*Borrador generado: 2026-03-29 — sdd-init agent — gerocultores-system*  
*Fuentes: SPEC/requirements.md, SPEC/user-stories.md, PLAN/backlog.md*  
*Engram topic key: academic/objetivos*
