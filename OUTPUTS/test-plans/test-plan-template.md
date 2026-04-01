# Test Plan — US-XX: [nombre de la historia de usuario]

> **Guardrail G03**: Todo feature MUST tener un test plan antes de aprobar el PR.
> Copia esta plantilla y renómbrala `test-plan-US-XX.md`.

---

## Scope

[Qué cubre este test plan: funcionalidad, roles implicados, condiciones de frontera.
Qué NO cubre (out of scope).]

**User Story**: US-XX — [título]
**Prioridad**: Must | Should | Could
**Sprint**: Sprint-X

---

## Preconditions (globales)

- [Condición inicial del sistema para todos los casos de este plan]
- [Ejemplo: Usuario autenticado con rol `gerocultor`]
- [Ejemplo: Firebase Emulator activo en localhost]

---

## Test Cases

### TC-01: [nombre del caso — acción + resultado esperado]

- **Preconditions**: [Estado inicial específico para este caso]
- **Steps**:
  1. [Paso 1]
  2. [Paso 2]
  3. [Paso 3]
- **Expected Result**: [Resultado observable y verificable]
- **Type**: unit | integration | e2e | manual
- **Priority**: high | medium | low

---

### TC-02: [caso negativo / error esperado]

- **Preconditions**: [Estado inicial]
- **Steps**:
  1. [Paso 1]
  2. [Paso 2]
- **Expected Result**: [Comportamiento esperado ante error]
- **Type**: unit | integration | e2e | manual
- **Priority**: high | medium | low

---

### TC-03: [caso de frontera / edge case]

- **Preconditions**: [Estado inicial]
- **Steps**:
  1. [Paso 1]
- **Expected Result**: [Resultado]
- **Type**: unit | integration | e2e | manual
- **Priority**: medium | low

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: [descripción] | TC-01 | ⬜ Pending |
| CA-2: [descripción] | TC-02 | ⬜ Pending |
| CA-3: [descripción] | TC-03 | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `[ruta al archivo de test]`
- **E2E tests** (Playwright): `[ruta al archivo de test]`
- **Manual only**: [casos que no se pueden automatizar y por qué]

---

## Meta

- **User Story**: US-XX
- **Guardrail**: G03 compliant ✅
- **Created**: YYYY-MM-DD
- **Author**: [Tester Agent / nombre]
- **Status**: Draft | Ready | Approved
