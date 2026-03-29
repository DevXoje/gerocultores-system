# User Stories — Historias de usuario

> Fuente: derivadas de los requisitos funcionales en `requirements.md`.
> Procesado en Fase 2 por el Collector/Structurer (IA).
>
> Convención de prioridad (MoSCoW):
> - **Must**: imprescindible para la entrega mínima viable.
> - **Should**: importante, se incluye si el tiempo lo permite.
> - **Could**: deseable, incluido si hay margen.
>
> Estado: Backlog | In Progress | Done
>
> *Última actualización: 2026-03-28 — Fase 2 bootstrap*

---

### US-01 — Inicio de sesión
**Como** gerocultor o coordinador, **quiero** iniciar sesión con mis credenciales, **para** acceder a mi agenda y los datos de los residentes de forma segura.

**Criterios de aceptación**:
- [ ] CA-1: El formulario de login muestra campos de usuario y contraseña.
- [ ] CA-2: Con credenciales incorrectas, el sistema muestra un mensaje de error claro sin revelar qué campo es incorrecto.
- [ ] CA-3: Con credenciales correctas, el usuario es redirigido a su agenda del día.
- [ ] CA-4: La sesión persiste mientras el navegador esté abierto (token en memoria/cookie segura, no localStorage en claro).
- [ ] CA-5: El botón de cerrar sesión invalida el token en el servidor.

**Requisitos relacionados**: RF-01  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-02 — Control de acceso por rol
**Como** administrador, **quiero** que cada usuario solo acceda a las funciones y datos que corresponden a su rol, **para** proteger la privacidad de los residentes y mantener la integridad del sistema.

**Criterios de aceptación**:
- [ ] CA-1: Un gerocultor no puede acceder al panel de administración de usuarios.
- [ ] CA-2: Un gerocultor solo ve los residentes que tiene asignados.
- [ ] CA-3: Un coordinador puede ver todos los residentes y agendas.
- [ ] CA-4: Intentar acceder a una ruta no autorizada retorna HTTP 403.

**Requisitos relacionados**: RF-02  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-03 — Consulta de agenda diaria
**Como** gerocultor, **quiero** ver mi agenda del día actual al iniciar sesión, **para** saber qué tareas tengo pendientes, en qué orden y para qué residente.

