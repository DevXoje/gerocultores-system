# Test Plan — US-03: Consulta de agenda diaria

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-03 — Como gerocultor, quiero ver mi agenda del día actual al iniciar sesión, para saber qué tareas tengo pendientes, en qué orden y para qué residente.

---

## Scope

**Cubre**:
- Renderizado de la lista de tareas del día ordenada cronológicamente por `fechaHora`
- Visualización de los 4 campos requeridos en cada `TaskCard`: hora, nombre del residente, `tipo` y `estado`
- Resaltado visual de tareas vencidas y no completadas (`estado !== 'completada'` con `fechaHora < ahora`)
- Estado vacío: mensaje "No tienes tareas para hoy" cuando no hay tareas para la fecha actual
- Pinia store `useAgendaStore`: carga desde Firestore filtrada por `usuarioId` + fecha del día
- Vue Router guard: redirección a `/login` si no hay sesión activa al acceder a `/agenda`
- Aislamiento de datos: el gerocultor solo ve sus propias tareas (filtro por `usuarioId`)
- Vista responsiva en viewport de tablet (10″ ≈ 1280×800) con soporte de interacción táctil
- Performance: tiempo de carga de la agenda < 2 segundos desde que el componente se monta

**No cubre (out of scope)**:
- Creación, edición o eliminación de tareas (US-04 / US-05)
- Registro de incidencias vinculadas a tareas (US-06)
- Notificaciones de tareas próximas (US-08)
- Vista de coordinador/administrador sobre agendas de otros gerocultores
- Autenticación en sí (cubierta en US-01)
- Control de acceso por rol (cubierto en US-02)

**Stack implicado**: Vue 3 + Pinia (`useAgendaStore`) + Vue Router (navigation guard) + Vitest + Vue Test Utils | Firebase Firestore (colección `tareas` + join por `residenteId`) | Firebase Emulator Suite (Auth:9099, Firestore:8080) | Playwright (e2e + performance)

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099, Firestore en 8080 / 18080)
- Usuario de test creado en el emulador con Custom Claims configurados:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-01`
  - Email: `test.gerocultor2@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-02`
- Documentos seed en Firestore (emulador), fecha de referencia = **hoy** (`TODAY`):
  - `/residentes/res-001` → `{ nombre: 'Carmen', apellidos: 'López García', habitacion: '101', archivado: false }`
  - `/residentes/res-002` → `{ nombre: 'José', apellidos: 'Martínez Ruiz', habitacion: '203', archivado: false }`
  - Tareas asignadas a `uid-gerocultor-01` para TODAY (3 tareas):
    - `/tareas/tarea-A` → `{ usuarioId: 'uid-gerocultor-01', residenteId: 'res-001', tipo: 'higiene', fechaHora: TODAY 08:00, estado: 'completada', titulo: 'Higiene matutina' }`
    - `/tareas/tarea-B` → `{ usuarioId: 'uid-gerocultor-01', residenteId: 'res-002', tipo: 'medicacion', fechaHora: TODAY 10:00, estado: 'pendiente', titulo: 'Administrar medicación' }`
    - `/tareas/tarea-C` → `{ usuarioId: 'uid-gerocultor-01', residenteId: 'res-001', tipo: 'alimentacion', fechaHora: TODAY 07:30, estado: 'pendiente', titulo: 'Desayuno' }` — VENCIDA (hora pasada)
  - Tarea de OTRO gerocultor para TODAY:
    - `/tareas/tarea-X` → `{ usuarioId: 'uid-gerocultor-02', residenteId: 'res-002', tipo: 'revision', fechaHora: TODAY 09:00, estado: 'pendiente', titulo: 'Revisión médica' }`
  - Tarea del propio gerocultor para MAÑANA (fuera de la agenda diaria):
    - `/tareas/tarea-D` → `{ usuarioId: 'uid-gerocultor-01', residenteId: 'res-001', tipo: 'actividad', fechaHora: TOMORROW 11:00, estado: 'pendiente', titulo: 'Actividad recreativa' }`
- Frontend corriendo: `cd frontend && npm run dev` (http://localhost:5173)
- La ruta `/agenda` requiere autenticación (navigation guard activo en Vue Router)

---

## Test Cases

### TC-01: Vue Router redirige a `/login` si el usuario no está autenticado

- **Preconditions**: Sin sesión activa (usuario no autenticado). Emulador activo.
- **Steps**:
  1. Navegar directamente a `http://localhost:5173/agenda` sin haber iniciado sesión.
  2. Observar el resultado de la navegación.
