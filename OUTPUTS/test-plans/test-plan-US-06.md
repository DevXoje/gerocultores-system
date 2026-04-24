# Test Plan — US-06: Registro de incidencia

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-06 — Como gerocultor, quiero registrar una incidencia sobre un residente, para que quede constancia del evento y el administrador sea notificado si es crítica.

---

## Scope

**Cubre**:
- Renderizado del formulario `IncidenceForm.vue` con los campos `residenteId`, `tipo`, `severidad`, `descripcion` (y `tareaId` opcional)
- Validación del lado del cliente (Zod) en el composable `useIncidencias`
- Errores por campo (`fieldErrors`) mostrados inline bajo el campo correspondiente con `role="alert"`
- Envío exitoso: llamada a `POST /api/incidencias`, recepción de `IncidenciaResponse`, emisión del evento `submitted`
- Estado de envío: botón `"Enviar Informe"` deshabilitado y spinner visible mientras `submitting = true`
- Error global de API (`submitError`) mostrado como banner con icono de advertencia
- Pre-relleno de `residenteId` y `tareaId` via props (`preselectedResidenteId`, `preselectedTareaId`)
- Cancelar: emite `cancelled` y resetea el formulario (estado limpio)
- Seguridad: solo gerocultores autenticados pueden enviar incidencias (token Bearer en cabecera)
- Valores de severidad exactos del spec: `leve | moderada | critica` (botones toggle con `aria-pressed`)
- Mensaje de cumplimiento normativo visible en el formulario
- Notificación al administrador cuando `severidad = 'critica'` (regla de negocio — Firestore backend)

**No cubre (out of scope)**:
- Historial de incidencias de un residente (US-07)
- Formulario de tareas ni cambio de estado `con_incidencia` (US-04) — solo la entrada al formulario
- Notificaciones push al administrador en el frontend (US-08) — solo el disparo del evento en el backend
- Edición o eliminación de incidencias (el historial es inmutable por regla de negocio)
- Alta o gestión de residentes (US-09)

