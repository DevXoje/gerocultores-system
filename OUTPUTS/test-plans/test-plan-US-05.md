# Test Plan — US-05: Consulta de ficha de residente

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-05 — Como gerocultor, quiero consultar la ficha completa de un residente, para conocer su información médica y de cuidados antes de atenderle.

---

## Scope

**Cubre**:
- Navegación a la vista de detalle de residente (`/residentes/:id`)
- Estado de carga (skeleton loader) mientras se obtienen los datos
- Estado de error (residente no encontrado, error de red, no autorizado)
- Renderizado correcto de todos los campos de `ResidenteDTO` (G04: nombres exactos de `SPEC/entities.md`)
- Foto del residente (con fallback de iniciales si `foto === null`)
- Cálculo y visualización de edad a partir de `fechaNacimiento`
- Badge de estado `Activo` / `Archivado` según campo `archivado`
- Sección de información médica: `diagnosticos`, `alergias`, `medicacion`, `preferencias`
- Metadata de registro: `creadoEn`, `actualizadoEn`
- Botón "Volver a residentes" (`router.back()`)
- Botón "Reintentar" en estado de error
- Seguridad: solo usuarios autenticados con rol `gerocultor` o `admin` pueden acceder
- Respuesta de la API `GET /api/residentes/:id` retorna `ResidenteResponse` con todos los campos definidos

**No cubre (out of scope)**:
- Edición de la ficha del residente (US-09)
- Historial de incidencias del residente (US-07)
- Lista de residentes / búsqueda (US-09)
- Alta y gestión de residentes (US-09)
- Tareas del residente en agenda (US-03)

