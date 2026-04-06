# 13. Bibliografía

> Las referencias se presentan en formato APA (7.ª edición). Cada entrada incluye un breve comentario sobre el uso que se le ha dado en el proyecto, tal como exige la normativa de CIPFP Batoi d'Alcoi. Las referencias marcadas con **[CITA PENDIENTE]** deberán completarse con los recursos concretos consultados durante el desarrollo.

---

## Tecnologías y frameworks

**Vue.js.** (2024). *Vue 3 — The Progressive JavaScript Framework*. Vue.js Organization. Recuperado de https://vuejs.org/

> Documentación oficial del framework frontend elegido. Consultada especialmente para la Composition API (`<script setup>`), Vue Router 4 y el sistema de componentes. Referenciada en ADR-01b y en las secciones 2 y 5 de esta memoria.

---

**Pinia.** (2024). *Pinia — The Vue Store that you will enjoy using*. Recuperado de https://pinia.vuejs.org/

> Documentación de la librería de gestión de estado utilizada en sustitución de Vuex. Los stores por dominio (`useAuthStore`, `useAgendaStore`, `useResidenteStore`) se diseñaron siguiendo los patrones de esta documentación. Referenciada en ADR-01b.

---

**Vite.** (2024). *Vite — Next Generation Frontend Tooling*. Recuperado de https://vitejs.dev/

> Bundler y servidor de desarrollo del frontend. Consultada para la configuración del proyecto, variables de entorno (`VITE_*`) y optimización del build de producción.

---

**Tailwind CSS.** (2024). *Tailwind CSS Documentation*. Tailwind Labs. Recuperado de https://tailwindcss.com/docs

> Framework de utilidades CSS empleado para el sistema de diseño y los componentes de la interfaz. La decisión de usar Tailwind en lugar de una biblioteca de componentes prefabricada (como shadcn/ui) se justifica en ADR-01b.

---

**Axios.** (2024). *Axios — Promise based HTTP client for the browser and Node.js*. Recuperado de https://axios-http.com/docs/intro

> Cliente HTTP utilizado en el frontend para comunicarse con la Express API. Se configura con interceptores para añadir automáticamente el token de Firebase Auth a cada petición.

---

**Firebase.** (2024). *Firebase Documentation*. Google LLC. Recuperado de https://firebase.google.com/docs

> Documentación principal de la plataforma Firebase. Cubre Firebase Auth (autenticación con email/contraseña, custom claims, ID tokens), Cloud Firestore (modelo de datos, consultas, seguridad), Firebase Hosting (despliegue SPA) y Firebase Local Emulator Suite. Referenciada en ADR-02b, ADR-03b y ADR-04b.

---

**Firebase.** (2024). *Firebase Security Rules Reference*. Google LLC. Recuperado de https://firebase.google.com/docs/rules

> Documentación específica de las Firebase Security Rules para Firestore. Empleada para diseñar el modelo de control de acceso por rol (`request.auth.token.rol`) documentado en ADR-03b. Clave para el cumplimiento de RNF-09.

---

**Express.js.** (2024). *Express — Fast, unopinionated, minimalist web framework for Node.js*. OpenJS Foundation. Recuperado de https://expressjs.com/

> Documentación del framework Node.js utilizado para la capa API del sistema. Se emplea principalmente para el middleware `verifyAuth` y los controladores de negocio que requieren lógica que no puede expresarse en Firestore Rules.

---

**Node.js.** (2024). *Node.js Documentation*. OpenJS Foundation. Recuperado de https://nodejs.org/docs/latest/api/

> Documentación del entorno de ejecución JavaScript del backend. Consultada para la gestión de variables de entorno y el arranque del servidor Express.

---

**Vitest.** (2024). *Vitest — A Vite-native test framework*. Recuperado de https://vitest.dev/

> Framework de testing unitario empleado para las pruebas de los stores Pinia y los servicios del frontend y la API. Seleccionado por su integración nativa con Vite.

---

**Playwright.** (2024). *Playwright — Fast and reliable end-to-end testing for modern web apps*. Microsoft. Recuperado de https://playwright.dev/

> Framework de testing E2E utilizado para los flujos críticos de la aplicación (login → agenda → actualización de tarea → registro de incidencia). Referenciado en las tareas T-67 del backlog.

---

**Faker.js.** (2024). *@faker-js/faker — Generate massive amounts of fake data in the browser and Node.js*. Recuperado de https://fakerjs.dev/

> Librería utilizada para generar datos ficticios de residentes, gerocultores e incidencias en los entornos de desarrollo y demostración. Esencial para el cumplimiento del RGPD (nunca datos reales de pacientes en ningún entorno, según ADR-04b).

---

**Google Stitch.** (s.f.). *Stitch — AI-powered design tool*. Google LLC. Recuperado de https://stitch.google.com/

