# Introducción

> **Borrador** — sección 1 de la memoria académica DAW  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: Agenda digital para gerocultores — gerocultores-system  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-03-29 — sdd-init agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud orientativa**: 250–350 palabras (este borrador) → expandir hasta 600–900 palabras en versión final

---

## 1. Introducción

La gestión de turnos y tareas en residencias de mayores se realiza habitualmente con papel o aplicaciones genéricas no diseñadas para el contexto sanitario-social. Esta situación genera pérdida de trazabilidad entre turnos, errores en la administración de medicación y dificultades para coordinar al equipo de gerocultores. Los profesionales que cuidan a personas mayores en situación de dependencia merecen herramientas digitales a su altura.

Este proyecto propone el desarrollo de una aplicación web accesible desde tablet y móvil que centraliza tres funcionalidades clave para el gerocultor: la agenda diaria de tareas, el acceso a las fichas de los residentes y el registro de incidencias. El sistema está diseñado para ser usado en condiciones de trabajo reales —con guantes, en movimiento, en entornos con iluminación variable y conexiones de red lentas— por lo que la experiencia de usuario y el rendimiento en dispositivos móviles son requisitos de primer orden.

El proyecto se desarrolla como Trabajo de Final de Ciclo del Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW) en el CIPFP Batoi d'Alcoi, durante el curso 2025-2026. La entrega académica está fijada para el 18 de mayo de 2026. Se trata de un proyecto individual, desarrollado íntegramente por Jose Vilches Sánchez, bajo la tutela de Andres Martos Gazquez.

La solución técnica está basada en una arquitectura web moderna: Vue 3 como framework de frontend, Firebase como plataforma de autenticación y base de datos, y una API REST construida con Express que actúa como capa de negocio. Esta combinación permite un desarrollo ágil, un coste de infraestructura mínimo y una experiencia de usuario fluida en dispositivos táctiles. La elección de cada tecnología está justificada en los Registros de Decisiones de Arquitectura (ADR) incluidos en el repositorio del proyecto.

La memoria está organizada en catorce secciones: tras este capítulo introductorio, se presentan los fundamentos teóricos y tecnológicos del proyecto, el análisis de requisitos, el diseño del sistema, las fases de implementación, los resultados de las pruebas y el cumplimiento de la normativa RGPD, y finalmente las conclusiones y lecciones aprendidas.

---

> **Notas para ampliar a versión final (objetivo: 600–900 palabras)**:
> - Añadir párrafo sobre motivación personal del autor: ¿por qué este proyecto? ¿conexión con el entorno sanitario/social?
> - Ampliar el contexto de las residencias de mayores en España (dato cuantitativo: aprox. 5.400 residencias, >380.000 plazas según IMSERSO).
> - Describir brevemente la estructura de la memoria (qué encontrará el lector en cada capítulo).
> - Incluir un párrafo sobre el alcance del MVP: qué funcionalidades entran y cuáles se dejaron fuera por limitaciones de tiempo (US-08 notificaciones = Should; US-12 agenda semanal = Could).

---

*Borrador generado: 2026-03-29 — sdd-init agent — gerocultores-system*  
*Fuentes: PROJECT_BRIEF.md, SPEC/requirements.md, SPEC/constraints.md, DECISIONS/ADR-01b.md*  
*Engram topic key: academic/introduccion*