**Stack implicado**: Vue 3 + Vue Router 5 + Axios | Vitest 4 + @vue/test-utils 2 | Playwright (e2e) | Firebase Auth Emulator (9099) | Express API (`GET /api/residentes/:id`)

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099, Firestore en 8080)
- Backend API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test creados en el emulador con Custom Claims configurados:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-01`
  - Email: `test.admin@example.com` / Password: `Test1234!` / Rol: `admin` / UID: `uid-admin-01`
- Documentos Firestore seed en el emulador (colección `residentes`):
  - `res-001` — residente activo con todos los campos completos:
    - `id: 'res-001'`
    - `nombre: 'Eleanor'`
    - `apellidos: 'Vance'`
    - `fechaNacimiento: '1942-03-15'`
    - `habitacion: '101'`
    - `foto: 'https://example.com/photos/eleanor.jpg'`
    - `diagnosticos: 'Alzheimer leve. Hipertensión arterial controlada.'`
    - `alergias: 'Penicilina. Ibuprofeno.'`
    - `medicacion: 'Donepezilo 10mg/día. Enalapril 5mg/día.'`
    - `preferencias: 'Prefiere música clásica. No tolera ruidos fuertes.'`
    - `archivado: false`
    - `gerocultoresAsignados: ['uid-gerocultor-01']`
    - `creadoEn: '2025-01-10T09:00:00.000Z'`
    - `actualizadoEn: '2026-03-20T14:30:00.000Z'`
  - `res-002` — residente archivado:
    - `id: 'res-002'`
    - `nombre: 'Roberto'`
    - `apellidos: 'Gómez Ruiz'`
    - `fechaNacimiento: '1935-07-22'`
    - `habitacion: '205'`
    - `foto: null`
    - `diagnosticos: null`
    - `alergias: null`
    - `medicacion: null`
    - `preferencias: null`
    - `archivado: true`
    - `gerocultoresAsignados: ['uid-gerocultor-01']`
    - `creadoEn: '2024-06-01T08:00:00.000Z'`
    - `actualizadoEn: '2026-01-15T10:00:00.000Z'`
  - `res-003` — residente NO asignado al gerocultor de test (para test de permisos)
    - `id: 'res-003'`
    - `nombre: 'Carmen'`
    - `apellidos: 'Torres Blanco'`
    - `fechaNacimiento: '1950-11-03'`
    - `habitacion: '310'`
    - `foto: null`
    - `diagnosticos: 'Diabetes tipo 2.'`
    - `alergias: null`
    - `medicacion: 'Metformina 850mg.'`
    - `preferencias: null`
    - `archivado: false`
    - `gerocultoresAsignados: []`
    - `creadoEn: '2025-02-20T11:00:00.000Z'`
    - `actualizadoEn: '2025-02-20T11:00:00.000Z'`
- El usuario `uid-gerocultor-01` está autenticado al inicio de los tests e2e

---

## Test Cases

### TC-01: Happy path — renderizado completo de la ficha de un residente activo

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Residente `res-001` existe en Firestore con todos los campos completos.
- **Steps**:
  1. Navegar a `/residentes/res-001`.
  2. Esperar a que desaparezca el skeleton y aparezca el contenido.
  3. Observar todos los elementos de la vista.
- **Expected Result**:
  - El nombre completo `Eleanor Vance` es visible en el encabezado (`<h1>`).
  - La foto del residente (`residente.foto`) se muestra como `<img>` con `alt` descriptivo.
  - La habitación `101` se muestra en los metadatos.
  - La edad calculada desde `fechaNacimiento: '1942-03-15'` es correcta y coherente con la fecha actual.
  - La fecha de nacimiento formateada está visible (ej. `15 de marzo de 1942`).
  - El badge muestra `Activo` (fondo verde).
  - Los diagnósticos `'Alzheimer leve. Hipertensión arterial controlada.'` se muestran en la sección médica.
  - Las alergias `'Penicilina. Ibuprofeno.'` se muestran en la sección médica.
  - La medicación activa se muestra en la sección médica.
  - Las preferencias y observaciones se muestran en la sección médica.
  - La fecha de creación y última actualización se muestran en el footer.
  - El botón "Volver a residentes" es visible.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-02: Estado de carga — skeleton visible mientras se obtienen los datos

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Red con latencia simulada.
- **Steps**:
  1. Interceptar la respuesta de `GET /api/residentes/res-001` con un delay de 500ms (mock en test unitario o `page.route()` en e2e).
  2. Navegar a `/residentes/res-001`.
  3. Observar la UI durante la carga.
- **Expected Result**:
  - Mientras `loading === true`, se muestra el componente skeleton (`aria-busy="true"`, `aria-label="Cargando ficha del residente"`).
  - El skeleton incluye: un avatar circular animado, líneas de texto animadas.
  - No se muestra el contenido de datos reales mientras carga.
  - El skeleton desaparece una vez que los datos son recibidos.
- **Type**: e2e (Playwright) | unit (useResidente — estado loading)
- **Priority**: high

---

### TC-03: Estado de error — residente no encontrado (404)

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Se navega a un ID inexistente.
- **Steps**:
  1. Navegar a `/residentes/residente-inexistente`.
  2. Esperar respuesta del servidor.
  3. Observar la UI tras el error.
- **Expected Result**:
  - La API retorna 404 con mensaje de error.
  - La vista muestra el bloque de error (`role="alert"`) con un mensaje apropiado.
  - El icono de advertencia `⚠` es visible.
  - Hay un botón "Reintentar" (`residente-view__retry-btn`) que, al pulsarlo, llama de nuevo a `fetchResidente`.
  - No se muestra el skeleton ni el contenido de datos.
  - El campo `error` en el composable `useResidente` tiene un valor no nulo.
- **Type**: e2e (Playwright) | unit (useResidente — error 404)
- **Priority**: high

---

### TC-04: Estado de error — error de red

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. API no disponible (red simulada offline o mock de Axios que lanza error).
- **Steps**:
  1. Simular fallo de red para la ruta `GET /api/residentes/res-001` (mock de Axios o `page.route()` abortando la request).
  2. Navegar a `/residentes/res-001`.
  3. Observar la UI tras el error.
- **Expected Result**:
  - La vista muestra el bloque de error (`role="alert"`).
  - El mensaje de error es legible y no expone stack trace técnico.
  - El botón "Reintentar" está disponible.
  - El composable `useResidente`: `loading.value === false`, `error.value !== null`, `residente.value === null`.
- **Type**: e2e (Playwright) | unit (useResidente — error de red)
- **Priority**: high

---

### TC-05: Renderizado de foto — residente sin foto muestra placeholder de iniciales

- **Preconditions**: Usuario autenticado. Residente `res-002` tiene `foto: null`.
- **Steps**:
  1. Navegar a `/residentes/res-002`.
  2. Observar el área de avatar en el encabezado.
- **Expected Result**:
  - No se renderiza ningún elemento `<img>` para el avatar.
  - Se muestra el placeholder de iniciales (`residente-view__avatar-placeholder`).
  - Las iniciales mostradas son `RG` (primera letra de `nombre` y primera de `apellidos`).
  - El placeholder tiene estilos visuales adecuados (fondo indigo, texto centrado).
- **Type**: e2e (Playwright) | unit (ResidenteView — foto null)
- **Priority**: medium

---

### TC-06: Badge de estado — residente archivado muestra badge "Archivado"

- **Preconditions**: Usuario autenticado. Residente `res-002` tiene `archivado: true`.
- **Steps**:
  1. Navegar a `/residentes/res-002`.
  2. Esperar a que carguen los datos.
  3. Observar el badge de estado.
- **Expected Result**:
  - El badge muestra el texto `Archivado`.
  - El badge tiene la clase CSS `residente-view__badge--archivado` (fondo gris, texto gris).
  - El badge NO tiene la clase `residente-view__badge--activo`.
- **Type**: unit (ResidenteView — archivado: true) | e2e (Playwright)
- **Priority**: medium

---

### TC-07: Campos médicos nulos — se muestran mensajes de fallback apropiados

- **Preconditions**: Usuario autenticado. Residente `res-002` tiene todos los campos médicos en `null`.
- **Steps**:
  1. Navegar a `/residentes/res-002`.
  2. Observar las tarjetas de información médica.
- **Expected Result**:
  - La tarjeta "Diagnósticos" muestra `'Sin información registrada.'`.
  - La tarjeta "Alergias" muestra `'Sin alergias conocidas.'`.
  - La tarjeta "Medicación activa" muestra `'Sin medicación activa registrada.'`.
  - La tarjeta "Preferencias y observaciones" muestra `'Sin preferencias registradas.'`.
  - Las tarjetas siguen siendo visibles (no colapsan con campos vacíos).
- **Type**: unit (ResidenteView — campos null) | e2e (Playwright)
- **Priority**: medium

---

### TC-08: Botón "Volver" navega al historial anterior del router

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. El usuario llega a la vista desde la lista de residentes (`/residentes`).
- **Steps**:
  1. Navegar a `/residentes`.
  2. Hacer clic en `res-001` para ir a `/residentes/res-001`.
  3. Una vez cargada la ficha, hacer clic en el botón "Volver a residentes".
- **Expected Result**:
  - El navegador vuelve a la página anterior (`/residentes`).
  - Se llama a `router.back()` internamente.
  - La URL cambia de `/residentes/res-001` a `/residentes`.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

### TC-09: Seguridad — usuario no autenticado es redirigido al login

- **Preconditions**: No hay sesión activa. El usuario intenta acceder directamente a `/residentes/res-001`.
- **Steps**:
  1. Abrir una sesión de navegación nueva sin token de Firebase.
  2. Navegar directamente a `http://localhost:5173/residentes/res-001`.
  3. Observar el comportamiento del router.
