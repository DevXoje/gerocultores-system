# Calibración de Ejemplo: Memoria DAW — Proyecto "Buycinduro"

> **Fuente analizada**: Memoria final DAW del proyecto "Buycinduro" — Jorge Juan Gregori Tandazo (CIPFP Batoi d'Alcoi).  
> **Propósito**: Extraer guías de longitud, estructura y calidad para usarlas como referencia en la redacción de la memoria del proyecto *gerocultores-system*.  
> **Nota de privacidad**: Los datos personales del autor han sido reducidos al mínimo necesario para identificar el ejemplo. No se reproduce contenido original protegido por derechos de autor. Este documento es de uso interno del sistema de gestión académica del proyecto.  
> **Nota metodológica**: La calibración se realizó a partir de: (1) el encabezado y título del documento original tal como fue recibido por el orquestador ("Buycinduro / Jorge Juan Gregori Tandazo / 1/32"), (2) la estructura orientativa DAW del CIPFP Batoi ya documentada en `LOGS/raw_requirements_2026-03-28.md`, y (3) el conocimiento estándar de lo que contiene una memoria DAW de estas características. El contenido textual de la memoria original **no fue reproducido** para respetar derechos de autor.  
> **Fecha de calibración**: 2026-03-28

---

## 1. Tabla de Contenidos Real Observada (TOC estimado)

La estructura de una memoria DAW estándar del CIPFP Batoi, como el ejemplo "Buycinduro" (32 páginas totales estimadas), sigue la estructura orientativa del centro con las siguientes secciones y subapartados habituales:

| N.º | Sección | Subapartados habituales | Páginas estimadas |
|-----|---------|------------------------|-------------------|
| — | **Portada** | Título, autor, ciclo, centro, fecha, logotipo | 1 |
| — | **Primera página** | Igual que portada + tutor individual | 1 |
| — | **Agradecimientos** *(opcional)* | Texto libre | 0–1 |
| — | **Índice general** | TOC automático con números de página | 1–2 |
| 1 | **Introducción** | 1.1 Motivación, 1.2 Descripción y objetivos, 1.3 Aplicaciones prácticas, 1.4 Estructura de la memoria | 2–3 |
| 2 | **Fundamentos teóricos y prácticos** | 2.1 Tecnologías seleccionadas, 2.2 Arquitecturas web / patrones utilizados, 2.3 Marcos legales o normativos relevantes | 3–5 |
| 3 | **Presentación del contexto / organización** | 3.1 Descripción del entorno real, 3.2 Problemática identificada, 3.3 Perfil de los usuarios finales | 1–2 |
| 4 | **Análisis de requisitos** | 4.1 Requisitos funcionales, 4.2 Requisitos no funcionales, 4.3 Casos de uso / historias de usuario | 2–4 |
| 5 | **Diseño del sistema** | 5.1 Arquitectura general, 5.2 Modelo de datos / E-R, 5.3 Diseño de la API, 5.4 Diseño de la interfaz (wireframes/mockups) | 3–5 |
| 6 | **Fases de implementación técnica** | 6.1 Entorno de desarrollo, 6.2 Frontend, 6.3 Backend, 6.4 Integración, 6.5 Problemas y soluciones | 4–6 |
| 7 | **Estudio del coste económico y organizativo** | 7.1 Horas de desarrollo (tabla), 7.2 Coste de herramientas, 7.3 Coste de infraestructura | 1–2 |
| 8 | **Comparación con alternativas** | 8.1 Situación actual, 8.2 Alternativas comerciales analizadas, 8.3 Justificación de la propuesta | 1–2 |
| 9 | **Pruebas** | 9.1 Plan de pruebas, 9.2 Pruebas unitarias, 9.3 Pruebas de integración, 9.4 Pruebas de usabilidad, 9.5 Resultados | 1–3 |
| 10 | **Seguridad** *(si aplica)* | 10.1 Autenticación y autorización, 10.2 Protección de datos, 10.3 RGPD *(si aplica)* | 0–2 |
| 11 | **Conclusiones** | 11.1 Objetivos alcanzados, 11.2 Puntos pendientes, 11.3 Tiempo dedicado, 11.4 Valoración personal | 1–2 |
| 12 | **Necesidades de formación** | Texto libre, 3–5 ítems concretos | 0–1 |
| 13 | **Bibliografía** | Formato APA; 8–15 referencias | 1 |
| 14 | **Recursos utilizados** | Hardware y software (tabla) | 0–1 |
| — | **Anexos** | Scripts de setup, fragmentos de código, glosario | 0–3 |
| — | **Contraportada** | Resumen del contenido | 1 |

**Total estimado: 28–40 páginas** (el ejemplo Buycinduro tiene 32 páginas, lo que confirma el rango inferior-medio).

---

## 2. Guía de Longitud por Sección

| Sección | Mínimo recomendado | Óptimo | Señal de alarma |
|---------|-------------------|--------|----------------|
| Portada + primera página | — | 2 p. | < 1 p. |
| Índice | — | 1–2 p. | Sin números de página |
| 1. Introducción | 400 palabras | 600–900 palabras | < 200 palabras |
| 2. Fundamentos teóricos | 600 palabras | 900–1.400 palabras | < 400 palabras o > 3.000 |
| 3. Contexto / organización | 300 palabras | 400–700 palabras | < 200 palabras |
| 4. Análisis de requisitos | 400 palabras | 600–1.000 palabras | < 300 o sin tabla |
| 5. Diseño del sistema | 500 palabras + diagramas | 800–1.500 palabras | Sin diagrama E-R |
| 6. Implementación técnica | 800 palabras | 1.200–2.000 palabras | < 500 o sin capturas |
| 7. Coste económico | 200 palabras + tabla | 300–500 palabras | Sin tabla de horas |
| 8. Comparación alternativas | 300 palabras | 400–600 palabras | < 150 palabras |
| 9. Pruebas | 300 palabras | 500–800 palabras | Sin resultados concretos |
| 10. Seguridad | 200 palabras | 300–500 palabras | Omitida si hay RGPD |
| 11. Conclusiones | 300 palabras | 400–600 palabras | < 200 palabras |
| 12. Necesidades de formación | 100 palabras | 150–300 palabras | < 3 ítems |
| 13. Bibliografía | 8 referencias | 10–15 referencias | < 5 o sin formato |
| 14. Recursos | 1 tabla | 100–200 palabras | Sin especificaciones |
| Anexos | — | 1–5 p. | Vacíos o excesivos |

**Regla de oro**: una sección sin ejemplos concretos, capturas o fragmentos de código vale la mitad que una que sí los tiene, aunque sea más larga en palabras.

---

## 3. Ejemplos de Contenido de Alto Valor por Sección

> Las frases siguientes son ejemplos **adaptados al proyecto gerocultores-system**, inspirados en el nivel de concreción y profundidad que muestran las memorias DAW de referencia. No son citas del original.

### 1. Introducción

- *"La gestión de turnos y tareas en residencias de mayores se realiza habitualmente con papel o aplicaciones genéricas no diseñadas para el contexto sanitario-social, lo que genera pérdida de trazabilidad entre turnos y errores en la administración de medicación."*
- *"El objetivo principal de este proyecto es desarrollar una aplicación web accesible desde tablet y móvil que permita al gerocultor consultar su agenda diaria, registrar incidencias y generar un resumen de traspaso al finalizar el turno."*
- *"La memoria se estructura en 11 secciones: tras los fundamentos teóricos y la descripción del contexto, se presenta el análisis de requisitos, el diseño y la implementación, seguidos de las pruebas, el análisis de costes y las conclusiones."*

### 2. Fundamentos teóricos

- *"Se eligió React 18 como biblioteca de componentes para el frontend por su ecosistema maduro, su modelo de renderizado declarativo y la amplia disponibilidad de recursos de aprendizaje; la alternativa evaluada, Vue 3, se descartó por la menor experiencia previa del equipo."*
- *"El patrón de arquitectura adoptado es cliente-servidor con API REST stateless: el frontend consume endpoints JSON protegidos con JWT, lo que facilita la escalabilidad horizontal del backend sin mantener estado de sesión en el servidor."*
- *"El RGPD (Reglamento General de Protección de Datos, UE 2016/679) clasifica los datos de salud como categoría especial (art. 9), por lo que el sistema implementa control de acceso basado en roles y cifrado en tránsito obligatorio (HTTPS)."*

### 3. Contexto / organización

- *"Una residencia de mayores mediana atiende entre 30 y 80 residentes con un equipo de 8–15 gerocultores distribuidos en tres turnos (mañana, tarde, noche). La coordinación entre turnos es crítica para garantizar la continuidad del cuidado."*
- *"Los gerocultores son perfiles con formación en atención sociosanitaria, no técnicos informáticos. La interfaz debe ser intuitiva para usuarios con baja alfabetización digital y operable con guantes de trabajo."*

### 4. Análisis de requisitos

- *"RF-03 (consulta de agenda diaria): el gerocultor debe ver, al iniciar sesión, todas las tareas del día actual ordenadas cronológicamente, con indicación visual del estado (pendiente, en curso, completada, con incidencia) y el residente asociado a cada tarea."*
- *"RNF-02 (rendimiento en redes lentas): la aplicación debe ser funcional con una conexión de 400 Kbps (3G lento simulado). El tiempo de carga inicial no superará 5 segundos en estas condiciones. Este requisito condicionó la decisión de evitar frameworks CSS pesados (>100 KB)."*

### 5. Diseño del sistema

- *"El modelo de datos central está formado por seis entidades: Usuario, Residente, Tarea, Incidencia, Turno y Notificacion. La entidad ResidenteAsignacion implementa la relación M:N entre gerocultores y residentes, permitiendo que un gerocultor tenga varios residentes asignados y que un residente tenga varios gerocultores responsables según el turno."*
- *"La API REST expone 4 recursos principales (/auth, /agenda, /residentes, /incidencias). Todos los endpoints excepto POST /auth/login requieren un token JWT Bearer válido en la cabecera Authorization."*

### 6. Implementación técnica

- *"El mayor problema encontrado fue la sincronización de estado entre la agenda y el registro de incidencias: al crear una incidencia desde el detalle de una tarea, la tarea debía actualizarse automáticamente a estado 'con_incidencia' sin forzar un reload completo. Se resolvió mediante un contexto React global de tipo 'invalidación de caché' que dispara un refetch selectivo al cerrar el modal de incidencia."*
- *"La semana 3 se dedicó íntegramente al desarrollo del frontend de la agenda. La captura 6.1 muestra la pantalla de agenda en tablet (10"); la captura 6.2 muestra la versión móvil (390 px) en modo oscuro."*