> Herramienta de diseño visual utilizada para la elaboración de wireframes y prototipos de la interfaz. La decisión de adoptarla como fuente de verdad de diseño se documenta en ADR-05. Los exports se versionan en `OUTPUTS/design-exports/`.

---

**Pandoc.** (2024). *Pandoc — a universal document converter*. John MacFarlane. Recuperado de https://pandoc.org/

> Conversor de documentos utilizado en el pipeline de generación de la memoria académica, transformando archivos Markdown a formato `.docx` con la plantilla del CIPFP Batoi d'Alcoi.

---

## RGPD y legislación

**Parlamento Europeo y Consejo de la Unión Europea.** (2016). *Reglamento (UE) 2016/679 relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (Reglamento General de Protección de Datos)*. Diario Oficial de la Unión Europea, L 119, 1–88. Recuperado de https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX%3A32016R0679

> Base normativa principal del proyecto en materia de protección de datos. El artículo 9 (categorías especiales de datos) es especialmente relevante, dado que el sistema gestiona diagnósticos, medicación, alergias e incidencias de salud de los residentes. Referenciado en los requisitos RNF-03, RNF-07 y en la sección 10 de esta memoria.

---

**Agencia Española de Protección de Datos (AEPD).** (2021). *Guía práctica para las evaluaciones de impacto en la protección de datos (EIPD)*. AEPD. Recuperado de https://www.aepd.es/es/documento/guia-evaluaciones-de-impacto-rgpd.pdf

> Guía oficial de la AEPD consultada para determinar si el proyecto requiere una Evaluación de Impacto en la Protección de Datos (EIPD). Dado que el sistema trata datos de categoría especial (art. 9 RGPD) a gran escala, la guía es relevante en el contexto de un despliegue real. En el ámbito académico, su contenido se refleja en las medidas técnicas y organizativas descritas en la sección 10.

---

**Agencia Española de Protección de Datos (AEPD).** (2019). *Guía para la protección de datos en aplicaciones móviles*. AEPD. Recuperado de https://www.aepd.es/

> Guía consultada para la sección 10 del proyecto, específicamente en lo relativo al almacenamiento de tokens de sesión y a la no persistencia de datos sensibles en almacenamiento local del cliente.

---

## Contexto sociosanitario

**IMSERSO.** (2023). *Informe 2022. Las personas mayores en España: datos estadísticos estatales y por comunidades autónomas*. Instituto de Mayores y Servicios Sociales (IMSERSO), Ministerio de Derechos Sociales y Agenda 2030. Recuperado de https://imserso.es/imserso_01/documentacion/estadisticas/informe_ppmm/index.htm

> Informe estadístico utilizado en la sección 3 (Contexto) para contextualizar la problemática de las residencias de mayores en España: número de centros, ratio de gerocultores por residente, y situación actual de la gestión asistencial. Aporta datos cuantitativos que justifican la necesidad del sistema.

---

## Accesibilidad

**World Wide Web Consortium (W3C).** (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. Recuperado de https://www.w3.org/TR/WCAG21/

> Estándar internacional de accesibilidad web adoptado como objetivo en RNF-05 (Lighthouse Accessibility score ≥ 85; contraste 4.5:1 para texto normal). Las pautas de nivel AA se han tenido en cuenta en el diseño de los componentes de la interfaz, especialmente los touch targets (44×44 px) y el contraste de color.

---

## Metodología

**[CITA PENDIENTE]** — *Referencia sobre metodología ágil / Scrum adaptado*

> A completar con la fuente concreta consultada durante el desarrollo (p. ej. Schwaber & Sutherland, *The Scrum Guide*, 2020, o un libro de texto de DAW sobre metodologías ágiles).

---

**[CITA PENDIENTE]** — *Referencia académica sobre desarrollo de software en proyectos individuales o proyectos de fin de ciclo*

> A completar con bibliografía de apoyo metodológico del ciclo DAW o de la normativa del CIPFP Batoi d'Alcoi.

---

## Herramientas complementarias

**Visual Studio Code.** (2024). *Visual Studio Code — Code Editing. Redefined*. Microsoft. Recuperado de https://code.visualstudio.com/

> Editor de código principal utilizado durante todo el desarrollo. Gratuito y de código abierto (MIT).

**GitHub.** (2024). *GitHub Documentation*. GitHub, Inc. Recuperado de https://docs.github.com/

> Plataforma de control de versiones y colaboración. Se ha utilizado para el repositorio del proyecto, la gestión del backlog y el pipeline de CI/CD con GitHub Actions.

---

*Sección generada: 2026-04-06 — WRITER agent — gerocultores-system*  
*Fuentes: `DECISIONS/ADR-01b`, `ADR-02b`, `ADR-03b`, `ADR-04b`, `ADR-05`; `SPEC/requirements.md`; `OUTPUTS/academic/memory-template.md`*