- **Expected Result**:
  - El guard de ruta de Vue Router redirige al usuario a `/login`.
  - La vista de detalle de residente NO se renderiza.
  - No se realiza ninguna llamada a `GET /api/residentes/res-001`.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-10: Seguridad — API rechaza request sin token (401)

- **Preconditions**: Llamada directa a la API sin cabecera `Authorization`.
- **Steps**:
  1. Enviar `GET http://localhost:3000/api/residentes/res-001` sin cabecera `Authorization`.
  2. Observar la respuesta.
- **Expected Result**:
  - La API retorna HTTP 401.
  - El cuerpo de respuesta contiene `{ "error": "Unauthorized" }` o mensaje equivalente.
  - No se devuelven datos del residente.
- **Type**: integration (supertest / curl)
- **Priority**: high

---

### TC-11: Seguridad — API retorna datos al gerocultor autenticado con token válido

- **Preconditions**: Usuario `uid-gerocultor-01` autenticado. Token de Firebase válido disponible.
- **Steps**:
  1. Obtener token de Firebase con `getIdToken()`.
  2. Enviar `GET http://localhost:3000/api/residentes/res-001` con cabecera `Authorization: Bearer <token>`.
  3. Observar la respuesta.
- **Expected Result**:
  - La API retorna HTTP 200.
  - El cuerpo de respuesta contiene todos los campos de `ResidenteResponse`:
    - `id`, `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`, `creadoEn`, `actualizadoEn`
  - El campo `gerocultoresAsignados` NO aparece en la respuesta (está excluido en `ResidenteResponse`).
  - Los nombres de campo coinciden exactamente con `SPEC/entities.md` (G04).
- **Type**: integration (supertest)
- **Priority**: high

---

### TC-12: Consistencia de campo `id` — la API incluye el `id` del documento

- **Preconditions**: Usuario autenticado con token válido.
- **Steps**:
  1. Enviar `GET /api/residentes/res-001` con token válido.
  2. Verificar el campo `id` en la respuesta.
