# Mapa SPEC → Secciones de la Memoria Académica

> Relaciona los artefactos `SPEC/` con las secciones de la memoria académica que nutren.  
> Indica qué artefacto SPEC debe completarse primero para desbloquear la redacción de cada sección.  
> Generado por: sdd-explore agent — 2026-03-28  
> Trazabilidad: `sdd/example-memories/calibration-1` y `sdd/example-memories/calibration-2` en engram.  
> **Última actualización**: 2026-03-28 — calibración desde ejemplo TaskNest [CALIBRADO DESDE EJEMPLO 2]

---

## Guía de lectura

| Columna | Significado |
|---------|------------|
| **Sección de memoria** | Sección de la memoria académica que se va a redactar |
| **Artefacto SPEC fuente** | Archivo(s) SPEC/ que contienen la información necesaria |
| **Artefacto DECISIONS/ fuente** | ADRs relevantes para esa sección |
| **Estado del artefacto** | ✅ Disponible · 🔲 Pendiente (con nota de qué falta) |
| **Artefacto desbloqueador** | El artefacto que DEBE existir antes de poder escribir esta sección |
| **Notas** | Consideraciones específicas para gerocultores-system |

---

## Tabla de mapeo

### Páginas preliminares

| Sección de memoria | Artefacto SPEC fuente | Artefacto DECISIONS/ fuente | Estado fuente | Artefacto desbloqueador | Notas |
|-------------------|----------------------|-----------------------------|---------------|------------------------|-------|
| Portada | `PROJECT_BRIEF.md` | — | ✅ Disponible | Ninguno | Usar datos de `PROJECT_BRIEF.md`: título, autor, ciclo, centro |
| Primera página | `PROJECT_BRIEF.md` | — | ✅ Disponible | Ninguno | Añadir nombre del tutor individual (no en SPEC, preguntar al alumno) |
| Agradecimientos | — | — | — | Ninguno | Contenido personal; no deriva de SPEC |
| Índice general | Todos los demás | — | 🔲 Pendiente | Completar toda la memoria | Generar al final automáticamente |

---

### 1. Introducción

| Artefacto SPEC fuente | Sección de SPEC relevante | Estado | Artefacto desbloqueador |
|----------------------|--------------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Visión, objetivos, problema que resuelve | ✅ Disponible | Ninguno |
| `SPEC/requirements.md` | Objetivo general (primeros 2 RF) | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Contexto académico y restricciones | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Contenido que aporta cada fuente**:
- `PROJECT_BRIEF.md` → motivación, descripción del problema, objetivos generales.
- `SPEC/requirements.md` → objetivos técnicos concretos.
- `SPEC/constraints.md` → contexto académico (ciclo DAW, CIPFP Batoi).

---

### 2. Fundamentos teóricos y prácticos

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `DECISIONS/ADR-01.md` | Decisión de framework frontend | 🔲 Pendiente (no creado) | **ADR-01** (desbloquea esta sección) |
| `DECISIONS/ADR-02.md` | Decisión de framework backend | 🔲 Pendiente (no creado) | **ADR-02** |
| `DECISIONS/ADR-03.md` | Decisión de base de datos | 🔲 Pendiente (no creado) | **ADR-03** |
| `DECISIONS/ADR-04.md` | Decisión de despliegue/hosting | 🔲 Pendiente (no creado) | **ADR-04** |
| `SPEC/constraints.md` | RGPD, accesibilidad, rendimiento | ✅ Disponible | Ninguno |
| `TECH_GUIDE.md` | Stack tecnológico elegido | 🔲 Parcial (pendiente stack final) | ADR-01..04 |

**No puede redactarse hasta que existan al menos ADR-01, ADR-02, ADR-03.** 🔲  
**Contenido que aporta cada fuente**:
- `DECISIONS/ADR-*.md` → justificación de cada elección tecnológica (esto es el núcleo de esta sección).
- `SPEC/constraints.md` → RGPD (art. 9), accesibilidad WCAG 2.1, rendimiento en redes lentas.
- `TECH_GUIDE.md` → convenciones de código, estructura del proyecto.

