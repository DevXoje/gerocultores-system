# 4. Análisis de requisitos

> **Borrador** — sección 4 de la memoria académica DAW  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: GeroCare — Agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-04-06 — WRITER agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud**: ~1.050 palabras + tablas

---

## 4.1 Metodología de captura de requisitos

La captura de requisitos se realizó mediante un proceso iterativo en dos fases. En la primera fase, utilicé una entrevista estructurada con el agente COLLECTOR —un rol de IA entrenado para extraer requisitos del dominio— a partir de la propuesta de proyecto aprobada (Jose Vilches Sánchez, 27 de febrero de 2026). El COLLECTOR documentó los resultados en `LOGS/raw_requirements_*.md` sin interpretar ni decidir, garantizando que la fuente primaria quedara intacta.

En la segunda fase, los requisitos en bruto fueron formalizados y estructurados en `SPEC/requirements.md` y `SPEC/user-stories.md`. Durante este proceso distinguí entre requisitos explícitos en la propuesta y requisitos inferidos del dominio (marcados como `[INFERRED]`), que son necesarios por las características propias de cualquier sistema con datos sanitarios y control de acceso por roles. La revisión final de los requisitos se realizó en diálogo con el tutor del proyecto, Andres Martos Gazquez, garantizando la coherencia con los objetivos académicos del ciclo DAW.

## 4.2 Actores del sistema

El sistema gestiona tres tipos de usuario con permisos diferenciados:

| Actor | Descripción | Historias de usuario asociadas |
|-------|-------------|-------------------------------|
| **Gerocultor** | Personal de atención directa. Trabaja en turnos rotativos (mañana, tarde, noche). Accede a su agenda personal, a los residentes que tiene asignados y puede registrar incidencias. | US-01, US-03, US-04, US-05, US-06, US-07, US-08, US-11, US-12 |
| **Coordinador** | Responsable de planta o de turno. Supervisa al equipo de gerocultores. Tiene acceso de lectura a todas las agendas y puede gestionar fichas de residentes. | US-01, US-02, US-05, US-07, US-09, US-11, US-12 |
| **Administrador** | Gestor del sistema (director del centro o responsable de TI). Controla la creación y desactivación de cuentas y la asignación de residentes a gerocultores. | US-02, US-10 |

## 4.3 Requisitos funcionales

Los siguientes requisitos definen qué debe hacer el sistema. La prioridad MoSCoW indica el impacto de cada requisito en la viabilidad del MVP:

| ID | Nombre | Descripción | Actor | Prioridad |
|----|--------|-------------|-------|-----------|
| RF-01 | Autenticación de usuarios | El sistema permite iniciar y cerrar sesión con credenciales seguras (email/contraseña). | Gerocultor, Coordinador, Administrador | **Must** |
| RF-02 | Gestión de roles y permisos | El sistema soporta tres roles (Gerocultor, Coordinador, Administrador) con permisos diferenciados a nivel de acción y de datos. | Sistema, Administrador | **Must** |
| RF-03 | Consulta de agenda diaria | El gerocultor consulta su agenda del día actual: tareas ordenadas por hora, con estado, residente asociado y notas. | Gerocultor | **Must** |
| RF-04 | Completar / actualizar tarea | El gerocultor marca tareas como completadas, en curso o con incidencia, y añade notas libres. | Gerocultor | **Must** |
| RF-05 | Consulta de ficha de residente | El gerocultor accede a la ficha del residente asignado: datos identificativos, diagnósticos, alergias, medicación y preferencias de cuidado. Solo lectura para gerocultor; editable por coordinador. | Gerocultor, Coordinador | **Must** |
| RF-06 | Registro de incidencia | El gerocultor registra una incidencia: tipo, descripción, severidad y marca de tiempo automática del servidor. La incidencia es inmutable post-creación. | Gerocultor | **Must** |
| RF-07 | Historial de incidencias | Listado de incidencias por residente, paginado, filtrable por fecha y tipo. | Gerocultor, Coordinador | **Must** |
| RF-08 | Notificaciones y alertas críticas | El sistema envía notificaciones in-app al gerocultor cuando se registra una incidencia crítica o una tarea está próxima. | Sistema, Gerocultor | **Should** |
| RF-09 | Gestión de residentes | El coordinador/administrador crea, edita y da de baja residentes. El alta activa la ficha y la posibilidad de asignar tareas. | Coordinador, Administrador | **Should** |
| RF-10 | Gestión de usuarios | El administrador crea y desactiva cuentas de gerocultores y coordinadores, y asigna residentes. | Administrador | **Should** |
| RF-11 | Resumen y traspaso de turno | El gerocultor genera un resumen al fin del turno con tareas completadas, pendientes e incidencias registradas. | Gerocultor | **Should** |
| RF-12 | Vista de agenda semanal | Vista de la agenda de la semana en curso para planificar o revisar la distribución de tareas. | Gerocultor, Coordinador | **Could** |