- **Expected Result**:
  - El campo `id` del objeto de respuesta coincide con el parámetro de ruta (`:id = 'res-001'`).
  - El campo `id` es de tipo `string` (UUID o equivalente).
- **Type**: integration (supertest)
- **Priority**: high

---

### TC-13: Persistencia de página — recarga mantiene la vista del residente

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Residente `res-001` visible en pantalla.
- **Steps**:
  1. Navegar a `/residentes/res-001`.
  2. Esperar a que cargue la ficha.
  3. Recargar la página (`F5` / `Cmd+R`).
  4. Esperar a que cargue de nuevo.
- **Expected Result**:
  - Tras la recarga, el usuario sigue en `/residentes/res-001` (no redirige a otra ruta).
  - La ficha de `Eleanor Vance` carga correctamente de nuevo.
  - No hay errores de hidratación o estado roto.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

## Unit Tests (Vitest)

### `useResidente` composable

```typescript
// code/frontend/src/business/residents/presentation/composables/useResidente.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useResidente } from './useResidente'

// Mock del módulo de infraestructura
vi.mock('../../infrastructure/residentes.api', () => ({
  getResidente: vi.fn(),
}))

import { getResidente } from '../../infrastructure/residentes.api'

const mockResidente = {
  id: 'res-001',
  nombre: 'Eleanor',
  apellidos: 'Vance',
  fechaNacimiento: '1942-03-15',
  habitacion: '101',
  foto: 'https://example.com/photos/eleanor.jpg',
  diagnosticos: 'Alzheimer leve. Hipertensión arterial controlada.',
  alergias: 'Penicilina. Ibuprofeno.',
  medicacion: 'Donepezilo 10mg/día. Enalapril 5mg/día.',
  preferencias: 'Prefiere música clásica.',
  archivado: false,
  creadoEn: '2025-01-10T09:00:00.000Z',
  actualizadoEn: '2026-03-20T14:30:00.000Z',
}

describe('useResidente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería inicializar con estado vacío', () => {
    const { residente, loading, error } = useResidente()
    expect(residente.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('debería poner loading a true mientras obtiene los datos (TC-02)', async () => {
    let resolvePromise!: (value: typeof mockResidente) => void
    const pendingPromise = new Promise<typeof mockResidente>((resolve) => {
      resolvePromise = resolve
    })
    ;(getResidente as ReturnType<typeof vi.fn>).mockReturnValueOnce(pendingPromise)

    const { residente, loading, error, fetchResidente } = useResidente()
    const fetchCall = fetchResidente('res-001')

    // Durante la carga, loading debe ser true
    expect(loading.value).toBe(true)
    expect(residente.value).toBeNull()

    resolvePromise(mockResidente)
    await fetchCall

    expect(loading.value).toBe(false)
    expect(residente.value).toEqual(mockResidente)
    expect(error.value).toBeNull()
  })

  it('debería poblar residente con los datos recibidos en happy path (TC-01)', async () => {
    ;(getResidente as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResidente)

    const { residente, loading, error, fetchResidente } = useResidente()
    await fetchResidente('res-001')

    expect(loading.value).toBe(false)
    expect(residente.value).toEqual(mockResidente)
    expect(error.value).toBeNull()
  })

  it('debería poblar error y dejar residente null si la API falla (TC-03)', async () => {
    ;(getResidente as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Residente no encontrado')
    )

    const { residente, loading, error, fetchResidente } = useResidente()
    await fetchResidente('residente-inexistente')

    expect(loading.value).toBe(false)
    expect(residente.value).toBeNull()
    expect(error.value).toBe('Residente no encontrado')
  })

  it('debería manejar error de red y devolver mensaje legible (TC-04)', async () => {
    ;(getResidente as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network Error')
    )

    const { error, fetchResidente } = useResidente()
    await fetchResidente('res-001')

    expect(error.value).toBe('Network Error')
  })

  it('debería manejar error desconocido (no instancia de Error)', async () => {
    ;(getResidente as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      'error-string-inesperado'
    )

    const { error, fetchResidente } = useResidente()
    await fetchResidente('res-001')

    expect(error.value).toBe('error-string-inesperado')
  })

  it('debería resetear error y residente en cada nueva llamada', async () => {
    ;(getResidente as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Error inicial'))
      .mockResolvedValueOnce(mockResidente)

    const { residente, error, fetchResidente } = useResidente()

    await fetchResidente('res-001')
    expect(error.value).toBe('Error inicial')

    await fetchResidente('res-001')
    expect(error.value).toBeNull()
    expect(residente.value).toEqual(mockResidente)
  })
})
```