- **Expected Result**:
  - El navigation guard detecta que no hay usuario autenticado (`useAuthStore.usuario === null`).
  - El usuario es redirigido a `/login`.
  - La vista `/agenda` **NO** se renderiza en ningún momento.
  - No se realizan peticiones a Firestore.
- **Type**: e2e (Playwright) | unit (guards.spec.ts)
- **Priority**: high

---

### TC-02: La agenda carga y muestra las tareas del día ordenadas cronológicamente

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Seed de tareas cargado (tarea-A 08:00, tarea-B 10:00, tarea-C 07:30).
- **Steps**:
  1. Iniciar sesión con `test.gerocultor@example.com` / `Test1234!`.
  2. Navegar a `/agenda` (o esperar redirección post-login).
  3. Observar la lista de tareas renderizada.
- **Expected Result**:
  - Se muestran exactamente **3 tareas** (tarea-A, tarea-B, tarea-C) — ni más ni menos.
  - El orden de las tarjetas es cronológico: tarea-C (07:30) → tarea-A (08:00) → tarea-B (10:00).
  - La tarea de otro gerocultor (`tarea-X`) **NO** aparece.
  - La tarea de mañana (`tarea-D`) **NO** aparece.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-03: Cada tarjeta muestra los 4 campos requeridos

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Agenda cargada con las tareas del seed.
- **Steps**:
  1. Navegar a `/agenda`.
  2. Inspeccionar la tarjeta correspondiente a `tarea-B` (medicación 10:00, residente José Martínez).
- **Expected Result**:
  - **Hora**: se muestra `10:00` (o formato equivalente derivado de `fechaHora`).
  - **Nombre del residente**: se muestra `José Martínez Ruiz` (o `José Martínez`, según diseño).
  - **Tipo de tarea**: se muestra `medicacion` (o su etiqueta display equivalente, ej. "Medicación").
  - **Estado**: se muestra `pendiente` (o su etiqueta display equivalente, ej. "Pendiente") con el indicador visual correspondiente.
  - Los 4 campos son visibles sin necesidad de hacer scroll horizontal.
- **Type**: e2e (Playwright) | unit (TaskCard.spec.ts)
- **Priority**: high

---

### TC-04: Las tareas vencidas y no completadas se resaltan visualmente

- **Preconditions**: Usuario autenticado. Tarea `tarea-C` (07:30, `estado: 'pendiente'`) tiene `fechaHora` en el pasado respecto a la hora actual del test.
- **Steps**:
  1. Navegar a `/agenda`.
  2. Localizar la tarjeta de `tarea-C` (Desayuno, 07:30).
  3. Inspeccionar las clases CSS o el estilo visual de dicha tarjeta.
- **Expected Result**:
  - La tarjeta de `tarea-C` tiene aplicada una clase CSS de resaltado de vencida (ej. `task-overdue`, `border-red-500`, o similar definida en el diseño).
  - La tarjeta de `tarea-A` (08:00, `estado: 'completada'`) **NO** tiene clase de vencida aunque su hora haya pasado — está completada.
  - La tarjeta de `tarea-B` (10:00, `estado: 'pendiente'`, hora futura) **NO** tiene clase de vencida.
- **Type**: e2e (Playwright) | unit (TaskCard.spec.ts — prop `vencida`)
- **Priority**: high

