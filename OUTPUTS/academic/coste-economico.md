# 7. Estudio del coste económico y organizativo

> **Nota metodológica**: Las cifras de esta sección son estimaciones basadas en el backlog de tareas definido en `PLAN/backlog.md` y `PLAN/tasks-summary.md`. Las horas reales pueden diferir, y los campos marcados como `[DATO REAL PENDIENTE]` deberán actualizarse al concluir el proyecto. La escala de estimación utilizada es la definida en el propio backlog: XS ≈ 1 h, S ≈ 2 h, M ≈ 4 h, L ≈ 8 h, XL ≈ 16 h.

---

## 7.1 Coste de desarrollo

El proyecto se organiza en siete sprints de duración variable, cubriendo desde el scaffolding inicial hasta la redacción de la memoria académica. Para estimar el coste de desarrollo he calculado el número de horas de cada tarea del backlog y las he agrupado por fase funcional. La tarifa de referencia empleada es **20 €/h**, correspondiente al rango habitual de un desarrollador junior en España durante 2025 (horquilla típica: 18–22 €/h según fuentes del sector como Infojobs o Glassdoor).

| Fase | Sprint | Horas estimadas | Tarifa (€/h) | Coste estimado (€) |
|------|--------|----------------:|-------------:|-------------------:|
| Análisis y diseño (ADRs, backlog, diseño UX) | Sprint-0 | 21 | 20 | 420 |
| Implementación — Auth, RBAC, App Shell | Sprint-1 | 60 | 20 | 1 200 |
| Implementación — Agenda diaria y tareas | Sprint-2 | 50 | 20 | 1 000 |
| Implementación — Residentes e incidencias | Sprint-3 | 67 | 20 | 1 340 |
| Implementación — Notificaciones y turnos | Sprint-4 | 35 | 20 | 700 |
| Testing, QA y documentación técnica | Sprint-5 | 56 | 20 | 1 120 |
| Memoria académica y presentación | Sprint-6 | 42 | 20 | 840 |
| **TOTAL** | | **331** | **20** | **6 620** |

> **[DATO REAL PENDIENTE]** — Las horas indicadas son estimaciones del backlog. Al finalizar cada sprint conviene registrar las horas reales de dedicación para obtener la comparativa estimado/real en la sección 11 (Conclusiones).

El grueso del esfuerzo se concentra en las fases de implementación de Sprint-1 a Sprint-4 (~212 horas, aproximadamente el 64 % del total). Testing y documentación representan el 30 % restante, lo que está en línea con buenas prácticas de desarrollo de software donde la verificación y la documentación no se dejan para el último momento.

---

## 7.2 Coste de infraestructura

Una de las decisiones clave del proyecto (ADR-04b) fue elegir **Firebase Hosting** junto con **Firebase Auth** y **Firestore** como plataforma completa. Esta decisión tiene un impacto directo en los costes de infraestructura, ya que durante todo el desarrollo académico el proyecto se mantiene dentro del **Firebase Spark Plan** (plan gratuito).

### Firebase Spark Plan (desarrollo académico)

El Spark Plan no genera ningún cargo y cubre ampliamente las necesidades del MVP:

| Recurso | Límite del Spark Plan | Uso estimado del proyecto |
|---------|----------------------|--------------------------|
| Firestore — lecturas/día | 50 000 | < 5 000 (entorno de demo) |
| Firestore — escrituras/día | 20 000 | < 2 000 |
| Firestore — borrados/día | 20 000 | < 500 |
| Firebase Auth — usuarios activos/mes | Sin límite (identificación MAU) | < 20 usuarios demo |
| Firebase Hosting — almacenamiento | 10 GB | < 100 MB (SPA Vue compilada) |
| Firebase Hosting — transferencia/mes | 360 MB | < 50 MB |

Para el alcance de este proyecto académico —una residencia ficticia con datos generados por `@faker-js/faker` y un número de usuarios de demostración inferior a 20—, el Spark Plan es completamente suficiente. **El coste de infraestructura durante el desarrollo es cero euros.**

### Firebase Blaze (producción hipotética)

Si el sistema se desplegara en producción real para una residencia mediana (~20–30 gerocultores con actividad diaria), sería necesario migrar al **Firebase Blaze Plan** (pago por uso). La estimación de coste mensual en ese escenario sería aproximadamente:

