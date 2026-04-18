# AGENTS.md — code/api (Backend API)

> Agent context file for the `code/api/` module.
> Specialist identity: **load `AGENTS/backend-specialist.md`** before any implementation task.

---

## Module

**GeroCare — Express REST API (gerocultores-system)**

This module is the backend layer: receives HTTP requests from the Vue frontend, validates them, applies business logic, and reads/writes Firestore via Firebase Admin SDK.

---

## Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥ 20 | Runtime |
| TypeScript | 6.0.2 | Language (strict: true, ES2022, commonjs) |
| Express | 5.2.1 | HTTP framework |
| firebase-admin | 13.7.0 | Firestore + Auth (server-side only) |
| cors | 2.8.6 | CORS middleware |
| dotenv | 17.3.1 | Environment variable loading |
| zod | _(to add)_ | Request body validation |
| vitest | _(to add)_ | Test runner |
| supertest | _(to add)_ | Integration testing |
| tsx | 4.21.0 | TS execution for dev server |

> `zod`, `vitest`, and `supertest` are not yet in `package.json`. Add them before writing tests or validation schemas.

---

## Specialist Identity

Before any implementation task in this module, the agent MUST load:

```
AGENTS/backend-specialist.md
```

That file contains: layer responsibilities, TypeScript rules, verifyAuth usage, Firebase Admin patterns, error handling, testing conventions, and the anti-pattern list.

---

## Folder Structure

```
src/
  app.ts                  — Express app: CORS, JSON body parser, routes, errorHandler
  server.ts               — Entry point: loads dotenv, starts app.listen()
  middleware/
    errorHandler.ts       — Last-resort error handler; returns { error: string }
    verifyAuth.ts         — Firebase token validation; populates req.user
    requireRole.ts        — Role-based guard factory (to be created)
  routes/
    index.ts              — Root router: mounts sub-routers + /health endpoint
    {module}.routes.ts    — Per-domain route files (to be created per US)
  controllers/
    {module}.controller.ts — HTTP layer only: parse req, call service, send res
  services/
    firebase.ts           — Firebase Admin init (ONLY file that imports firebase-admin)
    collections.ts        — Firestore collection name constants (to be created)
    {module}.service.ts   — Business logic + Firestore operations
  types/
    express.d.ts          — Augments Express Request with req.user (to be created)
    {module}.types.ts     — Zod schemas + TypeScript types derived from them
```

---

## Test Command

```bash
# Run from code/api/
npm test
```

Test files are co-located with the implementation files (`.spec.ts` suffix).

---

## Key ADRs

| ADR | Decision |
|-----|---------|
| ADR-02b | Firestore + Express API Wrapper as backend |
| ADR-03b | Firebase Auth + Custom Claims + verifyAuth middleware |
