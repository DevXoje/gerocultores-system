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

## Longitud de referencia

> [CALIBRADO DESDE EJEMPLO 1 + EJEMPLO 2] — Basado en el análisis de las memorias "Buycinduro" (32 p.) y "TaskNest" (30–38 p.), ambas del CIPFP Batoi, y en el patrón estándar de memorias DAW del centro.

Una memoria DAW individual bien estructurada ocupa **28–40 páginas** (sin anexos). El rango aceptable es 25–45 páginas. Por debajo de 20 páginas es insuficiente; por encima de 50 páginas, excesiva y penalizable en "aspectos formales".

> **Reconciliación entre ejemplos**: Ambas memorias se sitúan en el rango 30–38 p., confirmando que **30–35 páginas es el punto óptimo** para un proyecto individual de este nivel.

---

## Checklist de secciones requeridas (estructura orientativa DAW)

Marca las secciones conforme se vayan generando y validando.

### Páginas preliminares

- [ ] **Portada** — Título, autor, ciclo formativo, curso/fecha, nombre del centro, logotipo.
  > *Descripción*: Página de presentación del documento.  
  > *Longitud mínima*: 1 página. *Recomendada*: 1 página.  
  > [CALIBRADO DESDE EJEMPLO 1] La portada del proyecto "Buycinduro" incluía: título completo del proyecto, nombre completo del autor, ciclo formativo con código, año académico (2024-2025 o equivalente), nombre del centro y logotipo del CIPFP. La tipografía era formal y el título destacaba visualmente.

- [ ] **Primera página** — Información de portada + nombre del tutor individual.
  > *Descripción*: Repetición de la portada añadiendo el nombre completo del tutor.  
  > *Longitud mínima*: 1 página. *Recomendada*: 1 página.

- [ ] **Agradecimientos** *(opcional)*
  > *Descripción*: Reconocimiento a personas o instituciones que apoyaron el proyecto.  
  > *Longitud recomendada*: 100–200 palabras. Puede omitirse sin penalización.

- [ ] **Índice general** — Apartados, subapartados y páginas.
  > *Descripción*: Tabla de contenidos con números de página exactos. Imprescindible.  
  > *Longitud recomendada*: 1–2 páginas.  
  > [CALIBRADO DESDE EJEMPLO 1] El índice debe incluir todos los subapartados numerados (1.1, 1.2, etc.) con número de página correcto. Un índice sin números de página es un error formal que penaliza.

### Cuerpo de la memoria

- [ ] **1. Introducción** — Motivos del proyecto, descripción y objetivos, aplicaciones prácticas, presentación de los apartados.
  > *Descripción*: Presenta el proyecto, la motivación personal y el contexto. Es la primera sección que leerá el tribunal.  
  > *Longitud mínima*: 400 palabras (≈ 1 página). *Recomendada*: 600–900 palabras (2–3 páginas).  
  > *Fuentes SPEC*: `SPEC/requirements.md` (objetivos), `PROJECT_BRIEF.md` (visión del proyecto).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"La gestión de turnos y tareas en residencias de mayores se realiza habitualmente con papel o aplicaciones genéricas no diseñadas para el contexto sanitario-social, lo que genera pérdida de trazabilidad entre turnos y errores en la administración de medicación. Este proyecto propone una aplicación web accesible desde tablet que centraliza la información y mejora la coordinación entre gerocultores."*