---

### TC-05: Estado vacío — mensaje cuando no hay tareas para hoy

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. El emulador **no** tiene tareas asignadas a `uid-gerocultor-01` para TODAY (o se usa una cuenta limpia sin tareas).
- **Steps**:
  1. Limpiar las tareas del emulador para `uid-gerocultor-01` en TODAY (o usar fixture sin tareas).
  2. Navegar a `/agenda`.
  3. Observar el contenido de la vista.
- **Expected Result**:
  - No se renderiza ninguna tarjeta de tarea.
  - Se muestra el mensaje de estado vacío: "No tienes tareas para hoy" (texto exacto o equivalente traducible).
  - El mensaje es visible sin scroll en viewport de tablet.
  - No se muestra ningún error ni spinner infinito.
- **Type**: e2e (Playwright) | unit (AgendaView.spec.ts — prop `tareas=[]`)
- **Priority**: high

---

### TC-06: El gerocultor solo ve sus propias tareas (aislamiento de datos)

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Existen `tarea-B` (propia) y `tarea-X` (de `uid-gerocultor-02`) en el emulador para TODAY.
- **Steps**:
  1. Navegar a `/agenda`.
  2. Verificar el contenido del store `useAgendaStore` y la lista renderizada.
- **Expected Result**:
  - `useAgendaStore.tareas` contiene únicamente las tareas con `usuarioId === 'uid-gerocultor-01'`.
  - La tarea `tarea-X` (del otro gerocultor) **NO** aparece ni en el store ni en la UI.
  - La query a Firestore incluye el filtro `where('usuarioId', '==', currentUser.uid)`.
- **Type**: unit (useAgendaStore.spec.ts — filtro por `usuarioId`)
- **Priority**: high

---

### TC-07: La agenda carga en menos de 2 segundos (performance)

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Seed con las 3 tareas del día cargado en el emulador.
- **Steps**:
  1. Navegar a `/login` y autenticarse.
  2. Iniciar la medición de tiempo en Playwright con `performance.now()` o `page.waitForSelector`.
  3. Navegar a `/agenda` y esperar a que las tarjetas de tareas sean visibles en el DOM.
  4. Registrar el tiempo transcurrido desde la navegación hasta que el contenido de la agenda es visible.
- **Expected Result**:
  - El tiempo total desde que el componente `AgendaView` se monta hasta que las tarjetas de tareas son visibles es **< 2000 ms**.
  - No se muestra un spinner indefinido.
  - La medición se realiza contra el Firebase Emulator local (condición de red controlada).
- **Type**: e2e — performance (Playwright)
- **Priority**: high

---

### TC-08: La vista es usable en viewport de tablet (1280×800, táctil)

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado. Agenda cargada con las 3 tareas del seed.
- **Steps**:
  1. Configurar Playwright para emular viewport `1280×800` con `isMobile: false` y `hasTouch: true`.
  2. Navegar a `/agenda`.
  3. Verificar que las tarjetas son visibles sin overflow horizontal.
  4. Simular un tap sobre la tarjeta de `tarea-B`.
  5. Verificar que el tap es reconocido (ej. abre el detalle de la tarea o cambia el estado).
- **Expected Result**:
  - Las 3 tarjetas de tareas caben en el viewport sin scroll horizontal.
  - El texto de cada tarjeta es legible (tamaño de fuente ≥ 14px).
  - El tap sobre la tarjeta dispara la interacción esperada (navegación, modal, o cambio de estado).
  - No hay elementos solapados ni botones inaccesibles por tamaño táctil.
- **Type**: e2e (Playwright — emulación táctil)
- **Priority**: high

---

### TC-09: Estado de carga — spinner visible mientras se obtienen las tareas

- **Preconditions**: Usuario autenticado. Conexión al emulador activa (se puede simular latencia).
- **Steps**:
  1. Navegar a `/agenda`.
  2. Interceptar (o simular) una pequeña latencia en la respuesta de Firestore.
  3. Observar la UI durante el período de carga.
