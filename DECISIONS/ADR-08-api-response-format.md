# ADR-08: API Response Format — Direct data responses, `{ error, message }` errors, Zod validation, global errorHandler

- **Estado**: ACCEPTED
- **Fecha**: 2026-04-18
- **Fecha de aceptación**: 2026-04-18
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Relacionado con**: ADR-02b (Firestore + Express), ADR-07 (Testing Strategy)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-18.**

## Contexto

El backend Express expone endpoints REST consumidos por el frontend Vue 3. Necesitamos una convención consistente para:

1. **Formato de respuesta exitosa**: ¿Devolver los datos directamente o envueltos en un objeto wrapper?
2. **Formato de errores**: ¿Qué shape tienen los errores HTTP?
3. **Validación de request bodies**: ¿Cómo se validan y cómo se comunican los errores de validación?
4. **Manejo centralizado de errores**: ¿Cómo se evita duplicar lógica de error en cada controlador?

Un formato inconsistente obliga al frontend a manejar múltiples shapes, dificulta el testing y genera deuda técnica. Esta decisión afecta a todos los endpoints documentados en `SPEC/api-contracts.md`.

## Opciones consideradas

### Formato de respuesta exitosa

#### Opción A — Datos directamente en el body (elegida)
- **Pro**: Menor verbosidad. El frontend accede directamente a los campos sin desestructurar un wrapper. Compatible con el patrón RESTful estándar. Más fácil de tipar con TypeScript en el cliente.
- **Ejemplo**: `{ uid: "usr-123", displayName: "María", role: "admin" }`
- **Contra**: Sin un envelope estándar, es más difícil añadir metadatos (paginación, timestamps) retroactivamente.

#### Opción B — Datos envueltos en `{ data: ... }`
- **Pro**: Permite añadir metadatos en el mismo nivel que `data` (p.ej. `{ data: [...], meta: { total: 50 } }`).
- **Contra**: Añade una capa de desestructuración en el frontend para cada respuesta. El `SPEC/api-contracts.md` actual mezcla los dos patrones (herencia de versiones anteriores). Introduce inconsistencia con la convención establecida en el código actual del backend.

#### Opción C — JSON:API spec completa
- **Pro**: Estándar de la industria con soporte de librerías.
- **Contra**: Complejidad innecesaria para un proyecto académico. Overhead de serialización.

### Formato de errores

#### Opción A — `{ error: string, message: string }` (elegida)
- **Pro**: Distingue el tipo de error (campo `error`, p.ej. `"VALIDATION_ERROR"`) del mensaje legible por humanos (campo `message`). Consistente y predecible para el frontend. Compatible con el middleware `errorHandler` ya existente en `src/middleware/errorHandler.ts`.
- **Ejemplo**: `{ error: "NOT_FOUND", message: "Usuario no encontrado" }`
- **Contra**: No incluye detalles de campo por defecto (se complementa con errores Zod, ver abajo).

#### Opción B — Solo `{ message: string }`
- **Pro**: Más simple.
- **Contra**: El frontend no puede distinguir el tipo de error programáticamente sin parsear el string.

#### Opción C — RFC 7807 (Problem Details)
- **Pro**: Estándar IETF. Incluye `type`, `title`, `status`, `detail`, `instance`.
- **Contra**: Complejidad innecesaria para el tamaño del proyecto. El frontend Vue no necesita un parser de Problem Details.

### Validación de request bodies

#### Opción A — Zod con errores de campo en 400 (elegida)
- **Pro**: Zod es el validador estándar para proyectos TypeScript modernos. Los schemas Zod son la fuente única de verdad para tipos de request. Los errores de Zod son estructurados (por campo), lo que permite mensajes de validación precisos en el frontend. Integración trivial con Express (middleware de validación o en el controlador).
- **Ejemplo de respuesta 400**: `{ error: "VALIDATION_ERROR", message: "Datos de entrada inválidos", fields: { email: "Email inválido", role: "Rol debe ser 'admin' o 'gerocultor'" } }`
- **Contra**: Requiere añadir `zod` a `package.json` (aún no instalado, documentado en `code/api/AGENTS.md`).

#### Opción B — Validación manual con condicionales
- **Pro**: Sin dependencias adicionales.
- **Contra**: Verboso, propenso a errores, no tipado.

#### Opción C — `express-validator`
- **Pro**: Integración nativa con Express.
- **Contra**: API no tan limpia como Zod. Menos alineado con TypeScript idiomático. Zod ya se mencionaba como dependencia pendiente en `code/api/AGENTS.md`.

### Manejo centralizado de errores