## 4.4 Requisitos no funcionales

Los requisitos no funcionales definen las restricciones de calidad del sistema:

| ID | Nombre | Descripción | Criterio de aceptación |
|----|--------|-------------|------------------------|
| RNF-01 | Diseño tablet-first y mobile-first | Interfaz optimizada para tablets (768–1024 px) y móviles (< 768 px). Touch targets mínimos de 44×44 px. | Usable con el dedo en tablet de 10" y móvil de 5,5" sin necesidad de zoom. |
| RNF-02 | Rendimiento en redes lentas | Carga inicial funcional en conexión 3G lento (~400 Kbps). Tiempo de carga ≤ 5 segundos en esas condiciones. | Lighthouse Performance score ≥ 70 en simulación "Slow 3G". |
| RNF-03 | Seguridad de datos (RGPD) | Transmisión cifrada (HTTPS). Datos de salud accesibles solo con autenticación y rol adecuado. Sin datos sensibles en texto plano en el cliente. | Ninguna ruta API devuelve datos de residentes sin token válido. Accesos no autorizados retornan HTTP 401/403. |
| RNF-04 | Disponibilidad y tiempo de respuesta | Operaciones principales (carga de agenda, registro de incidencia) en menos de 2 segundos en condiciones normales. | Tests de rendimiento: respuesta < 2 s en el 95% de peticiones bajo carga normal. |
| RNF-05 | Accesibilidad WCAG 2.1 nivel AA | Contraste mínimo 4.5:1 para texto normal. Navegable con tecnologías de asistencia básicas. | Lighthouse Accessibility score ≥ 85. |
| RNF-06 | Escalabilidad básica | Soporte para al menos 20 usuarios concurrentes sin degradación significativa. | Tests de carga: 20 usuarios concurrentes sin superar 3 s de respuesta media. |
| RNF-07 | Trazabilidad y auditoría | Todas las operaciones sobre datos de residentes quedan registradas con usuario, timestamp y acción. | Registro de auditoría en base de datos, no modificable por el gerocultor. |
| RNF-08 | Mantenibilidad del código | Código sigue convenciones de TECH_GUIDE.md. Linting configurado. Cobertura de tests ≥ 60% en lógica de negocio. | Pipeline CI sin fallos de linting. Cobertura ≥ 60%. |
| RNF-09 | Seguridad con Firestore Rules | Acceso directo a Firestore desde el cliente bloqueado o estrictamente limitado mediante Firebase Security Rules. | Suite de tests automatizados para las reglas de Firestore que valida accesos permitidos y denegados por rol. |
| RNF-10 | PWA excluido del alcance | Las capacidades PWA y el funcionamiento offline quedan explícitamente fuera del alcance para garantizar la entrega en plazo. | La aplicación requiere conexión a internet. No se implementan Service Workers para caché offline. |

## 4.5 Historias de usuario

Las historias de usuario formalizan los requisitos desde el punto de vista del actor. A continuación se presentan las doce historias, con los criterios de aceptación completos de las tres más críticas para el flujo del gerocultor.

---

**US-01 — Inicio de sesión**  
*Como gerocultor o coordinador, quiero iniciar sesión con mis credenciales, para acceder a mi agenda y los datos de los residentes de forma segura.*