- **Expected Result**:
  - Mientras `useAgendaStore.cargando === true`, se muestra un indicador de carga (spinner, skeleton cards, o mensaje "Cargando agenda...").
  - El indicador desaparece una vez que las tareas han sido cargadas.
  - No se muestra la lista de tareas (vacía o con datos) hasta que la carga finaliza.
- **Type**: unit (AgendaView.spec.ts — estado `cargando`) | manual
- **Priority**: medium

---

### TC-10: `useAgendaStore` — ordenación cronológica correcta

- **Preconditions**: Tests unitarios con datos mock (no requiere emulador).
- **Steps**:
  1. Inicializar `useAgendaStore` con Pinia en modo test.
  2. Llamar a la acción `cargarAgenda(userId, fecha)` con un mock de Firestore que devuelve las tareas en orden DESORDENADO: `[tarea-B (10:00), tarea-C (07:30), tarea-A (08:00)]`.
  3. Acceder al getter `tareasOrdenadas` del store.
- **Expected Result**:
  - `tareasOrdenadas` devuelve el array ordenado por `fechaHora` ascendente: `[tarea-C (07:30), tarea-A (08:00), tarea-B (10:00)]`.
  - El orden no depende del orden de llegada desde Firestore.
- **Type**: unit (Vitest — useAgendaStore.spec.ts)
- **Priority**: high

---

## Unit Tests (Vitest)

### `useAgendaStore` — carga, ordenación y filtro de vencidas

```typescript
// frontend/src/stores/useAgendaStore.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useAgendaStore } from './useAgendaStore'
import { vi } from 'vitest'

// Mock de Firestore
vi.mock('../lib/firestore', () => ({
  getTareasDelDia: vi.fn(),
}))

const TODAY = new Date()
const makeTarea = (overrides: Partial<Tarea>): Tarea => ({
  id: 'tarea-mock',
  titulo: 'Tarea test',
  tipo: 'higiene',
  fechaHora: TODAY,
  estado: 'pendiente',
  notas: null,
  residenteId: 'res-001',
  usuarioId: 'uid-gerocultor-01',
  creadoEn: TODAY,
  actualizadoEn: TODAY,
  completadaEn: null,
  ...overrides,
})

describe('useAgendaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load tareas filtered by usuarioId and today date', async () => {
    const { getTareasDelDia } = await import('../lib/firestore')
    const mockTareas = [makeTarea({ id: 'tarea-A' })]
    vi.mocked(getTareasDelDia).mockResolvedValueOnce(mockTareas)

    const store = useAgendaStore()
    await store.cargarAgenda('uid-gerocultor-01', TODAY)

    expect(getTareasDelDia).toHaveBeenCalledWith('uid-gerocultor-01', TODAY)
    expect(store.tareas).toEqual(mockTareas)
    expect(store.cargando).toBe(false)
  })

  it('should expose tareasOrdenadas sorted by fechaHora ascending', async () => {
    const store = useAgendaStore()
    const t1 = makeTarea({ id: 'tarea-B', fechaHora: new Date(TODAY.setHours(10, 0)) })
    const t2 = makeTarea({ id: 'tarea-C', fechaHora: new Date(TODAY.setHours(7, 30)) })
    const t3 = makeTarea({ id: 'tarea-A', fechaHora: new Date(TODAY.setHours(8, 0)) })
    store.$patch({ tareas: [t1, t2, t3] })

    const ordenadas = store.tareasOrdenadas
    expect(ordenadas[0].id).toBe('tarea-C')  // 07:30
    expect(ordenadas[1].id).toBe('tarea-A')  // 08:00
    expect(ordenadas[2].id).toBe('tarea-B')  // 10:00
  })

  it('should identify overdue tasks (fechaHora < now AND estado !== completada)', () => {
    const store = useAgendaStore()
    const pastTime = new Date(Date.now() - 3600 * 1000)  // hace 1 hora
    const vencida = makeTarea({ id: 'tarea-C', fechaHora: pastTime, estado: 'pendiente' })
    const completada = makeTarea({ id: 'tarea-A', fechaHora: pastTime, estado: 'completada' })
    const futura = makeTarea({ id: 'tarea-B', fechaHora: new Date(Date.now() + 3600 * 1000), estado: 'pendiente' })
    store.$patch({ tareas: [vencida, completada, futura] })

    expect(store.tareasVencidas).toContainEqual(expect.objectContaining({ id: 'tarea-C' }))
    expect(store.tareasVencidas).not.toContainEqual(expect.objectContaining({ id: 'tarea-A' }))
    expect(store.tareasVencidas).not.toContainEqual(expect.objectContaining({ id: 'tarea-B' }))
  })

  it('should set cargando=true during fetch and false after', async () => {
    const { getTareasDelDia } = await import('../lib/firestore')
    let resolveFn!: (value: Tarea[]) => void
    vi.mocked(getTareasDelDia).mockImplementationOnce(
      () => new Promise((resolve) => { resolveFn = resolve })
    )

    const store = useAgendaStore()
    const promise = store.cargarAgenda('uid-gerocultor-01', TODAY)
    expect(store.cargando).toBe(true)

    resolveFn([])
    await promise
    expect(store.cargando).toBe(false)
  })

  it('should set tareas=[] and show empty state when no tasks returned', async () => {
    const { getTareasDelDia } = await import('../lib/firestore')
    vi.mocked(getTareasDelDia).mockResolvedValueOnce([])

    const store = useAgendaStore()
    await store.cargarAgenda('uid-gerocultor-01', TODAY)

    expect(store.tareas).toHaveLength(0)
    expect(store.sinTareas).toBe(true)
  })
})
```

