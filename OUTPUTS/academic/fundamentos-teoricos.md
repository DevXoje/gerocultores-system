# 2. Fundamentos teóricos y tecnológicos

> **Sección de la memoria académica DAW — gerocultores-system**  
> Autor: Jose Vilches Sánchez · CIPFP Batoi d'Alcoi · 2025-2026  
> ADRs de referencia: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05  
> Estado: BORRADOR — listo para revisión

---

## 2.1 Arquitectura SPA y el patrón cliente-servidor

Una SPA (*Single Page Application*) es una aplicación web que carga una sola página HTML y va actualizando el contenido dinámicamente sin recargar el navegador. Esto contrasta con las aplicaciones web tradicionales, donde cada acción del usuario desencadena una nueva petición al servidor y una recarga completa de la interfaz. Para una herramienta de trabajo como esta agenda digital, la diferencia es tangible: un gerocultor que actualiza el estado de una tarea en plena ronda no puede esperar a que la página se recargue, y mucho menos en redes lentas de residencias con wifi escaso.

La arquitectura que elegí sigue el modelo cliente-servidor en dos capas diferenciadas. Por un lado, el cliente es una SPA Vue 3 que corre íntegramente en el navegador del dispositivo (tablet o móvil) y se comunica con el backend a través de peticiones HTTP/REST. Por otro lado, el servidor es una API Express.js que recibe esas peticiones, aplica la lógica de negocio y consulta Cloud Firestore como base de datos. Esta separación me permite escalar o sustituir cualquiera de las dos capas de forma independiente, y facilita las pruebas unitarias de cada parte por separado. Además, al desplegar el frontend como activos estáticos en Firebase Hosting, la entrega al cliente es extremadamente rápida gracias al CDN global de Google.

---

## 2.2 Vue 3 + Composition API + Vite

Vue.js es un framework JavaScript progresivo para construir interfaces de usuario. La versión 3, lanzada en 2020, introdujo la *Composition API*: un sistema de organización del código basado en funciones (`setup()`, `ref()`, `computed()`, `watch()`) que sustituye —o complementa— a la *Options API* clásica. La ventaja principal es que la lógica relacionada se agrupa junta en lugar de estar dispersa entre `data`, `methods` y `computed`, lo que facilita extraerla en composables reutilizables.

Elegí Vue 3 sobre React 18 (la opción inicial del proyecto, documentada en ADR-01 y descartada en ADR-01b) por razones prácticas: mi productividad es mayor con la Composition API que con los hooks de React, y el deadline académico (2026-05-18) no deja margen para curvas de aprendizaje largas. También evalué Svelte + SvelteKit, que ofrece un bundle muy ligero y excelente rendimiento, pero su ecosistema de componentes es menor y el riesgo de bloquarme sin documentación o ejemplos era alto. Con Vue, el ecosistema de librerías y la documentación oficial en español son suficientemente maduros.

Como bundler utilizo **Vite 5+**, que aprovecha los módulos ES nativos del navegador para arrancar el servidor de desarrollo de forma casi instantánea, sin necesidad de empaquetar todo el proyecto cada vez. Esto es especialmente útil durante el desarrollo iterativo: cambiar un componente y ver el resultado en el navegador en menos de un segundo es el flujo habitual. La configuración del proyecto se inicializó con `npm create vue@latest` incluyendo TypeScript, Vue Router y Pinia de serie.

Para los estilos, elegí **Tailwind CSS v3**: un framework CSS de utilidades que permite construir interfaces directamente en el HTML sin saltar a archivos `.css` separados. La ausencia de una librería de componentes prediseñada como shadcn/ui (que sí usaba el stack React original) supone más esfuerzo en algunos elementos de UI, pero a cambio tengo control total sobre la accesibilidad y el diseño responsivo, críticos en un entorno de tablet con posible uso con guantes.

---

## 2.3 Pinia: gestión de estado

Pinia es la librería oficial de gestión de estado para Vue 3, recomendada por el propio equipo de Vue como sustituta de Vuex. Su modelo se basa en stores individuales por dominio —en mi caso `useAuthStore`, `useAgendaStore`, `useResidenteStore`— que exponen estado reactivo, getters y acciones de forma directa, sin los *mutations* que hacían Vuex verboso y difícil de seguir.