**Criterios de aceptación (completos)**:
- CA-1: El formulario de login muestra campos de usuario y contraseña.
- CA-2: Con credenciales incorrectas, el sistema muestra un mensaje de error claro sin revelar qué campo es incorrecto.
- CA-3: Con credenciales correctas, el usuario es redirigido a su agenda del día.
- CA-4: La sesión persiste utilizando el SDK de Firebase Auth, manejando el ciclo de vida del token de forma automática.
- CA-5: El botón de cerrar sesión invalida el token en el servidor.

---

**US-02 — Control de acceso por rol**  
*Como administrador, quiero que cada usuario solo acceda a las funciones y datos que corresponden a su rol, para proteger la privacidad de los residentes y mantener la integridad del sistema.*

**US-03 — Consulta de agenda diaria**  
*Como gerocultor, quiero ver mi agenda del día actual al iniciar sesión, para saber qué tareas tengo pendientes, en qué orden y para qué residente.*

**Criterios de aceptación (completos)**:
- CA-1: La agenda muestra todas las tareas del día, ordenadas cronológicamente.
- CA-2: Cada tarea muestra: hora, nombre del residente, tipo de tarea y estado (pendiente / en curso / completada).
- CA-3: Las tareas vencidas y no completadas se resaltan visualmente.
- CA-4: La vista es usable en tablet (10") con interacción táctil.
- CA-5: La agenda carga en menos de 2 segundos.

---

**US-04 — Actualizar estado de una tarea**  
*Como gerocultor, quiero marcar una tarea como completada o añadir notas, para registrar lo que he hecho y avisar al siguiente turno.*

**US-05 — Consulta de ficha de residente**  
*Como gerocultor, quiero acceder a la ficha de un residente desde su tarea o desde una búsqueda, para recordar sus condiciones de salud, alergias y preferencias antes de atenderle.*

**US-06 — Registro de incidencia**  
*Como gerocultor, quiero registrar una incidencia de un residente con un formulario rápido, para que quede constancia inmediata y el equipo pueda actuar.*

**Criterios de aceptación (completos)**:
- CA-1: El formulario permite seleccionar el residente, tipo de incidencia, severidad (leve / moderada / crítica) y descripción libre.
- CA-2: La fecha y hora se registran automáticamente (servidor, no cliente).
- CA-3: El usuario que registra la incidencia queda identificado automáticamente.
- CA-4: Al guardar, la incidencia aparece inmediatamente en el historial del residente.
- CA-5: Si la severidad es "crítica", se dispara una notificación al coordinador.
- CA-6: El formulario se puede completar con 5 taps o menos en tablet.

---

**US-07 — Historial de incidencias de un residente**  
*Como gerocultor o coordinador, quiero consultar el historial de incidencias de un residente filtrado por fecha y tipo, para evaluar su evolución y detectar patrones.*

**US-08 — Recibir notificaciones de alertas críticas** *(Should)*  
*Como gerocultor, quiero recibir notificaciones cuando haya una incidencia crítica o una tarea urgente, para reaccionar a tiempo sin tener que estar revisando la app constantemente.*

**US-09 — Alta y gestión de residentes** *(Should)*  
*Como coordinador, quiero dar de alta nuevos residentes y editar sus fichas, para mantener actualizado el registro de personas atendidas.*

**US-10 — Gestión de cuentas de usuarios** *(Should)*  
*Como administrador, quiero crear y desactivar cuentas de gerocultores y coordinadores, para controlar quién tiene acceso al sistema.*

**US-11 — Resumen de fin de turno** *(Should)*  
*Como gerocultor, quiero generar un resumen de mi turno al terminarlo, para facilitar el traspaso al compañero del turno siguiente.*

**US-12 — Vista de agenda semanal** *(Could)*  
*Como gerocultor o coordinador, quiero ver la agenda de la semana en una vista de calendario, para planificar y revisar la distribución de tareas.*

---

*Borrador generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*Fuentes: SPEC/requirements.md, SPEC/user-stories.md, SPEC/constraints.md*  
*Engram topic key: academic/analisis-requisitos*
