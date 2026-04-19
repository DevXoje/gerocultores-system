# Test Plan — US-06: Registro de incidencia

## 1. Summary and Acceptance Criteria
**User Story**: Como gerocultor, quiero registrar una incidencia de un residente con un formulario rápido, para que quede constancia inmediata y el equipo pueda actuar.

**Acceptance Criteria Mapped**:
- **CA-1**: Formulario con residente, tipo, severidad (leve/moderada/crítica) y descripción libre.
- **CA-2**: Fecha/hora registradas automáticamente en el servidor (timestamp Firestore).
- **CA-3**: Usuario identificado automáticamente en el backend.
- **CA-4**: La incidencia aparece inmediatamente en el historial del residente tras el guardado.
- **CA-5**: Dispara notificación in-app al administrador si la incidencia es crítica.
- **CA-6**: La interfaz debe permitir completar el formulario con 5 taps o menos en tablet.

## 2. Preconditions and Environment
- **Environment**: Firebase Emulator Suite (Auth, Firestore, Cloud Functions para triggers).
- **Test Users**:
  - `gero1@test.com` (role: `gerocultor`, uid: `gero1_uid`)
- **App State**: El usuario ha iniciado sesión y se encuentra en la vista de un residente o agenda para iniciar el flujo de "Nueva Incidencia".

## 3. Test Cases

### TC-06.01: Happy Path - Registrar incidencia leve
- **Steps**:
  1. Login como `gero1@test.com`.
  2. Abrir formulario "Nueva Incidencia" para el residente `res-123`.
  3. Seleccionar Tipo: "caida", Severidad: "leve", Descripción: "Tropiezo sin lesiones".
  4. Pulsar Guardar.
- **Expected Result**:
  - Se muestra confirmación visual de éxito.
  - La incidencia aparece inmediatamente en la vista del historial del residente.
  - En la BD, los campos `usuarioId` coinciden con `gero1_uid` y `registradaEn` tiene un timestamp válido generado por el servidor (e.g. `FieldValue.serverTimestamp()`).

### TC-06.02: Edge Case - Incidencia crítica dispara notificación
- **Steps**:
  1. Iniciar sesión y abrir el mismo formulario.
  2. Seleccionar Severidad: "critica".
  3. Guardar incidencia.
- **Expected Result**:
  - La incidencia se guarda correctamente.
  - Un trigger en el backend/Cloud Function crea un documento en la colección `/notificaciones` dirigido a los administradores.
  - El tipo de la notificación creada es `incidencia_critica`.

### TC-06.03: Failure Mode - Intento de manipular el servidor con payload malicioso
- **Steps**:
  1. Usar un script o interceptar la petición de escritura a Firestore.
  2. Modificar el payload enviando un `usuarioId` distinto al UID del Auth token, o enviando un campo `registradaEn` falso creado en el cliente.
- **Expected Result**:
  - Firestore Security Rules rechaza la escritura por inconsistencia de datos ("Missing or insufficient permissions").
  - La regla esperada (por ej. `request.resource.data.usuarioId == request.auth.uid`) debe activarse correctamente.

### TC-06.04: Happy Path (UX) - Formulario rápido en tablet
- **Steps**:
  1. Cargar vista en modo Tablet (10").
  2. Contar interacciones necesarias hasta el guardado desde el inicio del formulario.
- **Expected Result**:
  - Debe permitir completar y enviar en <= 5 toques empleando componentes tipo Select/Dropdown/Botones de opción rápida.

## 4. API Contract References / Database Expectations
- **Firestore Sub-Collection**: `residentes/{residenteId}/incidencias/{incidenciaId}` (basado en notas de diseño).
- **Fields Expected**: `tipo`, `severidad`, `descripcion`, `usuarioId`, `tareaId` (opcional), `registradaEn`.
- **Cloud Functions / Triggers**: Trigger en Firestore `onCreate` para documentos tipo `incidencias` que escuche por documentos con severidad `critica` para generar la respectiva notificación en `/notificaciones`.

## 5. Test Data Setup and Teardown
- **Setup**:
  - Sembrar residente inicial en `res-123`.
  - Crear usuario gerocultor en Firebase Auth Emulator.
  - Desplegar/Arrancar las reglas de Firestore y las Cloud Functions localmente.
- **Teardown**: Limpiar la colección `residentes`, la sub-colección `incidencias` y borrar registros de `/notificaciones`.

## 6. Automation Suggestions
- **Playwright (E2E)**: TC-06.01 (llenar formulario y revisar cambios en interfaz), TC-06.04 (validar flujo corto).
- **Firebase Emulator Tests (Backend)**: TC-06.02 (asegurar creación de notificaciones por trigger) y TC-06.03 (validar que las reglas de seguridad deniegan payloads malformados/falsificados).