---

### `AgendaView` component

```typescript
// frontend/src/views/AgendaView.spec.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AgendaView from './AgendaView.vue'
import { useAgendaStore } from '../stores/useAgendaStore'

describe('AgendaView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should show spinner while cargando=true', () => {
    const store = useAgendaStore()
    store.$patch({ cargando: true, tareas: [] })

    const wrapper = mount(AgendaView, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('[data-testid="agenda-spinner"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="task-list"]').exists()).toBe(false)
  })

  it('should show empty state message when tareas is empty and not loading', () => {
    const store = useAgendaStore()
    store.$patch({ cargando: false, tareas: [] })

    const wrapper = mount(AgendaView, { global: { plugins: [createPinia()] } })
    expect(wrapper.text()).toContain('No tienes tareas para hoy')
    expect(wrapper.find('[data-testid="task-list"]').exists()).toBe(false)
  })

  it('should render a TaskCard for each tarea when loaded', () => {
    const store = useAgendaStore()
    store.$patch({
      cargando: false,
      tareas: [
        { id: 'tarea-A', titulo: 'Higiene', tipo: 'higiene', fechaHora: new Date(), estado: 'completada', residenteId: 'res-001', usuarioId: 'uid-01', notas: null, creadoEn: new Date(), actualizadoEn: new Date(), completadaEn: new Date() },
        { id: 'tarea-B', titulo: 'Medicación', tipo: 'medicacion', fechaHora: new Date(), estado: 'pendiente', residenteId: 'res-002', usuarioId: 'uid-01', notas: null, creadoEn: new Date(), actualizadoEn: new Date(), completadaEn: null },
      ]
    })

    const wrapper = mount(AgendaView, { global: { plugins: [createPinia()] } })
    const cards = wrapper.findAll('[data-testid="task-card"]')
    expect(cards).toHaveLength(2)
  })
})
```

---

### `TaskCard` component

