# Normes CIPFP Batoi — Checklist de cumplimiento para la memoria DAW

> **Fuente**: Documento oficial «Normes i Recomanacions — Avaluació. Criteris de qualificació» del CIPFP Batoi d'Alcoi.  
> **Proyecto**: Sistema de Gestión para Gerocultores  
> **Autor**: Jose Vilches Sánchez  
> **Ciclo**: CFS Desarrollo de Aplicaciones Web (DAW) — 2025-2026  
> **Generado**: 2026-04-06 — WRITER/REVIEWER agent  
> **Propósito**: Lista de verificación activa para garantizar el cumplimiento total de las normas del centro antes de la entrega.

---

## 1. Criterios de evaluación

La calificación es **numérica, hasta 10 puntos, sin decimales**.

| Criterio | Peso | Qué implica para este proyecto |
|----------|------|---------------------------------|
| **Aspectos formales** (presentación, estructura documental, organización y redacción) | **20%** | PDF con formato correcto (márgenes, fuente, interlineado, cabecera, pie); índice con números de página; imágenes numeradas con pie de imagen; terminología explicada la primera vez; redacción coherente y en primera persona |
| **Contenidos** (dificultad, grado de resolución de la propuesta, originalidad, actualidad, alternativas presentadas y resultados obtenidos) | **50%** | Calidad técnica del sistema implementado; profundidad del análisis (RF/RNF, diseño, seguridad RGPD); originalidad del enfoque (problema real, solución específica para gerocultores); resultados cuantificables (tests, cobertura, métricas de rendimiento); alternativas tecnológicas bien documentadas con tabla comparativa; sección RGPD con datos de salud |
| **Exposición y defensa oral** (calidad de la exposición oral y respuestas al tribunal) | **30%** | Presentación de 20 minutos máximo; respuestas claras a preguntas del tribunal (cap. departamento + tutor de grupo + tutor individual); dominar el sistema desarrollado, las decisiones tecnológicas y los resultados |

> **Análisis de prioridad**: El criterio de mayor peso es **Contenidos (50%)**. Una memoria con contenido técnico sólido pero formato imperfecto sigue pudiendo alcanzar una nota alta. Sin embargo, una exposición oral deficiente (30%) puede bajar significativamente la nota final incluso con buena memoria. Los aspectos formales (20%) son el mínimo de calidad: incumplirlos castiga pero cumplirlos no sube la nota.

---

## 2. Requisitos de formato obligatorios

> Estado: **[✅]** = cumplido / **[⚠️]** = parcialmente / **[❌]** = no cumplido / **[🔲]** = no verificable aún

### 2.1 Formato de entrega

- [✅] **Entrega en PDF** — El script `scripts/build-academic-docx.sh` genera PDF mediante md-to-pdf (Chrome/Chromium) o pandoc+LaTeX. El pipeline es funcional.

### 2.2 Márgenes

- [✅] **Márgenes ≤ 2,5 cm** — El script especifica `"margin": {"top": "2.5cm", "bottom": "2.5cm", "left": "2.5cm", "right": "2.5cm"}` en las opciones de md-to-pdf y `--variable geometry:margin=2.5cm` en el fallback pandoc+xelatex. Cumple la norma exacta (≤ 2,5 cm).

### 2.3 Fuente

- [⚠️] **Fuente formal, tamaño 10, 11 o 12** — El fallback pandoc+xelatex especifica `--variable fontsize=11pt`. **Sin embargo, el método principal (md-to-pdf + Chrome) no define explícitamente el tamaño de fuente en los estilos CSS**: usa el tamaño por defecto del navegador (~16px ≈ 12pt). Se debe añadir CSS explícito. **Acción requerida** → ver Tarea 4.

### 2.4 Interlineado

- [⚠️] **Interlineado sencillo** — El fallback pandoc+xelatex no especifica `--variable linestretch` (por defecto pandoc usa 1.2). El método md-to-pdf no define `line-height` explícito. **Acción requerida** → añadir CSS con `line-height: 1.2` (interlineado sencillo).

### 2.5 Cabecera de página

