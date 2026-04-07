# Test Plan — US-04: Actualizar estado de una tarea

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-04 — Como gerocultor, quiero marcar una tarea como completada o añadir notas, para registrar lo que he hecho y avisar al siguiente turno.

---

## Scope

**Cubre**:
- Tap/click en una tarea abre panel de acciones (bottom sheet en mobile/tablet, modal en desktop)
- Presencia y accesibilidad de los 3 botones de cambio de estado (`en_curso`, `completada`, `con_incidencia`)
- Optimistic update: el estado cambia en la UI **antes** de que el servidor confirme la escritura
- Rollback automático: si la escritura en Firestore falla, el estado vuelve al valor anterior y se muestra mensaje de error
- Campo de nota libre (`notas`): acepta texto y se guarda junto al cambio de estado
- El documento Firestore actualizado incluye `actualizadoEn` (timestamp servidor) y `usuarioId` del usuario autenticado
- CA-5: cuando el estado cambia a `con_incidencia`, aparece un CTA que lleva al formulario de incidencias (US-06)
- Firestore Security Rules: solo el gerocultor propietario (`usuarioId`) o un coordinador/administrador pueden actualizar la tarea
- El campo `completadaEn` se asigna únicamente cuando el estado pasa a `completada`

**No cubre (out of scope)**:
- Creación de tareas en la agenda (US-03)
- Formulario completo de registro de incidencias (US-06) — solo se verifica el CTA de entrada
- Notificaciones push al coordinador (US-08)
- Cierre de turno y traspaso (US-07)
- Eliminación de tareas

**Stack implicado**: Vue 3 + Pinia (`useAgendaStore`) + Vue Test Utils | Playwright (e2e) | Firebase Firestore Emulator (8080 / 18080) | `@firebase/rules-unit-testing`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth en puerto 9099, Firestore en 8080 / 18080)
- Usuarios de test creados en el emulador con Custom Claims configurados:
  - Email: `test.gerocultor@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-01`
  - Email: `test.coordinador@example.com` / Password: `Test1234!` / Rol: `coordinador` / UID: `uid-coordinador-01`
  - Email: `test.gerocultor2@example.com` / Password: `Test1234!` / Rol: `gerocultor` / UID: `uid-gerocultor-02`
- Documentos de Firestore seed en el emulador (ruta de subcolección según diseño: `/residentes/{residenteId}/tareas`):
  - `/residentes/res-001/tareas/tarea-001` con campos:
    - `id: 'tarea-001'`
    - `titulo: 'Aseo matinal'`
    - `tipo: 'higiene'`
    - `estado: 'pendiente'`
    - `notas: null`
    - `residenteId: 'res-001'`
    - `usuarioId: 'uid-gerocultor-01'`
    - `creadoEn: <timestamp>`
    - `actualizadoEn: <timestamp>`
    - `completadaEn: null`
  - `/residentes/res-001/tareas/tarea-002` con `usuarioId: 'uid-gerocultor-02'` (para tests de permisos cruzados)