La gestión de estado es especialmente relevante en esta aplicación porque distintos componentes de la interfaz necesitan leer y actualizar los mismos datos simultáneamente: la lista de tareas de la agenda, el residente activo en la ficha, o el token de autenticación del gerocultor en sesión. Con Pinia, cualquier componente puede importar el store correspondiente y acceder a sus datos reactivos sin necesidad de prop drilling ni eventos de bus. Comparado con Redux/Zustand del ecosistema React (alternativa descartada), Pinia es considerablemente más directo: menos boilerplate, TypeScript integrado, y DevTools de Vue automáticamente disponibles.

---

## 2.4 Firebase: Firestore, Authentication y Hosting

### Firestore como base de datos

Cloud Firestore es una base de datos NoSQL orientada a documentos, gestionada como servicio en la nube por Google (Firebase/Google Cloud). En lugar de tablas y filas, Firestore organiza los datos en colecciones de documentos JSON anidables. Para este proyecto, cada entidad del dominio (residentes, tareas, incidencias, usuarios, turnos) se mapea directamente a una colección de nivel superior, siguiendo el modelo definido en `SPEC/entities.md`.

La elección de Firestore sobre PostgreSQL (la opción original con Supabase, descartada en ADR-02b) responde a dos razones principales. Primera, coherencia de ecosistema: al usar Firebase Auth y Firebase Hosting, concentrar también la base de datos en el mismo proveedor elimina la necesidad de gestionar credenciales, regiones y consolas de múltiples servicios. Segunda, velocidad de implementación: para un proyecto individual con deadline ajustado, el tiempo que ahorré evitando configurar PostgreSQL, migraciones SQL, y un ORM fue significativo. Como contrapartida, Firestore introduce complejidad en consultas relacionales (los *joins* no existen: hay que desnormalizar o hacer consultas múltiples), y genera vendor lock-in con Google. Documenté este tradeoff explícitamente en ADR-02b.

Una ventaja concreta de Firestore para esta aplicación es su soporte nativo de *listeners* en tiempo real: si un coordinador actualiza el estado de una tarea, el cambio puede propagarse automáticamente a la vista del gerocultor sin necesidad de polling. Esto abre la puerta a funcionalidades de tiempo real sin arquitectura adicional.

En cuanto al cumplimiento del RGPD, configuro el proyecto Firebase con la localización de Firestore en la región `europe-west1` (Bélgica) o `europe-west3` (Frankfurt) para asegurar que los datos permanecen en la Unión Europea. Este aspecto se desarrolla en detalle en la sección 10.

### Firebase Authentication

Firebase Auth es el servicio de autenticación de Firebase. Gestiona el ciclo completo de identidad: registro, inicio de sesión, recuperación de contraseña, y emisión de tokens JWT (*ID tokens*) que el cliente puede usar para autenticarse en la API Express. Elegí Firebase Auth sobre las alternativas por dos razones claras. Primero, evita implementar manualmente la gestión de JWT: generación, firma, expiración y refresh son responsabilidad del SDK, no mía. Segundo, es coherente con el resto del ecosistema Firebase: el mismo proyecto, la misma consola, las mismas credenciales de administración.

Descarté Auth0 (servicio externo de autenticación) porque añadiría un tercer proveedor de pago con un plan gratuito limitado. Descarté también implementar JWT propio con Express porque requeriría entre 3 y 5 días de desarrollo adicional y conlleva riesgo real de errores de seguridad en una aplicación que maneja datos de salud. El desglose de estas alternativas está en ADR-03b.

El modelo de seguridad que implementé tiene tres capas: Firebase Auth valida la identidad del usuario; las *Firestore Security Rules* controlan qué documentos puede leer o escribir cada rol en acceso directo; y el middleware Express verifica el ID token en cada petición a la API y comprueba los *custom claims* de rol (`gerocultor`, `coordinador`, `administrador`). Esta arquitectura de defensa en profundidad es especialmente importante porque los datos del sistema incluyen diagnósticos, medicación e incidencias de salud de los residentes: datos de categoría especial según el artículo 9 del RGPD.

### Firebase Hosting

Firebase Hosting es el servicio de alojamiento de activos estáticos de Firebase. Despliega la SPA Vue compilada en un CDN global con HTTPS automático, sin necesidad de configurar servidores ni certificados. El comando `firebase deploy` empaqueta en un solo paso el frontend, las Firestore Rules y las configuraciones del proyecto.