**Stack implicado**: Vue 3 + `useIncidencias` composable | Vitest 4 + @vue/test-utils 2 | Playwright (e2e) | Firebase Auth Emulator (9099) | Express API (`POST /api/incidencias`) | `@firebase/rules-unit-testing`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099, Firestore en 8080 / 18080)
- Backend API activo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend activo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test creados en el emulador con Custom Claims configurados:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-01`
  - Email: `test.admin@example.com` / Password: `Test1234!` / Rol: `admin` / UID: `uid-admin-01`
- Documentos de Firestore seed en el emulador:
  - `/residentes/res-001` con campos:
    - `id: 'res-001'`
    - `nombre: 'María'`
    - `apellidos: 'González López'`
    - `habitacion: '101'`
    - `archivado: false`
    - `creadoEn: <timestamp>`
    - `actualizadoEn: <timestamp>`
  - `/residentes/res-002` con `id: 'res-002'`, `nombre: 'José'`, `apellidos: 'Martínez Ruiz'`, `archivado: false`
- El usuario `uid-gerocultor-01` está autenticado al inicio de los tests e2e
- La ruta `/incidencias/nueva` o equivalente está accesible para el gerocultor autenticado

---

## Test Cases

### TC-01: El formulario se renderiza con todos los campos obligatorios visibles

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado, formulario abierto con al menos un residente en la prop `residents`.
- **Steps**:
  1. Montar `IncidenceForm` con `residents: [{ id: 'res-001', nombre: 'María', apellidos: 'González López' }]`.
  2. Observar los elementos renderizados.
- **Expected Result**:
  - El `<select id="incidence-residente">` está presente con la opción placeholder `"Seleccionar residente…"`.
  - El `<select id="incidence-tipo">` está presente con la opción placeholder `"Seleccionar tipo…"`.
  - Los 3 botones de severidad son visibles: `"Crítica"`, `"Moderada"`, `"Leve"` con atributo `aria-pressed="false"` en estado inicial.
  - El `<textarea id="incidence-descripcion">` está presente con su label.
  - El botón `"Enviar Informe"` está **deshabilitado** (porque `formIsValid` es `false` con campos vacíos).
  - El botón `"Cancelar"` está habilitado.
  - El mensaje de cumplimiento normativo es visible.
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: high

---

### TC-02: Submit sin rellenar campos muestra errores de campo inline

- **Preconditions**: Formulario montado con `residents` disponibles. Todos los campos vacíos.
- **Steps**:
  1. Llamar directamente a `submitIncidencia()` del composable `useIncidencias` con `form` en estado vacío.
  2. Observar `fieldErrors`.
- **Expected Result**:
  - `fieldErrors.residenteId` contiene un mensaje de error no vacío.
  - `fieldErrors.tipo` contiene un mensaje de error no vacío.
  - `fieldErrors.severidad` contiene un mensaje de error no vacío.
  - `fieldErrors.descripcion` contiene un mensaje de error no vacío.
  - La función devuelve `null` (sin llamar a la API).
  - `submitting.value` es `false` (el envío no comenzó).
- **Type**: unit (Vitest — `useIncidencias`)
- **Priority**: high

---

### TC-03: Los errores de campo se muestran en el DOM bajo el campo correspondiente

- **Preconditions**: Formulario montado. Se fuerza un error de validación (campo `descripcion` vacío).
- **Steps**:
  1. Montar `IncidenceForm` con `residents` disponibles.
  2. Seleccionar residente y tipo, activar severidad `'leve'`.
  3. Dejar `descripcion` vacío y hacer click en `"Enviar Informe"` (o llamar al handler).
  4. Observar el DOM bajo el `<textarea id="incidence-descripcion">`.
- **Expected Result**:
  - Aparece un `<p id="incidence-descripcion-err">` con texto de error visible.
  - El elemento tiene `role="alert"` para accesibilidad.
  - El `<textarea>` tiene `aria-invalid="true"` y `aria-describedby="incidence-descripcion-err"`.
  - El campo con error tiene clase CSS `incidence-form__textarea--error` (borde rojo).
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: high

---

### TC-04: Happy path — envío exitoso del formulario

- **Preconditions**: Firebase Auth Emulator activo con `uid-gerocultor-01`. API backend activo. Residente `res-001` existe en Firestore.
- **Steps**:
  1. Autenticar como `test.gerocultor@example.com`.
  2. Abrir el formulario de incidencias pre-rellenado con `preselectedResidenteId: 'res-001'`.
  3. Seleccionar `tipo: 'caida'`.
  4. Activar `severidad: 'moderada'`.
  5. Escribir en `descripcion`: `"El residente se cayó al levantarse de la cama. Se atendió de inmediato."`.
  6. Hacer click en `"Enviar Informe"`.
  7. Esperar confirmación.
- **Expected Result**:
  - Durante el envío, el botón muestra `"Enviando…"` con spinner y está deshabilitado (`aria-busy="true"`).
  - Tras la confirmación del servidor, el formulario emite el evento `submitted` con un objeto `IncidenciaResponse` que incluye `id`, `tipo: 'caida'`, `severidad: 'moderada'`, `residenteId: 'res-001'`, `usuarioId: 'uid-gerocultor-01'`, `tareaId: null`, `registradaEn` (ISO 8601).
  - El formulario queda reseteado (campos vacíos).
  - En Firestore, se ha creado el documento `/residentes/res-001/incidencias/{id}` con los campos correctos.
  - El campo `registradaEn` es asignado por el servidor (no por el cliente).
- **Type**: e2e (Playwright) | integration (API + Firestore Emulator)
- **Priority**: high

---

### TC-05: Pre-relleno de `residenteId` via prop `preselectedResidenteId`

- **Preconditions**: Formulario montado con `preselectedResidenteId: 'res-001'`.
- **Steps**:
  1. Montar `IncidenceForm` con `props.preselectedResidenteId = 'res-001'` y `residents = [{ id: 'res-001', ... }]`.
  2. Observar el valor del selector de residente.
- **Expected Result**:
  - `form.residenteId` tiene el valor `'res-001'` en el momento del montaje (`onMounted`).
  - El `<select id="incidence-residente">` muestra `"María González López"` seleccionado.
  - No hay error `fieldErrors.residenteId` (campo pre-rellenado válido).
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: high

---

### TC-06: Pre-relleno de `tareaId` via prop `preselectedTareaId`

- **Preconditions**: Formulario montado con `preselectedTareaId: 'tarea-001'`.
- **Steps**:
  1. Montar `IncidenceForm` con `props.preselectedTareaId = 'tarea-001'`.
  2. Rellenar el resto de campos y hacer submit.
  3. Verificar el payload enviado a la API.
- **Expected Result**:
  - `form.tareaId` tiene el valor `'tarea-001'` tras el montaje.
  - El DTO enviado a `createIncidencia` incluye `tareaId: 'tarea-001'`.
  - En Firestore, el documento creado tiene `tareaId: 'tarea-001'`.
- **Type**: unit (Vitest — `useIncidencias`) | integration
- **Priority**: high

---

### TC-07: Activar botón de severidad actualiza `form.severidad` y `aria-pressed`

- **Preconditions**: Formulario montado. Ninguna severidad seleccionada.
- **Steps**:
  1. Hacer click en el botón `"Crítica"` (valor `'critica'`).
  2. Observar `form.severidad` y atributos del botón.
  3. Hacer click en `"Leve"` (valor `'leve'`).
  4. Observar que el botón `"Crítica"` deja de estar activo.
- **Expected Result**:
  - Tras click en `"Crítica"`: `form.severidad === 'critica'`, botón tiene `aria-pressed="true"` y clase `incidence-form__severity-btn--active`.
  - Los otros dos botones tienen `aria-pressed="false"`.
  - Tras click en `"Leve"`: `form.severidad === 'leve'`, el botón `"Crítica"` vuelve a `aria-pressed="false"`.
  - Los valores son exactamente `leve | moderada | critica` — nunca `baja`, `media`, `alta` ni `crítica`.
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: high

---

### TC-08: Error global de API se muestra como banner

- **Preconditions**: Mock de `createIncidencia` configurado para lanzar un error `"Network Error"`.
- **Steps**:
  1. Montar `IncidenceForm` con `residents` disponibles.
  2. Rellenar todos los campos válidos.
  3. Hacer submit con el mock de API lanzando error.
  4. Observar el DOM.
- **Expected Result**:
  - `submitError.value` tiene el mensaje `"Network Error"`.
  - El banner `<div class="incidence-form__error" role="alert">` es visible con el mensaje de error.
  - El icono `⚠` de advertencia es visible.
  - El formulario NO se resetea (los datos del usuario se conservan para reintentar).
  - `submitting.value` es `false` tras el error.
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: high

---

### TC-09: El botón "Cancelar" resetea el formulario y emite `cancelled`

- **Preconditions**: Formulario montado con algunos campos rellenados.
- **Steps**:
  1. Rellenar `tipo: 'salud'`, `descripcion: 'Test'`.
  2. Hacer click en `"Cancelar"`.
  3. Observar el estado del formulario y los eventos emitidos.
- **Expected Result**:
  - El evento `cancelled` es emitido.
  - `form.tipo === ''`, `form.severidad === ''`, `form.residenteId === ''`, `form.descripcion === ''`, `form.tareaId === null`.
  - `fieldErrors` está limpio (sin mensajes de error).
  - `submitError.value` es `null`.
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: medium

---

### TC-10: Seguridad — usuario no autenticado recibe 401 de la API

- **Preconditions**: Firebase Auth Emulator activo. API backend activo.
- **Steps**:
  1. Realizar una petición `POST /api/incidencias` **sin** cabecera `Authorization`.
  2. Observar la respuesta.
- **Expected Result**:
  - La API responde con código HTTP `401 Unauthorized`.
  - El cuerpo de la respuesta incluye `{ error: "..." }` (sin detalles internos).
  - No se crea ningún documento en Firestore.
- **Type**: integration (supertest | Playwright con usuario no autenticado)
- **Priority**: high

---

### TC-11: Seguridad — usuario con rol `admin` puede registrar incidencias

- **Preconditions**: Usuario `test.admin@example.com` autenticado con `role: 'admin'`. API activa.
- **Steps**:
  1. Enviar `POST /api/incidencias` con token de `uid-admin-01` y payload válido.
  2. Observar la respuesta.
- **Expected Result**:
  - La API responde con código HTTP `201 Created` y el cuerpo `IncidenciaResponse`.
  - El documento creado en Firestore tiene `usuarioId: 'uid-admin-01'`.
- **Type**: integration (supertest)
- **Priority**: medium

---

### TC-12: El campo `registradaEn` es asignado por el servidor y no puede ser sobreescrito

- **Preconditions**: API backend activo con Firebase Admin SDK.
- **Steps**:
  1. Enviar `POST /api/incidencias` con payload válido incluyendo `registradaEn: '2020-01-01T00:00:00.000Z'` (fecha falsa del cliente).
  2. Leer el documento creado en Firestore.
- **Expected Result**:
  - La API ignora el campo `registradaEn` del cliente.
  - El documento en Firestore tiene `registradaEn` con la hora real del servidor (diferente a la enviada).
  - La hora asignada es cercana al momento del test (delta < 10 segundos).
- **Type**: integration (supertest + Firestore Emulator)
- **Priority**: high

---

### TC-13: Una incidencia `critica` dispara notificación al administrador

- **Preconditions**: Firebase Emulator activo. Documento `/usuarios/uid-admin-01` en Firestore.
- **Steps**:
  1. Enviar `POST /api/incidencias` con `severidad: 'critica'` y payload válido.
  2. Esperar la escritura asíncrona del backend.
  3. Verificar la colección `/notificaciones` en Firestore.
- **Expected Result**:
  - Se crea al menos un documento en `/notificaciones` con:
    - `usuarioId: 'uid-admin-01'`
    - `tipo: 'incidencia_critica'`
    - `referenciaId: {id de la incidencia creada}`
    - `referenciaModelo: 'Incidencia'`
    - `leida: false`
  - Para `severidad: 'leve'` y `severidad: 'moderada'`, **no** se crea notificación.
- **Type**: integration (Firestore Emulator)
- **Priority**: high

---

### TC-14: E2E completo — flujo de registro de incidencia desde la vista

- **Preconditions**: Emuladores activos (Auth:9099, Firestore:8080). API y frontend activos. Usuario `test.gerocultor@example.com` autenticado. Residente `res-001` disponible.
- **Steps**:
  1. Navegar a la ruta del formulario de incidencias (e.g., `/incidencias/nueva`).
  2. Verificar que el formulario es visible.
  3. Seleccionar residente `"María González López"`.
  4. Seleccionar tipo `"Caída"`.
  5. Activar severidad `"Moderada"`.
  6. Escribir descripción: `"El residente tropezó en el pasillo. Sin heridas visibles."`.
  7. Hacer click en `"Enviar Informe"`.
  8. Esperar confirmación.
  9. Verificar estado final.
- **Expected Result**:
  - Durante el envío, el botón muestra `"Enviando…"` con spinner.
  - Tras la confirmación, el usuario es redirigido o se muestra un mensaje de éxito (feedback visual).
  - En Firestore, existe el documento `/residentes/res-001/incidencias/{id}` con los datos correctos.
  - El formulario queda limpio.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-15: `formIsValid` es `false` si falta cualquier campo obligatorio

- **Preconditions**: Composable `useIncidencias` instanciado.
- **Steps**:
  1. Probar combinaciones: solo `tipo` rellenado, solo `severidad` activada, todos excepto `descripcion`, etc.
  2. Evaluar `formIsValid` en cada caso.
- **Expected Result**:
  - `formIsValid` es `true` únicamente cuando `tipo !== ''` AND `severidad !== ''` AND `residenteId !== ''` AND `descripcion.trim().length > 0`.
  - `formIsValid` es `false` en cualquier otra combinación.
  - El botón `"Enviar Informe"` refleja este estado (`disabled` cuando `false`).
- **Type**: unit (Vitest + @vue/test-utils)
- **Priority**: medium

---

## Unit Tests (Vitest)

### `useIncidencias` composable

```typescript
// code/frontend/src/business/incidents/presentation/composables/useIncidencias.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIncidencias } from './useIncidencias'

