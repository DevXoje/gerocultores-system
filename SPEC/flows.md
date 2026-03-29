# Flows — Flujos de usuario y de sistema

> Descripción de los flujos principales de la aplicación.
> Fuente para el Developer y el Tester.
>
> Convención:
> - **Actor**: quién inicia o participa en el flujo.
> - **Trigger**: qué evento inicia el flujo.
> - **Precondición**: estado necesario antes de empezar.
> - **Postcondición**: estado del sistema tras completar el flujo con éxito.
> - Los pasos marcados con `[Sistema]` son automáticos; los demás son acciones del usuario.
>
> *Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*

---

## FL-01 — Inicio de sesión

**Actor**: Gerocultor / Coordinador / Administrador  
**Trigger**: El usuario accede a la URL de la aplicación o es redirigido al login por sesión expirada.  
**Precondición**: El usuario tiene una cuenta activa (`Usuario.activo = true`).

**Pasos**:
1. El usuario ve la pantalla de inicio de sesión con campos `email` y `contraseña`.
2. El usuario introduce sus credenciales y pulsa "Entrar".
3. `[Sistema]` Valida que el email existe y que `passwordHash` coincide (bcrypt).
4. `[Sistema]` Si las credenciales son incorrectas: muestra mensaje de error genérico ("Usuario o contraseña incorrectos") sin indicar cuál de los dos falló. El flujo vuelve al paso 1.
5. `[Sistema]` Si son correctas: genera un token JWT firmado con tiempo de expiración.
6. `[Sistema]` Actualiza `Usuario.ultimoAcceso` con el timestamp actual.
7. `[Sistema]` Redirige al usuario a su agenda del día (flujo FL-02).

**Postcondición**: El usuario está autenticado y tiene un token JWT válido. Ve su agenda del día.

**Flujos alternativos**:
- **FA-01a**: El usuario intenta acceder a una ruta protegida sin sesión → `[Sistema]` redirige al login con mensaje informativo.
- **FA-01b**: El token JWT ha expirado → `[Sistema]` redirige al login; el usuario debe volver a autenticarse.

---

## FL-02 — Consulta de agenda diaria

**Actor**: Gerocultor  
**Trigger**: El gerocultor inicia sesión o navega al apartado "Mi Agenda" desde cualquier pantalla.  
**Precondición**: El usuario está autenticado con rol `gerocultor`.

**Pasos**:
1. `[Sistema]` Lee el `usuarioId` del token JWT.
2. `[Sistema]` Consulta las `Tarea` donde `usuarioId = {id del usuario}` y `fechaHora` corresponde al día actual.
3. `[Sistema]` Ordena las tareas cronológicamente por `fechaHora`.
4. La pantalla muestra la lista de tareas del día: hora, nombre del residente, tipo de tarea y estado con código de color (verde = completada, naranja = en curso, rojo = vencida y pendiente, gris = pendiente futura).
5. El gerocultor puede desplazarse por la lista verticalmente.
6. Al pulsar una tarea, accede al detalle de esa tarea (ver flujo FL-04, paso opcional).

**Postcondición**: El gerocultor ve todas sus tareas del día ordenadas y con su estado actualizado.

**Flujos alternativos**:
- **FA-02a**: No hay tareas asignadas para hoy → Se muestra un mensaje informativo: "No tienes tareas programadas para hoy".
- **FA-02b**: Error de red → Se muestra un mensaje de error con opción de reintentar.

---

## FL-03 — Registro de incidencia

**Actor**: Gerocultor  
**Trigger**: El gerocultor pulsa "Registrar incidencia" (desde la agenda, desde la ficha del residente o desde la tarea con estado `con_incidencia`).  
**Precondición**: El usuario está autenticado con rol `gerocultor`.

**Pasos**:
1. La pantalla muestra el formulario de registro de incidencia.
2. El gerocultor selecciona o confirma el residente afectado (si se abrió desde una tarea, se precarga el residente).
3. El gerocultor selecciona el tipo de incidencia (`caida`, `comportamiento`, `salud`, `alimentacion`, `medicacion`, `otro`).
4. El gerocultor selecciona la severidad (`leve`, `moderada`, `critica`).
5. El gerocultor escribe la descripción en el campo de texto libre.
6. El gerocultor pulsa "Guardar".
7. `[Sistema]` Valida que los campos obligatorios están completos.
8. `[Sistema]` Crea la entidad `Incidencia` con `registradaEn = NOW()` (servidor) y `usuarioId` del token.
9. `[Sistema]` Vincula la incidencia al `Residente` indicado.
10. `[Sistema]` Si `severidad = 'critica'`: crea una `Notificacion` de tipo `incidencia_critica` y la envía al coordinador de turno.
11. La app muestra confirmación: "Incidencia registrada correctamente".
12. El gerocultor es redirigido al historial del residente o a la agenda (según desde dónde se inició).