```typescript
// frontend/src/components/TaskCard.spec.ts
import { mount } from '@vue/test-utils'
import TaskCard from './TaskCard.vue'

const pastHour = new Date(Date.now() - 3600 * 1000)
const futureHour = new Date(Date.now() + 3600 * 1000)

const baseTarea = {
  id: 'tarea-B',
  titulo: 'Administrar medicación',
  tipo: 'medicacion' as const,
  fechaHora: futureHour,
  estado: 'pendiente' as const,
  residenteId: 'res-002',
  usuarioId: 'uid-01',
  notas: null,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  completadaEn: null,
}

const baseResidente = {
  id: 'res-002',
  nombre: 'José',
  apellidos: 'Martínez Ruiz',
  habitacion: '203',
}

describe('TaskCard', () => {
  it('should render hora, nombre del residente, tipo y estado', () => {
    const wrapper = mount(TaskCard, {
      props: { tarea: baseTarea, residente: baseResidente }
    })
    expect(wrapper.text()).toContain('José Martínez Ruiz')
    expect(wrapper.text()).toMatch(/medicaci[oó]n/i)
    expect(wrapper.text()).toMatch(/pendiente/i)
    // La hora debe estar en el formato HH:MM derivado de fechaHora
    const horaStr = futureHour.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    expect(wrapper.text()).toContain(horaStr)
  })

  it('should apply overdue class when fechaHora is past and estado is not completada', () => {
    const wrapper = mount(TaskCard, {
      props: {
        tarea: { ...baseTarea, fechaHora: pastHour, estado: 'pendiente' },
        residente: baseResidente
      }
    })
    // La clase exacta (ej. 'task-overdue') debe coincidir con el diseño implementado
    expect(wrapper.find('[data-testid="task-card"]').classes()).toContain('task-overdue')
  })

  it('should NOT apply overdue class when estado is completada even if fechaHora is past', () => {
    const wrapper = mount(TaskCard, {
      props: {
        tarea: { ...baseTarea, fechaHora: pastHour, estado: 'completada', completadaEn: new Date() },
        residente: baseResidente
      }
    })
    expect(wrapper.find('[data-testid="task-card"]').classes()).not.toContain('task-overdue')
  })

  it('should NOT apply overdue class when fechaHora is in the future', () => {
    const wrapper = mount(TaskCard, {
      props: {
        tarea: { ...baseTarea, fechaHora: futureHour, estado: 'pendiente' },
        residente: baseResidente
      }
    })
    expect(wrapper.find('[data-testid="task-card"]').classes()).not.toContain('task-overdue')
  })
})
```

---

## E2E Tests (Playwright)

### Performance — carga de agenda < 2 segundos

```typescript
// frontend/tests/e2e/agenda-performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('AgendaView — performance', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar con el emulador antes de cada test de performance
    await page.goto('http://localhost:5173/login')
    await page.fill('[data-testid="email-input"]', 'test.gerocultor@example.com')
    await page.fill('[data-testid="password-input"]', 'Test1234!')
    await page.click('[data-testid="login-submit"]')
    await page.waitForURL('**/agenda')
  })

  test('agenda should load task cards in under 2 seconds', async ({ page }) => {
    // Navegar a /agenda y medir el tiempo hasta que la primera tarjeta sea visible
    const startTime = Date.now()
    await page.goto('http://localhost:5173/agenda')

    // Esperar a que al menos una tarjeta de tarea sea visible
    await page.waitForSelector('[data-testid="task-card"]', { timeout: 2000 })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(2000)
    console.log(`Agenda load time: ${loadTime}ms`)
  })

  test('agenda should show empty state in under 2 seconds when no tasks', async ({ page, context }) => {
    // Usar cuenta sin tareas o limpiar el seed
    await page.goto('http://localhost:5173/agenda')
    const startTime = Date.now()

    await page.waitForSelector('[data-testid="empty-agenda-message"]', { timeout: 2000 })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(2000)
  })
})
```

### Vista responsiva en tablet