- [❌] **Cabecera: título del proyecto** — Ninguno de los métodos de generación PDF incluye cabecera con el título del proyecto. md-to-pdf no soporta cabeceras/pies de página de forma nativa sin CSS `@page`. **Acción requerida** → añadir CSS con `@page` running headers, o usar el fallback pandoc con `--variable header-includes`.

### 2.6 Pie de página

- [❌] **Pie: nombre del alumno + número de página** — Mismo problema que la cabecera. No está configurado en ningún método. **Acción requerida** → añadir CSS con `@page` running footers con nombre y contador de páginas.

---

## 3. Requisitos de contenido (recomendaciones aplicables)

### 3.1 Imágenes

- [🔲] **Imágenes nítidas, bien proporcionadas, de tamaño adecuado** — Los borradores actuales no contienen imágenes. Cuando se añadan (sección 5 — Diseño, sección 6 — Implementación), verificar resolución mínima 150 DPI para PDF.
- [❌] **Pie de imagen con número, descripción y fuente/origen** — No hay imágenes en los borradores actuales. **Cuando se añadan imágenes, es obligatorio** incluir pie de imagen numerado: `*Figura N — Descripción de la imagen. Fuente: [origen o "Elaboración propia"]*`.
- [🔲] **Imágenes comentadas antes o después** — Toda imagen debe ir acompañada de un párrafo de explicación antes o después.

### 3.2 Ejemplos reales de uso de la tecnología

- [⚠️] **Incluir ejemplos reales donde se use la tecnología estudiada/implementada** — Los borradores de `fundamentos-teoricos.md` y `alternativas.md` citan tecnologías pero no incluyen ejemplos de aplicaciones reales que usen Vue 3, Firebase o Express.js en producción. **Acción requerida** → añadir notas de revisión en las secciones correspondientes.

### 3.3 Terminología

- [⚠️] **Destacar y explicar conceptos importantes la primera vez** — Varios borradores usan acrónimos y términos técnicos (SPA, RBAC, JWT, CDN, RGPD, WCAG) sin definirlos inline la primera vez que aparecen en cada sección. Algunos sí están explicados en `fundamentos-teoricos.md`. **Acción requerida** → revisar sección por sección.

### 3.4 No copiar literalmente

- [✅] **Evitar copiar y pegar al pie de la letra** — Los borradores están redactados en primera persona y con voz propia. No se detectan párrafos copiados literalmente de documentación oficial.

### 3.5 Resumir y no hacer propaganda

- [⚠️] **No hacer propaganda de productos/tecnologías** — Se detectan algunas frases con tono laudatorio en `fundamentos-teoricos.md` y `alternativas.md` que deben revisarse. **Acción requerida** → ver auditoría detallada en sección 4.

### 3.6 Narración desde el punto de vista del alumno

- [✅] **Redacción coherente en primera persona (punto de vista del alumno)** — La mayoría de borradores usan primera persona ("elegí", "utilicé", "adopté"). Correcto.

### 3.7 Código fuente en repositorio

- [⚠️] **Código fuente entregado via repositorio de control de versiones (GitHub/GitLab)** — En `bibliografia.md` y `recursos.md` se menciona GitHub pero no se incluye el enlace directo al repositorio del proyecto. **Acción requerida** → añadir enlace concreto al repositorio en ambas secciones.

---

## 4. Fechas clave

| Hito | Fecha | Estado |
|------|-------|--------|
| **Primera entrega parcial recomendada** | **Antes del 30 de abril de 2026** | ⚠️ **URGENTE** — quedan ~24 días desde hoy (06/04/2026) |
| **Entrega final** | Primera semana de junio de 2026 (fecha exacta pendiente) | 🔲 Pendiente |
| **Exposiciones orales** | A lo largo de junio de 2026 (calendario por publicar) | 🔲 Pendiente |
| **Duración exposición oral** | Máximo 20 minutos | 🔲 Preparar presentación |
| **Tribunal** | Cap de departament + Tutor de grup + Tutor individual | Andres Martos Gazquez (tutor individual) |

> ⚠️ **ALERTA**: La primera entrega parcial recomendada es antes del 30 de abril de 2026. Hoy es 6 de abril de 2026. Quedan **24 días**. Las secciones prioritarias para esta entrega parcial son: 1 (Introducción), 3 (Contexto), 4 (Análisis de requisitos), parte de 5 (Diseño — arquitectura y entidades), y 10 (Seguridad/RGPD).