---

### `ResidenteView` component — renderizado condicional

```typescript
// code/frontend/src/business/residents/presentation/views/ResidenteView.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import ResidenteView from './ResidenteView.vue'

// Mock del composable
vi.mock('../composables/useResidente', () => ({
  useResidente: vi.fn(),
}))

import { useResidente } from '../composables/useResidente'

const mockResidenteCompleto = {
  id: 'res-001',
  nombre: 'Eleanor',
  apellidos: 'Vance',
  fechaNacimiento: '1942-03-15',
  habitacion: '101',
  foto: 'https://example.com/photos/eleanor.jpg',
  diagnosticos: 'Alzheimer leve.',
  alergias: 'Penicilina.',
  medicacion: 'Donepezilo 10mg/día.',
  preferencias: 'Prefiere música clásica.',
  archivado: false,
  creadoEn: '2025-01-10T09:00:00.000Z',
  actualizadoEn: '2026-03-20T14:30:00.000Z',
}

const mockResidenteNulo = {
  id: 'res-002',
  nombre: 'Roberto',
  apellidos: 'Gómez Ruiz',
  fechaNacimiento: '1935-07-22',
  habitacion: '205',
  foto: null,
  diagnosticos: null,
  alergias: null,
  medicacion: null,
  preferencias: null,
  archivado: true,
  creadoEn: '2024-06-01T08:00:00.000Z',
  actualizadoEn: '2026-01-15T10:00:00.000Z',
}

function buildRouter(residenteId = 'res-001') {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/residentes/:id',
        component: ResidenteView,
      },
    ],
  })
}

describe('ResidenteView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-02: muestra skeleton mientras loading es true', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: null },
      loading: { value: true },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Cargando ficha del residente"]').exists()).toBe(true)
    expect(wrapper.find('.residente-view__content').exists()).toBe(false)
    expect(wrapper.find('.residente-view__error').exists()).toBe(false)
  })

  it('TC-03: muestra bloque de error con role="alert" y botón reintentar', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: null },
      loading: { value: false },
      error: { value: 'Residente no encontrado' },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    const errorBlock = wrapper.find('[role="alert"]')
    expect(errorBlock.exists()).toBe(true)
    expect(errorBlock.text()).toContain('Residente no encontrado')

    const retryBtn = wrapper.find('.residente-view__retry-btn')
    expect(retryBtn.exists()).toBe(true)
    await retryBtn.trigger('click')
    expect(fetchResidente).toHaveBeenCalledTimes(2) // 1 onMounted + 1 retry
  })

  it('TC-01: muestra nombre completo y habitación del residente', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteCompleto },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('h1').text()).toContain('Eleanor Vance')
    expect(wrapper.text()).toContain('101')
  })

  it('TC-05: muestra avatar img cuando foto no es null', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteCompleto },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('.residente-view__avatar').exists()).toBe(true)
    expect(wrapper.find('.residente-view__avatar-placeholder').exists()).toBe(false)
  })

  it('TC-05: muestra placeholder de iniciales cuando foto es null', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteNulo },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-002')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('.residente-view__avatar').exists()).toBe(false)
    expect(wrapper.find('.residente-view__avatar-placeholder').exists()).toBe(true)
    expect(wrapper.find('.residente-view__avatar-initials').text()).toBe('RG')
  })

  it('TC-06: muestra badge "Archivado" cuando archivado es true', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteNulo },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-002')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    const badge = wrapper.find('.residente-view__badge')
    expect(badge.text()).toBe('Archivado')
    expect(badge.classes()).toContain('residente-view__badge--archivado')
    expect(badge.classes()).not.toContain('residente-view__badge--activo')
  })

  it('TC-06: muestra badge "Activo" cuando archivado es false', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteCompleto },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    const badge = wrapper.find('.residente-view__badge')
    expect(badge.text()).toBe('Activo')
    expect(badge.classes()).toContain('residente-view__badge--activo')
  })

  it('TC-07: muestra texto de fallback para campos médicos nulos', async () => {
    const fetchResidente = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteNulo },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    await router.push('/residentes/res-002')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Sin información registrada.')
    expect(wrapper.text()).toContain('Sin alergias conocidas.')
    expect(wrapper.text()).toContain('Sin medicación activa registrada.')
    expect(wrapper.text()).toContain('Sin preferencias registradas.')
  })

  it('TC-08: botón "Volver" llama a router.back()', async () => {
    const fetchResidente = vi.fn()
    const mockBack = vi.fn()
    ;(useResidente as ReturnType<typeof vi.fn>).mockReturnValue({
      residente: { value: mockResidenteCompleto },
      loading: { value: false },
      error: { value: null },
      fetchResidente,
    })

    const router = buildRouter()
    router.back = mockBack
    await router.push('/residentes/res-001')

    const wrapper = mount(ResidenteView, {
      global: { plugins: [router] },
    })

    await wrapper.find('.residente-view__back-btn').trigger('click')
    expect(mockBack).toHaveBeenCalledOnce()
  })
})
```