```typescript
// frontend/tests/e2e/agenda-tablet.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('AgendaView — tablet viewport', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    hasTouch: true,
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('[data-testid="email-input"]', 'test.gerocultor@example.com')
    await page.fill('[data-testid="password-input"]', 'Test1234!')
    await page.click('[data-testid="login-submit"]')
    await page.waitForURL('**/agenda')
  })

  test('task cards should be visible without horizontal scroll at 1280x800', async ({ page }) => {
    await page.goto('http://localhost:5173/agenda')
    await page.waitForSelector('[data-testid="task-card"]')

    // Verificar que no hay overflow horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('touch tap on task card should trigger interaction', async ({ page }) => {
    await page.goto('http://localhost:5173/agenda')
    const firstCard = page.locator('[data-testid="task-card"]').first()
    await firstCard.waitFor()
    await firstCard.tap()

    // Verificar que la interacción táctil fue reconocida
    // (ej. navegación al detalle, modal abierto, o cambio de estado)
    await expect(page.locator('[data-testid="task-detail"], [data-testid="task-modal"]')).toBeVisible()
  })
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: La agenda muestra todas las tareas del día ordenadas cronológicamente | TC-02, TC-10 (`tareasOrdenadas` getter) | ⬜ Pending |
| CA-2: Cada tarea muestra hora, nombre del residente, tipo y estado | TC-03 (e2e), `TaskCard` unit tests | ⬜ Pending |
| CA-3: Las tareas vencidas y no completadas se resaltan visualmente | TC-04, `TaskCard` unit tests (prop `vencida`) | ⬜ Pending |
| CA-4: La vista es usable en tablet (10″) con interacción táctil | TC-08, `agenda-tablet.spec.ts` | ⬜ Pending |
| CA-5: La agenda carga en menos de 2 segundos | TC-07, `agenda-performance.spec.ts` | ⬜ Pending |
| Estado vacío: mensaje "No tienes tareas para hoy" | TC-05, `AgendaView` unit test (empty state) | ⬜ Pending |
| Guard de Vue Router redirige a `/login` sin sesión | TC-01, `guards.spec.ts` | ⬜ Pending |
| Pinia store filtra tareas por `usuarioId` + fecha | TC-06, TC-10, `useAgendaStore.spec.ts` | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest + Vue Test Utils):
  - `frontend/src/stores/useAgendaStore.spec.ts` — carga, ordenación, filtro de vencidas, estado vacío, loading
  - `frontend/src/views/AgendaView.spec.ts` — spinner, empty state, cantidad de TaskCards
  - `frontend/src/components/TaskCard.spec.ts` — 4 campos, clase `task-overdue`, variantes de estado
  - `frontend/src/router/guards.spec.ts` — redirección sin sesión a `/login`
- **E2E tests** (Playwright):
  - `frontend/tests/e2e/agenda.spec.ts` — TC-01 a TC-06 (flujo completo con emulador)
  - `frontend/tests/e2e/agenda-performance.spec.ts` — TC-07 (carga < 2s)
  - `frontend/tests/e2e/agenda-tablet.spec.ts` — TC-08 (viewport táctil 1280×800)
- **Manual only**: TC-09 (timing visual del spinner con latencia simulada manualmente en DevTools)
- **Firebase Emulator**: todos los tests e2e e integración usan el emulador; nunca producción
- **Seed de datos**: el script `tests/fixtures/emulator-seed.ts` debe incluir las tareas de US-03 con campos exactos de `SPEC/entities.md`
- **`data-testid` requeridos en implementación**:
  - `agenda-spinner` — indicador de carga
  - `task-list` — contenedor de la lista de tareas
  - `task-card` — cada tarjeta individual
  - `empty-agenda-message` — mensaje de estado vacío
  - `task-detail` / `task-modal` — vista de detalle (para test táctil TC-08)

---

## Meta

- **User Story**: US-03
- **Requisito relacionado**: RF-03
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-07
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
