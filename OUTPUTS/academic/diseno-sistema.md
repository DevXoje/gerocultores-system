# 5. Diseño del sistema

> **Autor**: Jose Vilches Sánchez  
> **Tutor**: Andres Martos Gazquez  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Proyecto**: GeroCare — Sistema de Gestión para Gerocultores  
> **Estado**: BORRADOR — 2026-04-06  
> **Longitud objetivo**: ~1.800–2.200 palabras (páginas 20–25 de la memoria)

---

## 5.1 Arquitectura general

El sistema sigue una arquitectura de tres capas, separando de forma clara la presentación, la lógica de negocio y el almacenamiento de datos. Esta separación facilita el mantenimiento, la escalabilidad y la seguridad del proyecto.

La capa de **presentación** está formada por una SPA (*Single Page Application*) desarrollada con Vue 3 y compilada con Vite. Ejecuta en el navegador del dispositivo del usuario —tablet o móvil— y se comunica con el backend a través de peticiones HTTP. La elección de una SPA permite que la aplicación responda de forma ágil a la interacción táctil sin recargar la página completa, algo esencial para el entorno de trabajo de los gerocultores.

La capa de **lógica de negocio y autenticación** combina dos elementos: Firebase Auth para la gestión de identidades y una API REST ligera construida con Express.js (Node.js). Firebase Auth emite tokens JWT (*JSON Web Tokens*) que la API verifica en cada petición mediante el Firebase Admin SDK. La API es responsable de las operaciones que requieren lógica de servidor —por ejemplo, comprobar si un gerocultor tiene asignado un residente antes de devolver su ficha clínica.

La capa de **almacenamiento** utiliza Firestore, la base de datos documental en tiempo real de Firebase. Los datos se organizan en colecciones de documentos JSON, con Firestore Security Rules que impiden el acceso directo no autorizado incluso si alguien intentara saltarse la API.

```
┌─────────────────────────────────────────────────┐
│              Dispositivo del usuario             │
│   Vue 3 SPA (Vite + Pinia + Axios + Tailwind)   │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────┐
│                  Firebase Auth                   │
│          (Autenticación — JWT / ID Token)        │
└──────────────────────┬──────────────────────────┘
                       │ Bearer Token
┌──────────────────────▼──────────────────────────┐
│              API REST — Express.js               │
│  Middleware verifyAuth → lógica de negocio       │
└──────────────────────┬──────────────────────────┘
                       │ Firebase Admin SDK
┌──────────────────────▼──────────────────────────┐
│                   Firestore                      │
│  (Base de datos NoSQL — Firebase Security Rules) │
└─────────────────────────────────────────────────┘
```

*Figura 1 — Diagrama de arquitectura por capas del sistema. Elaboración propia.*

Esta arquitectura desacoplada permite que, si en el futuro fuera necesario cambiar el proveedor de base de datos, solo la capa de acceso a datos de la API requeriría modificaciones, sin impacto en el frontend.

---

## 5.2 Modelo de datos

El sistema gestiona siete entidades principales. A continuación describo cada una de ellas con sus atributos más relevantes y las relaciones que mantienen entre sí.

### Usuario

Representa a cualquier persona con acceso al sistema: gerocultor, coordinador o administrador. Los campos clave son `email` (utilizado como login, único en todo el sistema), `rol` (que determina los permisos) y `activo` (que permite desactivar una cuenta sin eliminar sus registros históricos). El campo `passwordHash` se almacena como hash bcrypt y nunca se devuelve al cliente.

### Residente

Representa a la persona mayor que vive en la residencia y recibe los cuidados. Contiene los datos identificativos básicos y varios campos de categoría especial según el RGPD (art. 9): `diagnosticos`, `alergias`, `medicacion` y `preferencias`. Estos campos solo son accesibles por usuarios autenticados con el rol apropiado. El campo `archivado` permite dar de baja a un residente sin eliminar su historial clínico.

### Tarea

Representa una actividad programada en la agenda de un gerocultor para un residente concreto (por ejemplo, administración de medicación a las 08:00). Su campo `estado` sigue un ciclo definido: `pendiente → en_curso → completada` (o `con_incidencia`). Al marcarse como completada, el sistema registra automáticamente la hora exacta en `completadaEn`.

