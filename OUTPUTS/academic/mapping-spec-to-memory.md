# Mapa SPEC → Secciones de la Memoria Académica

> Relaciona los artefactos `SPEC/` con las secciones de la memoria académica que nutren.  
> Indica qué artefacto SPEC debe completarse primero para desbloquear la redacción de cada sección.  
> Generado por: sdd-explore agent — 2026-03-28  
> **Actualizado**: 2026-03-29 — sdd-init agent (sincronización con calibraciones Buycinduro + TaskNest y cambio de stack Vue/Firebase)  
> Trazabilidad: `sdd/example-memories/calibration-1` (obs. #138) y `sdd/example-memories/calibration-2` (obs. #140) en Engram.

---

## Guía de lectura

| Columna | Significado |
|---------|------------|
| **Sección de memoria** | Sección de la memoria académica que se va a redactar |
| **Artefacto SPEC fuente** | Archivo(s) SPEC/ que contienen la información necesaria |
| **Artefacto DECISIONS/ fuente** | ADRs relevantes para esa sección |
| **Estado del artefacto** | ✅ Disponible · ⚠️ DRAFT/Parcial · 🔲 Pendiente (con nota de qué falta) |
| **Artefacto desbloqueador** | El artefacto que DEBE existir antes de poder escribir esta sección |
| **Notas** | Consideraciones específicas para gerocultores-system |

---

## Tabla de mapeo

### Páginas preliminares

| Sección de memoria | Artefacto SPEC fuente | Artefacto DECISIONS/ fuente | Estado fuente | Artefacto desbloqueador | Notas |
|-------------------|----------------------|-----------------------------|---------------|------------------------|-------|
| Portada | `PROJECT_BRIEF.md` | — | ✅ Disponible | Ninguno | Usar: título, autor (Jose Vilches Sánchez), ciclo DAW, curso 2025-2026, CIPFP Batoi d'Alcoi, tutor Andres Martos Gazquez |
| Primera página | `PROJECT_BRIEF.md` | — | ✅ Disponible | Ninguno | Igual que portada + tutor individual (ya en ADR-01b) |
| Agradecimientos | — | — | — | Ninguno | Contenido personal; no deriva de SPEC |
| Índice general | Todos los demás | — | 🔲 Pendiente | Completar toda la memoria | Generar al final; incluir todos los subapartados numerados con página exacta |

---

### 1. Introducción

| Artefacto SPEC fuente | Sección de SPEC relevante | Estado | Artefacto desbloqueador |
|----------------------|--------------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Visión, descripción del software, problema que resuelve | ✅ Disponible | Ninguno |
| `SPEC/requirements.md` | RF-01..RF-06 (objetivos principales) | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Contexto académico DAW, CIPFP Batoi, fechas de entrega | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Longitud objetivo**: 600–900 palabras (2–3 páginas).  
**Contenido que aporta cada fuente**:
- `PROJECT_BRIEF.md` → motivación, descripción del problema (gestión en papel, falta de trazabilidad).
- `SPEC/requirements.md` → objetivos técnicos concretos (agenda, residentes, incidencias).
- `SPEC/constraints.md` → contexto académico (ciclo DAW, CIPFP Batoi, deadline 2026-05-18).

> ⚠️ **Nota de stack (actualización 2026-03-29)**: la Introducción debe mencionar Vue 3 + Firebase como stack principal (ADR-01b/ADR-02b/ADR-03b en estado DRAFT, pendientes aprobación formal).

---

### 2. Fundamentos teóricos y prácticos

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `DECISIONS/ADR-01b.md` | Vue 3 + Vite + Pinia + Axios + Tailwind | ⚠️ DRAFT | **ADR-01b ACCEPTED** |
| `DECISIONS/ADR-02b.md` | Express API + Firestore | ⚠️ DRAFT | **ADR-02b ACCEPTED** |
| `DECISIONS/ADR-03b.md` | Firebase Auth | ⚠️ DRAFT | **ADR-03b ACCEPTED** |
| `DECISIONS/ADR-04b.md` | Despliegue (Firebase vs GCP — PENDIENTE) | 🔲 PENDIENTE | **ADR-04b ACCEPTED** |
| `SPEC/constraints.md` | RGPD art. 9, WCAG 2.1, redes lentas | ✅ Disponible | Ninguno |
| `TECH_GUIDE.md` | Stack completo con versiones | ⚠️ Parcial | ADR-01b..04b |

**Puede empezarse parcialmente** (frameworks, RGPD, accesibilidad), pero la sección completa requiere ADRs aprobados. ⚠️ Parcial  
**Longitud objetivo**: 900–1.400 palabras (3–5 páginas).  
**Contenido por subsección** (propuesta de estructura):
- `2.1 Arquitectura web SPA / REST API` → de constraints + ADR-01b
- `2.2 Vue 3 y Composition API` → ADR-01b (justificación de por qué Vue sobre React para este proyecto)
- `2.3 Pinia para gestión de estado` → ADR-01b
- `2.4 Express API REST` → ADR-02b
- `2.5 Firestore (NoSQL)` → ADR-02b (estructura de colecciones, decisión NoSQL vs SQL)
- `2.6 Firebase Auth` → ADR-03b
- `2.7 Firebase Security Rules` → ADR-03b + RNF-09
- `2.8 Accesibilidad WCAG 2.1` → constraints.md § 4
- `2.9 RGPD art. 9` → constraints.md § 3

> ⚠️ **[CALIBRADO DESDE EJEMPLO 1]**: No copiar párrafos de documentación oficial. Explicar SIEMPRE "por qué elegí X para ESTE proyecto concreto". El tribunal detecta el cambio de registro.

---

### 3. Presentación del contexto / organización

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Contexto de las residencias de mayores | ✅ Disponible | Ninguno |
| `SPEC/user-stories.md` | Actores: Gerocultor, Coordinador, Administrador | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Entorno de uso (tablet, redes lentas, uso con guantes) | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Longitud objetivo**: 400–700 palabras (1–2 páginas).  
**Contenido que aporta cada fuente**:
- `PROJECT_BRIEF.md` → problemática actual (papel, hojas sueltas, falta de trazabilidad entre turnos).
- `SPEC/user-stories.md` → perfil de los actores (gerocultor: formación sociosanitaria, no técnico informático).
- `SPEC/constraints.md` → entorno físico (tablet 10", redes lentas, uso con guantes, luz variable).

---

### 4. Análisis de requisitos

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/requirements.md` | RF-01..RF-12 + RNF-01..RNF-10 (incl. delta Vue/Firebase) | ✅ Disponible | Ninguno |
| `SPEC/user-stories.md` | US-01..US-12 + criterios de aceptación | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Restricciones técnicas y de privacidad | ✅ Disponible | Ninguno |

**Puede redactarse ya.** ✅  
**Longitud objetivo**: 600–1.000 palabras + tabla (2–4 páginas).  
**Contenido que aporta cada fuente**:
- `SPEC/requirements.md` → lista canónica de RF y RNF con actores y prioridad (MoSCoW). Incluye RNF-09 (Firestore Rules) y RNF-10 (PWA excluido).
- `SPEC/user-stories.md` → formato narrativo con criterios de aceptación medibles.
- `SPEC/constraints.md` → restricciones de privacidad (RGPD), accesibilidad y rendimiento.

> **Nota**: RNF-09 y RNF-10 son específicos del stack Vue/Firebase. Incluirlos en la memoria explica por qué PWA está fuera del alcance.

---

### 5. Diseño del sistema

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/entities.md` | Modelo de datos (7 entidades) | ✅ Disponible | Ninguno |
| `SPEC/flows.md` | Flujos principales FL-01..FL-06 | ✅ Disponible | Ninguno |
| `SPEC/api-contracts.md` | Contratos de endpoints Express API | ⚠️ Parcial | **api-contracts.md completo** |
| `DECISIONS/ADR-01b.md` | Arquitectura frontend (Vue/Atomic Design) | ⚠️ DRAFT | ADR-01b ACCEPTED |
| `DECISIONS/ADR-02b.md` | Arquitectura backend (Express + Firestore) | ⚠️ DRAFT | ADR-02b ACCEPTED |
| `DECISIONS/ADR-05.md` | Decisión de diseño/prototipado (Stitch) | ✅ Disponible | Ninguno |

**Puede empezarse parcialmente** (entidades + flujos + diseño UX). La sección de API requiere api-contracts.md completo. ⚠️ Parcial  
**Longitud objetivo**: 900–1.600 palabras + 3 diagramas (3–6 páginas).  
**Contenido que aporta cada fuente**:
- `SPEC/entities.md` → diagrama E-R / colecciones Firestore + campos por entidad.
- `SPEC/flows.md` → 6 flujos de usuario (inicio de sesión, agenda, actualizar tarea, incidencia, historial, cierre de turno).
- `SPEC/api-contracts.md` → endpoints de la API Express con métodos, rutas y contratos JSON.
- `DECISIONS/ADR-01b.md` → justificación de Atomic Design + Pinia stores por dominio.
- `DECISIONS/ADR-05.md` → proceso de diseño UX con Stitch; incluir wireframes exportados.

> ⚠️ **[CALIBRADO DESDE EJEMPLO 2]**: Incluir al menos 2–3 wireframes que muestren el PROCESO de diseño (prototipo inicial → iteración → versión final), no solo el resultado final.
> ⚠️ **AP-03**: Sección sin diagramas = penalización formal. Obligatorio: diagrama E-R/colecciones + diagrama de arquitectura + capturas de UI.

---

### 6. Fases de implementación técnica

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PLAN/current-sprint.md` | Planificación Sprint 0 (activo) | ✅ Disponible | Ninguno |
| `PLAN/backlog.md` | Backlog T-01..T-95 | ✅ Disponible | Ninguno |
| `PLAN/tasks-summary.md` | Resumen de tareas por sprint | ✅ Disponible | Ninguno |
| `DECISIONS/ADR-*.md` | Decisiones técnicas durante el desarrollo | ⚠️ DRAFT | ADR-01b..04b |
| `LOGS/` | Notas de sesión y problemas encontrados | ✅ Disponible (parcial) | Ninguno |

**No puede redactarse completamente hasta que el desarrollo esté en marcha.** 🔲 Bloqueada  
**Esta sección se redacta principalmente a posteriori (durante/al final del desarrollo).**  
**Longitud objetivo**: 1.200–2.200 palabras + capturas (4–7 páginas).  
**Estructura recomendada** (por sprint):
- Sprint 0: configuración entorno, scaffolding Vue + Firebase, Emulator Suite
- Sprint 1: Firebase Auth, RBAC, Firestore Rules base
- Sprint 2: Agenda diaria (US-03, US-04)
- Sprint 3: Fichas de residentes (US-05), Registro de incidencias (US-06)
- Sprint 4: Historial (US-07), Notificaciones (US-08), Cierre de turno (US-11)
- Sprint 5: Pruebas, correcciones, ajustes finales, entrega

> ⚠️ **[CALIBRADO DESDE EJEMPLO 2 — AP-06]**: Organizar POR SPRINT, NO por tecnología. Cada sprint: objetivo → tareas completadas → captura UI → problema encontrado + solución. La narrativa cronológica es lo que el tribunal evalúa.

---

### 7. Estudio del coste económico y organizativo

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PLAN/backlog.md` | Estimación de horas por tarea | ✅ Disponible | Ninguno |
| `PLAN/tasks-generated.csv` | Estimaciones por tarea en CSV | ✅ Disponible | Ninguno |
| `PLAN/current-sprint.md` | Horas reales dedicadas | 🔲 Parcial | Completar sprints |
| `SPEC/constraints.md` | Herramientas y hosting (coste 0, planes gratuitos) | ✅ Disponible | Ninguno |

**Puede empezarse (estimaciones)**, pero la tabla real de horas requiere terminar el desarrollo. ⚠️ Parcial  
**Longitud objetivo**: 300–500 palabras + 2 tablas (1–2 páginas).  
**Tabla de herramientas** (planes gratuitos disponibles): VS Code, GitHub, Firebase Spark plan, Stitch/Figma free tier, Vitest, Playwright.

---

### 8. Comparación con alternativas

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `PROJECT_BRIEF.md` | Problema que resuelve / situación actual | ✅ Disponible | Ninguno |
| `SPEC/constraints.md` | Restricciones de presupuesto (plan gratuito) | ✅ Disponible | Ninguno |

**Puede redactarse ya** (requiere investigación de alternativas comerciales). ✅  
**Longitud objetivo**: 400–700 palabras + tabla comparativa (1–2 páginas).  
**Alternativas a investigar**: CareMaster, aCareGiver, Google Sheets, Gestion Residencias SaaS.  
**Tabla recomendada**: Alternativa | Precio/mes | Personalización | Privacidad datos salud | ¿Por qué descartada?

> ⚠️ **[CALIBRADO DESDE EJEMPLO 2 — AP-08]**: Incluir tabla comparativa estructurada. La descripción en prosa de cada alternativa sin tabla no aporta valor analítico.

---

### 9. Pruebas

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `OUTPUTS/test-plans/` | Planes de test por user story | 🔲 **Vacío** | **test-plan-US-01..12** (Tester) |
| `SPEC/user-stories.md` | Criterios de aceptación (CA-X) | ✅ Disponible | Ninguno |
| `SPEC/requirements.md` | Criterios de aceptación de RNF | ✅ Disponible | Ninguno |

**No puede redactarse hasta que existan los planes de test y se ejecuten las pruebas.** 🔲 Bloqueada  
**Longitud objetivo**: 600–900 palabras + tabla de resultados (2–3 páginas).  
**Tabla obligatoria de resultados**: Tipo de prueba | N.º tests | Pasados | Fallidos | Cobertura (%)  
**Tipos de prueba para gerocultores-system**: Vitest (unitarios), Playwright (E2E), Firebase Emulator Suite (Firestore Rules), pruebas de usabilidad en tablet/móvil.

> ⚠️ **[CALIBRADO DESDE EJEMPLO 2 — AP-09]**: Sin tabla de resultados, el tribunal no puede evaluar si el testing fue real. La tabla es obligatoria.

---

### 10. Seguridad y cumplimiento RGPD

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/constraints.md` | Sección 3: RGPD y medidas de privacidad | ✅ Disponible | Ninguno |
| `SPEC/entities.md` | Campos marcados RGPD dato sensible | ✅ Disponible | Ninguno |
| `SPEC/flows.md` | FL-01 (autenticación y autorización) | ✅ Disponible | Ninguno |
| `DECISIONS/ADR-03b.md` | Firebase Auth (seguridad) | ⚠️ DRAFT | ADR-03b ACCEPTED |
| `SPEC/requirements.md` | RNF-03, RNF-07, RNF-09 | ✅ Disponible | Ninguno |

**Puede empezarse ya** (con constraints + entities + RNF-03, RNF-07, RNF-09). ✅ Parcial  
**Longitud objetivo**: **400–600 palabras mínimo** (1–2 páginas). **MÍNIMO ABSOLUTO: 300 palabras.**  
**Contenido obligatorio**:
1. Categoría especial (art. 9 RGPD): diagnósticos, alergias, medicación, incidencias de salud
2. RBAC: roles Gerocultor, Coordinador, Administrador y sus permisos
3. Firebase Security Rules: acceso directo Firestore bloqueado sin autenticación
4. HTTPS obligatorio en producción
5. Auditoría de accesos (RNF-07: timestamp + usuario + acción en cada operación)
6. Política de retención (5 años tras alta del residente — configurable)
7. Datos ficticios en entorno de desarrollo (nunca datos reales de pacientes)

> ⚠️ **Esta sección es CRÍTICA**. gerocultores-system maneja datos de salud (art. 9 RGPD). Omitirla o tratarla superficialmente puede resultar en penalización directa en la calificación de contenidos (50% de la nota).

---

### 11. Conclusiones

| Artefacto SPEC fuente | Sección relevante | Estado | Artefacto desbloqueador |
|----------------------|-------------------|--------|------------------------|
| `SPEC/user-stories.md` | US completadas vs. planificadas | 🔲 Pendiente (requiere desarrollo) | **Completar desarrollo** |
| `PLAN/backlog.md` | Features planificadas | ✅ Disponible | Ninguno |
| `LOGS/` | Problemas y decisiones de la sesión | ✅ Disponible | Ninguno |

**No puede redactarse hasta el final del desarrollo.** 🔲 Bloqueada  
**Longitud objetivo**: 400–600 palabras (1–2 páginas).  
**Contenido obligatorio** (con datos cuantitativos):
- US completadas vs. planificadas (p.ej. "10 de 12 historias de usuario implementadas")
- Horas totales reales vs. estimadas
- Cobertura de tests obtenida
- 1–2 problemas concretos encontrados y resueltos
- Funcionalidades que quedaron fuera del alcance y por qué
- Líneas de trabajo futuro

> ⚠️ **AP-04**: Conclusiones sin datos cuantitativos son de bajo valor percibido. "Ha sido un proyecto enriquecedor" sin datos es un antipatrón detectado por el tribunal.

---

### 12. Necesidades de formación

**Fuentes**: Reflexión personal del alumno. Sin fuente SPEC directa.  
**Puede redactarse en cualquier momento.** ✅  
**Longitud objetivo**: 150–300 palabras (3–5 áreas concretas).  
**Áreas sugeridas** (completar con experiencia real durante el desarrollo):
- Vue 3 Composition API avanzada (composables, teleport, Suspense)
- Firebase Security Rules y testing con Emulator Suite
- Testing E2E con Playwright para SPA con autenticación
- Diseño de accesibilidad WCAG 2.1 (auditoría con axe-core)
- Firestore: modelado de datos NoSQL vs. SQL relacional

---

### 13. Bibliografía

**Fuentes**: Investigación del alumno durante el desarrollo. Sin fuente SPEC directa.  
**Construir progresivamente** durante el desarrollo: anotar cada recurso consultado.  
**Mínimo**: 8 referencias. **Recomendado**: 10–15 referencias.  
**Formato**: APA + comentario breve de uso por referencia (norma CIPFP Batoi).  
**Referencias iniciales sugeridas**:
- RGPD (UE) 2016/679 — para justificar sección 10
- Documentación oficial Vue 3 (vue.js.org) — con resumen propio, no copiar
- Firebase Documentation — ídem
- WCAG 2.1 (W3C) — para justificar RNF-05

---

### 14. Recursos utilizados

| Artefacto SPEC fuente | Sección relevante | Estado |
|----------------------|-------------------|--------|
| `SPEC/constraints.md` | Herramientas listadas (Node.js, VS Code, Docker) | ✅ Disponible |
| `TECH_GUIDE.md` | Stack completo con versiones | ⚠️ Parcial |

**Puede empezarse ya** con las herramientas conocidas. Completar al final con versiones exactas. ✅ Parcial  
**Tabla inicial** (completar versiones al final):

| Herramienta | Tipo | Versión | Coste |
|------------|------|---------|-------|
| Vue 3 + Vite | Framework frontend | 3.x / 5.x | Gratuito (MIT) |
| Pinia | Gestión de estado | 2.x | Gratuito (MIT) |
| Tailwind CSS | Framework CSS | 3.x | Gratuito (MIT) |
| Express | API REST | 4.x | Gratuito (MIT) |
| Firebase Auth | Autenticación | — | Gratuito (Spark) |
| Firestore | Base de datos | — | Gratuito (Spark) |
| Vitest | Testing unitario | — | Gratuito (MIT) |
| Playwright | Testing E2E | — | Gratuito (MIT) |
| GitHub | Repositorio | — | Gratuito |
| VS Code | IDE | — | Gratuito |
| Docker Desktop | Entorno de desarrollo | — | Gratuito (plan personal) |

---

## Resumen: Orden de redacción recomendado

```
FASE 0 — Ya disponible (redactar AHORA — antes del martes 31):
  ├── Portada + Primera página
  ├── 3. Contexto / organización
  ├── 1. Introducción
  ├── 4. Análisis de requisitos
  ├── 8. Comparación con alternativas (+ investigación propia)
  └── 12. Necesidades de formación

FASE 1 — Desbloquea cuando ADR-01b..04b pasen de DRAFT → ACCEPTED:
  ├── 2. Fundamentos teóricos (completo)
  └── 5. Diseño del sistema (sección API)
  
FASE 1.5 — Parcialmente disponible YA (entidades + flujos + diseño UX):
  ├── 5. Diseño del sistema (entidades, flujos, wireframes Stitch)
  └── 10. Seguridad / RGPD (base con constraints + entities)

FASE 2 — Desbloquea cuando OUTPUTS/test-plans/ existan:
  └── 9. Pruebas (bloqueado por Tester)

FASE 3 — Durante el desarrollo (Sprint 1 en adelante):
  ├── 6. Implementación técnica (por sprint)
  └── 7. Coste económico (horas reales)

FASE 4 — Al terminar el desarrollo:
  ├── 11. Conclusiones
  ├── 13. Bibliografía (acumulativa)
  └── 14. Recursos (versiones finales)

FASE 5 — Al final de todo:
  └── Índice general + Contraportada
```

---

## Artefactos críticos que deben crearse para desbloquear la memoria

| Artefacto | Secciones que desbloquea | Agente responsable | Estado actual |
|-----------|--------------------------|-------------------|--------------|
| `DECISIONS/ADR-01b.md` (Vue/frontend) ACCEPTED | 2, 5, 6 | ARCHITECT + Jose (aprobación) | ⚠️ DRAFT |
| `DECISIONS/ADR-02b.md` (Express+Firestore) ACCEPTED | 2, 5, 6 | ARCHITECT + Jose | ⚠️ DRAFT |
| `DECISIONS/ADR-03b.md` (Firebase Auth) ACCEPTED | 2, 5, 10 | ARCHITECT + Jose | ⚠️ DRAFT |
| `DECISIONS/ADR-04b.md` (Despliegue) ACCEPTED | 2, 7 | ARCHITECT + Jose (decisión hosting) | 🔲 PENDIENTE |
| `SPEC/api-contracts.md` (completo) | 5 | DEVELOPER | ⚠️ Parcial |
| `OUTPUTS/test-plans/test-plan-US-*.md` | 9 | TESTER | 🔲 Vacío |

---

## Inconsistencias detectadas durante esta actualización

> Ver también: `OUTPUTS/academic/inconsistencies.md` (si existe).

| # | Inconsistencia | Impacto | Acción recomendada |
|---|---------------|---------|-------------------|
| INC-01 | El mapping original (2026-03-28) referenciaba ADR-01..04 como "no creados". Ahora existen ADR-01b..03b (DRAFT) y ADR-04b (pendiente resolución hosting). El mapping se ha actualizado para reflejar DRAFT en lugar de "no creado". | Medio | Aprobar ADRs formalmente cuanto antes |
| INC-02 | `PROJECT_BRIEF.md` tiene 4 secciones TODO sin completar (Usuarios objetivo, Problema que resuelve, Alcance MVP, Stack técnico). La sección 3 de la memoria (Contexto) se verá afectada por esta falta. | Alto | Completar PROJECT_BRIEF.md antes de redactar la sección 3 |
| INC-03 | `SPEC/user-stories.md` US-08 CA-4 menciona notificaciones push/PWA, pero RNF-10 excluye PWA del alcance. El delta de la US-08 aclara que solo son in-app, pero el CA-4 original podría confundir al tribunal. | Medio | Verificar coherencia US-08 CA-4 en la memoria final |

---

*Documento generado: 2026-03-28 — sdd-explore agent — gerocultores-system*  
*Referencia: calibración `example-calibration-buycinduro.md` (obs. #138) y `example-calibration-tasknest.md` (obs. #140)*  
*Última actualización: 2026-03-29 — sdd-init agent [SINCRONIZADO CON STACK VUE/FIREBASE + CALIBRACIONES EJEMPLO 1 + EJEMPLO 2]*
