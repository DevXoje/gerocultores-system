# ADR-06: CI Tooling — ESLint 9, Prettier 3, Playwright (Chromium), Vitest (jsdom), PLAYWRIGHT_TEST_BASE_URL

- **Estado**: ACCEPTED
- **Fecha**: 2026-04-12
- **Fecha de aceptación**: 2026-04-12
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Relacionado con**: ADR-01b (Vue 3 + Vite + TypeScript)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-12.**

## Contexto

El stack frontend elegido en ADR-01b (Vue 3 + Vite + TypeScript) requiere un conjunto de herramientas de CI para linting, formateo, testing E2E y testing unitario. Estas decisiones son corolarios directos de ADR-01b y complementan la infraestructura de calidad del proyecto. Este ADR las documenta formalmente para satisfacer G02 (toda decisión técnica relevante debe tener un ADR) y para proveer justificación explícita al revisor GGA.

Las decisiones aquí documentadas son estándar de la industria para proyectos Vue 3 + TypeScript + Vite. No obstante, se registran porque el revisor automatizado las identificó como potencialmente no documentadas.

## Opciones consideradas

### Linting

#### Opción A — ESLint 9 flat config con `typescript-eslint` + `eslint-plugin-vue` + `eslint-config-prettier` (elegida)
- **Pro**: Configuración oficial recomendada por `typescript-eslint` y `eslint-plugin-vue`. ESLint 9 flat config es el estándar migrado desde ESLint 8 `.eslintrc`. Integración con Prettier vía `eslint-config-prettier` evita conflictos de reglas.
- **Contra**: Breaking change respecto a ESLint 8 (`.eslintrc` → `eslint.config.js`).

#### Opción B — ESLint 8 con `.eslintrc`
- **Pro**: API legacy más familiar.
- **Contra**: Deprecado. ESLint 8 ya no recibe actualizaciones. La migración es inevitable.

### Formateo

#### Opción A — Prettier 3 integrado via `eslint-config-prettier` (elegida)
- **Pro**: Estándar de la industria en el ecosistema Vue. `eslint-config-prettier` desactiva reglas de ESLint que conflictan con Prettier. Configuración zero-config en la mayoría de casos.
- **Contra**: Añade una dependencia de desarrollo adicional.

#### Opción B — Solo ESLint con reglas de estilo
- **Pro**: Una herramienta menos.
- **Contra**: Las reglas de estilo de ESLint son menos potentes que Prettier. No es la práctica estándar en Vue.

### Testing E2E

#### Opción A — Playwright con Chromium únicamente en CI (elegida)
- **Pro**: La documentación oficial de Playwright indica explícitamente: _"Using the default Playwright configuration with the latest Chromium is a good idea most of the time."_ Chromium cubre Chrome y Edge (basados en Blink). Para un proyecto académico con deadline fijo, el coste de multi-browser supera el beneficio.
- **Contra**: Firefox y WebKit no se testean en CI.

#### Opción B — Playwright multi-browser (Chromium + Firefox + WebKit)
- **Pro**: Cobertura completa de navegadores.
- **Contra**: Tiempo de CI 3x mayor, mayor coste de mantenimiento. Innecesario para un proyecto DAW individual.

### Testing unitario — entorno

#### Opción A — Vitest con `environment: 'jsdom'` (elegida)
- **Pro**: La documentación oficial de Vitest presenta `jsdom` como el entorno estándar para aplicaciones web que requieren `window`, `document`, `localStorage`, y APIs del DOM. Compatible con `@vue/test-utils`. Requerido para tests de componentes Vue.
- **Contra**: jsdom no es un navegador real (no hay CSS rendering, no hay layout real).

#### Opción B — Vitest con `environment: 'happy-dom'`
- **Pro**: Implementación más rápida y ligera que jsdom.
- **Contra**: Menor compatibilidad con APIs del DOM. `@vue/test-utils` documenta jsdom como entorno principal. Posibles diferencias de comportamiento con la app real.

#### Opción C — Vitest con `environment: 'node'` (defecto)
- **Pro**: Más rápido para tests puros de lógica.
- **Contra**: No disponibles las APIs del navegador. Incompatible con tests de componentes Vue.

### Cobertura de tests

