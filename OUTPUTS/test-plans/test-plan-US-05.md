# Test Plan — US-05: Consulta de ficha de residente

## 1. Summary and Acceptance Criteria
**User Story**: Como gerocultor, quiero acceder a la ficha de un residente desde su tarea o desde una búsqueda, para recordar sus condiciones de salud, alergias y preferencias antes de atenderle.

**Acceptance Criteria Mapped**:
- **CA-1**: Muestra datos completos (nombre, DOB, foto, diagnósticos, alergias, medicación, preferencias).
- **CA-2**: Solo lectura para el rol `gerocultor`.
- **CA-3**: Permite edición para el rol `admin`.
- **CA-4**: Datos de salud inaccesibles sin autenticación.
- **CA-5**: Enlace rápido al historial de incidencias.

## 2. Preconditions and Environment
- **Environment**: Firebase Emulator Suite (Auth, Firestore).
- **Test Users**:
  - `gero1@test.com` (role: `gerocultor`)
  - `admin1@test.com` (role: `admin`)
  - No autenticado (Guest)
- **Firebase/Firestore Rules**: Configured to restrict reads on `residentes` based on `gerocultoresAsignados` array or `admin` role.

## 3. Test Cases

### TC-05.01: Happy Path - Ver ficha como gerocultor
- **Steps**:
  1. Login como `gero1@test.com`.
  2. Navegar a `/residentes/res-123` (residente asignado).
- **Expected Result**: 
  - La ficha renderiza la información de salud completa.
  - No hay botón de edición visible.
  - El enlace a "Historial de Incidencias" está presente.

### TC-05.02: Edge Case - Gerocultor intenta acceder a residente no asignado
- **Steps**:
  1. Login como `gero1@test.com`.
  2. Navegar directamente por URL a `/residentes/res-999` (no asignado).
- **Expected Result**:
  - Pantalla muestra error "No tienes acceso a este residente" o 403 Forbidden.
  - La petición a Firestore falla por permisos.

### TC-05.03: Happy Path - Administrador ve y puede editar
- **Steps**:
  1. Login como `admin1@test.com`.
  2. Navegar a `/residentes/res-123`.
- **Expected Result**:
  - Ficha se muestra correctamente.
  - El botón/opción "Editar Ficha" es visible y habilitado.

### TC-05.04: Failure Mode - Acceso sin autenticación
- **Steps**:
  1. Abrir navegador en incógnito (sin sesión).
  2. Navegar a `/residentes/res-123`.
- **Expected Result**:
  - Redirección automática a `/login`.
  - Intento de leer de Firestore falla con "Missing or insufficient permissions".

## 4. API Contract References / Database Expectations
- **Firestore Document**: `residentes/{residenteId}`
- **Fields Expected**: `id`, `nombre`, `apellidos`, `fechaNacimiento`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`.
- **Security Rules**:
  - Lectura `residentes`: `request.auth != null && (request.auth.token.role == 'admin' || request.auth.uid in resource.data.gerocultoresAsignados)` (según notas de diseño).

## 5. Test Data Setup and Teardown
- **Setup**:
  - Crear usuarios en Auth Emulator (`gero1@test.com`, `admin1@test.com`) y asignarles custom claims (`role`).
  - Sembrar Firestore con un documento de prueba en `/residentes/res-123`, incluyendo a `gero1_uid` en `gerocultoresAsignados`.
  - Crear otro residente en `/residentes/res-999` sin `gero1_uid`.
- **Teardown**: Vaciar emulador de Firestore y resetear Auth tras la ejecución de las suites.

## 6. Automation Suggestions
- **Integration Tests (Playwright)**: TC-05.01 (visualización correcta de interfaz por gerocultor), TC-05.03 (visualización admin y presencia de botón).
- **Unit/Security Tests (Firebase Emulator)**: TC-05.02 (bloqueo de acceso directo en Firestore Rules), TC-05.04 (redirección y fallos al consultar la DB no autenticado).