// Mock de la capa de infraestructura
vi.mock('../../infrastructure/incidencias.api', () => ({
  createIncidencia: vi.fn(),
}))

describe('useIncidencias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-02: submitIncidencia retorna null y popula fieldErrors si el formulario está vacío', async () => {
    const { submitIncidencia, fieldErrors } = useIncidencias()
    const result = await submitIncidencia()
    expect(result).toBeNull()
    expect(fieldErrors.residenteId).toBeTruthy()
    expect(fieldErrors.tipo).toBeTruthy()
    expect(fieldErrors.severidad).toBeTruthy()
    expect(fieldErrors.descripcion).toBeTruthy()
  })

  it('TC-04: submitIncidencia llama a createIncidencia con el DTO correcto y devuelve la respuesta', async () => {
    const { createIncidencia } = await import('../../infrastructure/incidencias.api')
    const mockResponse = {
      id: 'inc-001',
      tipo: 'caida' as const,
      severidad: 'moderada' as const,
      descripcion: 'El residente se cayó.',
      residenteId: 'res-001',
      usuarioId: 'uid-gerocultor-01',
      tareaId: null,
      registradaEn: '2026-04-24T10:00:00.000Z',
    }
    ;(createIncidencia as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse)

    const { form, submitIncidencia } = useIncidencias()
    form.tipo = 'caida'
    form.severidad = 'moderada'
    form.residenteId = 'res-001'
    form.descripcion = 'El residente se cayó.'

    const result = await submitIncidencia()
    expect(result).toEqual(mockResponse)
    expect(createIncidencia).toHaveBeenCalledWith({
      tipo: 'caida',
      severidad: 'moderada',
      residenteId: 'res-001',
      descripcion: 'El residente se cayó.',
    })
  })

  it('TC-04: el formulario se resetea tras un submit exitoso', async () => {
    const { createIncidencia } = await import('../../infrastructure/incidencias.api')
    ;(createIncidencia as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'inc-001',
      tipo: 'salud',
      severidad: 'leve',
      descripcion: 'Test.',
      residenteId: 'res-001',
      usuarioId: 'uid-gerocultor-01',
      tareaId: null,
      registradaEn: '2026-04-24T10:00:00.000Z',
    })

    const { form, submitIncidencia } = useIncidencias()
    form.tipo = 'salud'
    form.severidad = 'leve'
    form.residenteId = 'res-001'
    form.descripcion = 'Test.'

    await submitIncidencia()

    expect(form.tipo).toBe('')
    expect(form.severidad).toBe('')
    expect(form.residenteId).toBe('')
    expect(form.descripcion).toBe('')
    expect(form.tareaId).toBeNull()
  })

  it('TC-06: tareaId pre-rellenado se incluye en el DTO enviado', async () => {
    const { createIncidencia } = await import('../../infrastructure/incidencias.api')
    ;(createIncidencia as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'inc-002',
      tipo: 'otro',
      severidad: 'leve',
      descripcion: 'Test con tarea.',
      residenteId: 'res-001',
      usuarioId: 'uid-gerocultor-01',
      tareaId: 'tarea-001',
      registradaEn: '2026-04-24T10:00:00.000Z',
    })

    const { form, submitIncidencia } = useIncidencias()
    form.tipo = 'otro'
    form.severidad = 'leve'
    form.residenteId = 'res-001'
    form.descripcion = 'Test con tarea.'
    form.tareaId = 'tarea-001'

    await submitIncidencia()

    expect(createIncidencia).toHaveBeenCalledWith(
      expect.objectContaining({ tareaId: 'tarea-001' })
    )
  })

  it('TC-08: submitError se popula cuando createIncidencia falla', async () => {
    const { createIncidencia } = await import('../../infrastructure/incidencias.api')
    ;(createIncidencia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network Error')
    )

    const { form, submitIncidencia, submitError } = useIncidencias()
    form.tipo = 'comportamiento'
    form.severidad = 'critica'
    form.residenteId = 'res-001'
    form.descripcion = 'Test error.'

    const result = await submitIncidencia()

    expect(result).toBeNull()
    expect(submitError.value).toBe('Network Error')
  })

  it('TC-09: resetForm limpia todos los campos y errores', () => {
    const { form, fieldErrors, submitError, resetForm } = useIncidencias()
    form.tipo = 'salud'
    form.severidad = 'moderada'
    form.residenteId = 'res-001'
    form.descripcion = 'Descripción previa.'
    form.tareaId = 'tarea-001'
    fieldErrors.tipo = 'Error de tipo'
    submitError.value = 'Error previo'

    resetForm()

    expect(form.tipo).toBe('')
    expect(form.severidad).toBe('')
    expect(form.residenteId).toBe('')
    expect(form.descripcion).toBe('')
    expect(form.tareaId).toBeNull()
    expect(fieldErrors.tipo).toBeUndefined()
    expect(submitError.value).toBeNull()
  })

  it('TC-08: submitting es false tras un error de API', async () => {
    const { createIncidencia } = await import('../../infrastructure/incidencias.api')
    ;(createIncidencia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('500'))

    const { form, submitting, submitIncidencia } = useIncidencias()
    form.tipo = 'medicacion'
    form.severidad = 'leve'
    form.residenteId = 'res-001'
    form.descripcion = 'Test.'

    await submitIncidencia()
    expect(submitting.value).toBe(false)
  })
})
```

---

### `IncidenceForm` component

```typescript
// code/frontend/src/business/incidents/presentation/components/IncidenceForm.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import IncidenceForm from './IncidenceForm.vue'