---

### 3. Presentación del contexto / organización

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Contexto de las residencias de mayores | ✅ Disponible | Ninguno |
| `SPEC/user-stories.md` | Actores: Gerocultor, Coordinador, Administrador | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Descripción del entorno de uso (tablet, redes lentas) | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Contenido que aporta cada fuente**:
- `PROJECT_BRIEF.md` → problemática actual (papel, hojas sueltas, falta de trazabilidad).
- `SPEC/user-stories.md` → perfil de los actores (gerocultor, coordinador).
- `SPEC/constraints.md` → entorno físico (tablet, redes lentas, uso con guantes).

---

### 4. Análisis de requisitos

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/requirements.md` | RF-01..RF-12 + RNF-01..RNF-08 | ✅ Disponible | Ninguno |
| `SPEC/user-stories.md` | US-01..US-12 + criterios de aceptación | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Restricciones técnicas y de privacidad | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Contenido que aporta cada fuente**:
- `SPEC/requirements.md` → lista canónica de RF y RNF con actores y prioridad (MoSCoW).
- `SPEC/user-stories.md` → formato narrativo "Como [actor], quiero [acción], para [objetivo]" con criterios de aceptación.
- `SPEC/constraints.md` → requisitos no funcionales de privacidad (RGPD), accesibilidad y rendimiento.

---

### 5. Diseño del sistema

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/entities.md` | Modelo de datos completo (7 entidades) | ✅ Disponible | Ninguno |
| `SPEC/flows.md` | Flujos principales FL-01..FL-06 | ✅ Disponible | Ninguno |
| `SPEC/api-contracts.md` | Contratos de endpoints | 🔲 Pendiente (fase 5) | **ADR-01..ADR-03** (stack API) |
| `DECISIONS/ADR-01.md` | Arquitectura frontend | 🔲 Pendiente | ADR-01 |
| `DECISIONS/ADR-02.md` | Arquitectura backend | 🔲 Pendiente | ADR-02 |
| `DECISIONS/ADR-03.md` | Capa de datos / ORM | 🔲 Pendiente | ADR-03 |

**Puede empezarse parcialmente** (entidades + flujos), pero la sección de API requiere ADR-01..03. 🔲 Parcial  
**Contenido que aporta cada fuente**:
- `SPEC/entities.md` → diagrama E-R (tabla de campos + diagrama textual ya incluido).
- `SPEC/flows.md` → diagramas de flujo de usuario para los 6 flujos principales.
- `SPEC/api-contracts.md` → tabla de endpoints con métodos, rutas y contratos JSON.
- `DECISIONS/ADR-*.md` → justificación de la arquitectura elegida (capas, patrones).

> **[CALIBRADO DESDE EJEMPLO 2]** Esta sección también debe incluir wireframes o prototipos del proceso de diseño UX (no solo la UI final). Fuente recomendada: exportación de Figma o capturas de pantalla de iteraciones de diseño. Desbloqueador adicional: disponer de al menos 2–3 pantallas prototipadas para incluir como evidencia del proceso de diseño.

---