- [ ] **2. Fundamentos teóricos y prácticos** — Marco conceptual relevante (arquitecturas web, PWA, accesibilidad, RGPD en salud, etc.).
  > *Descripción*: Explica las tecnologías, arquitecturas y normativas utilizadas, desde el punto de vista del alumno (no copiar documentación oficial).  
  > *Longitud mínima*: 600 palabras (≈ 1,5 páginas). *Recomendada*: 900–1.400 palabras (3–5 páginas).  
  > *Fuentes SPEC*: `DECISIONS/ADR-*.md` (justificación de cada decisión técnica), `SPEC/constraints.md`.  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"Se eligió React 18 como biblioteca de componentes para el frontend por su ecosistema maduro y su modelo de renderizado declarativo; la alternativa evaluada, Vue 3, se descartó por la menor experiencia previa. El patrón cliente-servidor con API REST stateless facilita la escalabilidad sin mantener estado de sesión en el servidor."*  
  > ⚠️ **Antipatrón a evitar**: Copiar párrafos literales de MDN, Wikipedia o documentación oficial. El tribunal lo detecta por el cambio de registro. Siempre resumir y explicar por qué se eligió para *este* proyecto.

- [ ] **3. Presentación del contexto / organización** — Descripción del entorno real de uso (residencias de mayores, perfil de los gerocultores, problemática actual).
  > *Descripción*: Contextualiza el problema que resuelve la aplicación: quiénes son los usuarios, cómo trabajan hoy, qué necesitan.  
  > *Longitud mínima*: 300 palabras (≈ 1 página). *Recomendada*: 400–700 palabras (1–2 páginas).  
  > *Fuentes SPEC*: `PROJECT_BRIEF.md`, `SPEC/user-stories.md` (descripción de actores).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"Una residencia de mayores mediana atiende entre 30 y 80 residentes con un equipo de 8–15 gerocultores distribuidos en tres turnos. Los gerocultores son perfiles con formación sociosanitaria, no técnicos informáticos, por lo que la interfaz debe ser intuitiva para usuarios con baja alfabetización digital y operable en condiciones de trabajo reales (guantes, prisas, luz variable)."*

- [ ] **4. Análisis de requisitos** — Requisitos funcionales (RF-01…RF-12) y no funcionales (RNF-01…RNF-08). Basado en `SPEC/requirements.md`.
  > *Descripción*: Lista estructurada de lo que el sistema debe hacer (RF) y cómo debe hacerlo (RNF), con criterios de aceptación medibles.  
  > *Longitud mínima*: 400 palabras + tabla de requisitos (≈ 1,5 páginas). *Recomendada*: 600–1.000 palabras (2–4 páginas).  
  > *Fuentes SPEC*: `SPEC/requirements.md` (canónico), `SPEC/user-stories.md`.  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de requisito bien redactado: *"RF-03 — Consulta de agenda diaria: el gerocultor debe ver al iniciar sesión todas las tareas del día actual ordenadas cronológicamente, con indicación visual del estado (pendiente, en curso, completada, con incidencia) y el residente asociado. Criterio de aceptación: la agenda carga en menos de 2 segundos; las tareas vencidas se resaltan en rojo."*  
  > ⚠️ **Antipatrón a evitar**: Requisitos sin criterios de aceptación. El tribunal no puede evaluar si se cumplieron.

- [ ] **5. Diseño del sistema** — Arquitectura general (frontend/backend/BD), entidades del dominio, diagrama entidad-relación, flujos principales, diseño de la API. Basado en `SPEC/entities.md`, `SPEC/flows.md`, `SPEC/api-contracts.md`.
  > *Descripción*: Describe la arquitectura del sistema, el modelo de datos y el diseño de la interfaz. Es la sección más técnica y visual.  
  > *Longitud mínima*: 500 palabras + 1 diagrama E-R (≈ 2 páginas). *Recomendada*: **900–1.600 palabras** + 3 diagramas/capturas (3–6 páginas). [CALIBRADO DESDE EJEMPLO 2]  
  > *Fuentes SPEC*: `SPEC/entities.md`, `SPEC/flows.md`, `SPEC/api-contracts.md`, `DECISIONS/`.  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"El modelo de datos central está formado por siete entidades: Usuario, Residente, Tarea, Incidencia, Turno, Notificacion y ResidenteAsignacion. La entidad ResidenteAsignacion implementa la relación M:N entre gerocultores y residentes, permitiendo que un gerocultor tenga varios residentes asignados y que un residente tenga varios gerocultores responsables según el turno."*  
  > [CALIBRADO DESDE EJEMPLO 2] Ejemplo adicional (énfasis en UX iterativa): *"El flujo de registro de incidencia fue el más rediseñado: el primer prototipo usaba un formulario modal de 10 campos. Tras pruebas con usuarios reales, se redujo a 3 campos obligatorios, con el resto opcionales en un panel lateral colapsable."*  
  > ⚠️ **Antipatrón a evitar (AP-03)**: Describir el diseño solo con texto, sin diagrama E-R, sin diagrama de arquitectura ni capturas de pantalla. El tribunal espera soporte visual.  
  > ⚠️ **Antipatrón a evitar (AP-07)**: Mencionar wireframes sin incluirlos. Incluir al menos 2–3 wireframes que muestren el proceso de diseño, no solo el resultado final. [CALIBRADO DESDE EJEMPLO 2]