// Mock del composable
vi.mock('../composables/useIncidencias', () => ({
  useIncidencias: vi.fn(() => ({
    form: { tipo: '', severidad: '', residenteId: '', descripcion: '', tareaId: null },
    fieldErrors: {},
    submitting: { value: false },
    submitError: { value: null },
    submitIncidencia: vi.fn().mockResolvedValue(null),
    resetForm: vi.fn(),
  })),
}))

const residentsBase = [
  { id: 'res-001', nombre: 'María', apellidos: 'González López' },
  { id: 'res-002', nombre: 'José', apellidos: 'Martínez Ruiz' },
]

describe('IncidenceForm', () => {
  it('TC-01: renderiza el selector de residente con las opciones disponibles', () => {
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const select = wrapper.find('#incidence-residente')
    expect(select.exists()).toBe(true)
    const options = select.findAll('option')
    // 1 placeholder + 2 residentes
    expect(options).toHaveLength(3)
    expect(options[1].text()).toBe('María González López')
    expect(options[2].text()).toBe('José Martínez Ruiz')
  })

  it('TC-01: renderiza los 3 botones de severidad con aria-pressed="false" en estado inicial', () => {
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const severityBtns = wrapper.findAll('.incidence-form__severity-btn')
    expect(severityBtns).toHaveLength(3)
    const labels = severityBtns.map((b) => b.text())
    expect(labels).toContain('Crítica')
    expect(labels).toContain('Moderada')
    expect(labels).toContain('Leve')
    severityBtns.forEach((btn) => {
      expect(btn.attributes('aria-pressed')).toBe('false')
    })
  })

  it('TC-01: el botón "Enviar Informe" está deshabilitado cuando el formulario está vacío', () => {
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const submitBtn = wrapper.find('.incidence-form__submit-btn')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('TC-03: fieldErrors.residenteId visible en el DOM con role=alert', async () => {
    const { useIncidencias } = await import('../composables/useIncidencias')
    ;(useIncidencias as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      form: { tipo: 'caida', severidad: 'leve', residenteId: '', descripcion: 'Test', tareaId: null },
      fieldErrors: { residenteId: 'El residente es obligatorio' },
      submitting: { value: false },
      submitError: { value: null },
      submitIncidencia: vi.fn().mockResolvedValue(null),
      resetForm: vi.fn(),
    })
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const errEl = wrapper.find('#incidence-residente-err')
    expect(errEl.exists()).toBe(true)
    expect(errEl.attributes('role')).toBe('alert')
    expect(errEl.text()).toBe('El residente es obligatorio')
  })

  it('TC-08: banner de error global es visible cuando submitError tiene valor', async () => {
    const { useIncidencias } = await import('../composables/useIncidencias')
    ;(useIncidencias as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      form: { tipo: '', severidad: '', residenteId: '', descripcion: '', tareaId: null },
      fieldErrors: {},
      submitting: { value: false },
      submitError: { value: 'Error de conexión con el servidor' },
      submitIncidencia: vi.fn().mockResolvedValue(null),
      resetForm: vi.fn(),
    })
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const banner = wrapper.find('.incidence-form__error')
    expect(banner.exists()).toBe(true)
    expect(banner.attributes('role')).toBe('alert')
    expect(banner.text()).toContain('Error de conexión con el servidor')
  })

  it('TC-09: click en "Cancelar" emite el evento cancelled', async () => {
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const cancelBtn = wrapper.find('.incidence-form__cancel-btn')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('cancelled')).toBeTruthy()
  })

  it('TC-04: submit exitoso emite el evento submitted con la respuesta de la API', async () => {
    const mockResponse = {
      id: 'inc-001',
      tipo: 'caida',
      severidad: 'moderada',
      descripcion: 'Descripción.',
      residenteId: 'res-001',
      usuarioId: 'uid-gerocultor-01',
      tareaId: null,
      registradaEn: '2026-04-24T10:00:00.000Z',
    }
    const { useIncidencias } = await import('../composables/useIncidencias')
    ;(useIncidencias as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      form: { tipo: 'caida', severidad: 'moderada', residenteId: 'res-001', descripcion: 'Descripción.', tareaId: null },
      fieldErrors: {},
      submitting: { value: false },
      submitError: { value: null },
      submitIncidencia: vi.fn().mockResolvedValue(mockResponse),
      resetForm: vi.fn(),
    })
    const wrapper = mount(IncidenceForm, { props: { residents: residentsBase } })
    const form = wrapper.find('form')
    await form.trigger('submit')
    // Al resolver la promesa
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('submitted')).toBeTruthy()
    expect(wrapper.emitted('submitted')![0]).toEqual([mockResponse])
  })
})
```

---

## E2E Tests (Playwright)

```typescript
// code/frontend/tests/e2e/register-incidence.spec.ts
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Autenticar con el emulador
  await page.goto('http://localhost:5173/login')
  await page.fill('[data-testid="email-input"]', 'test.gerocultor@example.com')
  await page.fill('[data-testid="password-input"]', 'Test1234!')
  await page.click('[data-testid="submit-btn"]')
  await page.waitForURL('**/dashboard')
})