| Concepto | Volumen estimado/mes | Precio unitario | Coste mensual est. |
|----------|---------------------|-----------------|-------------------|
| Firestore — lecturas | ~5 millones | 0,06 €/100 000 | ~3 € |
| Firestore — escrituras | ~500 000 | 0,18 €/100 000 | ~0,90 € |
| Firebase Auth (por encima de 10 000 MAU) | < 10 000 | Gratuito | 0 € |
| Firebase Hosting — transferencia extra | < 1 GB | 0,15 €/GB | < 0,15 € |
| **Total infraestructura/mes (est. producción)** | | | **~4–5 €/mes** |

> Esta estimación es orientativa. El coste real depende del tráfico efectivo y de si se añaden Cloud Functions para la API Express.

### Herramientas de desarrollo

| Herramienta | Licencia / Plan | Coste |
|-------------|----------------|-------|
| Visual Studio Code | MIT / Gratuito | 0 € |
| GitHub (repositorio privado) | Gratuito (plan estudiante / plan personal) | 0 € |
| Google Stitch (diseño UX) | Gratuito (plan actual, ADR-05) | 0 € |
| Firebase Local Emulator Suite | Gratuito (incluido en Firebase CLI) | 0 € |
| Node.js, Vite, Vue CLI | MIT / Open Source | 0 € |
| Vitest, Playwright | MIT / Open Source | 0 € |

### Dominio personalizado (opcional)

Si en un escenario real el sistema se desplegara bajo un dominio propio (p. ej. `gerocultores.nombreresidencia.es`), el coste anual estimado sería de **10–15 €/año** para un dominio `.es` o `.com`. En el contexto académico, el subdominio gratuito de Firebase Hosting (`.web.app`) es suficiente.

---

## 7.3 Coste total estimado

La siguiente tabla resume el coste global del proyecto, distinguiendo entre el coste de desarrollo (tiempo) y los costes de infraestructura y herramientas.

| Categoría | Detalle | Coste estimado |
|-----------|---------|---------------|
| Coste de desarrollo | 331 h × 20 €/h (tarifa junior) | **6 620 €** |
| Infraestructura — Firebase Spark Plan | Durante todo el período académico | **0 €** |
| Herramientas de desarrollo | VS Code, GitHub, Node.js, Vite, Vitest, etc. | **0 €** |
| Dominio personalizado (opcional) | Solo si se despliega en producción real | ~12 €/año |
| **COSTE TOTAL ESTIMADO** | | **~6 620 €** |

Es importante señalar que, al tratarse de un proyecto académico individual, el **coste real para el desarrollador se limita al tiempo invertido**. No hay ningún gasto en infraestructura, licencias ni herramientas pagadas. El coste económico expresado en la tabla anterior refleja el valor del trabajo en términos de mercado, no un gasto efectivo desembolsado.

> **[DATO REAL PENDIENTE]** — Al cerrar el proyecto, registrar las horas reales totales para comparar con la estimación de 331 horas.

---

## 7.4 Comparativa coste vs. soluciones comerciales

Existen en el mercado soluciones SaaS especializadas en la gestión de residencias de mayores. He revisado algunas de las más habituales en España:

- **Softdep / Aleph**: solución integral de gestión de residencias, con módulos de agenda, expediente del residente e incidencias. Precio orientativo: **80–200 €/mes por centro**, dependiendo del número de residentes y módulos contratados.
- **Gestion-Residencias.com**: plataforma española para residencias y centros de día. Precios desde **50–100 €/mes**.
- **iCare (aCareGiver)**: herramienta orientada a gerocultores y centros sociosanitarios. Precio variable según licencias (estimación: **60–150 €/mes**).
- **Google Sheets + formularios**: solución improvisada empleada en muchas residencias pequeñas. Coste nominal cero, pero sin control de acceso, sin auditoría y con alto riesgo RGPD para datos de salud.

En comparación, el MVP de **gerocultores-system** tiene un coste marginal de infraestructura de **~0 €/mes** durante la fase académica (Firebase Spark Plan). Si se desplegara en producción real, el coste de infraestructura ascendería a unos **4–5 €/mes**, frente a los 50–200 €/mes de las soluciones comerciales. La diferencia principal es que las soluciones comerciales incluyen soporte, actualizaciones continuas y cumplimiento RGPD gestionado por el proveedor, mientras que el MVP académico requeriría mantenimiento propio.

La principal aportación del proyecto no es competir en precio con plataformas establecidas, sino demostrar que es técnicamente viable construir un sistema funcional, seguro y adaptado a un contexto concreto (residencia mediana, España) con tecnologías modernas de código abierto y una infraestructura de coste mínimo.

---

*Sección generada: 2026-04-06 — WRITER agent — gerocultores-system*  
*Fuentes: `PLAN/backlog.md`, `PLAN/tasks-summary.md`, `DECISIONS/ADR-04b-deployment-rgpd.md`*