- Frontend corriendo: `cd frontend && npm run dev` (http://localhost:5173)
- El usuario `uid-gerocultor-01` está autenticado al inicio de los tests e2e
- La vista de agenda (`/agenda`) lista `tarea-001` visible y pulsable

---

## Test Cases

### TC-01: Tap en una tarea abre el panel de acciones con los 3 botones de estado

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado en `/agenda`. La tarea `tarea-001` con estado `pendiente` está visible en la lista.
- **Steps**:
  1. Localizar la tarjeta de la tarea `'Aseo matinal'` en la agenda.
  2. Realizar tap/click sobre la tarjeta.
  3. Observar el panel resultante.
- **Expected Result**:
  - Aparece un bottom sheet o modal con el título de la tarea visible.
  - Hay exactamente 3 botones de acción de estado: `"En curso"`, `"Completada"`, `"Con incidencia"`.
  - Los botones son visibles, tienen contraste suficiente y son accesibles por teclado (rol ARIA `button`).
  - Hay un campo de texto para añadir nota libre (textarea o input) etiquetado apropiadamente.
  - Hay un botón para cerrar el panel sin realizar cambios.
- **Type**: e2e (Playwright) | manual
- **Priority**: high

---

### TC-02: El estado `pendiente` actual se refleja visualmente en el panel de acciones

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` tiene `estado: 'pendiente'`.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Observar el estado activo resaltado en el panel.
- **Expected Result**:
  - El estado actual `pendiente` está indicado visualmente (p.ej. botón resaltado, chip, badge o texto de estado).
  - Los otros 3 botones de acción aparecen como opciones alternativas no activas.
- **Type**: e2e (Playwright) | unit (TaskActionSheet)
- **Priority**: medium

---

### TC-03: Cambio de estado a `en_curso` — optimistic update antes de respuesta del servidor

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` con `estado: 'pendiente'`. Red en funcionamiento.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Pulsar el botón `"En curso"` en el panel de acciones.
  3. Observar la tarjeta de la tarea en la agenda **inmediatamente** (sin esperar a respuesta del servidor).
- **Expected Result**:
  - La tarjeta de `tarea-001` refleja el nuevo estado `en_curso` **de forma inmediata** (antes de que el servidor confirme).
  - El indicador visual de estado cambia sin delay perceptible (< 100 ms desde el click).
  - El panel de acciones se cierra o muestra confirmación.
  - Segundos después, Firestore confirma la escritura sin revertir el estado.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-04: Cambio de estado a `completada` — el campo `completadaEn` se registra en Firestore

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` con `estado: 'pendiente'`.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Pulsar el botón `"Completada"`.
  3. Verificar en Firestore (vía emulador UI o SDK) el documento `tarea-001`.
- **Expected Result**:
  - El campo `estado` del documento es `'completada'`.
  - El campo `completadaEn` tiene un valor de tipo timestamp (no null).
  - El campo `actualizadoEn` se ha actualizado con el timestamp del servidor.
  - El campo `usuarioId` permanece con el valor `'uid-gerocultor-01'` (no se sobreescribe).
  - En la UI, la tarea muestra el nuevo estado `completada`.
- **Type**: e2e (Playwright) | integration (Firestore Emulator)
- **Priority**: high

---

### TC-05: Rollback de optimistic update cuando el servidor falla

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` con `estado: 'pendiente'`. Se simula un fallo de red o rechazo de Firestore (mock o regla temporal que deniega la escritura).
- **Steps**:
  1. Configurar el mock de `updateDoc` (o Firestore Rules) para que lance un error en la escritura.
  2. Tap/click sobre `tarea-001`.
  3. Pulsar el botón `"En curso"`.
  4. Observar la UI inmediatamente después del click (optimistic) y después del fallo.
- **Expected Result**:
  - Inmediatamente tras el click, el estado en UI cambia a `en_curso` (optimistic update).
  - Tras el fallo del servidor (error de escritura), la UI **revierte** al estado anterior `pendiente`.
  - Se muestra un mensaje de error al usuario (toast, banner o similar) indicando que el cambio no se pudo guardar.
  - El store de Pinia refleja el estado revertido.
  - No quedan datos inconsistentes en la UI.
- **Type**: unit (Vitest — `useAgendaStore` con mock de Firestore) | e2e (Playwright con red simulada offline)
- **Priority**: high

---

### TC-06: Añadir nota libre junto al cambio de estado

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` con `notas: null`.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Escribir en el campo de nota: `"Residente no cooperó al inicio, finalizó bien"`.
  3. Pulsar el botón `"Completada"`.
  4. Verificar en Firestore el documento `tarea-001`.
- **Expected Result**:
  - El campo `notas` del documento en Firestore contiene `"Residente no cooperó al inicio, finalizó bien"`.
  - El campo `estado` es `'completada'`.
  - La nota es visible en la vista de detalle de la tarea tras el cambio.
  - El campo `notas` acepta hasta al menos 500 caracteres sin truncar.
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-07: Marcar como `con_incidencia` muestra CTA para ir al formulario de incidencias

- **Preconditions**: Usuario `test.gerocultor@example.com` en `/agenda`. `tarea-001` con `estado: 'pendiente'`.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Pulsar el botón `"Con incidencia"`.
  3. Observar la UI tras el cambio de estado.
- **Expected Result**:
  - El estado de la tarea se actualiza a `con_incidencia` en la UI (optimistic).
  - Aparece un elemento CTA (botón, banner o dialog) con texto del tipo `"Registrar incidencia"` o `"Iniciar registro de incidencia"`.
  - Al pulsar el CTA, el usuario es llevado al formulario de incidencias (ruta `/incidencias/nueva` o equivalente), con el `tareaId` pre-cargado en el formulario si aplica (RF-06 / US-06).
  - El CTA es distinguible y accesible (tiene `role="button"` o es un enlace navegable).
- **Type**: e2e (Playwright) | unit (TaskActionSheet)
- **Priority**: high

---

### TC-08: El update en Firestore incluye `actualizadoEn` y `usuarioId` correcto

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado.
- **Steps**:
  1. Mediante `@firebase/rules-unit-testing` (o test de integración), llamar a la función de update de tarea con `estado: 'en_curso'`.
  2. Leer el documento resultante en Firestore.
  3. Verificar los campos de auditoría.
- **Expected Result**:
  - `actualizadoEn` tiene un valor de tipo `Timestamp` de Firestore (no una fecha del cliente).
  - El campo `usuarioId` sigue siendo `'uid-gerocultor-01'` (el gerocultor asignado, no se cambia con el update).
  - El documento **no** contiene campos extra no definidos en `SPEC/entities.md`.
  - Si el estado es `completada`, `completadaEn` también está presente como `Timestamp`.
  - Si el estado es `en_curso`, `completadaEn` permanece `null`.
- **Type**: integration (Firestore Emulator + `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-09: Firestore Rules — gerocultor propietario puede actualizar su propia tarea

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado con Custom Claim `rol: 'gerocultor'`. Documento `tarea-001` con `usuarioId: 'uid-gerocultor-01'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con contexto `uid-gerocultor-01, { rol: 'gerocultor' }`.
  2. Intentar `updateDoc` sobre `/residentes/res-001/tareas/tarea-001` con `{ estado: 'completada', actualizadoEn: serverTimestamp() }`.
  3. Observar si la operación es permitida.
- **Expected Result**:
  - La regla `allow update: if isResourceOwner() || hasAnyRole(['coordinador', 'administrador'])` permite la operación.
  - `assertSucceeds(...)` no lanza error.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-10: Firestore Rules — gerocultor NO puede actualizar una tarea de otro gerocultor

- **Preconditions**: Firebase Emulator activo. Usuario `uid-gerocultor-01` autenticado. Documento `tarea-002` con `usuarioId: 'uid-gerocultor-02'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con contexto `uid-gerocultor-01, { rol: 'gerocultor' }`.
  2. Intentar `updateDoc` sobre `/residentes/res-001/tareas/tarea-002` con `{ estado: 'completada' }`.
  3. Observar si la operación es denegada.
- **Expected Result**:
  - La regla deniega el acceso porque `request.auth.uid !== resource.data.usuarioId` y el rol no es elevado.
  - `assertFails(...)` pasa sin error.
  - La operación lanza `FirebaseError: Missing or insufficient permissions`.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-11: Firestore Rules — coordinador puede actualizar cualquier tarea

- **Preconditions**: Firebase Emulator activo. Usuario `uid-coordinador-01` autenticado con Custom Claim `rol: 'coordinador'`. Documento `tarea-001` con `usuarioId: 'uid-gerocultor-01'`.
- **Steps**:
  1. Inicializar `@firebase/rules-unit-testing` con contexto `uid-coordinador-01, { rol: 'coordinador' }`.
  2. Intentar `updateDoc` sobre `/residentes/res-001/tareas/tarea-001` con `{ estado: 'en_curso', actualizadoEn: serverTimestamp() }`.
  3. Observar si la operación es permitida.
- **Expected Result**:
  - La regla `allow update: if hasAnyRole(['coordinador', 'administrador'])` permite la operación.
  - `assertSucceeds(...)` pasa sin error.
- **Type**: unit (Firestore Rules — `@firebase/rules-unit-testing`)
- **Priority**: high

---

### TC-12: Persistencia verificada tras recarga de página (e2e completo)

- **Preconditions**: Usuario `test.gerocultor@example.com` autenticado en `/agenda`. `tarea-001` con `estado: 'pendiente'`.
- **Steps**:
  1. Tap/click sobre `tarea-001`.
  2. Escribir nota: `"Completado sin incidencias"`.
  3. Pulsar `"Completada"`.
  4. Esperar confirmación visual del cambio.
  5. Recargar la página (`F5` / `Cmd+R`).
  6. Localizar de nuevo `tarea-001` en la agenda.
- **Expected Result**:
  - Tras la recarga, `tarea-001` muestra estado `completada` (no `pendiente`).
  - La nota `"Completado sin incidencias"` es visible en el detalle de la tarea.
  - El campo `completadaEn` tiene un valor de timestamp en Firestore.
  - No se muestra ningún error de sincronización.
- **Type**: e2e (Playwright)
- **Priority**: high

---

## Unit Tests (Vitest)

### `useAgendaStore` — `updateTaskStatus()` action

```typescript
// stores/useAgendaStore.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useAgendaStore } from '@/stores/useAgendaStore'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock de Firestore updateDoc
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>()
  return {
    ...actual,
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
  }
})

describe('useAgendaStore — updateTaskStatus()', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should apply optimistic update immediately before server confirmation', async () => {
    const store = useAgendaStore()
    // Seed una tarea en el store
    store.tareas = [
      {
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      },
    ]
    // updateDoc tarda pero la UI no debe esperar
    const { updateDoc } = await import('firebase/firestore')
    ;(updateDoc as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((resolve) => setTimeout(resolve, 500))
    )
    const promise = store.updateTaskStatus('tarea-001', 'en_curso')
    // El estado ya cambió en el store ANTES de que resuelva la promesa
    expect(store.tareas[0].estado).toBe('en_curso')
    await promise
    // Sigue en el estado correcto tras confirmación
    expect(store.tareas[0].estado).toBe('en_curso')
  })

  it('should revert to previous state if server update fails (rollback)', async () => {
    const store = useAgendaStore()
    store.tareas = [
      {
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      },
    ]
    const { updateDoc } = await import('firebase/firestore')
    ;(updateDoc as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Firestore: Missing or insufficient permissions.')
    )
    await expect(
      store.updateTaskStatus('tarea-001', 'en_curso')
    ).rejects.toThrow()
    // El estado debe haber vuelto a 'pendiente'
    expect(store.tareas[0].estado).toBe('pendiente')
    // El store debe exponer un mensaje de error
    expect(store.error).not.toBeNull()
  })

  it('should set completadaEn when estado is completada', async () => {
    const store = useAgendaStore()
    store.tareas = [
      {
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      },
    ]
    const { updateDoc } = await import('firebase/firestore')
    ;(updateDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined)
    await store.updateTaskStatus('tarea-001', 'completada')
    expect(store.tareas[0].completadaEn).not.toBeNull()
  })

  it('should NOT set completadaEn when estado is en_curso', async () => {
    const store = useAgendaStore()
    store.tareas = [
      {
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      },
    ]
    const { updateDoc } = await import('firebase/firestore')
    ;(updateDoc as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined)
    await store.updateTaskStatus('tarea-001', 'en_curso')
    expect(store.tareas[0].completadaEn).toBeNull()
  })

  it('should save notas field together with estado update', async () => {
    const store = useAgendaStore()
    store.tareas = [
      {
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      },
    ]
    const { updateDoc } = await import('firebase/firestore')
    const mockUpdateDoc = updateDoc as ReturnType<typeof vi.fn>
    mockUpdateDoc.mockResolvedValueOnce(undefined)
    await store.updateTaskStatus('tarea-001', 'completada', 'Nota de prueba')
    // El payload enviado a Firestore debe incluir notas
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ notas: 'Nota de prueba', estado: 'completada' })
    )
    expect(store.tareas[0].notas).toBe('Nota de prueba')
  })
})
```

---

### `TaskActionSheet` component

```typescript
// components/TaskActionSheet.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import TaskActionSheet from '@/components/TaskActionSheet.vue'

const tareaBase = {
  id: 'tarea-001',
  titulo: 'Aseo matinal',
  tipo: 'higiene' as const,
  estado: 'pendiente' as const,
  notas: null,
  residenteId: 'res-001',
  usuarioId: 'uid-gerocultor-01',
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  completadaEn: null,
  fechaHora: new Date(),
}

describe('TaskActionSheet', () => {
  it('should render 3 status action buttons', () => {
    const wrapper = mount(TaskActionSheet, { props: { tarea: tareaBase } })
    const buttons = wrapper.findAll('[data-testid^="btn-estado-"]')
    expect(buttons).toHaveLength(3)
    const labels = buttons.map((b) => b.text())
    expect(labels).toContain('En curso')
    expect(labels).toContain('Completada')
    expect(labels).toContain('Con incidencia')
  })

  it('should render a textarea for nota libre', () => {
    const wrapper = mount(TaskActionSheet, { props: { tarea: tareaBase } })
    const textarea = wrapper.find('[data-testid="nota-textarea"]')
    expect(textarea.exists()).toBe(true)
  })

  it('should emit update-estado with correct payload when "Completada" is clicked', async () => {
    const wrapper = mount(TaskActionSheet, { props: { tarea: tareaBase } })
    const textarea = wrapper.find('[data-testid="nota-textarea"]')
    await textarea.setValue('Mi nota')
    const btnCompletada = wrapper.find('[data-testid="btn-estado-completada"]')
    await btnCompletada.trigger('click')
    expect(wrapper.emitted('update-estado')).toBeTruthy()
    expect(wrapper.emitted('update-estado')![0]).toEqual([
      { estado: 'completada', notas: 'Mi nota' },
    ])
  })

  it('should show incidencia CTA when estado is con_incidencia', async () => {
    const wrapper = mount(TaskActionSheet, {
      props: { tarea: { ...tareaBase, estado: 'con_incidencia' } },
    })
    const cta = wrapper.find('[data-testid="cta-incidencia"]')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toMatch(/incidencia/i)
  })

  it('should NOT show incidencia CTA for other states', () => {
    const wrapper = mount(TaskActionSheet, {
      props: { tarea: { ...tareaBase, estado: 'completada' } },
    })
    const cta = wrapper.find('[data-testid="cta-incidencia"]')
    expect(cta.exists()).toBe(false)
  })

  it('should display current task estado visually highlighted', () => {
    const wrapper = mount(TaskActionSheet, {
      props: { tarea: { ...tareaBase, estado: 'en_curso' } },
    })
    const btn = wrapper.find('[data-testid="btn-estado-en_curso"]')
    // El botón del estado actual debe tener clase activa o aria-pressed=true
    expect(
      btn.classes().some((c) => c.includes('active') || c.includes('selected')) ||
      btn.attributes('aria-pressed') === 'true'
    ).toBe(true)
  })
})
```

---

### Firestore Rules — update de tareas

```typescript
// tests/firestore-rules/tareas-update.spec.ts
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gerocultores-emulator',
    firestore: {
      rules: readFileSync('code/firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  })
})

beforeEach(async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    // Seed tarea-001: propietario uid-gerocultor-01
    await db
      .doc('residentes/res-001/tareas/tarea-001')
      .set({
        id: 'tarea-001',
        titulo: 'Aseo matinal',
        tipo: 'higiene',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-01',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      })
    // Seed tarea-002: propietario uid-gerocultor-02
    await db
      .doc('residentes/res-001/tareas/tarea-002')
      .set({
        id: 'tarea-002',
        titulo: 'Medicación',
        tipo: 'medicacion',
        estado: 'pendiente',
        notas: null,
        residenteId: 'res-001',
        usuarioId: 'uid-gerocultor-02',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        completadaEn: null,
        fechaHora: new Date(),
      })
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('Firestore Rules — tareas update', () => {
  it('TC-09: gerocultor propietario puede actualizar su propia tarea', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    await assertSucceeds(
      db.doc('residentes/res-001/tareas/tarea-001').update({
        estado: 'completada',
        actualizadoEn: new Date(),
      })
    )
  })

  it('TC-10: gerocultor NO puede actualizar tarea de otro gerocultor', async () => {
    const db = testEnv
      .authenticatedContext('uid-gerocultor-01', { rol: 'gerocultor' })
      .firestore()
    await assertFails(
      db.doc('residentes/res-001/tareas/tarea-002').update({
        estado: 'completada',
        actualizadoEn: new Date(),
      })
    )
  })

  it('TC-11: coordinador puede actualizar cualquier tarea', async () => {
    const db = testEnv
      .authenticatedContext('uid-coordinador-01', { rol: 'coordinador' })
      .firestore()
    await assertSucceeds(
      db.doc('residentes/res-001/tareas/tarea-001').update({
        estado: 'en_curso',
        actualizadoEn: new Date(),
      })
    )
  })

  it('usuario no autenticado NO puede actualizar tareas', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      db.doc('residentes/res-001/tareas/tarea-001').update({
        estado: 'completada',
      })
    )
  })
})
```

---

## E2E Tests (Playwright)

```typescript
// frontend/tests/e2e/update-task-status.spec.ts
import { test, expect } from '@playwright/test'

// Helper: autenticar con el emulador antes de los tests
test.beforeEach(async ({ page }) => {
  // Usar el emulador de Firebase Auth
  await page.goto('http://localhost:5173/login')
  await page.fill('[data-testid="email-input"]', 'test.gerocultor@example.com')
  await page.fill('[data-testid="password-input"]', 'Test1234!')
  await page.click('[data-testid="submit-btn"]')
  await page.waitForURL('**/agenda')
})

test('TC-01: tap en tarea abre panel con 3 botones de estado', async ({ page }) => {
  // La tarea debe estar visible en la agenda
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  // Verificar que aparece el panel de acciones
  await expect(page.getByTestId('task-action-sheet')).toBeVisible()
  await expect(page.getByTestId('btn-estado-en_curso')).toBeVisible()
  await expect(page.getByTestId('btn-estado-completada')).toBeVisible()
  await expect(page.getByTestId('btn-estado-con_incidencia')).toBeVisible()
  await expect(page.getByTestId('nota-textarea')).toBeVisible()
})

test('TC-03: cambio de estado a en_curso aplica optimistic update inmediatamente', async ({ page }) => {
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  await page.getByTestId('btn-estado-en_curso').click()
  // Inmediatamente (sin esperar respuesta de servidor) la tarjeta debe reflejar el nuevo estado
  await expect(page.getByTestId('tarea-estado-tarea-001')).toHaveText(/en.curso/i)
})

test('TC-05: rollback cuando el servidor falla', async ({ page }) => {
  // Bloquear la escritura a Firestore simulando error de red
  await page.route('**/firestore.googleapis.com/**', (route) => route.abort('failed'))
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  await page.getByTestId('btn-estado-en_curso').click()
  // Debe revertir al estado anterior y mostrar error
  await expect(page.getByTestId('tarea-estado-tarea-001')).toHaveText(/pendiente/i, { timeout: 5000 })
  await expect(page.getByTestId('error-toast')).toBeVisible()
})

test('TC-06: añadir nota libre junto al cambio de estado', async ({ page }) => {
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  await page.getByTestId('nota-textarea').fill('Residente no cooperó al inicio, finalizó bien')
  await page.getByTestId('btn-estado-completada').click()
  // Verificar que la nota es visible en el detalle de la tarea
  await tareaCard.tap()
  await expect(page.getByTestId('task-action-sheet')).toContainText('Residente no cooperó al inicio, finalizó bien')
})

test('TC-07: con_incidencia muestra CTA para formulario de incidencias', async ({ page }) => {
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  await page.getByTestId('btn-estado-con_incidencia').click()
  // Debe aparecer el CTA de incidencia
  await expect(page.getByTestId('cta-incidencia')).toBeVisible()
  // Al pulsar el CTA, debe navegar al formulario de incidencias
  await page.getByTestId('cta-incidencia').click()
  await expect(page).toHaveURL(/incidencias\/nueva/)
})

test('TC-12: persistencia verificada tras recarga de página', async ({ page }) => {
  const tareaCard = page.getByTestId('tarea-card-tarea-001')
  await tareaCard.tap()
  await page.getByTestId('nota-textarea').fill('Completado sin incidencias')
  await page.getByTestId('btn-estado-completada').click()
  // Esperar confirmación visual
  await expect(page.getByTestId('tarea-estado-tarea-001')).toHaveText(/completada/i)
  // Recargar página
  await page.reload()
  await page.waitForURL('**/agenda')
  // El estado debe persistir
  await expect(page.getByTestId('tarea-estado-tarea-001')).toHaveText(/completada/i)
  // La nota debe persistir (abrir detalle)
  await page.getByTestId('tarea-card-tarea-001').tap()
  await expect(page.getByTestId('task-action-sheet')).toContainText('Completado sin incidencias')
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Tap en tarea abre panel con acción para marcar `completada`, `en_curso` o `con_incidencia` | TC-01, TC-02 | ⬜ Pending |
| CA-2: Estado actualizado se refleja inmediatamente en la agenda (optimistic update) | TC-03, TC-05 (rollback) | ⬜ Pending |
| CA-3: Se puede añadir nota libre (texto) a la tarea | TC-06, unit `useAgendaStore` `should save notas` | ⬜ Pending |
| CA-4: Cambio de estado queda registrado con timestamp y usuario en el servidor | TC-04, TC-08 | ⬜ Pending |
| CA-5: Marcar `con_incidencia` propone iniciar flujo de incidencias (US-06) | TC-07, unit `TaskActionSheet` `cta-incidencia` | ⬜ Pending |
| Rollback si servidor falla | TC-05, unit `useAgendaStore` `should revert on failure` | ⬜ Pending |
| Solo propietario o coordinador puede actualizar la tarea (Firestore Rules) | TC-09, TC-10, TC-11 | ⬜ Pending |
| `completadaEn` se asigna solo al pasar a `completada` | TC-04, unit `useAgendaStore` `completadaEn` | ⬜ Pending |
| Persistencia verificada tras recarga | TC-12 | ⬜ Pending |

---

## Automation Notes

- **Unit tests — Store** (Vitest): `frontend/src/stores/useAgendaStore.spec.ts`
  - Mock de `firebase/firestore` con `vi.mock` para simular éxitos y fallos de `updateDoc`
  - Ejecutar con: `cd frontend && npx vitest run stores/useAgendaStore.spec.ts`

- **Unit tests — Component** (Vitest + Vue Test Utils): `frontend/src/components/TaskActionSheet.spec.ts`
  - Montar `TaskActionSheet` con distintas props de `tarea` para verificar renderizado condicional
  - Verificar `data-testid` en todos los elementos interactivos

- **Unit tests — Firestore Rules** (`@firebase/rules-unit-testing`): `tests/firestore-rules/tareas-update.spec.ts`
  - Requieren Firestore Emulator activo en `localhost:8080`
  - Usar `testEnv.withSecurityRulesDisabled` para el seed de datos previo a cada test
  - Ejecutar con: `firebase emulators:exec --only firestore "vitest run tests/firestore-rules/tareas-update.spec.ts"`

- **E2E tests** (Playwright): `frontend/tests/e2e/update-task-status.spec.ts`
  - Requieren todos los emuladores activos (Auth:9099, Firestore:8080) y frontend en `localhost:5173`
  - TC-05 (rollback) usa `page.route()` de Playwright para interceptar y abortar requests a Firestore
  - Ejecutar con: `npx playwright test update-task-status.spec.ts`

- **`data-testid` requeridos** (convención para que tests e2e funcionen):
  - `tarea-card-{id}` — tarjeta de tarea en la agenda
  - `tarea-estado-{id}` — indicador de estado en la tarjeta
  - `task-action-sheet` — panel de acciones (bottom sheet / modal)
  - `btn-estado-en_curso`, `btn-estado-completada`, `btn-estado-con_incidencia` — botones de cambio de estado
  - `nota-textarea` — campo de nota libre
  - `cta-incidencia` — botón/enlace para iniciar registro de incidencia
  - `error-toast` — mensaje de error en caso de fallo

- **Manual only**: ninguno — todos los test cases tienen cobertura automatizable

- **Seed de datos**: usar el script `tests/fixtures/emulator-seed.ts` (ya definido en test-plan-US-02) para pre-cargar las tareas del emulador antes de ejecutar los tests E2E

---

## Meta

- **User Story**: US-04
- **Requisito relacionado**: RF-04
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-07
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Ready