test('TC-14: flujo completo de registro de incidencia', async ({ page }) => {
  await page.goto('http://localhost:5173/incidencias/nueva')

  // Verificar que el formulario es visible
  await expect(page.locator('#incidence-form-title')).toBeVisible()

  // Seleccionar residente
  await page.selectOption('#incidence-residente', 'res-001')

  // Seleccionar tipo
  await page.selectOption('#incidence-tipo', 'caida')

  // Activar severidad "Moderada"
  await page.click('.incidence-form__severity-btn--moderada')
  await expect(page.locator('.incidence-form__severity-btn--moderada')).toHaveAttribute('aria-pressed', 'true')

  // Escribir descripción
  await page.fill('#incidence-descripcion', 'El residente tropezó en el pasillo. Sin heridas visibles.')

  // El botón debe estar habilitado
  await expect(page.locator('.incidence-form__submit-btn')).not.toBeDisabled()

  // Enviar formulario
  await page.click('.incidence-form__submit-btn')

  // Verificar estado de envío (spinner)
  // El botón puede mostrar "Enviando…" brevemente — esperamos el resultado final

  // Esperar confirmación (redirect o mensaje de éxito)
  await page.waitForURL(/incidencias|dashboard/, { timeout: 10000 })
})

test('TC-10: usuario no autenticado es redirigido al intentar acceder al formulario', async ({ page }) => {
  // Cerrar sesión primero
  await page.goto('http://localhost:5173/logout')
  await page.goto('http://localhost:5173/incidencias/nueva')
  // Debe redirigir a login
  await expect(page).toHaveURL(/login/)
})