### 6. Fases de implementación técnica

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PLAN/current-sprint.md` | Planificación por sprints/semanas | ✅ Disponible (parcial) | Ninguno |
| `PLAN/backlog.md` | Backlog priorizado | ✅ Disponible | Ninguno |
| `DECISIONS/ADR-*.md` | Decisiones técnicas tomadas durante el desarrollo | 🔲 Pendiente | **ADR-01..04** |
| `LOGS/` | Notas de sesión y problemas encontrados | ✅ Disponible (parcial) | Ninguno |

**No puede redactarse completamente hasta que el desarrollo esté en marcha.** 🔲 Bloqueada  
**Esta sección se redacta principalmente a posteriori (durante/al final del desarrollo).**  
**Contenido que aporta cada fuente**:
- `PLAN/current-sprint.md` → estructura cronológica del desarrollo (semana a semana).
- `DECISIONS/ADR-*.md` → problemas técnicos encontrados y decisiones adoptadas.
- `LOGS/` → registro de problemas reales encontrados durante la implementación.
- Capturas de pantalla propias durante el desarrollo.

> **[CALIBRADO DESDE EJEMPLO 2]** Estructura recomendada: organizar POR SPRINT/SEMANA, no por tecnología. Cada sprint debe incluir: objetivo, tareas completadas, captura de pantalla del estado de la UI, y (si aplica) problema encontrado + solución adoptada. Divergencia con ejemplo 1: ninguna — ambos ejemplos coinciden en que la narrativa cronológica es la estructura correcta.

---

### 7. Estudio del coste económico y organizativo

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PLAN/backlog.md` | Estimación de horas por tarea | ✅ Disponible | Ninguno |
| `PLAN/current-sprint.md` | Horas reales dedicadas | 🔲 Parcial | Completar sprints |
| `SPEC/constraints.md` | Herramientas y hosting (coste) | ✅ Disponible | Ninguno |

**Puede empezarse (estimaciones)**, pero la tabla real de horas requiere terminar el desarrollo. 🔲 Parcial  
**Contenido que aporta cada fuente**:
- `PLAN/backlog.md` → horas estimadas por historia de usuario.
- `PLAN/current-sprint.md` → horas reales dedicadas (para el informe final).
- `SPEC/constraints.md` → lista de herramientas y sus costes (plan gratuito).

---

### 8. Comparación con alternativas

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Problema que resuelve / situación actual | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Restricciones de presupuesto | ✅ Disponible | Ninguno |

**Puede redactarse ya** (requiere investigación de alternativas comerciales por parte del alumno). ✅  
**Contenido que aporta cada fuente**:
- `PROJECT_BRIEF.md` → situación actual (papel, hojas sueltas) que justifica el proyecto.
- `SPEC/constraints.md` → restricción de presupuesto mínimo que descarta alternativas de pago.
- Investigación externa: buscar 2–3 apps comerciales comparables (análisis propio del alumno).

---

### 9. Pruebas

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `OUTPUTS/test-plans/` | Planes de test por user story | 🔲 Pendiente (no creados) | **test-plans US-01..US-12** |
| `SPEC/user-stories.md` | Criterios de aceptación (CA-X) | ✅ Disponible | Ninguno |
| `SPEC/requirements.md` | Criterios de aceptación de RNF | ✅ Disponible | Ninguno |

**No puede redactarse hasta que existan los planes de test.** 🔲 Bloqueada  
**Contenido que aporta cada fuente**:
- `OUTPUTS/test-plans/` → estrategia de pruebas por US (unitarias, integración, E2E, usabilidad).
- `SPEC/user-stories.md` → criterios de aceptación como base para los casos de prueba.
- `SPEC/requirements.md` → criterios de aceptación de RNF (Lighthouse score, tiempo de respuesta).

> **[CALIBRADO DESDE EJEMPLO 2]** La sección debe incluir una tabla de resultados: Tipo de prueba | N.º tests | Pasados | Fallidos | Cobertura (%). Sin esta tabla, la sección tiene bajo valor percibido. Mínimo aceptable: 52 tests unitarios + tests E2E de flujos críticos.

---

### 10. Seguridad y cumplimiento RGPD

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/constraints.md` | Sección 3: RGPD y medidas de privacidad | ✅ Disponible | Ninguno |
| `SPEC/entities.md` | Campos marcados `<!-- RGPD: dato sensible -->` | ✅ Disponible | Ninguno |
| `SPEC/flows.md` | FL-01 (autenticación y autorización) | ✅ Disponible | Ninguno |
| `DECISIONS/ADR-*.md` | Decisiones de seguridad (JWT, bcrypt, HTTPS) | 🔲 Pendiente | ADR-01..02 |

**Puede empezarse ya** (con constraints + entities). Los detalles de implementación requieren ADRs. ✅ Parcial  
**Contenido que aporta cada fuente**:
- `SPEC/constraints.md` → RGPD art. 9, cifrado en tránsito, política de retención.
- `SPEC/entities.md` → qué campos son datos de categoría especial y por qué.
- `SPEC/flows.md` → cómo se implementa la autenticación y el control de acceso.

---

### 11. Conclusiones

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/user-stories.md` | US completadas vs. planificadas | 🔲 Pendiente (requiere desarrollo) | **Completar desarrollo** |
| `PLAN/backlog.md` | Features planificadas | ✅ Disponible | Ninguno |
| `LOGS/` | Problemas y decisiones de la sesión | ✅ Disponible | Ninguno |

