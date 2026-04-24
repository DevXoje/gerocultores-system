# Test Plan — US-09: Alta y gestión de residentes

> **Guardrail G03**: Test plan requerido antes de aprobación de PR.
> **User Story**: US-09 — Como administrador, quiero dar de alta nuevos residentes y editar sus fichas, para mantener actualizado el registro de personas atendidas.

---

## Scope

**Cubre**:
- Creación de un nuevo residente con campos obligatorios: `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`
- Edición de todos los campos de la ficha: diagnósticos, alergias, medicación, preferencias
- Archivado (baja) de un residente sin eliminar su historial
- Residente archivado no aparece en agendas activas pero su historial es consultable
- Listado de residentes con indicador de archivado
- Solo administradores pueden crear/editar/archivar residentes

**No cubre (out of scope)**:
- Asignación de residentes a gerocultores (US-10)
- Detalle de residente y consulta de ficha (US-05)
- Historial de incidencias (US-07)
- Eliminación permanente de residentes

**Stack implicado**: Vue 3 + `useResidentesStore` (Pinia) | Express API (`residentes.routes.ts`) | Firebase Firestore (`/residentes`) | Playwright (e2e) | Vitest (unit)

**G04 Compliance Note**: Entity field names from `SPEC/entities.md` — `Residente`:
- `id`, `nombre`, `apellidos`, `fechaNacimiento`, `habitacion`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`, `archivado`, `creadoEn`, `actualizadoEn`
- No aliases. Fields must match exactly.

**Stitch Screen**: `Resident Records` (`projects/16168255182252500555/screens/b21c6314296342708a666893b69b3f12`) — `OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png`

---

## Preconditions (globales)

- Firebase Emulator Suite activo: `firebase emulators:start` (Auth:9099, Firestore:8080)
- API corriendo: `cd code/api && npm run dev` (http://localhost:3000)
- Frontend corriendo: `cd code/frontend && npm run dev` (http://localhost:5173)
- Usuarios de test:
  - `admin@example.com` / `Test1234!` / rol: `admin` / UID: `uid-admin`
  - `gerocultor@example.com` / `Test1234!` / rol: `gerocultor` / UID: `uid-001`
- Seed en Firestore:
  - `/residentes/res-001` — archivado: `false`, con datos completos
  - `/residentes/res-002` — archivado: `true` (para pruebas de archivado)

---

## Test Cases

### TC-01: Admin puede crear residente con campos obligatorios

- **Preconditions**: Admin autenticado. Navegar a `/admin/residentes/nuevo`.
- **Steps**:
  1. Rellenar: `nombre: 'María'`, `apellidos: 'García López'`, `fechaNacimiento: 1955-03-15`, `habitacion: '201-A'`.
  2. Pulsar "Guardar".
- **Expected Result**:
  - HTTP 201 o éxito en Firestore.
  - Se crea documento en `/residentes` con `id` generado (UUID).
  - Los campos `archivado: false`, `creadoEn: <timestamp>`, `actualizadoEn: <timestamp>` se asignan automáticamente.
  - Redirección a la vista de detalle del nuevo residente.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-02: Crear residente — campo obligatorio faltante muestra error de validación

- **Preconditions**: Admin autenticado en formulario de nuevo residente.
- **Steps**:
  1. Dejar `habitacion` vacío.
  2. Intentar guardar.
- **Expected Result**:
  - Mensaje de error junto al campo `habitacion`: "Este campo es obligatorio".
  - La petición a Firestore/API no se realiza.
  - El formulario permanece editable.
- **Type**: e2e (Playwright) | unit (validation schema)
- **Priority**: high

---

### TC-03: Admin puede editar todos los campos de la ficha de un residente

- **Preconditions**: Admin autenticado. Residente `res-001` existe con datos.
- **Steps**:
  1. Navegar a `/admin/residentes/res-001/editar`.
  2. Modificar: `diagnosticos: 'Diabetes tipo 2'`, `alergias: 'Penicilina'`, `medicacion: 'Metformina 850mg'`, `preferencias: 'Prefiere ducha a las 9h'`.
  3. Guardar.
- **Expected Result**:
  - Firestore document `/residentes/res-001` actualizado.
  - `actualizadoEn` modificado al timestamp actual.
  - Los campos de categoría especial RGPD (`diagnosticos`, `alergias`, `medicacion`) se guardan correctamente.
  - No se modifica `creadoEn` ni `id`.
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-04: Admin puede archivar un residente

- **Preconditions**: Admin autenticado. Residente `res-001` tiene `archivado: false`.
- **Steps**:
  1. En la vista de detalle o listado de `res-001`, pulsar "Archivar" o "Dar de baja".
  2. Confirmar la acción en el diálogo de confirmación.
- **Expected Result**:
  - El campo `archivado` del documento en Firestore cambia a `true`.
  - `actualizadoEn` se actualiza.
  - El residente deja de aparecer en las agendas activas (filtro `archivado === false`).
  - El historial de incidencias y tareas sigue siendo accesible.
  - La ficha del residente sigue visible (no se oculta al admin).
- **Type**: e2e (Playwright) | unit
- **Priority**: high

---

### TC-05: Residente archivado NO aparece en agendas activas

- **Preconditions**: Residente `res-001` acaba de ser archivado (`archivado: true`). Existe una tarea programada para `res-001` en la agenda.
- **Steps**:
  1. Como gerocultor, navegar a `/agenda` (vista de agenda diaria).
  2. Observar si la tarea de `res-001` aparece.
- **Expected Result**:
  - Las tareas asociadas a `res-001` NO se muestran en la agenda del gerocultor.
  - El residente archivado no aparece en listados de selección de residente para nuevas tareas.
  - Si se intenta acceder directamente a la ficha de `res-001`, sí es consultable (historial).
- **Type**: e2e (Playwright) | integration
- **Priority**: high

---

### TC-06: Historial de residente archivado es consultable

- **Preconditions**: Admin autenticado. Residente `res-002` está archivado.
- **Steps**:
  1. Navegar a `/residentes/res-002` o `/admin/residentes/res-002`.
  2. Verificar que la ficha es accesible y que hay enlace al historial de incidencias.
- **Expected Result**:
  - La ficha del residente archivado es visible con todos sus datos.
  - El historial de incidencias (US-07) es accesible.
  - Se muestra un indicador visual de que el residente está archivado.
- **Type**: e2e (Playwright)
- **Priority**: medium

---

### TC-07: Listado de residentes — incluye indicador de archivado

- **Preconditions**: Admin autenticado. Existe al menos un residente archivado (`res-002`) y uno activo (`res-001`).
- **Steps**:
  1. Navegar a `/admin/residentes` (listado).
  2. Observar cómo se presentan los residentes archivados.
- **Expected Result**:
  - Los residentes activos (`archivado: false`) se muestran con estilo normal.
  - Los residentes archivados se muestran con estilo diferenciado (ej. texto tachado, badge "Archivado", color apagado) o en una sección separada.
  - El admin puede filtrar entre "Activos", "Archivados" y "Todos".
- **Type**: e2e (Playwright) | unit
- **Priority**: medium

---

### TC-08: Gerocultor NO puede crear residentes — acceso denegado

- **Preconditions**: Gerocultor autenticado. Navegar a `/admin/residentes/nuevo`.
- **Steps**:
  1. Intentar acceder a la ruta de creación de residente como gerocultor.
- **Expected Result**:
  - Vue Router guard redirige a `/403` o `/agenda`.
  - Firestore Security Rules bloquean la escritura.
  - API (si existe endpoint de escritura) retorna HTTP 403.
- **Type**: e2e (Playwright) | unit (Firestore Rules)
- **Priority**: high

---

### TC-09: Gerocultor NO puede editar residentes

- **Preconditions**: Gerocultor autenticado. Intentar editar `/admin/residentes/res-001/editar`.
- **Steps**:
  1. Navegar directamente a la URL de edición de ficha.
- **Expected Result**:
  - Redirect a `/403` o `/agenda`.
  - Si por algún medio se llega al formulario, la手里的 de guardar retorna error (Firestore Rule deny).
- **Type**: e2e (Playwright)
- **Priority**: high

---

### TC-10: Campos RGPD — solo usuarios autenticados pueden acceder a datos sensibles

- **Preconditions**: Firebase Emulator. Intentar acceder a `/residentes/res-001` con usuario no autenticado.
- **Steps**:
  1. Sin sesión activa, llamar directamente a Firestore (o API) para leer `/residentes/res-001`.
- **Expected Result**:
  - Firestore Security Rules deniegan el acceso a campos RGPD (`diagnosticos`, `alergias`, `medicacion`, `preferencias`).
  - Datos `nombre`, `apellidos`, `habitacion` pueden ser accesibles a usuarios autenticados con rol `gerocultor` o `admin`.
- **Type**: unit (Firestore Rules)
- **Priority**: high

---

## Unit Tests (Vitest)

### Validation schema (Zod) for `Residente`

```typescript
// types/residente.types.spec.ts
describe('Residente create schema', () => {
  it('requires nombre, apellidos, fechaNacimiento, habitacion', () => {
    // Assert parsing fails without these fields
  })

  it('accepts valid full Residente object', () => {
    // Assert parsing succeeds with all required + optional fields
  })

  it('rejects invalid fechaNacimiento (future date, non-date string)', () => {
    // Assert validation errors
  })
})
```

### `useResidentesStore` — Pinia store

```typescript
// stores/useResidentesStore.spec.ts
describe('useResidentesStore', () => {
  it('createResidente adds new document to Firestore', async () => {
    // Mock addDoc
    // Call store.createResidente({...})
    // Assert addDoc was called with correct collection and data
  })

  it('updateResidente updates document and sets actualizadoEn', async () => {
    // Mock updateDoc
    // Call store.updateResidente('res-001', {...})
    // Assert updateDoc called with object containing actualizadoEn
  })

  it('archiveResidente sets archivado: true', async () => {
    // Mock updateDoc
    // Call store.archiveResidente('res-001')
    // Assert called with { archivado: true }
  })

  it('fetchResidentes filters out archivado: true by default', async () => {
    // Seed: 1 archived, 2 active
    // Call store.fetchResidentes()
    // Assert store.residentes has only the 2 active
  })

  it('fetchResidentes includes archived when filter is set', async () => {
    // Call store.fetchResidentes({ includeArchived: true })
    // Assert all 3 are returned
  })
})
```

### `ResidenteForm` component

```typescript
// components/ResidenteForm.spec.ts
describe('ResidenteForm', () => {
  it('shows validation errors for missing required fields', async () => {
    // Mount form, try to submit empty
    // Assert error messages per field
  })

  it('emits submit with correct Residente payload on valid submit', async () => {
    // Fill required fields
    // Submit
    // Assert emitted payload has all required fields + archivado: false, creadoEn, actualizadoEn (set by store/API)
  })

  it('shows "Archivar" button only in edit mode', () => {
    // Mount in edit mode → assert archive button visible
    // Mount in create mode → assert archive button absent
  })
})
```

---

## E2E Tests (Playwright)

```typescript
// frontend/tests/e2e/admin-residentes.spec.ts
test('TC-01: admin creates new residente', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('http://localhost:5173/admin/residentes/nuevo')
  await page.fill('[data-testid="input-nombre"]', 'María')
  await page.fill('[data-testid="input-apellidos"]', 'García López')
  await page.fill('[data-testid="input-fechaNacimiento"]', '1955-03-15')
  await page.fill('[data-testid="input-habitacion"]', '201-A')
  await page.click('[data-testid="btn-guardar"]')
  await page.waitForURL(/\/residentes\/[a-z0-9-]+/)
})

