# OUTPUTS/academic — Memoria del Proyecto Final DAW

> Secciones generadas para la memoria académica del ciclo DAW — CIPFP Batoi d'Alcoi.
> El Writer Agent genera borradores en esta carpeta. El Reviewer verifica cobertura (guardrail G09).
>
> **Autor**: Jose Vilches Sánchez  
> **Título del proyecto**: Desarrollo de una agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Ciclo**: CFS Desarrollo de Aplicaciones Web (DAW)

---

## Criterios de calificación

| Criterio | Peso |
|----------|------|
| Aspectos formales (presentación, estructura, organización, redacción) | **20%** |
| Contenidos (dificultad, resolución, originalidad, actualidad, alternativas, resultados) | **50%** |
| Exposición y defensa oral (calidad de la exposición y respuestas al tribunal) | **30%** |

> Nota final: numérica, hasta 10 puntos, sin decimales.

---

## Fechas clave

| Hito | Fecha |
|------|-------|
| Primera entrega parcial recomendada | **Antes del 30 de abril de 2026** |
| Entrega final | **Primera semana de junio de 2026** (fecha exacta pendiente) |
| Exposición oral (máx. 20 minutos) | **A lo largo de junio de 2026** |
| Tribunal | Jefe de departamento + tutor de grupo + tutor individual |

> ⚠️ El proyecto no puede presentarse hasta que todos los módulos estén aprobados y la FCT finalizada.

---

## Formato de entrega

- **Formato**: PDF.
- **Márgenes**: ≤ 2,5 cm.
- **Fuente**: formal, 10–12 pt.
- **Interlineado**: sencillo.
- **Cabecera**: título del proyecto.
- **Pie de página**: nombre del alumno + número de página.
- **Imágenes**: nítidas, numeradas y con pie de imagen comentado.
- **Código fuente**: entregado vía repositorio (GitHub/GitLab).

---

## Checklist de secciones requeridas (estructura orientativa DAW)

Marca las secciones conforme se vayan generando y validando.

### Páginas preliminares

- [ ] **Portada** — Título, autor, ciclo formativo, curso/fecha, nombre del centro, logotipo.
- [ ] **Primera página** — Información de portada + nombre del tutor individual.
- [ ] **Agradecimientos** *(opcional)*
- [ ] **Índice general** — Apartados, subapartados y páginas.

### Cuerpo de la memoria

- [ ] **1. Introducción** — Motivos del proyecto, descripción y objetivos, aplicaciones prácticas, presentación de los apartados.
- [ ] **2. Fundamentos teóricos y prácticos** — Marco conceptual relevante (arquitecturas web, PWA, accesibilidad, RGPD en salud, etc.).
- [ ] **3. Presentación del contexto / organización** — Descripción del entorno real de uso (residencias de mayores, perfil de los gerocultores, problemática actual).
- [ ] **4. Análisis de requisitos** — Requisitos funcionales (RF-01…RF-12) y no funcionales (RNF-01…RNF-08). Basado en `SPEC/requirements.md`.
- [ ] **5. Diseño del sistema** — Arquitectura general (frontend/backend/BD), entidades del dominio, diagrama entidad-relación, flujos principales, diseño de la API. Basado en `SPEC/entities.md`, `SPEC/flows.md`, `SPEC/api-contracts.md`.
- [ ] **6. Fases de implementación técnica** — Descripción cronológica del desarrollo: UX/arquitectura, frontend, backend, integración, pruebas. Problemas encontrados y soluciones adoptadas. Decisiones técnicas (ADRs).
- [ ] **7. Estudio del coste económico y organizativo** — Estimación de horas de desarrollo, herramientas utilizadas (coste cero o coste mínimo), coste de infraestructura (cloud gratuito vs. de pago).
- [ ] **8. Comparación con la situación actual y alternativas** — Cómo se gestiona actualmente la agenda en residencias (papel, hojas sueltas), alternativas comerciales existentes (apps similares), justificación de la propuesta.
- [ ] **9. Pruebas** — Plan de tests, tipos de pruebas realizadas (unitarias, integración, E2E, usabilidad), resultados y cobertura obtenida.
- [ ] **10. Seguridad y cumplimiento RGPD** — Medidas implementadas para la protección de datos de categoría especial (datos de salud), cifrado, control de acceso, política de retención.

### Cierre de la memoria

- [ ] **11. Conclusiones** — Resultados obtenidos, puntos pendientes, tiempo total dedicado, dificultades encontradas, valoración personal, conexiones con la FCT, consejos para futuros proyectos similares.
- [ ] **12. Necesidades y sugerencias de formación** — Formación adicional que sería útil para el desarrollo de este tipo de proyectos.
- [ ] **13. Bibliografía** — Autor, título, editorial/web, año, comentario breve por referencia. Formato APA o similar.
- [ ] **14. Recursos utilizados** — Hardware, software, observaciones de instalación y configuración.

### Anexos (en el mismo documento, si aplica)

- [ ] **Anexo A** — Scripts de configuración del entorno de desarrollo.
- [ ] **Anexo B** — Fragmentos de código fuente relevantes (referencia al repositorio).
- [ ] **Anexo C** — Glosario de términos técnicos y del dominio (residencia de mayores, gerocultores, etc.).
- [ ] **Anexo D** — Normativa aplicable (resumen RGPD, WCAG 2.1).
- [ ] **Anexo E** — Documentación de la API (endpoints, contratos). *(Puede reemplazarse por enlace a `SPEC/api-contracts.md`)*

### Elementos opcionales

- [ ] **Índice de imágenes**
- [ ] **Índice de tablas**
- [ ] **Contraportada** — Resumen del contenido del proyecto.

---

## Cómo generar una sección

Usar el prompt: `PROMPTS/academic/write_memory_section.md`

Ejemplo de invocación:
> "Genera el borrador de la sección 4 (Análisis de requisitos) de la memoria académica,
> basándote en `SPEC/requirements.md` y `SPEC/user-stories.md`."

El Writer Agent producirá el archivo en `OUTPUTS/academic/seccion-XX-nombre.md`.

---

## Archivos generados en esta carpeta

| Archivo | Sección | Estado |
|---------|---------|--------|
| *(ninguno aún)* | — | — |

*Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*
