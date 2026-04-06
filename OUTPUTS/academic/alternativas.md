# 8. Comparación con alternativas y soluciones existentes

> **Sección de la memoria académica DAW — gerocultores-system**  
> Autor: Jose Vilches Sánchez · CIPFP Batoi d'Alcoi · 2025-2026  
> ADRs de referencia: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05  
> Estado: BORRADOR — listo para revisión

---

## 8.1 Soluciones existentes en el mercado

La gestión del trabajo diario en residencias de mayores se resuelve hoy de formas muy dispares. En residencias pequeñas y medianas, lo más habitual es una combinación de hojas de cálculo Excel, cuadernos en papel y comunicación verbal entre turnos: el gerocultor saliente anota a mano las incidencias del día, y el entrante debe leer esas notas —si están legibles y están donde tocan— antes de empezar su ronda. La falta de trazabilidad entre turnos es el problema central: cuando algo falla, no hay forma rápida de saber quién hizo qué, cuándo, y con qué residente.

Existen soluciones SaaS especializadas en el sector sociosanitario, como **CareMaster** o **aCareGiver**, que ofrecen módulos de gestión de tareas, fichas de residentes e informes. Sin embargo, estas plataformas presentan barreras claras para el contexto de este proyecto: son de pago con licencias mensuales por usuario (inviable para un proyecto académico sin presupuesto), están diseñadas para gestores y coordinadores, no para el uso en ronda del gerocultor, y habitualmente requieren integración con sistemas propietarios del centro (HIS, SAP) que un proyecto individual no puede replicar. Este proyecto propone una alternativa web, accesible desde cualquier dispositivo sin instalación, diseñada específicamente para el flujo de trabajo del gerocultor en planta.

---

## 8.2 Tabla comparativa de alternativas tecnológicas

Todas las decisiones tecnológicas del proyecto pasaron por una evaluación explícita de alternativas, documentada en los ADRs. La siguiente tabla resume las opciones consideradas, la elegida en cada categoría, y el motivo principal de elección.

| Categoría | Opción elegida | Alternativas consideradas | Motivo de elección |
|-----------|---------------|--------------------------|-------------------|
| **Frontend framework** | Vue 3 + Composition API | React 18 + TanStack Query; Svelte + SvelteKit | Vue ofrece mayor productividad para este desarrollador; menor carga cognitiva frente a React hooks; Svelte descartado por ecosistema menor y mayor riesgo de bloqueo (ADR-01b) |
| **Bundler** | Vite 5+ | Webpack (implícito en CRA); Parcel | Vite arranca en milisegundos con módulos ES nativos; feedback de desarrollo inmediato (ADR-01b) |
| **Gestión de estado** | Pinia | Vuex; Redux/Zustand (con React) | Pinia es la librería oficial de Vue 3; stores por dominio directos, sin mutations, con TypeScript nativo (ADR-01b) |
| **Estilos CSS** | Tailwind CSS v3 | shadcn/ui (con React); Bootstrap; CSS Modules | Tailwind permite construir interfaces accesibles y responsivas sin depender de componentes prediseñados; control total sobre accesibilidad (ADR-01b) |
| **Base de datos / Backend** | Cloud Firestore + Express API | Supabase (PostgreSQL BaaS); Express + PostgreSQL propio | Un solo ecosistema Firebase; setup rápido para deadline ajustado; Express + PostgreSQL propio descartado por ~10-15 días de setup inviables (ADR-02b) |
| **Autenticación** | Firebase Auth | Supabase Auth; Auth0; JWT autogestionado con Express | Coherencia con ecosistema Firebase; gestiona ciclo JWT sin infraestructura propia; Auth0 añade un tercer proveedor de pago; JWT propio requería 3-5 días con riesgo de bugs de seguridad en app con datos de salud (ADR-03b) |
| **Hosting / Despliegue** | Firebase Hosting | Google Cloud Run; Firebase Hosting + Cloud Functions; Vercel/Netlify | Deploy en un comando (`firebase deploy`), CDN + HTTPS automático, plan Spark gratuito; Cloud Run requiere Docker y excede el scope; Vercel/Netlify añaden un segundo proveedor desconectado de Firebase (ADR-04b) |
| **Diseño / prototipado UI** | Google Stitch (IA) | Figma; Balsamiq | Stitch está integrado vía MCP en el flujo con agentes de IA del proyecto; exporta pantallas versionables directamente al repositorio; Figma es estándar en industria pero no es la herramienta ya integrada en el flujo (ADR-05) |

### Notas sobre las alternativas descartadas

**React 18** era el stack original del proyecto (ADR-01, supersedido por ADR-01b). Lo descarté no por ser inferior técnicamente —es el framework más usado en la industria y hubiera sido igualmente válido— sino porque mi productividad real durante el desarrollo era menor que con Vue, y en un proyecto individual con deadline el factor humano pesa más que el factor técnico abstracto.

**Supabase + PostgreSQL** (ADR-02, supersedido por ADR-02b) es una opción muy competente: PostgreSQL relacional es más natural para un modelo de datos con relaciones entre entidades (residentes ↔ tareas ↔ gerocultores). Lo descarté principalmente por coherencia de ecosistema: usar Firebase Auth y mantener Supabase como backend implicaba dos consolas, dos conjuntos de credenciales y dos SDKs distintos. Concentrarlo todo en Firebase simplifica la operativa.

**JWT autogestionado con Express** (descartado en ADR-03b) habría sido la opción más didáctica para la memoria DAW, pero el riesgo de introducir vulnerabilidades de seguridad en una aplicación que maneja datos de salud de categoría especial (art. 9 RGPD) no es justificable por motivos académicos.

---

*Borrador generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*ADRs fuente: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05*  
*Extensión aproximada: 560 palabras*
