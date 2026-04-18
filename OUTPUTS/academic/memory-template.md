# Plantilla de Memoria Académica — Proyecto Final DAW
## gerocultores-system

> **Autor**: Jose Vilches Sánchez  
> **Tutor**: ANDRES MARTOS GAZQUEZ  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Ciclo**: CFS Desarrollo de Aplicaciones Web (DAW)  
> **Curso**: 2025-2026  
> **Título del proyecto**: Agenda digital para gerocultores  
> **Stack**: Vue 3 + Vite + Pinia + Axios + Tailwind CSS + Firebase Auth + Firestore + Express API  
>
> **Longitud objetivo**: 30–35 páginas (rango aceptable: 28–40 páginas).  
> **Calibrado desde**: ejemplo-calibration-buycinduro.md + example-calibration-tasknest.md  
> **Generado**: 2026-03-29 — sdd-init agent

---

## ÍNDICE COMPLETO (estructura orientativa)

```
PÁGINAS PRELIMINARES
  Portada ...................................... 1
  Primera página (con tutor) .................. 2
  Agradecimientos (opcional) .................. 3
  Índice general ............................... 4–5

CUERPO DE LA MEMORIA
  1. Introducción .............................. 6–8
     1.1 Motivación y contexto
     1.2 Descripción del proyecto
     1.3 Objetivos generales y específicos
     1.4 Estructura del documento

  2. Fundamentos teóricos y prácticos ......... 9–13
     2.1 Arquitectura web (SPA / REST API)
     2.2 Framework frontend — Vue 3 y Composition API
     2.3 Gestión de estado — Pinia
     2.4 Backend — Express + API REST
     2.5 Persistencia — Firestore (NoSQL)
     2.6 Autenticación — Firebase Auth
     2.7 Seguridad Firestore Rules
     2.8 Accesibilidad — WCAG 2.1
     2.9 Normativa aplicable — RGPD art. 9

  3. Presentación del contexto y organización . 14–15
     3.1 Las residencias de mayores hoy
     3.2 El gerocultor: perfil y entorno de trabajo
     3.3 Problemática actual (papel, hojas sueltas)
     3.4 Roles del sistema: Gerocultor, Coordinador, Administrador

  4. Análisis de requisitos ................... 16–19
     4.1 Metodología de captura de requisitos
     4.2 Requisitos funcionales (RF-01..RF-12)
     4.3 Requisitos no funcionales (RNF-01..RNF-10)
     4.4 Historias de usuario (US-01..US-12)
     4.5 Priorización MoSCoW

  5. Diseño del sistema ....................... 20–25
     5.1 Arquitectura general (diagrama de capas)
     5.2 Modelo de datos (entidades y relaciones)
     5.3 Diagrama entidad-relación
     5.4 Colecciones Firestore y estructura de documentos
     5.5 Diseño de la API REST (endpoints principales)
     5.6 Diseño UX: flujos de usuario (FL-01..FL-06)
     5.7 Wireframes y prototipos (proceso iterativo)
     5.8 Sistema de diseño y componentes (Atomic Design)
     5.9 Seguridad: RBAC, Firebase Rules, middleware

  6. Fases de implementación técnica .......... 26–32
     6.1 Sprint 0 — Configuración y scaffolding
     6.2 Sprint 1 — Autenticación y control de acceso
     6.3 Sprint 2 — Agenda diaria y gestión de tareas
     6.4 Sprint 3 — Fichas de residentes e incidencias
     6.5 Sprint 4 — Historial, notificaciones y cierre de turno
     6.6 Sprint 5 — Pruebas, ajustes y entrega
     [Cada sprint: objetivo • tareas completadas • captura UI • problema + solución]

  7. Estudio del coste económico y organizativo 33–34
     7.1 Estimación de horas por fase
     7.2 Coste de desarrollo (tarifa junior)
     7.3 Costes de herramientas y hosting (plan gratuito)

  8. Comparación con alternativas ............. 35–36
     8.1 Situación actual en las residencias
     8.2 Alternativas comerciales analizadas
     8.3 Tabla comparativa de alternativas
     8.4 Justificación de la propuesta

  9. Pruebas .................................. 37–38
     9.1 Estrategia de pruebas
     9.2 Pruebas unitarias (Vitest)
     9.3 Pruebas E2E (Playwright)
     9.4 Pruebas de Firestore Rules (Emulator Suite)
     9.5 Pruebas de usabilidad en tablet/móvil
     9.6 Tabla de resultados

  10. Seguridad y cumplimiento RGPD ........... 39–40
      10.1 Datos de categoría especial (art. 9 RGPD)
      10.2 Control de acceso — RBAC + Firebase Auth
      10.3 Firebase Security Rules
      10.4 Cifrado en tránsito (HTTPS)
      10.5 Auditoría de accesos (RNF-07)
      10.6 Política de retención de datos
      10.7 Datos ficticios en entorno de desarrollo

  11. Conclusiones ............................ 41–42
      11.1 Resultados obtenidos
      11.2 Funcionalidades completadas vs. planificadas
      11.3 Tiempo total y distribución por fase
      11.4 Dificultades y aprendizajes
      11.5 Líneas de trabajo futuro
      11.6 Valoración personal

  12. Necesidades y sugerencias de formación .. 43
  13. Bibliografía ............................. 44
  14. Recursos utilizados ....................... 45

ANEXOS (si aplica)
  Anexo A — Scripts de configuración del entorno
  Anexo B — Fragmentos de código fuente relevantes
  Anexo C — Glosario de términos
  Anexo D — Normativa aplicable (resumen RGPD, WCAG 2.1)
  Anexo E — Documentación de la API (o enlace a SPEC/api-contracts.md)
```