---

## 5. Impacto en la nota — Análisis por criterio

### 5.1 Contenidos (50%) — Máxima prioridad

Las acciones con mayor impacto en la nota son las que mejoran los contenidos:

| Acción | Impacto estimado | Estado |
|--------|-----------------|--------|
| Sección 5 (Diseño): incluir diagrama E-R + arquitectura + wireframes | Alto — el tribunal espera soporte visual | 🔲 Pendiente |
| Sección 6 (Implementación): sprints con capturas UI y problemas/soluciones | Alto — narrativa de proceso | 🔲 Bloqueado (requiere código) |
| Sección 9 (Pruebas): resultados cuantificables (N tests, cobertura %) | Alto — sin datos = bajo valor percibido | 🔲 Bloqueado (requiere tests) |
| Sección 10 (RGPD): datos de salud, bases legales, medidas técnicas | Alto — obligatorio para datos de salud | ✅ Borrador completo (580 palabras) |
| Sección 8 (Alternativas): tabla comparativa de soluciones | Medio — AP-08 si solo hay texto | ⚠️ Borrador sin tabla de soluciones de gestión de residencias |
| Sección 11 (Conclusiones): datos cuantitativos | Medio — penaliza si es genérico | 🔲 Bloqueado (requiere fin desarrollo) |

### 5.2 Aspectos formales (20%) — Cumplimiento mínimo obligatorio

| Acción | Impacto | Estado |
|--------|---------|--------|
| PDF con cabecera y pie de página correctos | Alto en aspectos formales | ❌ No implementado |
| Fuente 10-12 en PDF | Medio | ⚠️ No explícito en md-to-pdf |
| Interlineado simple | Medio | ⚠️ No explícito |
| Imágenes con pie numerado | Alto — todas las imágenes que se añadan | 🔲 No hay imágenes aún |
| Índice con números de página | Alto | 🔲 Depende del pipeline PDF |

### 5.3 Exposición oral (30%) — Preparación independiente

| Acción | Notas |
|--------|-------|
| Preparar presentación de 20 minutos máximo | Estructurar: problema → solución → implementación → resultados → RGPD → conclusiones |
| Dominar las decisiones tecnológicas (ADRs) | El tribunal puede preguntar "¿por qué Vue y no React?" |
| Preparar demostración del sistema funcional | Si el MVP está operativo, demostrarlo en vivo |
| Anticipar preguntas sobre RGPD y datos de salud | Es un área de riesgo alta para el tribunal |

---

## 6. Resumen de acciones críticas

> Las siguientes acciones son **bloqueantes** para cumplir las normas del centro:

1. **[CRÍTICO — Formato PDF]** Añadir CSS con `@page` al script de build para generar cabecera (título) y pie (nombre + número de página). Sin esto, el PDF no cumple las normas formales del centro.
2. **[CRÍTICO — Formato PDF]** Añadir CSS explícito para fuente 11-12pt e interlineado 1.0 (sencillo) en el método md-to-pdf.
3. **[ALTA — Contenidos]** Incluir enlace al repositorio GitHub en `recursos.md` y `bibliografia.md` (reemplazar `[URL_REPOSITORIO_GITHUB]` cuando esté disponible).
4. **[ALTA — Contenidos]** Completar sección 5 (Diseño del sistema) con diagrama E-R, arquitectura y wireframes antes de la entrega parcial del 30 de abril.
5. **[MEDIA — Contenidos]** Añadir tabla comparativa de soluciones de gestión de residencias en `alternativas.md` (sección 8.1).
6. **[MEDIA — Contenidos]** Añadir ejemplos reales de uso de las tecnologías en producción en `fundamentos-teoricos.md`.
7. **[BAJA — Aspectos formales]** Revisar terminología no explicada en los borradores y añadir definiciones inline.

---

*Generado: 2026-04-06 — WRITER/REVIEWER agent — gerocultores-system*  
*Fuente normativa: Normes i Recomanacions CIPFP Batoi d'Alcoi — Mòdul de Projecte DAW*  
*Engram topic key: academic/normes-checklist*