**Criterios de aceptación**:
- [ ] CA-1: La agenda muestra todas las tareas del día, ordenadas cronológicamente.
- [ ] CA-2: Cada tarea muestra: hora, nombre del residente, tipo de tarea y estado (pendiente/en curso/completada).
- [ ] CA-3: Las tareas vencidas y no completadas se resaltan visualmente.
- [ ] CA-4: La vista es usable en tablet (10") con interacción táctil.
- [ ] CA-5: La agenda carga en menos de 2 segundos.

**Requisitos relacionados**: RF-03  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-04 — Actualizar estado de una tarea
**Como** gerocultor, **quiero** marcar una tarea como completada o añadir notas, **para** registrar lo que he hecho y avisar al siguiente turno.

**Criterios de aceptación**:
- [ ] CA-1: Al pulsar una tarea, aparece una acción para marcarla como "completada", "en curso" o "con incidencia".
- [ ] CA-2: El estado actualizado se refleja inmediatamente en la agenda.
- [ ] CA-3: Se puede añadir una nota libre (texto) a la tarea.
- [ ] CA-4: El cambio de estado queda registrado con timestamp y usuario en el servidor.
- [ ] CA-5: Si se marca "con incidencia", el sistema propone iniciar el flujo de registro de incidencia (RF-06).

**Requisitos relacionados**: RF-04  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-05 — Consulta de ficha de residente
**Como** gerocultor, **quiero** acceder a la ficha de un residente desde su tarea o desde una búsqueda, **para** recordar sus condiciones de salud, alergias y preferencias antes de atenderle.

**Criterios de aceptación**:
- [ ] CA-1: La ficha muestra: nombre completo, fecha de nacimiento, foto (opcional), diagnósticos principales, alergias, medicación activa y preferencias de cuidado.
- [ ] CA-2: La ficha es de solo lectura para el gerocultor (no puede editarla).
- [ ] CA-3: El coordinador puede editar la ficha.
- [ ] CA-4: Los campos de salud (diagnósticos, medicación, alergias) no son accesibles sin autenticación.
- [ ] CA-5: La ficha incluye un enlace rápido al historial de incidencias del residente.

**Requisitos relacionados**: RF-05  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-06 — Registro de incidencia
**Como** gerocultor, **quiero** registrar una incidencia de un residente con un formulario rápido, **para** que quede constancia inmediata y el equipo pueda actuar.

**Criterios de aceptación**:
- [ ] CA-1: El formulario permite seleccionar el residente, tipo de incidencia, severidad (leve/moderada/crítica) y descripción libre.
- [ ] CA-2: La fecha y hora se registran automáticamente (servidor, no cliente).
- [ ] CA-3: El usuario que registra la incidencia queda identificado automáticamente.
- [ ] CA-4: Al guardar, la incidencia aparece inmediatamente en el historial del residente.
- [ ] CA-5: Si la severidad es "crítica", se dispara una notificación al coordinador.
- [ ] CA-6: El formulario se puede completar con 5 taps o menos en tablet.

**Requisitos relacionados**: RF-06  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-07 — Historial de incidencias de un residente
**Como** gerocultor o coordinador, **quiero** consultar el historial de incidencias de un residente filtrado por fecha y tipo, **para** evaluar su evolución y detectar patrones.

**Criterios de aceptación**:
- [ ] CA-1: El historial muestra todas las incidencias del residente, ordenadas de más reciente a más antigua.
- [ ] CA-2: Se puede filtrar por rango de fechas y por tipo de incidencia.
- [ ] CA-3: Cada entrada muestra: fecha/hora, tipo, severidad, descripción, gerocultor que la registró.
- [ ] CA-4: El historial es paginado o con scroll infinito (no más de 20 registros por carga).
- [ ] CA-5: Los datos son de solo lectura (no se puede editar el historial).

**Requisitos relacionados**: RF-07  
**Prioridad**: Must  
**Estado**: Backlog

---

### US-08 — Recibir notificaciones de alertas críticas
**Como** gerocultor, **quiero** recibir notificaciones cuando haya una incidencia crítica o una tarea urgente, **para** reaccionar a tiempo sin tener que estar revisando la app constantemente.

**Criterios de aceptación**:
- [ ] CA-1: Al registrarse una incidencia de severidad "crítica", los gerocultores del turno activo reciben una notificación in-app.
- [ ] CA-2: Las tareas que están a 15 minutos de su hora programada generan un aviso visible.
- [ ] CA-3: Las notificaciones se pueden marcar como leídas.
- [ ] CA-4: Si la app está en segundo plano o cerrada (PWA), la notificación aparece como notificación del sistema operativo (push).

**Requisitos relacionados**: RF-08  
**Prioridad**: Should  
**Estado**: Backlog

---

### US-09 — Alta y gestión de residentes
**Como** coordinador, **quiero** dar de alta nuevos residentes y editar sus fichas, **para** mantener actualizado el registro de personas atendidas.

**Criterios de aceptación**:
- [ ] CA-1: El coordinador puede crear un nuevo residente con los campos obligatorios: nombre, apellidos, fecha de nacimiento, habitación.
- [ ] CA-2: Puede editar todos los campos de la ficha (diagnósticos, alergias, medicación, preferencias).
- [ ] CA-3: Puede dar de baja (archivar) un residente sin eliminar su historial.
- [ ] CA-4: Un residente archivado no aparece en las agendas activas pero su historial es consultable.

**Requisitos relacionados**: RF-09  
**Prioridad**: Should  
**Estado**: Backlog

---

### US-10 — Gestión de cuentas de usuarios
**Como** administrador, **quiero** crear y desactivar cuentas de gerocultores y coordinadores, **para** controlar quién tiene acceso al sistema.

**Criterios de aceptación**:
- [ ] CA-1: El administrador puede crear una cuenta indicando nombre, rol y credenciales iniciales.
- [ ] CA-2: El administrador puede asignar residentes a un gerocultor.
- [ ] CA-3: El administrador puede desactivar una cuenta; el usuario desactivado no puede iniciar sesión.
- [ ] CA-4: No se eliminan registros históricos al desactivar una cuenta.

**Requisitos relacionados**: RF-10  
**Prioridad**: Should  
**Estado**: Backlog

---

### US-11 — Resumen de fin de turno
**Como** gerocultor, **quiero** generar un resumen de mi turno al terminarlo, **para** facilitar el traspaso al compañero del turno siguiente.

**Criterios de aceptación**:
- [ ] CA-1: El resumen incluye: tareas completadas, tareas pendientes, incidencias registradas durante el turno.
- [ ] CA-2: El resumen se puede ver en pantalla y exportar o compartir (PDF o enlace).
- [ ] CA-3: El resumen queda guardado y es visible para el coordinador y el turno siguiente.

**Requisitos relacionados**: RF-11  
**Prioridad**: Should  
**Estado**: Backlog

---

### US-12 — Vista de agenda semanal
**Como** gerocultor o coordinador, **quiero** ver la agenda de la semana en una vista de calendario, **para** planificar y revisar la distribución de tareas.

**Criterios de aceptación**:
- [ ] CA-1: La vista semanal muestra los 7 días de la semana con las tareas de cada día.
- [ ] CA-2: Al pulsar un día, se muestra el detalle de ese día (agenda diaria).
- [ ] CA-3: El coordinador puede añadir o modificar tareas desde la vista semanal.

**Requisitos relacionados**: RF-12  
**Prioridad**: Could  
**Estado**: Backlog

<!-- sdd/switch-stack-to-vue-firebase SPEC delta -->
### Cambios en Criterios de Aceptación (Stack Firebase)
- **US-01 (Inicio de sesión)**: 
  - *Modificado CA-4*: La sesión persiste utilizando el SDK de Firebase Auth, manejando el ciclo de vida del token de forma automática en lugar de cookies gestionadas manualmente.
- **US-02 (Control de acceso por rol)**:
  - *Añadido CA-5*: Las reglas de seguridad de Firestore (Firestore Rules) rechazan de forma nativa cualquier lectura/escritura en base de datos si el rol en el token (Custom Claims) no coincide con los permisos requeridos.
- **US-08 (Notificaciones y alertas)**:
  - *Modificado CA-4*: Las notificaciones push nativas en segundo plano (PWA / Service Workers) quedan fuera del alcance. Las notificaciones se mostrarán in-app únicamente cuando la aplicación esté en primer plano.
<!-- fin delta -->

*Última actualización: 2026-03-29 — Fase sdd-spec*