---

## Guías de longitud por sección

> Basado en análisis de memorias Buycinduro (32p) + TaskNest (30–38p) — CIPFP Batoi.  
> Las longitudes son ORIENTATIVAS. El contenido de calidad pesa más que el número de palabras.

| Sección | Mínimo | Recomendado | Notas |
|---------|--------|-------------|-------|
| Portada | 1 p. | 1 p. | Formato formal con logotipo del centro |
| Primera página | 1 p. | 1 p. | Igual que portada + nombre tutor |
| Agradecimientos | — | 100–200 palabras | Opcional |
| Índice general | 1 p. | 1–2 p. | Con números de página exactos (obligatorio) |
| 1. Introducción | 400 palabras | 600–900 palabras (2–3 p.) | La primera sección que lee el tribunal |
| 2. Fundamentos teóricos | 600 palabras | 900–1.400 palabras (3–5 p.) | NO copiar documentación oficial |
| 3. Contexto | 300 palabras | 400–700 palabras (1–2 p.) | Perfiles de usuario y entorno |
| 4. Análisis de requisitos | 400 pal. + tabla | 600–1.000 palabras (2–4 p.) | Incluir criterios de aceptación medibles |
| 5. Diseño del sistema | 500 pal. + 1 diagrama E-R | 900–1.600 palabras + 3 diagramas (3–6 p.) | Mínimo: E-R + arquitectura + 2 capturas UI |
| 6. Implementación técnica | 800 pal. + capturas | 1.200–2.200 palabras (4–7 p.) | Organizar POR SPRINT, no por tecnología |
| 7. Coste económico | 200 pal. + tabla | 300–500 palabras + 2 tablas (1–2 p.) | Tabla de horas desglosada obligatoria |
| 8. Comparación alternativas | 300 palabras | 400–700 pal. + tabla comparativa (1–2 p.) | Tabla comparativa obligatoria |
| 9. Pruebas | 400 pal. + tabla | 600–900 palabras (2–3 p.) | Tabla: tipo \| n.º tests \| pasados \| cobertura |
| 10. Seguridad / RGPD | **300 palabras mín.** | 400–600 palabras (1–2 p.) | **Obligatorio**: datos de salud art. 9 RGPD |
| 11. Conclusiones | 300 palabras | 400–600 palabras (1–2 p.) | Con datos cuantitativos reales |
| 12. Form. adicional | 100 palabras | 150–300 palabras | 3–5 áreas concretas |
| 13. Bibliografía | 8 referencias | 10–15 referencias | Formato APA + comentario de uso |
| 14. Recursos utilizados | 1 tabla | 100–200 pal. + tabla | Versiones exactas al final |
| Anexos | — | 0–5 p. | Solo si añaden valor técnico real |

**Total objetivo**: 30–35 páginas cuerpo (sin anexos).

---

## Mapping SPEC → Secciones (resumen ejecutivo)

