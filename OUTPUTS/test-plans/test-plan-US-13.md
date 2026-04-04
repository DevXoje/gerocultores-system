# Test Plan — US-13: Verificación de disponibilidad de la API (Health Check)

> **Guardrail G03**: Todo feature MUST tener un test plan antes de aprobar el PR.
> Generado a partir de `test-plan-template.md`.

---

## Scope

Cubre el endpoint `GET /health` de la Express API: respuesta HTTP, estructura del cuerpo JSON,
ausencia de autenticación requerida y tiempo de respuesta.

**No cubre**: lógica de negocio (el endpoint no la tiene), integración con Firestore,
ni el comportamiento del frontend al llamar a este endpoint.

**User Story**: US-13 — Verificación de disponibilidad de la API (Health Check)  
**Prioridad**: Must  
**Sprint**: Sprint-0

---

## Preconditions (globales)

- Servidor Express accesible en `http://localhost:3000` (o el puerto configurado en `PORT`).
- Variables de entorno mínimas cargadas desde `code/api/.env` (solo `PORT` es requerido para este endpoint).
- No se requiere token de autenticación ni usuario activo.

---

## Test Cases

### TC-01: Handler unit test — respuesta correcta

- **Preconditions**: El handler de `/health` está importado directamente (sin arrancar servidor).
- **Steps**:
  1. Crear mocks de `Request` y `Response` de Express.
  2. Llamar al handler directamente: `healthHandler(req, res)`.
  3. Capturar el valor pasado a `res.json(...)`.
- **Expected Result**:
  - `res.status` no se llama con un código de error (implicitamente 200).
  - El objeto JSON tiene `status: 'ok'`.
  - El objeto JSON tiene `timestamp` que es un string ISO-8601 válido (`/^\d{4}-\d{2}-\d{2}T/`).
- **Type**: unit
- **Priority**: high

---

### TC-02: Integration test — GET /health devuelve 200 con cuerpo correcto

- **Preconditions**: Servidor Express arrancado en modo test (puerto `3001` o libre configurado).
- **Steps**:
  1. Ejecutar `npm run dev` o crear la instancia de `app` en el test y escuchar en un puerto efímero.
  2. Hacer `GET http://localhost:{PORT}/health`.
  3. Leer el código de estado y el cuerpo de la respuesta.
- **Expected Result**:
  - HTTP status code: `200`.
  - `Content-Type` incluye `application/json`.
  - Body: `{ "status": "ok", "timestamp": "<ISO-8601>" }`.
  - El campo `timestamp` cambia entre llamadas sucesivas (es dinámico).
- **Type**: integration
- **Priority**: high

---

### TC-03: Integration test — endpoint es público (sin token)

- **Preconditions**: Servidor Express arrancado con middleware `verifyAuth` activo en rutas protegidas.
- **Steps**:
  1. Hacer `GET /health` sin cabecera `Authorization`.
  2. Leer el código de estado.
- **Expected Result**:
  - HTTP status code: `200` (no `401`).
  - El body contiene `{ "status": "ok" }`.
- **Type**: integration
- **Priority**: high

---

### TC-04: Manual — verificación de despliegue (smoke test)

- **Preconditions**: API desplegada en entorno de staging o producción.
- **Steps**:
  1. Abrir terminal o cliente HTTP (curl, Postman, navegador).
  2. Ejecutar: `curl -i https://<api-url>/health`.
  3. Observar cabeceras y cuerpo de respuesta.
- **Expected Result**:
  - HTTP `200 OK`.
  - Body: `{ "status": "ok", "timestamp": "..." }`.
  - Cabeceras CORS presentes si se llama desde un origen permitido (configurable vía `CORS_ORIGIN`).
  - Tiempo de respuesta < 200 ms (bajo condiciones normales).
- **Type**: manual
- **Priority**: medium

---

## Coverage

| Criterio de Aceptación | Caso(s) de Test | Estado |
|------------------------|-----------------|--------|
| CA-1: `GET /health` devuelve HTTP 200 | TC-02, TC-03 | ⬜ Pending |
| CA-2: Body es `{ "status": "ok", "timestamp": "<ISO-8601>" }` | TC-01, TC-02 | ⬜ Pending |
| CA-3: Endpoint no requiere autenticación | TC-03 | ⬜ Pending |
| CA-4: Timestamp generado en servidor | TC-01 (timestamp dinámico) | ⬜ Pending |
| CA-5: Responde en < 200 ms bajo condiciones normales | TC-04 (manual, medición con curl) | ⬜ Pending |

---

## Automation Notes

- **Unit tests** (Vitest): `code/api/src/routes/health.spec.ts` (crear si se extrae el handler a función separada)
- **Integration tests** (Vitest + supertest): `code/api/src/routes/index.spec.ts`
- **Manual only**: TC-04 — requiere entorno de staging/producción; no se puede automatizar en CI local.

### Comandos para ejecutar los tests (cuando existan)

```bash
# Desde la raíz del proyecto
cd code/api && npm run test

# Test específico
cd code/api && npx vitest run src/routes/index.spec.ts
```

---

## Meta

- **User Story**: US-13
- **Guardrail**: G03 compliant ✅
- **Created**: 2026-04-04
- **Author**: sdd-apply Agent
- **Status**: Draft