### Incidencia

Representa un evento registrado durante la atención a un residente (caída, problema de salud, comportamiento, etc.). Las incidencias son **inmutables**: una vez creadas, no se pueden editar ni eliminar, garantizando la trazabilidad del historial clínico. Si la `severidad` es `critica`, el sistema genera automáticamente una notificación al coordinador.

### Turno

Representa el turno de trabajo de un gerocultor. Al finalizar el turno, el sistema genera un resumen de traspaso (`resumenTraspaso`) con las tareas completadas, las pendientes y las incidencias registradas durante ese período.

### Notificacion

Almacena los avisos generados automáticamente por el sistema para un usuario concreto. No puede ser creada directamente por el usuario: solo el sistema la genera en respuesta a eventos (incidencia crítica, tarea próxima, traspaso de turno). El usuario solo puede marcarla como leída.

### ResidenteAsignacion

Tabla de unión que relaciona gerocultores con los residentes que tienen asignados. Un gerocultor solo puede ver y actuar sobre los residentes que figuran en sus asignaciones activas. Esta restricción se aplica tanto en la API como en las Firestore Security Rules.

---

## 5.3 Diagrama entidad-relación

La siguiente figura muestra las relaciones entre entidades. Las líneas con notación `1` y `N` indican la cardinalidad de cada relación.

```
Usuario (1) ──────────────────── (N) ResidenteAsignacion (N) ──── (1) Residente
   │                                                                       │
   │ (1)                                                                   │ (1)
   ├──────── (N) Tarea ─────────────────────────────────────────────────── ┤
   │                                                                       │
   ├──────── (N) Incidencia ──────────────────────────────────────────────── ┤
   │                                                                       │
   └──────── (N) Turno                                                     │
                                                                           │
Notificacion (N) ─────── (1) Usuario                                      │
                                                                           │
Incidencia (N) ─── (0..1) Tarea                                           │
```

*Figura 2 — Diagrama entidad-relación del modelo de datos. Elaboración propia.*

Una decisión de diseño importante es que `Incidencia` puede estar vinculada opcionalmente a una `Tarea` (cuando el gerocultor marca una tarea como "con incidencia"), pero también puede crearse de forma independiente desde la ficha del residente. Esto da flexibilidad sin romper la integridad del modelo.

---

## 5.4 Estructura de colecciones en Firestore

Firestore organiza los datos en colecciones de documentos JSON. A diferencia de una base de datos relacional, no existen tablas con filas: cada documento es un objeto independiente con sus propios campos. Las relaciones se implementan mediante IDs de referencia o subcolecciones.

Para este sistema, la estructura de colecciones es la siguiente:

| Colección raíz | Descripción |
|----------------|-------------|
| `/usuarios` | Un documento por usuario (gerocultor, coordinador, admin) |
| `/residentes` | Un documento por residente. Subcol. `/residentes/{id}/tareas` e `/residentes/{id}/incidencias` |
| `/turnos` | Un documento por turno de trabajo |
| `/notificaciones` | Un documento por notificación generada |

Las `Tarea` e `Incidencia` se almacenan como subcolecciones dentro del documento del residente al que pertenecen. Esta estructura facilita las consultas más habituales ("todas las tareas de hoy para el residente X") y simplifica las reglas de seguridad: si un usuario no tiene acceso al documento padre (`residente`), tampoco puede acceder a sus subcolecciones.

Las asignaciones gerocultor-residente se implementan como un array de IDs de usuario (`gerocultoresAsignados`) dentro del documento del residente, lo que permite a las Firestore Rules verificar directamente si el usuario autenticado está en esa lista.

---

## 5.5 Diseño de la API REST

La API REST actúa como capa intermedia entre el frontend y Firestore cuando la lógica de negocio requiere validaciones que no se pueden expresar en las Firestore Rules. Todos los endpoints exigen un token de autenticación válido en la cabecera `Authorization: Bearer {idToken}`, salvo el endpoint de verificación de disponibilidad (`GET /health`).