- [ ] **6. Fases de implementación técnica** — Descripción cronológica del desarrollo: UX/arquitectura, frontend, backend, integración, pruebas. Problemas encontrados y soluciones adoptadas. Decisiones técnicas (ADRs).
  > *Descripción*: Narra el proceso de desarrollo semana a semana, con capturas de pantalla de la UI, fragmentos de código relevantes y relato honesto de los problemas encontrados y cómo se resolvieron.  
  > *Longitud mínima*: 800 palabras + capturas (≈ 3 páginas). *Recomendada*: **1.200–2.200 palabras** (4–7 páginas). [CALIBRADO DESDE EJEMPLO 2]  
  > *Fuentes SPEC*: `PLAN/current-sprint.md`, `DECISIONS/ADR-*.md`, `LOGS/`.  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"El mayor problema encontrado fue la sincronización de estado entre la agenda y el registro de incidencias: al crear una incidencia desde el detalle de una tarea, la tarea debía actualizarse automáticamente a estado 'con_incidencia' sin forzar un reload completo. Se resolvió mediante un contexto global que dispara un refetch selectivo al cerrar el modal de incidencia."*  
  > [CALIBRADO DESDE EJEMPLO 2] Ejemplo adicional (énfasis en pruebas de usabilidad): *"La Semana 5 se dedicó a pruebas de usabilidad con gerocultores reales. Los hallazgos clave fueron: (1) el icono de 'incidencia' no era reconocible sin etiqueta de texto, (2) los botones de acción eran insuficientes para uso con guantes (< 44 px táctiles). Ambos se corrigieron en la Semana 6 antes de la entrega."*  
  > ⚠️ **Antipatrón a evitar (AP-06)**: Organizar esta sección por tecnología ("React", "Node.js") en lugar de por sprints/semanas. La narrativa cronológica con problemas y soluciones es lo que el tribunal valora. [CALIBRADO DESDE EJEMPLO 2]

- [ ] **7. Estudio del coste económico y organizativo** — Estimación de horas de desarrollo, herramientas utilizadas (coste cero o coste mínimo), coste de infraestructura (cloud gratuito vs. de pago).
  > *Descripción*: Tabla de horas por fase, coste estimado en euros aplicando tarifa de mercado junior, y análisis de costes de herramientas y hosting.  
  > *Longitud mínima*: 200 palabras + tabla de horas (≈ 1 página). *Recomendada*: 300–500 palabras + 2 tablas (1–2 páginas).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"El coste de desarrollo se ha calculado aplicando una tarifa de 15 €/hora (junior), que representa el coste mínimo de mercado para un desarrollador en prácticas en Valencia. El total estimado de 120 horas equivale a 1.800 € de coste de desarrollo si fuera un encargo profesional. Las herramientas utilizadas tienen coste cero en el plan académico: VS Code (libre), GitHub (plan gratuito), Supabase (free tier)."*  
  > ⚠️ **Antipatrón a evitar**: Sección sin tabla de horas. La tabla desglosada por fase es esperada por el tribunal.

