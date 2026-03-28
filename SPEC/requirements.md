# Requirements — Requisitos del sistema

> Fuente canónica de requisitos. Procesado en Fase 2 por el Collector/Structurer (IA).
> Fuente: propuesta de proyecto aprobada (Jose Vilches Sánchez, 2026-02-27) + dominio inferido.
>
> Convención:
> - **[INFERRED]**: requisito inferido del dominio, no mencionado explícitamente en la propuesta.
> - Los nombres de campo deben coincidir exactamente con `entities.md` (guardrail G04).
>
> *Última actualización: 2026-03-28 — Fase 2 bootstrap*

---

## Requisitos Funcionales

### RF-01 — Autenticación de usuarios
- **Descripción**: El sistema debe permitir a los gerocultores y coordinadores iniciar y cerrar sesión con credenciales seguras (usuario/contraseña o sistema equivalente).
- **Actor**: Gerocultor, Coordinador, Administrador
- **Prioridad**: Alta
- **User Stories relacionadas**: US-01
- **Nota**: [INFERRED] — necesario para cualquier sistema con datos sensibles RGPD.

### RF-02 — Gestión de roles y permisos
- **Descripción**: El sistema debe soportar al menos dos roles: Gerocultor (acceso a su agenda y residentes asignados) y Coordinador/Administrador (acceso completo). Los permisos se aplican a nivel de acción y de datos.
- **Actor**: Sistema, Administrador
- **Prioridad**: Alta
- **User Stories relacionadas**: US-02
- **Nota**: [INFERRED] — implícito por la propuesta (supervisión, familiares, coordinación).

### RF-03 — Consulta de agenda diaria
- **Descripción**: El gerocultor debe poder consultar su agenda del día actual: lista de tareas ordenadas por hora, con estado (pendiente / en curso / completada), residente asociado y notas.
- **Actor**: Gerocultor
- **Prioridad**: Alta
- **User Stories relacionadas**: US-03

### RF-04 — Completar / actualizar tarea de la agenda
- **Descripción**: El gerocultor debe poder marcar una tarea como completada, en curso o con incidencia, y añadir notas libres a la tarea.
- **Actor**: Gerocultor
- **Prioridad**: Alta
- **User Stories relacionadas**: US-04

### RF-05 — Consulta de ficha de residente
- **Descripción**: El gerocultor debe poder acceder a la ficha de cada residente asignado: datos identificativos, condiciones de salud relevantes, medicación, alergias y preferencias de cuidado.
- **Actor**: Gerocultor, Coordinador
- **Prioridad**: Alta
- **User Stories relacionadas**: US-05
- **Nota**: Campos con datos de salud son RGPD categoría especial.

### RF-06 — Registro de incidencia
- **Descripción**: El gerocultor debe poder registrar una incidencia asociada a un residente: tipo, descripción, severidad y marca de tiempo automática. La incidencia queda en el historial del residente.
- **Actor**: Gerocultor
- **Prioridad**: Alta
- **User Stories relacionadas**: US-06

### RF-07 — Consulta de historial de incidencias por residente
- **Descripción**: El gerocultor y el coordinador deben poder consultar el listado de incidencias pasadas de un residente, filtradas por fecha y tipo.
- **Actor**: Gerocultor, Coordinador
- **Prioridad**: Alta
- **User Stories relacionadas**: US-07

### RF-08 — Notificaciones y alertas críticas
- **Descripción**: El sistema debe enviar notificaciones al gerocultor para alertar de tareas próximas o urgentes y de incidencias de severidad crítica registradas por compañeros.
- **Actor**: Sistema, Gerocultor
- **Prioridad**: Media
- **User Stories relacionadas**: US-08
- **Nota**: Implementación vía notificaciones push (PWA) o in-app.

### RF-09 — Gestión de residentes [INFERRED]
- **Descripción**: El coordinador/administrador debe poder crear, editar y dar de baja residentes del sistema. El alta de un nuevo residente activa su ficha y la posibilidad de asignarle tareas.
- **Actor**: Coordinador, Administrador
- **Prioridad**: Media
- **User Stories relacionadas**: US-09

### RF-10 — Gestión de usuarios/gerocultores [INFERRED]
- **Descripción**: El administrador debe poder crear y desactivar cuentas de gerocultores y coordinadores, y asignar residentes a cada gerocultor.
- **Actor**: Administrador
- **Prioridad**: Media
- **User Stories relacionadas**: US-10

