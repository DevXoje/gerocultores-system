# Resumen Ejecutivo

> **Borrador** — para la memoria académica DAW (una página)  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: GeroCare — Agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Tutor**: ANDRES MARTOS GAZQUEZ  
> **Ciclo**: CFS Desarrollo de Aplicaciones Web (DAW) — 2025-2026  
> **Generado**: 2026-03-29 — sdd-init agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud**: ~310 palabras (objetivo: 250–350 palabras / 1 página)

---

## Resumen Ejecutivo

**GeroCare** es una aplicación web diseñada para digitalizar la gestión del trabajo diario en residencias de mayores. El sistema centraliza tres funcionalidades clave para el gerocultor —la agenda diaria de tareas, el acceso a las fichas de los residentes y el registro de incidencias— en una interfaz optimizada para tablet y móvil, operativa en condiciones de trabajo reales: uso táctil, redes lentas y entornos de iluminación variable.

El proyecto surge de la detección de una brecha concreta en el sector sociosanitario: la mayoría de las residencias de tamaño mediano gestionan los turnos y los cuidados con papel o herramientas genéricas (hojas de cálculo, papel impreso) que no ofrecen trazabilidad entre turnos ni alertas ante incidencias críticas. Las alternativas comerciales existentes tienen costes elevados y escasa personalización para el perfil del gerocultor.

La solución técnica se basa en una arquitectura SPA (Vue 3 + Pinia) comunicada con una API REST en Express, utilizando Firebase Authentication para la gestión de identidad y Google Firestore como base de datos NoSQL. El sistema implementa control de acceso basado en roles (RBAC) con tres perfiles: Gerocultor, Coordinador y Administrador. Los datos de los residentes, al tratarse de datos de categoría especial según el artículo 9 del RGPD (diagnósticos, alergias, medicación), están protegidos mediante cifrado en tránsito (HTTPS), reglas de seguridad de Firestore y auditoría de accesos.

El desarrollo sigue una metodología ágil por sprints, con especificación formal de requisitos (12 funcionales, 10 no funcionales) y 12 historias de usuario. La cobertura de tests incluye pruebas unitarias con Vitest, pruebas E2E con Playwright y validación automatizada de reglas de Firestore con el Emulator Suite.

El proyecto se entrega el 18 de mayo de 2026 como Trabajo de Final de Ciclo del CFS DAW en el CIPFP Batoi d'Alcoi.

---

> **Notas para la versión final**:
> - Actualizar con datos reales de cobertura de tests y US implementadas cuando estén disponibles.
> - Añadir la frase de impacto: resultado cuantificable (p.ej. "el tiempo de registro de una incidencia se redujo de X minutos a Y taps").
> - Si se realiza prueba con usuarios reales, mencionar el resultado brevemente.

---

*Borrador generado: 2026-03-29 — sdd-init agent — GeroCare (gerocultores-system)*  
*Fuentes: PROJECT_BRIEF.md, SPEC/requirements.md, SPEC/constraints.md, DECISIONS/ADR-01b.md*  
*Engram topic key: academic/resumen-ejecutivo*