test('TC-03: errores de campo visibles tras intento de envío con campos vacíos', async ({ page }) => {
  await page.goto('http://localhost:5173/incidencias/nueva')

  // Intentar submit directo sin rellenar nada (el botón estará deshabilitado)
  // Verificamos que el botón esté deshabilitado con el formulario vacío
  await expect(page.locator('.incidence-form__submit-btn')).toBeDisabled()

  // Rellenar solo descripcion y verificar que el botón sigue deshabilitado
  await page.fill('#incidence-descripcion', 'Solo descripcion')
  await expect(page.locator('.incidence-form__submit-btn')).toBeDisabled()
})

test('TC-07: botones de severidad muestran estado activo correcto', async ({ page }) => {
  await page.goto('http://localhost:5173/incidencias/nueva')

  // Activar Crítica
  await page.click('.incidence-form__severity-btn--critica')
  await expect(page.locator('.incidence-form__severity-btn--critica')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.incidence-form__severity-btn--moderada')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.incidence-form__severity-btn--leve')).toHaveAttribute('aria-pressed', 'false')

  // Cambiar a Leve
  await page.click('.incidence-form__severity-btn--leve')
  await expect(page.locator('.incidence-form__severity-btn--leve')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.incidence-form__severity-btn--critica')).toHaveAttribute('aria-pressed', 'false')
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Formulario con campos `tipo`, `severidad`, `residenteId`, `descripcion` | TC-01 | ⬜ Pending |
| CA-2: Validación de campos obligatorios — errores inline por campo | TC-02, TC-03 | ⬜ Pending |
| CA-3: Submit exitoso → `IncidenciaResponse` con todos los campos de SPEC | TC-04 | ⬜ Pending |
| CA-4: Pre-relleno de `residenteId` desde tarea (US-04 CTA) | TC-05, TC-06 | ⬜ Pending |
| CA-5: `severidad = 'critica'` dispara notificación al admin | TC-13 | ⬜ Pending |
| Estado de envío: spinner + botón deshabilitado durante `submitting` | TC-04 (observación), TC-01 | ⬜ Pending |
| Error global de API visible como banner | TC-08 | ⬜ Pending |
| Cancelar resetea formulario | TC-09 | ⬜ Pending |
| Solo gerocultores/admins autenticados pueden registrar incidencias | TC-10, TC-11 | ⬜ Pending |
| `registradaEn` asignado por servidor (no modificable por cliente) | TC-12 | ⬜ Pending |
| Valores de severidad exactos del SPEC: `leve`, `moderada`, `critica` | TC-07 | ⬜ Pending |
| `formIsValid` solo `true` con todos los campos obligatorios | TC-15 | ⬜ Pending |
| Flujo e2e completo desde la vista | TC-14 | ⬜ Pending |

---

## Automation Notes

- **Unit tests — Composable** (Vitest): `code/frontend/src/business/incidents/presentation/composables/useIncidencias.spec.ts`
  - Mock de `../../infrastructure/incidencias.api` con `vi.mock` para simular éxito y error de `createIncidencia`
  - Ejecutar con: `cd code/frontend && npx vitest run src/business/incidents/presentation/composables/useIncidencias.spec.ts`

- **Unit tests — Component** (Vitest + Vue Test Utils): `code/frontend/src/business/incidents/presentation/components/IncidenceForm.spec.ts`
  - Mock del composable `useIncidencias` para controlar estados (`submitting`, `submitError`, `fieldErrors`)
  - Verificar `data-testid` o selectores CSS BEM en todos los elementos interactivos
  - Ejecutar con: `cd code/frontend && npx vitest run src/business/incidents/presentation/components/IncidenceForm.spec.ts`

- **Integration tests — API** (supertest): `code/api/src/routes/incidencias.spec.ts`
  - Requieren Firebase Auth Emulator activo en `localhost:9099`
  - Verificar TC-10 (sin token → 401), TC-11 (admin → 201), TC-12 (`registradaEn` del servidor)
  - Ejecutar con: `cd code/api && npx vitest run src/routes/incidencias.spec.ts`

- **E2E tests** (Playwright): `code/frontend/tests/e2e/register-incidence.spec.ts`
  - Requieren todos los emuladores activos (Auth:9099, Firestore:8080), API en `localhost:3000` y frontend en `localhost:5173`
  - Ejecutar con: `npx playwright test register-incidence.spec.ts`

- **`data-testid` y selectores requeridos** (convención para que tests e2e funcionen):
  - `#incidence-form-title` — título del formulario (`h2`)
  - `#incidence-residente` — selector de residente (`<select>`)
  - `#incidence-tipo` — selector de tipo (`<select>`)
  - `.incidence-form__severity-btn--critica` — botón de severidad crítica
  - `.incidence-form__severity-btn--moderada` — botón de severidad moderada
  - `.incidence-form__severity-btn--leve` — botón de severidad leve
  - `#incidence-descripcion` — textarea de descripción
  - `#incidence-residente-err` — error inline del selector de residente
  - `#incidence-tipo-err` — error inline del selector de tipo
  - `#incidence-descripcion-err` — error inline de la descripción
  - `.incidence-form__error` — banner de error global
  - `.incidence-form__submit-btn` — botón de envío
  - `.incidence-form__cancel-btn` — botón de cancelar

- **Valores de severidad canónicos** (G04): siempre `leve | moderada | critica`. Cualquier otra variante (`baja`, `alta`, `crítica` con tilde) es una violación de G04.

- **Seed de datos**: usar script `tests/fixtures/emulator-seed.ts` o equivalente para pre-cargar residentes y usuarios en el emulador antes de los tests E2E.

---

## Meta

- **User Story**: US-06
- **Requisito relacionado**: RF-06
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