#### Opción A — `@vitest/coverage-v8` (elegida)
- **Pro**: Usa la instrumentación de cobertura nativa del motor V8 (el mismo que Node.js y Chrome). Integración zero-config con Vite. Sin instrumentación adicional de código. Es la opción estándar para proyectos Vite/Vitest.
- **Contra**: Requiere Node.js con soporte V8 coverage (≥ v16).

#### Opción B — `@vitest/coverage-istanbul`
- **Pro**: Cobertura basada en Istanbul, compatible con proyectos más antiguos.
- **Contra**: Requiere instrumentación del código fuente en tiempo de build. Mayor overhead. No es necesario cuando V8 coverage está disponible.

### URL base de Playwright

#### Opción A — `PLAYWRIGHT_TEST_BASE_URL` como variable de entorno con fallback (elegida)
- **Pro**: Permite que entornos CI/CD sobreescriban la URL sin modificar código. Sigue el patrón `process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:4173'`. El puerto 4173 es el puerto por defecto de `vite preview`. Es la convención usada en la documentación oficial de CI de Playwright (sección "On deployment" de GitHub Actions). Configurable en CI sin cambios de código.
- **Contra**: Playwright no tiene esta variable integrada de forma nativa — es una convención de configuración.

#### Opción B — URL hardcodeada `http://localhost:4173`
- **Pro**: Más simple, sin variables de entorno adicionales.
- **Contra**: Requiere cambio de código para ejecutar en entornos con puertos diferentes. No se adapta a CI/CD dinámico.

## Decisión

Se adopta el siguiente conjunto de herramientas de CI:

| Herramienta | Elección | Justificación |
|-------------|----------|---------------|
| Linter | ESLint 9 flat config + `typescript-eslint` + `eslint-plugin-vue` | Configuración oficial recomendada para Vue 3 + TypeScript |
| Formateador | Prettier 3 + `eslint-config-prettier` | Estándar del ecosistema Vue; integración sin conflictos con ESLint |
| Testing E2E | Playwright, Chromium-only en CI | Recomendación oficial de Playwright para proyectos individuales con deadline |
| Entorno unitario | Vitest + `environment: 'jsdom'` | Entorno estándar para tests de componentes Vue con APIs del DOM |
| Cobertura | `@vitest/coverage-v8` | Cobertura nativa V8, zero-config para Vite |
| URL base E2E | `process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:4173'` | Convención oficial Playwright CI docs; configurable en CI sin cambios de código |

## Consecuencias

- **Positivas**:
  - Setup de linting alineado con las recomendaciones oficiales de `typescript-eslint` y `eslint-plugin-vue`.
  - CI más rápida y económica con Chromium-only.
  - Tests de componentes Vue funcionan sin configuración adicional con jsdom.
  - Cobertura V8 sin overhead de instrumentación.
  - `PLAYWRIGHT_TEST_BASE_URL` permite CI/CD flexible sin hardcodear URLs (convención documentada en los docs oficiales de Playwright CI).
- **Negativas**:
  - Firefox y WebKit no se testean en CI automáticamente (riesgo bajo para DAW académico).
  - jsdom no detecta errores de CSS layout (riesgo bajo; los tests son unitarios/integración).
- **Deuda documentada**: Si en el futuro se añade multi-browser testing, actualizar este ADR y el workflow de CI.

## Archivos de configuración relacionados

- `code/frontend/eslint.config.js` — ESLint 9 flat config
- `code/frontend/.prettierrc` — Prettier config
- `code/frontend/playwright.config.ts` — Playwright config (Chromium, PLAYWRIGHT_TEST_BASE_URL)
- `code/frontend/vite.config.ts` — Vitest config (jsdom, @vitest/coverage-v8)
- `code/frontend/.env.example` — documentación de PLAYWRIGHT_TEST_BASE_URL

## Referencias

- [typescript-eslint: Getting Started with Vue](https://typescript-eslint.io/getting-started/legacy-eslint-setup/) 
- [eslint-plugin-vue: User Guide](https://eslint.vuejs.org/user-guide/)
- [Playwright: Configuration docs — "Using the default Playwright configuration with the latest Chromium is a good idea most of the time."](https://playwright.dev/docs/test-configuration)
- [Vitest: Environment — jsdom](https://vitest.dev/config/#environment)
- [Vitest: Coverage — v8](https://vitest.dev/guide/coverage)
- ADR-01b — Stack frontend (Vue 3 + Vite + TypeScript)