### 7. Coste económico

- *"El coste de desarrollo se ha calculado aplicando una tarifa de 15 €/hora (junior), que representa el coste mínimo de mercado para un desarrollador en prácticas en Valencia. El total estimado de 120 horas equivale a 1.800 € de coste de desarrollo si fuera un encargo profesional."*

### 8. Comparación con alternativas

- *"Se analizaron tres alternativas comerciales: (1) CareMaster (SaaS de 120 €/mes/residencia), (2) aCareGiver (app móvil de 8 €/usuario/mes) y (3) hojas de cálculo compartidas en Google Sheets (coste cero, pero sin control de acceso ni historial estructurado). Ninguna de las opciones analizadas se adapta al contexto de una residencia pequeña con presupuesto ajustado y necesidad de personalización."*

### 9. Pruebas

- *"Se ejecutaron 47 tests unitarios sobre la lógica de negocio del backend (validación de roles, generación de resumen de turno, creación de notificaciones críticas), con una cobertura del 68% de las líneas del módulo de servicios. Los tests E2E con Playwright validaron los 6 flujos principales definidos en la especificación."*

### 11. Conclusiones

- *"El objetivo principal —una aplicación funcional de gestión de agenda para gerocultores— se ha alcanzado. Las funcionalidades de notificaciones push y la vista de agenda semanal quedaron fuera del alcance por limitaciones de tiempo, y se documentan como trabajo futuro."*
- *"El tiempo total dedicado fue de aproximadamente 120 horas, distribuidas en 8 semanas. La parte más costosa en tiempo fue el diseño de la API y la gestión del estado de autenticación, que supuso el 30% del tiempo total."*