- [ ] **8. Comparación con la situación actual y alternativas** — Cómo se gestiona actualmente la agenda en residencias (papel, hojas sueltas), alternativas comerciales existentes (apps similares), justificación de la propuesta.
  > *Descripción*: Analiza qué soluciones existen actualmente y por qué la propuesta del proyecto es mejor o diferente para el contexto específico.  
  > *Longitud mínima*: 300 palabras (≈ 1 página). *Recomendada*: **400–700 palabras + tabla comparativa** (1–2 páginas). [CALIBRADO DESDE EJEMPLO 2]  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"Se analizaron tres alternativas: (1) CareMaster (SaaS de 120 €/mes/residencia), (2) aCareGiver (app móvil de 8 €/usuario/mes) y (3) hojas de cálculo en Google Sheets (coste cero, sin control de acceso). Ninguna se adapta a una residencia pequeña con presupuesto ajustado y necesidad de personalización. La propuesta permite un coste operativo de 0 € (infraestructura gratuita) con funcionalidad específica para gerocultores."*  
  > [CALIBRADO DESDE EJEMPLO 2] Ejemplo de tabla comparativa: Incluir columnas Alternativa | Precio/mes | Personalización | Privacidad datos de salud | ¿Por qué descartada?  
  > ⚠️ **Antipatrón a evitar (AP-08)**: Describir las alternativas en prosa sin tabla comparativa. El tribunal espera una comparación sistemática, no una descripción narrativa de cada herramienta. [CALIBRADO DESDE EJEMPLO 2]

- [ ] **9. Pruebas** — Plan de tests, tipos de pruebas realizadas (unitarias, integración, E2E, usabilidad), resultados y cobertura obtenida.
  > *Descripción*: Describe la estrategia de pruebas adoptada, los casos de prueba más representativos y los resultados cuantificables (cobertura %, tests pasados/fallidos).  
  > *Longitud mínima*: **400 palabras** + tabla de resultados (≈ 1,5 páginas). *Recomendada*: **600–900 palabras** (2–3 páginas). [CALIBRADO DESDE EJEMPLO 2]  
  > *Fuentes SPEC*: `OUTPUTS/test-plans/`, `SPEC/user-stories.md` (criterios de aceptación).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"Se ejecutaron 47 tests unitarios sobre la lógica de negocio del backend, con una cobertura del 68% de las líneas del módulo de servicios. Los tests E2E con Playwright validaron los 6 flujos principales: inicio de sesión, consulta de agenda, registro de incidencia, marcar tarea, consulta de historial y cierre de turno. Todos pasaron en la rama main en el momento de la entrega."*  
  > [CALIBRADO DESDE EJEMPLO 2] Ejemplo de tabla de resultados de tests: Tipo | N.º tests | Pasados | Fallidos | Cobertura  
  > ⚠️ **Antipatrón a evitar (AP-09)**: Describir la estrategia de testing sin incluir resultados cuantificables (n.º de tests, cobertura %). El tribunal no puede evaluar si el testing fue real o simbólico. [CALIBRADO DESDE EJEMPLO 2]

- [ ] **10. Seguridad y cumplimiento RGPD** — Medidas implementadas para la protección de datos de categoría especial (datos de salud), cifrado, control de acceso, política de retención.
  > *Descripción*: Explica las medidas de seguridad técnicas adoptadas y cómo cumple el sistema con el RGPD para datos de salud (categoría especial, art. 9).  
  > *Longitud mínima*: **300 palabras** (≈ 1 página — **obligatorio**, sin excepción para datos de salud). *Recomendada*: **400–600 palabras** (1–2 páginas). [CALIBRADO DESDE EJEMPLO 2]  
  > *Fuentes SPEC*: `SPEC/constraints.md` (sección RGPD), `SPEC/entities.md` (campos marcados RGPD).  
  > [CALIBRADO DESDE EJEMPLO 2] Ejemplo de párrafo de alto valor: *"El sistema implementa RBAC con tres roles: ADMIN, COORDINADOR y GEROCULTOR. Los endpoints verifican el rol via middleware antes de procesar la petición. Los datos de residentes (diagnósticos, alergias, medicación) son categoría especial según art. 9 RGPD: se cifran en tránsito (HTTPS forzado), se audita cada acceso, y la política de retención establece 5 años tras el alta del residente."*  
  > ⚠️ Esta sección es **crítica** para proyectos con datos de salud. Omitirla o tratarla superficialmente puede resultar en penalización.