**No puede redactarse hasta el final del desarrollo.** 🔲 Bloqueada  
**Redactar al final** con datos reales: horas totales, features completadas, cobertura de tests.

---

### 12. Necesidades de formación

**Fuentes**: Reflexión personal del alumno. Sin fuente SPEC directa.  
**Puede redactarse en cualquier momento.** ✅  
**Consejo**: Anotar durante el desarrollo las áreas donde hubo dificultades (JWT, accesibilidad, Docker, etc.).

---

### 13. Bibliografía

**Fuentes**: Investigación del alumno durante el desarrollo. Sin fuente SPEC directa.  
**Construir progresivamente** durante el desarrollo: anotar cada recurso consultado.  
**Artefacto desbloqueador**: Ninguno (acumulativo durante todo el proyecto).

---

### 14. Recursos utilizados

| Artefacto SPEC fuente | Sección relevante | Estado |
|----------------------|-------------------|--------|
| `SPEC/constraints.md` | Herramientas listadas (Node.js, Docker, VS Code) | ✅ Disponible |
| `TECH_GUIDE.md` | Stack completo con versiones | 🔲 Parcial |

**Puede empezarse ya** con las herramientas conocidas. Completar al final con versiones exactas. ✅ Parcial

---

## Resumen: Orden de redacción recomendado

Basado en las dependencias identificadas, el orden óptimo de redacción es:

```
FASE 0 — Ya disponible (redactar ahora):
  ├── Portada + Primera página
  ├── 3. Contexto / organización
  ├── 1. Introducción
  ├── 4. Análisis de requisitos
  ├── 8. Comparación con alternativas
  └── 12. Necesidades de formación

FASE 1 — Desbloquea ADR-01..04 (después de stack-decision):
  ├── 2. Fundamentos teóricos
  └── 5. Diseño del sistema (completo)

FASE 2 — Desbloquea test-plans (después del Tester):
  └── 9. Pruebas

FASE 3 — Durante/al final del desarrollo:
  ├── 6. Implementación técnica
  └── 10. Seguridad (detalles de implementación)

FASE 4 — Al terminar el desarrollo:
  ├── 7. Coste económico (horas reales)
  ├── 11. Conclusiones
  ├── 13. Bibliografía (acumulativa)
  └── 14. Recursos (versiones finales)

FASE 5 — Al final de todo:
  └── Índice general + Contraportada
```

---

## Artefactos SPEC críticos que deben crearse para desbloquear la memoria

| Artefacto | Secciones que desbloquea | Agente responsable |
|-----------|--------------------------|-------------------|
| `DECISIONS/ADR-01.md` (frontend) | 2, 5, 6, 10 | ARCHITECT |
| `DECISIONS/ADR-02.md` (backend) | 2, 5, 6, 10 | ARCHITECT |
| `DECISIONS/ADR-03.md` (base de datos) | 2, 5, 6 | ARCHITECT |
| `DECISIONS/ADR-04.md` (despliegue) | 2, 7 | ARCHITECT |
| `SPEC/api-contracts.md` (completo) | 5 | DEVELOPER |
| `OUTPUTS/test-plans/test-plan-US-*.md` | 9 | TESTER |

---

*Documento generado: 2026-03-28 — sdd-explore agent — gerocultores-system*  
*Referencia: calibración `example-calibration-buycinduro.md` (ejemplo 1) y `example-calibration-tasknest.md` (ejemplo 2)*  
*Última actualización: 2026-03-28 [CALIBRADO DESDE EJEMPLO 2]*