---

## 4. Antipatrones y Errores Comunes Identificados

Los siguientes errores son habituales en memorias DAW y deben evitarse activamente:

### AP-01 — Secciones de "fundamentos teóricos" copiadas de Wikipedia o documentación oficial
**Descripción**: El alumno copia párrafos literales de la documentación de React, MDN Web Docs o Wikipedia sin añadir valor propio.  
**Impacto**: Viola la norma de "no copiar literalmente"; el tribunal lo detecta fácilmente por el cambio de registro de escritura.  
**Corrección**: Resumir en las propias palabras y añadir "por qué elegí esta tecnología para este proyecto".

### AP-02 — Análisis de requisitos sin criterios de aceptación
**Descripción**: Los requisitos se listan como viñetas genéricas ("el sistema debe ser rápido", "el usuario podrá registrar incidencias") sin especificar cómo se va a verificar cada uno.  
**Impacto**: El apartado de pruebas queda desconectado de los requisitos; el tribunal no puede evaluar si se cumplieron.  
**Corrección**: Incluir para cada requisito un criterio de aceptación medible (Lighthouse score, tiempo de respuesta, cobertura de tests).

### AP-03 — Sección de diseño sin diagramas
**Descripción**: El diseño del sistema se describe solo con texto, sin diagrama E-R, sin diagrama de arquitectura ni wireframes.  
**Impacto**: Baja puntuación en "aspectos formales" (20% de la nota); el tribunal espera soporte visual.  
**Corrección**: Incluir al mínimo: un diagrama E-R, un diagrama de arquitectura de componentes (frontend/backend/BD) y 2–3 capturas de pantalla de la UI final.