Evalué otras opciones: Vercel y Netlify ofrecen excelentes previews de pull requests y deploys rápidos, pero requieren un segundo proveedor desconectado de Firebase, con más fricción operativa. Google Cloud Run permitiría desplegar también la API Express en contenedores, pero implica Dockerfile, CI/CD más complejo y coste por invocación que excede el plan gratuito para un proyecto académico. La decisión completa está en ADR-04b.

---

## 2.5 Express.js como capa API intermedia

Express.js es un framework minimalista para construir servidores HTTP con Node.js. En este proyecto cumple el rol de *API wrapper*: recibe las peticiones del cliente Vue, verifica la autenticación (middleware `verifyAuth` con Firebase Admin SDK), aplica la lógica de negocio que no puede expresarse solo en Firestore Rules, y ejecuta las operaciones en Firestore a través del Admin SDK.

La capa Express es necesaria en dos escenarios principales. Primero, en operaciones que requieren comprobaciones cruzadas entre colecciones: por ejemplo, verificar que un gerocultor tiene asignado el residente que intenta consultar requiere cruzar la colección `residenteAsignaciones` antes de servir el documento de `residentes`. Esto no es posible directamente en Firestore Rules. Segundo, en la gestión de los *custom claims* de rol: asignar o modificar el claim `rol` de un usuario solo puede hacerse desde el Admin SDK (backend), nunca desde el cliente.

La arquitectura interna de la API sigue la estructura `api/{routes, controllers, middleware, services}`, donde cada capa tiene una responsabilidad única. El *middleware* solo verifica tokens; los *controllers* orquestan la petición; los *services* encapsulan la lógica de negocio; las *routes* definen los endpoints.

---

## 2.6 Diseño Mobile-first y accesibilidad (WCAG 2.1 AA)

El diseño *mobile-first* es una metodología que parte del diseño para la pantalla más pequeña (generalmente móvil) y escala progresivamente hacia pantallas más grandes, en lugar del enfoque inverso. Para esta aplicación es la opción natural: los gerocultores trabajan con tablets de 10 pulgadas o móviles durante sus rondas, a menudo con guantes, en entornos con luz variable. El diseño debe funcionar correctamente en esas condiciones desde el principio.

La implementación de *mobile-first* en Tailwind CSS es directa: sus clases responsivas usan prefijos (`sm:`, `md:`, `lg:`) que aplican estilos a partir de cierto ancho, forzando a diseñar el layout base para pantallas pequeñas.

Respecto a la accesibilidad, el proyecto sigue las pautas WCAG 2.1 nivel AA (*Web Content Accessibility Guidelines*). Esto implica garantizar contraste mínimo de 4.5:1 en texto normal, proporcionar etiquetas `aria-*` en elementos interactivos, asegurar navegación completa por teclado, y que las áreas pulsables sean suficientemente grandes para uso táctil (mínimo 44×44px). Estas exigencias son especialmente relevantes porque el personal de una residencia puede tener distintos perfiles de visión y movilidad.

Para el proceso de diseño de pantallas utilicé **Google Stitch** (ADR-05), una herramienta de prototipado asistida por IA integrada en el flujo de trabajo con agentes MCP. Los exports de pantallas se versionan en `OUTPUTS/design-exports/` siguiendo la convención de nombres definida en ADR-05.

---

## 2.7 Metodología: Spec-Driven Development (SDD) y ciclo ágil

El desarrollo del proyecto sigue una metodología ágil con sprints semanales de 5-7 días. La planificación parte del backlog definido en `PLAN/backlog.md`, priorizado con criterios MoSCoW (Must/Should/Could/Won't), y se trabaja un sprint a la vez documentado en `PLAN/current-sprint.md`.

Dentro de este ciclo ágil, adopté **Spec-Driven Development (SDD)** como metodología de trabajo con agentes de IA. SDD propone escribir las especificaciones, decisiones de diseño y tareas de implementación en artefactos estructurados antes de escribir código, de modo que los agentes tengan contexto suficiente para producir código coherente con los requisitos. Los guardrails del proyecto (G01-G09, en `AGENTS/guardrails.md`) formalizan este enfoque: ningún agente puede escribir código sin una historia de usuario en `SPEC/`, y ninguna decisión técnica relevante avanza sin un ADR en `DECISIONS/`. Esta disciplina, aunque añade fricción inicial, reduce significativamente la deuda técnica y las inconsistencias entre capas en un proyecto de desarrollo individual.

---

*Borrador generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*ADRs fuente: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05*  
*Extensión aproximada: 1.350 palabras*