### RF-11 — Traspaso de turno / resumen de turno [INFERRED]
- **Descripción**: Al finalizar su turno, el gerocultor debe poder generar un resumen de las tareas completadas, pendientes e incidencias registradas, para facilitar el traspaso al turno siguiente.
- **Actor**: Gerocultor
- **Prioridad**: Media
- **User Stories relacionadas**: US-11

### RF-12 — Visualización de agenda semanal [INFERRED]
- **Descripción**: El gerocultor y el coordinador deben poder consultar una vista de la agenda de la semana en curso para planificar o revisar la distribución de tareas.
- **Actor**: Gerocultor, Coordinador
- **Prioridad**: Baja
- **User Stories relacionadas**: US-12

---

## Requisitos No Funcionales

### RNF-01 — Diseño tablet-first y mobile-first
- **Categoría**: Usabilidad / Accesibilidad
- **Descripción**: La interfaz debe estar optimizada para tablets (768–1024 px) y funcionar correctamente en móviles (< 768 px). Los touch targets deben tener un mínimo de 44×44 px.
- **Criterio de aceptación**: La aplicación se puede usar cómodamente con el dedo en una tablet de 10" y en un móvil de 5,5" sin necesidad de zoom.

### RNF-02 — Rendimiento en redes lentas
- **Categoría**: Rendimiento
- **Descripción**: La aplicación debe cargarse y ser funcional en conexiones de baja velocidad (simulando 3G lento: ~400 Kbps). El tiempo de carga inicial no debe superar 5 segundos en estas condiciones.
- **Criterio de aceptación**: Lighthouse Performance score ≥ 70 en condiciones de red simulada "Slow 3G".

### RNF-03 — Seguridad de datos (RGPD)
- **Categoría**: Seguridad / Privacidad
- **Descripción**: Todos los datos de residentes se transmiten cifrados (HTTPS). Los datos de categoría especial (salud) solo son accesibles por usuarios autenticados con el rol correspondiente. No se almacenan datos sensibles en texto plano en el cliente.
- **Criterio de aceptación**: Ninguna ruta de la API devuelve datos de residentes sin un token de autenticación válido. Las pruebas de acceso no autorizado retornan HTTP 401/403.

### RNF-04 — Disponibilidad y tiempo de respuesta
- **Categoría**: Disponibilidad / Rendimiento
- **Descripción**: El tiempo de respuesta de las operaciones principales (carga de agenda, registro de incidencia) no debe superar 2 segundos en condiciones normales de red.
- **Criterio de aceptación**: Tests de rendimiento demuestran respuesta < 2 s en el 95% de las peticiones bajo carga normal.

### RNF-05 — Accesibilidad WCAG 2.1 nivel AA [INFERRED]
- **Categoría**: Accesibilidad
- **Descripción**: La interfaz debe cumplir los criterios de contraste (4.5:1 para texto normal) y ser navegable con tecnologías de asistencia básicas.
- **Criterio de aceptación**: axe-core o Lighthouse Accessibility score ≥ 85.

### RNF-06 — Escalabilidad básica [INFERRED]
- **Categoría**: Rendimiento
- **Descripción**: El sistema debe soportar al menos 20 usuarios concurrentes sin degradación significativa del rendimiento (suficiente para una residencia mediana).
- **Criterio de aceptación**: Tests de carga con 20 usuarios concurrentes no superan 3 s de respuesta media.

### RNF-07 — Trazabilidad y auditoría [INFERRED]
- **Categoría**: Seguridad
- **Descripción**: Todas las operaciones sobre datos de residentes (creación, modificación, eliminación de incidencias) deben quedar registradas con usuario, timestamp y acción realizada.
- **Criterio de aceptación**: El registro de auditoría existe en base de datos y no puede ser modificado por el gerocultor.

### RNF-08 — Mantenibilidad del código
- **Categoría**: Mantenibilidad
- **Descripción**: El código debe seguir las convenciones definidas en TECH_GUIDE.md, con linting configurado y al menos un 60% de cobertura de tests en la lógica de negocio.
- **Criterio de aceptación**: El pipeline de CI no falla en linting. La cobertura de tests es ≥ 60%.

*Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*