**Postcondición**: La `Incidencia` existe en base de datos, aparece en el historial del residente y, si es crítica, el coordinador ha recibido una notificación.

**Flujos alternativos**:
- **FA-03a**: Campos obligatorios vacíos → `[Sistema]` muestra validación inline sin enviar. El gerocultor corrige y reintenta.
- **FA-03b**: Error de red al guardar → `[Sistema]` muestra error; el formulario conserva los datos para reintentar.
- **FA-03c**: El gerocultor pulsa "Cancelar" → Se descarta el formulario y se vuelve a la pantalla anterior. No se crea ningún registro.

---

## FL-04 — Consulta de historial de residente

**Actor**: Gerocultor / Coordinador  
**Trigger**: El usuario pulsa "Ver historial" desde la ficha del residente o desde el detalle de una incidencia.  
**Precondición**: El usuario está autenticado. El residente está asignado al gerocultor (o el usuario es coordinador/administrador).

**Pasos**:
1. `[Sistema]` Verifica que el usuario tiene permiso de acceso a ese residente.
2. La pantalla muestra el historial de incidencias del residente, ordenadas de más reciente a más antigua (máximo 20 por página).
3. El usuario ve para cada incidencia: fecha/hora, tipo, severidad (con icono de color), descripción breve, nombre del gerocultor que la registró.
4. El usuario puede filtrar por rango de fechas (fecha inicio y fecha fin).
5. El usuario puede filtrar por tipo de incidencia.
6. `[Sistema]` Aplica los filtros y recarga la lista.
7. Al pulsar una incidencia, se expande para mostrar la descripción completa.

**Postcondición**: El usuario ha consultado el historial completo o filtrado del residente. No se ha modificado ningún dato.

**Flujos alternativos**:
- **FA-04a**: El gerocultor intenta acceder al historial de un residente no asignado → `[Sistema]` retorna HTTP 403. La app muestra "No tienes permiso para ver este residente".
- **FA-04b**: El residente no tiene incidencias registradas → Se muestra "Sin incidencias registradas".
- **FA-04c**: El filtro de fechas no devuelve resultados → Se muestra "No hay incidencias en el periodo seleccionado" con opción de limpiar filtros.

---

## FL-05 — Marcar tarea como completada

**Actor**: Gerocultor  
**Trigger**: El gerocultor pulsa sobre una tarea pendiente o en curso en su agenda.  
**Precondición**: El usuario está autenticado. La tarea está en estado `pendiente` o `en_curso`.

**Pasos**:
1. Al pulsar la tarea, aparece un panel de acción (bottom sheet en mobile/tablet) con las opciones: "Marcar completada", "En curso", "Con incidencia", "Añadir nota".
2. El gerocultor selecciona "Marcar completada".
3. `[Sistema]` Actualiza `Tarea.estado = 'completada'` y `Tarea.completadaEn = NOW()`.
4. La agenda se actualiza visualmente de forma inmediata (optimistic update).
5. Si el gerocultor seleccionó "Añadir nota", puede escribir texto en un campo adicional antes de confirmar.

**Postcondición**: La tarea queda en estado `completada` con timestamp de finalización. El cambio queda registrado en el servidor.

**Flujos alternativos**:
- **FA-05a**: El gerocultor selecciona "Con incidencia" → El flujo continúa en FL-03 (registro de incidencia) con el residente de la tarea precargado.
- **FA-05b**: Error de red → `[Sistema]` revierte el optimistic update y muestra error. La tarea vuelve a su estado anterior.

---

## FL-06 — Cierre de turno y resumen de traspaso

**Actor**: Gerocultor  
**Trigger**: El gerocultor pulsa "Finalizar turno" desde el menú o la barra de navegación.  
**Precondición**: El gerocultor tiene un turno activo (`Turno.fin = null`).

**Pasos**:
1. La app muestra una pantalla de confirmación: "¿Deseas finalizar tu turno?".
2. El gerocultor confirma.
3. `[Sistema]` Registra `Turno.fin = NOW()`.
4. `[Sistema]` Genera el resumen de traspaso: lista de tareas completadas, tareas pendientes (con detalle) e incidencias registradas durante el turno.
5. La app muestra el resumen generado para revisión.
6. El gerocultor puede añadir observaciones finales al resumen (campo de texto libre).
7. El gerocultor confirma el resumen.
8. `[Sistema]` Guarda `Turno.resumenTraspaso` con el contenido generado + observaciones.
9. La app muestra confirmación y redirige al gerocultor a la pantalla de inicio.

**Postcondición**: El turno queda cerrado. El resumen de traspaso está disponible para el coordinador y el turno siguiente.

**Flujos alternativos**:
- **FA-06a**: El gerocultor cancela en el paso 2 → No se realiza ningún cambio.
- **FA-06b**: Quedan tareas críticas pendientes → `[Sistema]` muestra una advertencia antes de la confirmación (paso 2) pero no impide el cierre.

*Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*