test('TC-04: admin archives residente', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('http://localhost:5173/admin/residentes/res-001')
  await page.click('[data-testid="btn-archivar"]')
  await page.click('[data-testid="btn-confirmar-archivar"]')
  await expect(page.locator('[data-testid="badge-archivado"]')).toBeVisible()
})

test('TC-08: gerocultor cannot access create residente route', async ({ page }) => {
  await loginAsGerocultor(page)
  await page.goto('http://localhost:5173/admin/residentes/nuevo')
  await expect(page).toHaveURL(/403|agenda/)
})
```

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: Admin crea residente con campos obligatorios | TC-01, TC-02 | ⬜ Pending |
| CA-2: Admin edita todos los campos de la ficha | TC-03 | ⬜ Pending |
| CA-3: Admin puede archivar sin eliminar historial | TC-04, TC-06 | ⬜ Pending |
| CA-4: Archivado no aparece en agendas activas | TC-05 | ⬜ Pending |
| Listado incluye indicador de archivado | TC-07 | ⬜ Pending |
| Gerocultor no puede crear/editar residentes | TC-08, TC-09 | ⬜ Pending |
| RGPD: campos sensibles solo para usuarios autenticados | TC-10 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/frontend/src/stores/useResidentesStore.spec.ts`, `code/frontend/src/components/ResidenteForm.spec.ts`, `code/frontend/src/types/residente.types.spec.ts`
- **E2E tests** (Playwright): `code/frontend/tests/e2e/admin-residentes.spec.ts`
- **Firestore Rules tests** (`@firebase/rules-unit-testing`): `tests/firestore-rules/residentes-crud.spec.ts`
- **Seed**: ampliar `tests/fixtures/emulator-seed.ts` para incluir residentes archivados

---

## Meta

- **User Story**: US-09
- **Requisito relacionado**: RF-09
- **Guardrail**: G03 compliant ✅
- **G04 Field Names**: ✅ Complies with `SPEC/entities.md` — Residente entity fields
- **Stitch Screen**: `Resident Records` (US-09)
- **Created**: 2026-04-24
- **Author**: Tester Agent (IA) — gerocultores-system
- **Status**: Draft