### Cierre de la memoria

- [ ] **11. Conclusiones** — Resultados obtenidos, puntos pendientes, tiempo total dedicado, dificultades encontradas, valoración personal, conexiones con la FCT, consejos para futuros proyectos similares.
  > *Descripción*: Cierre reflexivo del proyecto: qué se logró, qué quedó fuera, cuánto tiempo costó y qué aprendiste.  
  > *Longitud mínima*: 300 palabras (≈ 1 página). *Recomendada*: 400–600 palabras (1–2 páginas).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de párrafo de alto valor: *"El objetivo principal —una aplicación funcional de gestión de agenda para gerocultores— se ha alcanzado. Las funcionalidades de notificaciones push y la vista de agenda semanal quedaron fuera del alcance por limitaciones de tiempo. El tiempo total dedicado fue de 120 horas en 8 semanas. La parte más costosa fue el diseño de la API y la gestión del estado de autenticación (≈ 30% del tiempo total)."*  
  > ⚠️ **Antipatrón a evitar**: Conclusiones genéricas sin datos cuantitativos ("ha sido enriquecedor"). El tribunal espera horas, features completadas vs. planificadas, y problemas concretos resueltos.

- [ ] **12. Necesidades y sugerencias de formación** — Formación adicional que sería útil para el desarrollo de este tipo de proyectos.
  > *Descripción*: Lista de 3–5 áreas o cursos concretos que hubieran ayudado al desarrollo del proyecto y que el alumno considera útiles para proyectos similares.  
  > *Longitud mínima*: 100 palabras (3 ítems). *Recomendada*: 150–300 palabras (5 ítems).  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de ítem de alto valor: *"Formación específica en diseño de accesibilidad (WCAG 2.1): aunque se cumple el nivel AA básico, un curso sobre auditoría de accesibilidad con axe-core y NVDA hubiera acelerado las decisiones de diseño de componentes interactivos."*

- [ ] **13. Bibliografía** — Autor, título, editorial/web, año, comentario breve por referencia. Formato APA o similar.
  > *Descripción*: Lista de todas las fuentes consultadas durante el proyecto, con formato consistente y comentario de por qué se usó cada referencia.  
  > *Longitud mínima*: 8 referencias. *Recomendada*: 10–15 referencias.  
  > [CALIBRADO DESDE EJEMPLO 1] Ejemplo de referencia bien formateada: *"Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD). (2016). Diario Oficial de la Unión Europea. Consultado en: https://eur-lex.europa.eu — Utilizado para definir las restricciones de tratamiento de datos de salud en el módulo de residentes."*  
  > ⚠️ **Antipatrón a evitar**: URLs sin formato, sin año ni autor, sin comentario de uso. La norma del CIPFP Batoi exige comentario breve por referencia.

- [ ] **14. Recursos utilizados** — Hardware, software, observaciones de instalación y configuración.
  > *Descripción*: Tabla de hardware y software utilizado durante el desarrollo, con versiones y notas de configuración relevantes.  
  > *Longitud mínima*: 1 tabla. *Recomendada*: 100–200 palabras + tabla.

### Anexos (en el mismo documento, si aplica)