| Sección memoria | Artefactos SPEC fuente | Estado fuente | Puede redactarse ahora |
|----------------|----------------------|---------------|----------------------|
| 1. Introducción | PROJECT_BRIEF.md, requirements.md, constraints.md | ✅ | ✅ SÍ |
| 2. Fundamentos teóricos | ADR-01b..ADR-04b, TECH_GUIDE.md | ⚠️ DRAFT | ⚠️ Parcial (ADRs en DRAFT) |
| 3. Contexto | PROJECT_BRIEF.md, user-stories.md, constraints.md | ✅ | ✅ SÍ |
| 4. Análisis de requisitos | requirements.md, user-stories.md, constraints.md | ✅ | ✅ SÍ |
| 5. Diseño del sistema | entities.md, flows.md, api-contracts.md, ADRs | ⚠️ Parcial | ⚠️ Parcial (entidades+flujos) |
| 6. Implementación | PLAN/current-sprint.md, LOGS/, ADRs | 🔲 Requiere código | 🔲 NO |
| 7. Coste económico | PLAN/backlog.md (estimaciones) | ✅ | ⚠️ Estimaciones, no real |
| 8. Alternativas | PROJECT_BRIEF.md, constraints.md | ✅ | ✅ SÍ (+ investigación propia) |
| 9. Pruebas | OUTPUTS/test-plans/ (vacío) | 🔲 | 🔲 NO (bloqueado por Tester) |
| 10. Seguridad/RGPD | constraints.md, entities.md, flows.md, ADRs | ✅ Parcial | ✅ Parcial |
| 11. Conclusiones | US completadas, PLAN, LOGS | 🔲 Al final | 🔲 NO |
| 12. Form. adicional | Reflexión personal | — | ✅ SÍ |
| 13. Bibliografía | Investigación progresiva | — | ✅ Parcial |
| 14. Recursos | constraints.md, TECH_GUIDE.md | ✅ Parcial | ✅ Parcial |

---

## Secciones bloqueadas y sus desbloqueadores

> **CRÍTICO**: Las siguientes secciones están bloqueadas. Indicar en cada revisión de la memoria
> qué está pendiente para poder completarlas.

| Sección bloqueada | Bloqueador | Agente responsable |
|------------------|-----------|-------------------|
| 2. Fundamentos teóricos (completa) | ADR-01b..ADR-04b marcados ACCEPTED | ARCHITECT (Jose debe aprobar) |
| 5. Diseño del sistema (API) | api-contracts.md completo | DEVELOPER |
| 6. Implementación técnica | Inicio de desarrollo real | DEVELOPER |
| 9. Pruebas | OUTPUTS/test-plans/test-plan-US-*.md | TESTER |
| 11. Conclusiones | Finalizar desarrollo | DEVELOPER + WRITER |

---

## Antipatrones críticos (resumen)

| # | Antipatrón | Impacto | 
|---|-----------|---------|
| AP-01 | Copiar literalmente de documentación oficial | Viola norma del centro |
| AP-02 | Requisitos sin criterios de aceptación | Tests desconectados de requisitos |
| AP-03 | Diseño del sistema sin diagramas | Penalización en aspectos formales |
| AP-04 | Conclusiones sin datos cuantitativos | Bajo valor percibido |
| AP-05 | Bibliografía sin formato ni comentario | Incumple norma CIPFP Batoi |
| AP-06 | Implementación organizada por tecnología | Pierde narrativa de proceso |
| AP-07 | Wireframes mencionados pero no incluidos | Sección de diseño sin credibilidad |
| AP-08 | Alternativas sin tabla comparativa | No aporta valor analítico |
| AP-09 | Tests sin resultados cuantificables | Testing no evaluable |

---

## Nota sobre diagramas obligatorios

La sección 5 (Diseño del sistema) **debe incluir** al menos:
- Diagrama E-R o diagrama de colecciones Firestore (exportar desde herramienta UML o generar con dbdiagram.io)
- Diagrama de arquitectura de capas (Vue SPA → Express API → Firestore → Firebase Auth)
- 2–3 wireframes o capturas de la UI en etapas de diseño (no solo la UI final)

Sin diagramas, la sección 5 tiene bajo valor percibido por el tribunal (AP-03).

---

## Nota crítica: Sección 10 — Seguridad y RGPD (mínimo no negociable)

**gerocultores-system maneja datos de categoría especial (art. 9 RGPD): diagnósticos, medicación, alergias, incidencias de salud.**

La sección 10 es **obligatoria** con un mínimo de **300 palabras**. Omitirla o tratarla superficialmente (< 200 palabras) es una penalización directa en la calificación de contenidos (50% del total).

Debe cubrir:
1. Identificación de los datos de categoría especial en el sistema
2. Medidas técnicas: HTTPS, RBAC, Firebase Security Rules, no localStorage en claro
3. Medidas organizativas: política de retención, datos ficticios en desarrollo
4. Base legal: art. 9 RGPD + legitimación del tratamiento en contexto sanitario-social
5. Derechos ARCO+L: cómo puede el titular de los datos ejercerlos

---

*Generado: 2026-03-29 — sdd-init agent — gerocultores-system*  
*Calibración: example-calibration-buycinduro.md + example-calibration-tasknest.md*  
*Engram topic key: academic/memory-template*