Los endpoints principales son los siguientes:

| Método | Ruta | Descripción | Rol mínimo |
|--------|------|-------------|-----------|
| `GET` | `/health` | Verificación de disponibilidad | Público |
| `POST` | `/auth/login` | Inicio de sesión (delega en Firebase Auth) | Público |
| `GET` | `/api/residents` | Lista de residentes asignados al usuario autenticado | Gerocultor |
| `GET` | `/api/residents/:id` | Ficha completa de un residente (incluye datos sensibles) | Gerocultor asignado |
| `POST` | `/api/incidents` | Registro de una nueva incidencia | Gerocultor |
| `GET` | `/api/incidents?residenteId=:id` | Historial de incidencias de un residente | Gerocultor asignado |
| `PATCH` | `/api/tasks/:id` | Actualizar estado de una tarea | Gerocultor asignado |

Un ejemplo de petición y respuesta para el registro de incidencia (`POST /api/incidents`):

```json
// Request body
{
  "tipo": "caida",
  "severidad": "moderada",
  "descripcion": "El residente tropezó en el pasillo durante el paseo de las 10:00",
  "residenteId": "res-123",
  "tareaId": null
}

// Response 201
{
  "data": {
    "id": "inc-456",
    "tipo": "caida",
    "severidad": "moderada",
    "registradaEn": "2026-04-06T10:15:32Z",
    "usuarioId": "usr-789"
  }
}
```

El timestamp `registradaEn` lo genera el servidor, no el cliente. Esto es un requisito de seguridad: si permitiéramos que el cliente enviara la fecha, un usuario podría antedatar incidencias y alterar el historial clínico.

---

## 5.6 Diseño UX: flujos de usuario principales

El sistema define seis flujos de usuario (FL-01 a FL-06) que cubren las operaciones más frecuentes del gerocultor. Estos flujos guiaron el diseño de las pantallas y sirvieron como base para los wireframes.

**FL-01 — Inicio de sesión**: El gerocultor introduce su email y contraseña. El sistema los valida contra Firebase Auth. Si son correctos, recibe un token JWT y se le redirige a su agenda del día. Si son incorrectos, el mensaje de error es genérico ("Usuario o contraseña incorrectos") para no revelar qué campo falló.

**FL-02 — Consulta de agenda diaria**: Al acceder, el sistema recupera automáticamente todas las tareas del día del gerocultor, ordenadas cronológicamente. Cada tarea muestra la hora, el nombre del residente, el tipo de cuidado y el estado con código de color (verde = completada, naranja = en curso, rojo = vencida y pendiente).

**FL-03 — Registro de incidencia**: El gerocultor puede registrar una incidencia desde la agenda, desde la ficha del residente o al marcar una tarea con estado "con incidencia". El formulario está optimizado para completarse en cinco pasos táctiles o menos (requisito US-06).

**FL-04 — Consulta del historial de incidencias**: Desde la ficha de un residente, el coordinador o el gerocultor asignado puede consultar el historial completo con filtros por fecha y tipo.

**FL-05 — Actualización de estado de tarea**: Al pulsar una tarea, aparece un panel de acción con las opciones disponibles. El estado actualizado se refleja de forma inmediata en la agenda mediante optimistic update (la UI se actualiza antes de que el servidor confirme, mejorando la percepción de velocidad).

**FL-06 — Cierre de turno**: Al finalizar su turno, el gerocultor confirma el cierre y el sistema genera automáticamente el resumen de traspaso, que queda disponible para el coordinador y el turno siguiente.

---

## 5.7 Prototipo y diseño de pantallas

Las pantallas principales del sistema se diseñaron usando Stitch (Google), una herramienta de prototipado que permite generar propuestas visuales rápidas. Los prototipos sirvieron para validar la distribución de elementos antes de empezar la implementación y para verificar que los flujos definidos en la especificación eran realizables en la interfaz.

Las pantallas principales prototipadas son:

| Pantalla | Descripción | US relacionada |
|----------|-------------|----------------|
| Login | Formulario de acceso con email y contraseña | US-01 |
| Dashboard / Agenda diaria | Lista de tareas del día con estados y colores | US-03 |
| Detalle de tarea | Panel de acción: completar, añadir nota, incidencia | US-04 |
| Ficha de residente | Datos identificativos y campos clínicos sensibles | US-05 |
| Formulario de incidencia | Selector de tipo, severidad y descripción libre | US-06 |
| Historial de incidencias | Lista filtrable con paginación | US-07 |
| Alertas críticas | Notificaciones de incidencias críticas en tiempo real | US-08 |
| Gestión de residentes | Alta, edición y archivo de fichas (coordinador) | US-09 |
| Panel del coordinador | Vista global de agenda y residentes | US-10 |
| Agenda semanal | Vista de siete días con tareas por día | US-12 |

> **Nota de revisión**: Incluir aquí capturas de pantalla de los prototipos Stitch cuando estén disponibles. Añadir pie de imagen con número y descripción según la norma del centro: *Figura N — Descripción. Fuente: Elaboración propia / Stitch.*

---

## 5.8 Sistema de diseño y componentes

La interfaz sigue los principios del **Atomic Design** en su versión simplificada: los elementos básicos (botones, etiquetas, badges de estado) se definen como átomos reutilizables; los grupos de elementos relacionados (tarjeta de tarea, cabecera de ficha de residente) forman moléculas; y las pantallas completas son páginas que ensamblan organismos.

El sistema de diseño aplica los siguientes criterios visuales, definidos en función de los requisitos no funcionales del proyecto:

- **Tablet-first y mobile-first**: todos los touch targets tienen un mínimo de 44×44 px (requisito RNF-01). Los textos principales no son inferiores a 16 px para facilitar la lectura en condiciones de trabajo.
- **Contraste WCAG 2.1 nivel AA**: la relación de contraste entre texto y fondo es de al menos 4,5:1 para el texto normal, de acuerdo con el requisito RNF-05.
- **Código de colores semántico**: verde para estados completados, naranja para en curso, rojo para vencidos y sin completar, gris para pendientes futuros. Esta codificación es consistente en todas las pantallas para reducir la carga cognitiva del gerocultor durante su turno.
- **Tailwind CSS**: los estilos se definen mediante clases de utilidad de Tailwind CSS, lo que garantiza consistencia visual sin necesidad de una librería de componentes externa.

---

## 5.9 Seguridad: modelo de acceso y control

El sistema implementa un modelo de seguridad de tres capas independientes y complementarias:

**Capa 1 — Firebase Auth**: gestiona la autenticación. Verifica las credenciales del usuario y emite un token JWT firmado con tiempo de expiración. Los roles del sistema (`gerocultor`, `coordinador`, `administrador`) se almacenan como Custom Claims dentro del token, lo que permite que las capas siguientes los lean sin consultar la base de datos en cada petición.

**Capa 2 — Express middleware (`verifyAuth`)**: intercepta todas las peticiones a la API y verifica el token JWT usando el Firebase Admin SDK. Si el token es inválido, expirado o está ausente, la petición recibe una respuesta `401 Unauthorized` antes de llegar al controlador. Si el usuario no tiene el rol requerido para una operación concreta, la respuesta es `403 Forbidden`.

**Capa 3 — Firestore Security Rules**: actúan como última línea de defensa. Incluso si alguien intentara acceder directamente a Firestore sin pasar por la API, las reglas bloquean cualquier operación no autorizada basándose en el `request.auth.uid` y los Custom Claims del token. Por ejemplo, las incidencias tienen la regla `allow update, delete: if false`, que hace el historial clínico inmutable independientemente del rol del usuario.

Este diseño multicapa cumple con los requisitos de seguridad RNF-03 y RNF-09, y con las obligaciones del RGPD para el tratamiento de datos de categoría especial (art. 9) como los diagnósticos y medicación de los residentes.

---

*Generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*Fuentes: SPEC/entities.md, SPEC/api-contracts.md, SPEC/flows.md, SPEC/user-stories.md, DECISIONS/ADR-01b, ADR-02b, ADR-03b, ADR-04b*
