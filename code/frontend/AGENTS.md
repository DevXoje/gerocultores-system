# AGENTS.md — code/frontend

<!-- AGENT-ONLY. Machine-readable context file for the frontend module. -->
<!-- Human-facing docs are in README.md. -->

---

## 1. Module Overview

**Module**: Frontend — Vue 3 SPA for GeroCare (gerocultores-system)
**Purpose**: Daily scheduling, resident management, and incident reporting for care staff. Tablet and mobile first.
**Project type**: DAW academic project (CIPFP Batoi, solo developer)
**Deadline**: 2026-05-18

**Exact stack versions**:
- Vue 3.5.32 + TypeScript 6 + Vite 8
- Pinia 3 (state management)
- Vue Router 5
- Tailwind CSS 4 via `@tailwindcss/vite` plugin
- Firebase 12 (Auth + Firestore)
- Axios 1.14
- Vitest 4 + @vue/test-utils 2

---

## 2. Mandatory Loading

**BEFORE working on this module, every agent MUST load the frontend specialist file:**

```
AGENTS/frontend-specialist.md   ← 439 lines, non-negotiable architecture rules
```

This file encodes the full identity, import rules, BEM conventions, TDD workflow, Zod patterns, and Vue-specific constraints. **Not loading it is a guardrail violation.**

---

## 3. Architecture Rules (DDD)

### Folder Structure

```
src/
  business/
    {module}/        ← auth | residents | schedule | incidents
      domain/        — entities, value objects, repository interfaces (pure TypeScript, no framework deps)
      application/   — use cases, composables (no Firebase calls directly)
      infrastructure/ — Firestore repos, API clients (Axios)
      presentation/  — Vue components, page views, UI composables, Pinia stores
  router/            — Vue Router routes
  assets/            — global CSS, images
  main.ts            — app bootstrap
```

### Import Rules (enforced by ESLint)

- Components import ONLY from `presentation/composables/` — **NEVER** from stores or repos directly
- `application/` imports from `domain/` and `infrastructure/` interfaces only
- `infrastructure/` is the ONLY layer allowed to call Firebase or Axios
- Cross-module imports: only through domain interfaces (no coupling between `business/` modules)

### Pinia Store Rule

Stores are **state-only containers**:
- ✅ State fields, getters (derived state), basic mutations (synchronous)
- ❌ NO async calls, NO Firebase, NO business logic in stores
- Async data-fetching lives in `application/` use cases invoked from composables

### Vue Component Rules

- Always use `<script setup lang="ts">` — Options API is BANNED
- Props and emits MUST be explicitly typed: `defineProps<{}>()` / `defineEmits<{}>()`
- `v-for` always requires `:key` with a unique domain ID — never array index
- `v-if` and `v-for` NEVER on the same element — use `<template>` as wrapper
- No direct store imports inside `*.vue` files — always go through composables

---

## 4. TypeScript Rules

- `any` is **BANNED** — ESLint enforces `no-explicit-any`
- Type assertions (`as X`) are **BANNED** — only inside dedicated Zod-based type guard functions
- `strict: true` is required in `tsconfig.json`
- Domain entities and API responses MUST have Zod schemas for runtime validation
- Zod schemas live alongside their entity in `domain/entities/`
- Pattern: `z.infer<typeof Schema>` produces the TypeScript type — no manual duplication

---

## 5. Styling Rules

- **BEM naming** is required for ALL HTML class attributes: `block__element--modifier`
- **Tailwind classes go in CSS via `@apply`** — NOT inline in HTML templates
  - ✅ `.button--primary { @apply bg-blue-600 text-white px-4 py-2; }`
  - ❌ `<button class="bg-blue-600 text-white px-4 py-2">` — BANNED in templates
- Scoped styles: use `<style scoped>` per component
- Global styles: `src/assets/` only
- Tailwind config: handled via `@tailwindcss/vite` plugin — no separate `tailwind.config.js` needed

---

## 6. Testing Rules

### TDD Workflow (Mandatory for domain/ and application/)

```
RED   → Write a failing test that describes the expected behavior (from spec scenarios)
GREEN → Write the minimum code to make it pass
REFACTOR → Clean up without changing behavior — run tests again to confirm
```

**Never skip RED.** A test that passes immediately without code means the behavior already exists or the test is wrong.

### Coverage Targets

| Layer | Target |
|-------|--------|
| `domain/` | ≥ 80% |
| `application/` | ≥ 80% |
| `presentation/composables/` | ≥ 70% |
| `presentation/components/` | best-effort (no hard target) |

### Tools

- **Vitest 4** — unit and integration tests
- **@vue/test-utils 2** — Vue component tests
- Run a specific test file during TDD: `npx vitest run path/to/file.spec.ts` (not full suite)

### Test Location

Tests live alongside source files: `entities/Resident.spec.ts` next to `entities/Resident.ts`

---

## 7. Environment

### Required Variables (`.env.local` — never committed)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATOR="true"       # set to true in dev to use local Firebase emulators
```

### Firebase Emulator (Development)

- Emulators run via Docker from `code/` directory
- When `VITE_USE_EMULATOR="true"`, the app auto-connects to local emulator ports
- Auth emulator: `localhost:9099`
- Firestore emulator: `localhost:8080`
- **NEVER point dev code at production Firebase** — always use emulator locally

### `.env.example` must exist

All required variables must appear in `.env.example` with empty or placeholder values (G05 compliance).

---

## 8. Guardrails (Highest Priority for Frontend)

These guardrails from root `AGENTS.md` are most critical in this module:

| ID | Rule | What it means here |
|----|------|--------------------|
| **G01** | No code without US-XX requirement | Every component, composable, use case must trace to a user story in `SPEC/` |
| **G04** | Entity field names must match `SPEC/entities.md` | Domain TypeScript interfaces and Zod schemas must use identical field names — no aliases |
| **G05** | No hardcoded secrets | No Firebase config values in source — use `VITE_*` env vars; `.env.local` in `.gitignore` |
| **G06** | No scope creep | Do not add features not in `SPEC/` without explicit notification |
| **G08** | Commit traceability | All `feat` commits must reference `US-XX` |

**G03** (no feature without test plan) is enforced at PR review by REVIEWER agent.

---

## 9. Commit Convention

```
<type>(US-XX): short description

[optional body]
```

**Required types**: `feat`, `fix`, `test`, `refactor`, `style`, `docs`, `chore`, `perf`

**G08 rule**: Every `feat` commit MUST include the `US-XX` scope.

Examples:
```
feat(US-04): add ResidentCard component with BEM styling
fix(US-07): correct Zod schema for incident severity field
test(US-04): add unit tests for ResidentRepository interface
```

---

## 10. Anti-Patterns (NEVER do in this module)

```
❌ import { useResidentStore } from '../store'  ← inside a .vue file — use composables
❌ const data = ref<any>(null)                  ← any is banned
❌ const resident = response.data as Resident   ← type assertion without Zod guard
❌ <div class="flex gap-2 text-sm">            ← Tailwind inline in HTML
❌ class="residentCard__name"                   ← camelCase BEM — use kebab-case: resident-card__name
❌ store.loadResidents()                        ← async call inside Pinia store
❌ import { db } from '@/firebase'              ← Firebase in application/ or presentation/ — only infrastructure/
❌ v-if v-for on same element                   ← always wrap with <template>
❌ :key="index"                                 ← array index as key
❌ defineComponent({ ... })                     ← Options API — use <script setup lang="ts">
❌ VITE_FIREBASE_API_KEY="AIzaSy..."            ← hardcoded in source code
❌ Adding a feature not in SPEC/               ← scope creep (G06)
```