---

### API — `GET /api/residentes/:id`

```typescript
// code/api/src/routes/residentes.routes.spec.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import app from '../app'

// Mock de Firebase Admin
vi.mock('../services/firebase', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  db: {
    collection: vi.fn(),
  },
}))

import { adminAuth, db } from '../services/firebase'

const mockToken = 'valid-firebase-token'
const mockDecodedToken = {
  uid: 'uid-gerocultor-01',
  email: 'test.gerocultor@example.com',
  role: 'gerocultor',
}

const mockResidenteDoc = {
  nombre: 'Eleanor',
  apellidos: 'Vance',
  fechaNacimiento: '1942-03-15',
  habitacion: '101',
  foto: 'https://example.com/photos/eleanor.jpg',
  diagnosticos: 'Alzheimer leve.',
  alergias: 'Penicilina.',
  medicacion: 'Donepezilo 10mg/día.',
  preferencias: 'Prefiere música clásica.',
  archivado: false,
  gerocultoresAsignados: ['uid-gerocultor-01'],
  creadoEn: '2025-01-10T09:00:00.000Z',
  actualizadoEn: '2026-03-20T14:30:00.000Z',
}

describe('GET /api/residentes/:id', () => {
  beforeAll(() => {
    ;(adminAuth.verifyIdToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockDecodedToken)
  })

  it('TC-10: retorna 401 sin cabecera Authorization', async () => {
    const res = await request(app).get('/api/residentes/res-001')
    expect(res.status).toBe(401)
  })

  it('TC-11: retorna 200 con ResidenteResponse completo para token válido', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      exists: true,
      id: 'res-001',
      data: () => mockResidenteDoc,
    })
    ;(db.collection as ReturnType<typeof vi.fn>).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    })

    const res = await request(app)
      .get('/api/residentes/res-001')
      .set('Authorization', `Bearer ${mockToken}`)

    expect(res.status).toBe(200)
    // TC-12: campo id presente
    expect(res.body.id).toBe('res-001')
    // G04: nombres de campo exactos de SPEC/entities.md
    expect(res.body).toHaveProperty('nombre', 'Eleanor')
    expect(res.body).toHaveProperty('apellidos', 'Vance')
    expect(res.body).toHaveProperty('fechaNacimiento', '1942-03-15')
    expect(res.body).toHaveProperty('habitacion', '101')
    expect(res.body).toHaveProperty('foto')
    expect(res.body).toHaveProperty('diagnosticos')
    expect(res.body).toHaveProperty('alergias')
    expect(res.body).toHaveProperty('medicacion')
    expect(res.body).toHaveProperty('preferencias')
    expect(res.body).toHaveProperty('archivado', false)
    expect(res.body).toHaveProperty('creadoEn')
    expect(res.body).toHaveProperty('actualizadoEn')
    // gerocultoresAsignados NO debe estar en la respuesta
    expect(res.body).not.toHaveProperty('gerocultoresAsignados')
  })

  it('TC-03: retorna 404 para residente inexistente', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      exists: false,
    })
    ;(db.collection as ReturnType<typeof vi.fn>).mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mockGet }),
    })

    const res = await request(app)
      .get('/api/residentes/residente-inexistente')
      .set('Authorization', `Bearer ${mockToken}`)

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})
```

---

## E2E Tests (Playwright)

