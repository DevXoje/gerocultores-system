# ADR-07: Testing Strategy — Vitest (unit/component), Playwright (E2E), @firebase/rules-unit-testing (Firestore rules)

- **Estado**: ACCEPTED
- **Fecha**: 2026-04-18
- **Fecha de aceptación**: 2026-04-18
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Relacionado con**: ADR-01b (Vue 3 + Vite + TypeScript), ADR-02b (Firestore + Express), ADR-06 (CI Tooling)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-18.**

## Contexto

El proyecto GeroCare utiliza un stack mixto: Vue 3 + TypeScript en el frontend, Express + TypeScript en el backend, y Firebase (Auth + Firestore) como capa de datos. Necesitamos definir una estrategia de testing coherente que cubra:

1. **Lógica de negocio y servicios** (backend Express + servicios Firestore)
2. **Componentes Vue** (frontend)
3. **Flujos de usuario completos** (E2E)
4. **Reglas de seguridad de Firestore** (validación de acceso por rol)

La estrategia debe ser pragmática dado el deadline del proyecto (2026-05-18) y el contexto académico (proyecto DAW individual).

## Opciones consideradas

### Testing unitario / componentes

#### Opción A — Vitest para frontend y backend (elegida)
- **Pro**: Un único test runner para todo el proyecto. Vitest es el estándar de facto para proyectos Vite/Vue 3. Compatible con `@vue/test-utils` para componentes. Compatibilidad con el entorno Node.js sin configuración adicional para el backend Express. Velocidad superior a Jest. API compatible con Jest (migración trivial si fuera necesario).
- **Contra**: Requiere configuraciones separadas para frontend (jsdom) y backend (node).

#### Opción B — Jest para backend + Vitest para frontend
- **Pro**: Jest es más maduro y tiene mayor ecosistema.
- **Contra**: Dos test runners con configuraciones distintas. Mayor complejidad de mantenimiento. Innecesario dado que Vitest cubre ambos casos.

#### Opción C — Jest para todo el proyecto
- **Pro**: Un único runner con larga trayectoria.
- **Contra**: Configuración más pesada para proyectos Vite. No es el estándar recomendado para Vue 3 + Vite.

### Testing E2E

#### Opción A — Playwright (elegida)
- **Pro**: Ya documentado en ADR-06 como herramienta de CI. Consistencia con decisiones previas. Soporte oficial para Vue. Configurado con `PLAYWRIGHT_TEST_BASE_URL` para entornos CI/CD.
- **Contra**: Requiere el emulador Firebase para pruebas E2E completas (ver punto de Firestore Rules abajo).

#### Opción B — Cypress
- **Pro**: API más orientada a desarrolladores web. Buena documentación.
- **Contra**: No alineado con ADR-06. Introduce una segunda herramienta de testing E2E. Mayor coste de setup.

### Testing de Reglas de Seguridad Firestore

#### Opción A — @firebase/rules-unit-testing con Firebase Emulator Suite (elegida, diferida a Sprint-3)
- **Pro**: Herramienta oficial de Firebase para validar las reglas de `firestore.rules` de forma aislada sin producción. Permite simular usuarios autenticados con claims personalizados. Integra con Vitest (runner compatible).
- **Contra**: Requiere el Firebase Emulator Suite instalado y en ejecución. Añade complejidad al pipeline de CI. Se difiere a Sprint-3 para no bloquear el Sprint actual.

#### Opción B — Tests manuales contra Firestore real (en entorno de desarrollo)
- **Pro**: Sin configuración adicional.
- **Contra**: No reproducible. No automatizable. Riesgo de afectar datos reales.

## Decisión

Se adopta la siguiente estrategia por capas:

| Capa | Herramienta | Entorno | Cuando |
|------|-------------|---------|--------|
| Servicios backend (Express, lógica de negocio) | Vitest | `node` | Sprint actual |
| Componentes Vue (frontend) | Vitest + `@vue/test-utils` | `jsdom` | Sprint actual |
| Integración HTTP (routes + controllers) | Vitest + Supertest | `node` | Sprint actual |
| Flujos E2E | Playwright (Chromium) | Firebase Emulator | Sprint-2 en adelante |
| Reglas de seguridad Firestore | `@firebase/rules-unit-testing` | Firebase Emulator | Sprint-3 (diferido) |

**Cobertura**: Se reporta mediante `vitest --coverage` usando `@vitest/coverage-v8` (alineado con ADR-06).

**Test co-location**: Los archivos de test se ubican junto al archivo que prueban con el sufijo `.spec.ts` (convención del proyecto, documentada en `code/api/AGENTS.md`).

## Consecuencias

- **Positivas**:
  - Un único runner (Vitest) para backend y frontend elimina configuración duplicada.
  - Tests de lógica de negocio y servicios se ejecutan sin emulador Firebase, lo que acelera el ciclo de desarrollo.
  - `@firebase/rules-unit-testing` garantizará que las reglas de Firestore estén validadas automáticamente una vez activado en Sprint-3.
  - Reportes de cobertura unificados con `@vitest/coverage-v8`.
- **Negativas**:
  - Los tests E2E y de reglas Firestore requieren el emulador (Firebase Emulator Suite). CI tarda más cuando están activos.
  - Diferir `@firebase/rules-unit-testing` a Sprint-3 introduce un riesgo temporal: las reglas no estarán validadas automáticamente hasta entonces.
- **Deuda documentada**: Activar `@firebase/rules-unit-testing` en Sprint-3. Actualizar este ADR con la configuración del emulador cuando se implemente.

## Archivos de configuración relacionados

- `code/api/vitest.config.ts` — configuración Vitest para el backend (a crear)
- `code/frontend/vite.config.ts` — configuración Vitest para el frontend (ya existente, ver ADR-06)
- `code/api/src/**/*.spec.ts` — tests unitarios del backend

## Referencias

- [Vitest: Getting Started](https://vitest.dev/guide/)
- [Vitest: Testing with jsdom](https://vitest.dev/config/#environment)
- [@firebase/rules-unit-testing](https://firebase.google.com/docs/rules/unit-tests)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- ADR-01b — Stack frontend (Vue 3 + Vite + TypeScript)
- ADR-02b — Backend: Firestore + Express
- ADR-06 — CI Tooling (ESLint, Prettier, Playwright, Vitest)