#### Opción A — Middleware `errorHandler` en Express (elegida)
- **Pro**: El archivo `src/middleware/errorHandler.ts` ya existe en el proyecto. Un único punto de salida para todos los errores evita duplicación en controladores. Los controladores lanzan errores con `next(error)` o `throw` y el handler los captura. Permite logging centralizado.
- **Contra**: Los controladores deben usar `next(error)` de forma consistente (requiere disciplina).

#### Opción B — Try/catch en cada controlador con res.json() local
- **Pro**: Cada controlador es autocontenido.
- **Contra**: Duplicación masiva de lógica de error. Inconsistencias inevitables entre controladores.

## Decisión

Se adopta el siguiente contrato de respuesta para **todos** los endpoints de la API:

### Respuestas exitosas

Los datos se devuelven **directamente** en el body, sin wrapper `{ data: ... }`:

```json
// GET /api/admin/users → 200
[
  { "uid": "usr-123", "displayName": "María", "email": "maria@example.com", "role": "gerocultor", "active": true, "createdAt": "2026-04-18T10:00:00Z" }
]

// POST /api/admin/users → 201
{ "uid": "usr-456", "displayName": "Juan", "email": "juan@example.com", "role": "admin", "active": true, "createdAt": "2026-04-18T10:00:00Z" }
```

### Respuestas de error

Todos los errores siguen el shape `{ error: string, message: string }` con HTTP status apropiado:

```json
// 400 — Validación fallida (incluye campo `fields` con detalle Zod)
{ "error": "VALIDATION_ERROR", "message": "Datos de entrada inválidos", "fields": { "email": "Email inválido" } }

// 401 — No autenticado
{ "error": "UNAUTHORIZED", "message": "Token no provisto o inválido" }

// 403 — Sin permisos
{ "error": "FORBIDDEN", "message": "Rol insuficiente: se requiere admin" }

// 404 — Recurso no encontrado
{ "error": "NOT_FOUND", "message": "Usuario no encontrado" }

// 409 — Conflicto
{ "error": "CONFLICT", "message": "El email ya está en uso" }

// 500 — Error interno (capturado por errorHandler)
{ "error": "INTERNAL_ERROR", "message": "Error interno del servidor" }
```

### Validación

- Los schemas Zod se definen en `src/types/{module}.types.ts` y son la **fuente única de verdad** para los tipos de request.
- Los controladores llaman a `schema.parse(req.body)` o `schema.safeParse(req.body)` y pasan los errores Zod formateados al `errorHandler`.
- El campo `fields` en errores 400 es opcional: solo aparece cuando Zod provee detalle por campo.

### Middleware errorHandler

El middleware `src/middleware/errorHandler.ts` captura todos los errores no manejados:
- Errores Zod (`ZodError`) → 400 con `fields`
- Errores con propiedad `status` → usa ese status
- Cualquier otro error → 500

**Nota sobre SPEC/api-contracts.md**: Los contratos existentes en `SPEC/api-contracts.md` que usan el wrapper `{ data: ... }` son una herencia de versiones anteriores del spec. La implementación real y los tests siguen este ADR (datos directos). El SPEC se actualizará progresivamente en futuras iteraciones.

## Consecuencias

- **Positivas**:
  - Contrato predecible para el frontend: no necesita desestructurar `data` en cada llamada.
  - Zod schemas como fuente única de verdad para validación y tipos TypeScript.
  - `errorHandler` centralizado elimina duplicación en controladores.
  - Errores Zod estructurados (campo a campo) mejoran la UX de formularios.
- **Negativas**:
  - Añadir metadatos de paginación en el futuro requiere cambiar el formato de listas (breaking change).
  - La inconsistencia entre `SPEC/api-contracts.md` (wrapper `{ data: ... }`) y este ADR (datos directos) es deuda temporal hasta actualizar el SPEC.
- **Deuda documentada**: Actualizar `SPEC/api-contracts.md` para eliminar el wrapper `{ data: ... }` en todos los endpoints y alinearlo con este ADR. Estimado: Sprint-2.

## Archivos relacionados

- `code/api/src/middleware/errorHandler.ts` — middleware de error centralizado (ya existente)
- `code/api/src/types/*.types.ts` — schemas Zod + tipos TypeScript (a crear por módulo)
- `SPEC/api-contracts.md` — contratos de endpoints (pendiente actualización para eliminar wrapper)

## Referencias

- [Zod: Getting Started](https://zod.dev/)
- [Express: Error Handling](https://expressjs.com/en/guide/error-handling.html)
- ADR-02b — Backend: Firestore + Express
- ADR-07 — Testing Strategy (Vitest + Supertest para validar estos contratos)