- [ ] **Anexo A** — Scripts de configuración del entorno de desarrollo.
- [ ] **Anexo B** — Fragmentos de código fuente relevantes (referencia al repositorio).
- [ ] **Anexo C** — Glosario de términos técnicos y del dominio (residencia de mayores, gerocultores, etc.).
- [ ] **Anexo D** — Normativa aplicable (resumen RGPD, WCAG 2.1).
- [ ] **Anexo E** — Documentación de la API (endpoints, contratos). *(Puede reemplazarse por enlace a `SPEC/api-contracts.md`)*

> *Longitud orientativa de anexos*: 0–5 páginas en total. No son obligatorios pero añaden valor si contienen información técnica real (scripts probados, código comentado, glosario del dominio).

### Elementos opcionales

- [ ] **Índice de imágenes**
- [ ] **Índice de tablas**
- [ ] **Contraportada** — Resumen del contenido del proyecto.

---

## Antipatrones críticos a evitar

> [CALIBRADO DESDE EJEMPLO 1 + EJEMPLO 2] — Los siguientes errores son habituales en memorias DAW y reducen la nota significativamente.

| # | Antipatrón | Impacto | Corrección |
|---|-----------|---------|-----------|
| AP-01 | Copiar literalmente de documentación oficial o Wikipedia | Viola norma del centro; cambio de registro detectado por el tribunal | Resumir en propias palabras + añadir "por qué elegí esto para este proyecto" |
| AP-02 | Requisitos sin criterios de aceptación medibles | El apartado de pruebas queda desconectado de los requisitos | Incluir criterio medible (score, tiempo de respuesta, cobertura) por cada RF/RNF |
| AP-03 | Diseño del sistema sin diagramas | Baja puntuación en aspectos formales (20% de la nota) | Mínimo: diagrama E-R + diagrama de arquitectura + 2 capturas de UI |
| AP-04 | Conclusiones sin datos cuantitativos | Sección de bajo valor percibido | Incluir horas totales, features completadas/planificadas, cobertura de tests, y 1 problema concreto resuelto |
| AP-05 | Bibliografía sin formato ni comentario | Incumple norma del CIPFP Batoi | Usar APA mínimo + 1 frase de uso por referencia |
| AP-06 | Implementación técnica organizada por tecnología, no por sprint/semana | Pierde narrativa de proceso; el tribunal no puede evaluar cómo se resolvieron los problemas | Estructurar por semanas/sprints con capturas en cada fase [CALIBRADO DESDE EJEMPLO 2] |
| AP-07 | Wireframes mencionados pero no incluidos en la memoria | La sección de diseño pierde credibilidad; no muestra proceso de diseño | Incluir al menos 2–3 wireframes mostrando evolución: prototipo inicial → versión final [CALIBRADO DESDE EJEMPLO 2] |
| AP-08 | Sección de alternativas sin tabla comparativa estructurada | No aporta valor analítico; el tribunal espera comparación sistemática | Incluir tabla: Alternativa \| Precio \| Personalización \| Privacidad datos \| Por qué descartada [CALIBRADO DESDE EJEMPLO 2] |
| AP-09 | Tests descritos sin resultados cuantificables | El tribunal no puede evaluar si el testing fue real o simbólico | Incluir tabla: Tipo de prueba \| N.º tests \| Pasados \| Fallidos \| Cobertura [CALIBRADO DESDE EJEMPLO 2] |

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
| `example-calibration-buycinduro.md` | Calibración de ejemplo 1 | ✅ Generado |
| `example-calibration-tasknest.md` | Calibración de ejemplo 2 | ✅ Generado |
| `mapping-spec-to-memory.md` | Mapa SPEC → secciones memoria | ✅ Generado |
| *(borradores de sección — pendientes)* | — | 🔲 Pendiente |

---

*Última actualización: 2026-03-28 — sdd-explore (calibración desde ejemplo TaskNest) [CALIBRADO DESDE EJEMPLO 1 + EJEMPLO 2]*
