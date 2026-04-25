# ADR-01b: Switch Frontend a Vue.js + Vite + Tailwind + Pinia + Axios

- **Estado**: ACCEPTED
- **Última revisión**: 2026-04-25 — corregida arquitectura de componentes (feature-based, no Atomic Design)
- **Fecha**: 2026-03-29
- **Fecha de aceptación**: 2026-04-01
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-01 (React 18 + Vite + shadcn/ui + TanStack Query)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-01.**

## Contexto

El proyecto "gerocultores-system" (GeroCare) eligió inicialmente React 18 + TanStack Query + shadcn/ui (ADR-01). Tras evaluar las fortalezas del desarrollador y la complejidad del proyecto frente al deadline (2026-05-18), se propone pivotar a Vue.js 3 con Vite como bundler. Vue ofrece una curva de aprendizaje más suave con la Composition API, y Pinia proporciona gestión de estado más directa que Redux/Zustand.

Adicionalmente, PWA/Offline se excluyen explícitamente del scope (ver propuesta `sdd/switch-stack-to-vue-firebase/proposal`). Esto reduce complejidad.

## Opciones consideradas

### Opción A — React 18 + Vite + TanStack Query + shadcn/ui (stack original)
- **Pro**: Ecosistema extenso, mayor empleabilidad post-DAW, shadcn/ui es production-ready.
- **Contra**: Mayor carga cognitiva en gestión de estado (hooks + TanStack Query), el desarrollador reporta menor productividad.

### Opción B — Vue 3 + Vite + Pinia + Axios + Tailwind CSS (propuesta)
- **Pro**: Composition API intuitiva, Pinia simplifica estado, Axios es familiar, Tailwind igual de potente.
- **Contra**: Ecosistema de componentes UI algo menor que React (mitigado con Tailwind + componentes propios Atomic Design).

### Opción C — Svelte + SvelteKit
- **Pro**: Bundle muy ligero, excelente rendimiento.
- **Contra**: Comunidad menor, menor ecosistema de componentes, mayor riesgo de bloqueo.

## Decisión

Se elige **Opción B: Vue 3 + Vite + Pinia + Axios + Tailwind CSS**.

- **Framework**: Vue 3 con Composition API (`<script setup>`).
- **Bundler**: Vite 5+.
- **Estilos**: Tailwind CSS v3.
- **Estado**: Pinia (store por dominio: `useAuthStore`, `useAgendaStore`, `useResidenteStore`). Stores ubicados en `business/{domain}/` (no en `src/stores/`).
- **HTTP**: Axios con interceptores para token Firebase Auth.
- **Routing**: Vue Router 4.
- **Arquitectura de componentes**: Feature-based (`business/{domain}/presentation/{components,views,pages,composables,stores}`).
- **Testing**: Vitest (unit) + Playwright (E2E).

## Consecuencias

- **Positivas**: Desarrollo más rápido, menor carga cognitiva, Pinia stores directos.
- **Negativas**: Sin shadcn/ui; los componentes UI se construyen desde Tailwind (mayor esfuerzo en algunos elementos).
- **Migración**: Reescribir tareas del backlog Sprint-0 (scaffold, dependencias). Impacto: ~1 día.
- **Académica**: La memoria DAW debe documentar Vue.js, Pinia y Composition API en lugar de React.

## Criterios de aceptación

- [ ] Proyecto Vue + Vite + TS inicializado con `npm create vue@latest`.
- [ ] Tailwind CSS configurado con `content` paths.
- [ ] Pinia instalado y un store de ejemplo funcional.
- [ ] Vue Router configurado con rutas base (login, agenda, 404).
- [ ] Vitest configurado para tests unitarios.
- [ ] Axios configurado con interceptor de token.

## Notas de implementación

- Inicializar con `npm create vue@latest frontend -- --typescript --router --pinia`.
- Añadir Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`.
- Instalar Axios: `npm install axios`.
- Estructura de carpetas: `src/{components,composables,stores,views,services,types,router}`.

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-01.  
> Fecha de creación: 2026-03-29  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-01 (superseded) — Stack original React.
- Propuesta: Engram `sdd/switch-stack-to-vue-firebase/proposal`.
- SPEC/constraints.md § 2.1 — Stack tecnológico (JS/TS).

## Nota de revisión (2026-04-25)

> **Drift corregido**: La arquitectura de componentes documentada originalmente como "Atomic Design simplificado" fue reemplazada en la práctica por una arquitectura **feature-based** (`business/{domain}/presentation/{components,views,pages,composables,stores}`). Los Pinia stores residen en `business/{domain}/` en lugar de `src/stores/`. Este ADR se actualiza para reflejar la implementación real.