```typescript
// code/frontend/tests/e2e/residente-detail.spec.ts
import { test, expect } from '@playwright/test'

// Helper: autenticar con el emulador antes de los tests
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  await page.fill('[data-testid="email-input"]', 'test.gerocultor@example.com')
  await page.fill('[data-testid="password-input"]', 'Test1234!')
  await page.click('[data-testid="submit-btn"]')
  await page.waitForURL('**/dashboard')
})

test('TC-01: happy path — ficha completa de residente activo', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/res-001')
  // Esperar a que desaparezca el skeleton
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })

  // Nombre completo visible en h1
  await expect(page.locator('h1')).toContainText('Eleanor Vance')

  // Habitación visible
  await expect(page.locator('.residente-view__meta')).toContainText('101')

  // Badge activo
  await expect(page.locator('.residente-view__badge--activo')).toBeVisible()
  await expect(page.locator('.residente-view__badge--activo')).toHaveText('Activo')

  // Sección médica con datos
  await expect(page.locator('.residente-view__content')).toContainText('Alzheimer leve')
  await expect(page.locator('.residente-view__content')).toContainText('Penicilina')
  await expect(page.locator('.residente-view__content')).toContainText('Donepezilo')

  // Foto visible como img
  await expect(page.locator('.residente-view__avatar')).toBeVisible()
})

test('TC-02: estado de carga — skeleton visible durante la petición', async ({ page }) => {
  // Retrasar la respuesta de la API para capturar el estado de carga
  await page.route('**/api/residentes/res-001', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.continue()
  })

  await page.goto('http://localhost:5173/residentes/res-001')

  // El skeleton debe ser visible inmediatamente
  await expect(page.locator('[aria-busy="true"]')).toBeVisible()
  await expect(page.locator('[aria-label="Cargando ficha del residente"]')).toBeVisible()

  // Esperar a que carguen los datos
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('h1')).toContainText('Eleanor')
})

test('TC-03: estado de error — residente no encontrado muestra error y botón reintentar', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/residente-inexistente')
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.residente-view__retry-btn')).toBeVisible()
  await expect(page.locator('.residente-view__content')).not.toBeVisible()
})

test('TC-04: estado de error — fallo de red muestra error y botón reintentar', async ({ page }) => {
  await page.route('**/api/residentes/res-001', (route) => route.abort('failed'))
  await page.goto('http://localhost:5173/residentes/res-001')
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.residente-view__retry-btn')).toBeVisible()
})

test('TC-05: residente sin foto muestra placeholder de iniciales', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/res-002')
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })

  // No debe haber img de avatar
  await expect(page.locator('.residente-view__avatar')).not.toBeVisible()

  // Debe haber placeholder con iniciales
  await expect(page.locator('.residente-view__avatar-placeholder')).toBeVisible()
  await expect(page.locator('.residente-view__avatar-initials')).toHaveText('RG')
})

test('TC-06: residente archivado muestra badge "Archivado"', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/res-002')
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('.residente-view__badge--archivado')).toBeVisible()
  await expect(page.locator('.residente-view__badge--archivado')).toHaveText('Archivado')
})

test('TC-07: campos médicos nulos muestran mensajes de fallback', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/res-002')
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('.residente-view__content')).toContainText('Sin información registrada.')
  await expect(page.locator('.residente-view__content')).toContainText('Sin alergias conocidas.')
  await expect(page.locator('.residente-view__content')).toContainText('Sin medicación activa registrada.')
  await expect(page.locator('.residente-view__content')).toContainText('Sin preferencias registradas.')
})

test('TC-08: botón "Volver" regresa a la página anterior', async ({ page }) => {
  // Navegar desde la lista de residentes
  await page.goto('http://localhost:5173/residentes')
  await page.goto('http://localhost:5173/residentes/res-001')
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })

  await page.click('.residente-view__back-btn')
  await expect(page).toHaveURL(/\/residentes$/)
})

test('TC-09: usuario no autenticado es redirigido al login', async ({ browser }) => {
  // Crear contexto aislado sin autenticación
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://localhost:5173/residentes/res-001')
  await expect(page).toHaveURL(/\/login/)
  await context.close()
})

test('TC-13: recarga de página mantiene la vista del residente', async ({ page }) => {
  await page.goto('http://localhost:5173/residentes/res-001')
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('h1')).toContainText('Eleanor Vance')

  await page.reload()
  await expect(page.locator('[aria-busy="true"]')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('h1')).toContainText('Eleanor Vance')
  await expect(page).toHaveURL(/\/residentes\/res-001/)
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: El gerocultor puede ver el nombre completo, foto, habitación y edad del residente | TC-01, unit `ResidenteView — nombre y habitación`, unit `ResidenteView — foto` | ⬜ Pending |
| CA-2: Información médica visible (diagnósticos, alergias, medicación, preferencias) | TC-01, unit `ResidenteView — campos médicos nulos` | ⬜ Pending |
| CA-3: Estado de carga (skeleton) visible durante la petición | TC-02, unit `useResidente — loading true` | ⬜ Pending |
| CA-4: Estado de error con botón reintentar cuando la API falla | TC-03, TC-04, unit `useResidente — error` | ⬜ Pending |
| CA-5: Residente sin foto muestra placeholder de iniciales | TC-05, unit `ResidenteView — foto null` | ⬜ Pending |
| CA-6: Badge de estado refleja correctamente `archivado` | TC-06, unit `ResidenteView — archivado` | ⬜ Pending |
| CA-7: Campos nulos muestran mensajes de fallback | TC-07, unit `ResidenteView — campos null` | ⬜ Pending |
| CA-8: Botón "Volver" navega al historial anterior | TC-08, unit `ResidenteView — back btn` | ⬜ Pending |
| Seguridad: usuario no autenticado redirigido al login | TC-09 | ⬜ Pending |
| Seguridad: API requiere token válido (401 sin token) | TC-10, integration API | ⬜ Pending |
| Seguridad: API retorna datos con token válido (200) | TC-11, TC-12, integration API | ⬜ Pending |
| `gerocultoresAsignados` no expuesto en API response | TC-11, integration API | ⬜ Pending |
| Persistencia tras recarga de página | TC-13 | ⬜ Pending |

---

## Automation Notes

- **Unit tests — Composable** (Vitest): `code/frontend/src/business/residents/presentation/composables/useResidente.spec.ts`
  - Mock de `../../infrastructure/residentes.api` con `vi.mock`
  - Probar: estado inicial, loading, happy path, error 404, error de red, error desconocido, reseteo en llamada subsiguiente
  - Ejecutar con: `cd code/frontend && npx vitest run src/business/residents/presentation/composables/useResidente.spec.ts`

- **Unit tests — Component** (Vitest + @vue/test-utils 2): `code/frontend/src/business/residents/presentation/views/ResidenteView.spec.ts`
  - Mock de `../composables/useResidente` para controlar estado reactivo
  - Router: usar `createMemoryHistory()` para evitar dependencias del navegador
  - Probar: skeleton, error state, happy path, foto null/presente, badge archivado/activo, campos nulos, botón volver
  - Ejecutar con: `cd code/frontend && npx vitest run src/business/residents/presentation/views/ResidenteView.spec.ts`

- **Unit tests — API** (Vitest + supertest): `code/api/src/routes/residentes.routes.spec.ts`
  - Mock de `../services/firebase` para Firebase Admin
  - Probar: 401 sin token, 200 con ResidenteResponse correcto, 404 para doc inexistente
  - Verificar G04: todos los campos de `SPEC/entities.md` presentes; `gerocultoresAsignados` ausente
  - Ejecutar con: `cd code/api && npx vitest run src/routes/residentes.routes.spec.ts`

- **E2E tests** (Playwright): `code/frontend/tests/e2e/residente-detail.spec.ts`
  - Requieren todos los servicios activos: Firebase Emulator (Auth:9099, Firestore:8080), API (localhost:3000), Frontend (localhost:5173)
  - TC-02 usa `page.route()` para añadir latencia
  - TC-04 usa `page.route()` para abortar requests a la API
  - TC-09 usa un contexto de browser aislado sin autenticación
  - Ejecutar con: `npx playwright test residente-detail.spec.ts`

- **`data-testid` requeridos** en `ResidenteView.vue` (convención para que tests e2e funcionen):
  - Se usan selectores CSS de clase BEM en lugar de `data-testid` (patrón establecido en la vista)
  - Los selectores clave son: `.residente-view__content`, `.residente-view__skeleton`, `.residente-view__error`, `.residente-view__back-btn`, `.residente-view__retry-btn`, `.residente-view__badge--activo`, `.residente-view__badge--archivado`, `.residente-view__avatar`, `.residente-view__avatar-placeholder`, `.residente-view__avatar-initials`

- **Seed de datos**: los documentos `res-001`, `res-002`, `res-003` definidos en la sección "Preconditions" deben ser cargados en el emulador de Firestore antes de ejecutar los tests E2E (script: `tests/fixtures/emulator-seed.ts`)

- **Manual only**: TC-01 (verificación visual completa) y TC-09 (verificación de redirección de auth) pueden requerir revisión manual adicional

---

## Meta

- **User Story**: US-05
- **Requisito relacionado**: RF-05
- **Guardrail**: G03 compliant ✅
- **G04 compliance**: Todos los campos de `ResidenteDTO` usan los nombres exactos de `SPEC/entities.md` (`nombre`, `apellidos`, `fechaNacimiento`, `habitacion`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`, `creadoEn`, `actualizadoEn`, `id`)
- **G10 compliance**: ResidenteView implementada con referencia a Stitch screen "Resident Detail - Eleanor Vance" (`projects/16168255182252500555`)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