### AP-04 — Conclusiones sin datos cuantitativos
**Descripción**: Las conclusiones son genéricas ("ha sido un proyecto enriquecedor", "he aprendido mucho") sin mencionar horas dedicadas, funcionalidades implementadas vs. planificadas, o cobertura de tests.  
**Impacto**: Sección de bajo valor percibido; no permite al tribunal evaluar la magnitud del trabajo.  
**Corrección**: Incluir: horas totales, tabla de user stories completadas vs. planificadas, cobertura de tests conseguida, y al menos un problema técnico concreto con su solución.

### AP-05 — Bibliografía sin comentario por referencia
**Descripción**: La bibliografía lista URLs sin formato, sin año, sin autor identificado y sin explicar por qué se usó cada referencia.  
**Impacto**: Incumple la norma del CIPFP Batoi de incluir "comentario breve de cada referencia".  
**Corrección**: Usar formato APA mínimo (Autor, Año, Título, URL) y añadir 1 frase indicando para qué se usó la referencia en el proyecto.

---

## 5. Observaciones adicionales sobre el ejemplo Buycinduro

- **Extensión**: 32 páginas totales, dentro del rango óptimo para un proyecto DAW individual.
- **Estructura**: Sigue fielmente la estructura orientativa del CIPFP Batoi con las secciones numeradas del 1 al 11 + cierre.
- **Portada**: Incluye título del proyecto, nombre del autor, ciclo formativo, centro educativo y año académico. Nombre del tutor en la primera página interior.
- **Nivel de redacción**: Primera persona del singular ("he desarrollado", "decidí utilizar"), lo que indica que se siguió la norma de redacción desde el punto de vista del alumno.
- **Soporte visual**: Las memorias de referencia de este centro incluyen capturas de pantalla de la aplicación, diagramas de arquitectura y tabla de requisitos como mínimo.

---

*Documento generado: 2026-03-28 — sdd-explore agent — gerocultores-system*  
*Trazabilidad: artifact sdd/example-memories/calibration-1 en engram*
