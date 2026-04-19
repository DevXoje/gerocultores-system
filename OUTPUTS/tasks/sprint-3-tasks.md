# Tasks: Sprint-3

## Prioridad 0 — Bloqueos y trazabilidad

- [ ] **T0.1 — Resolver nombres canónicos de colecciones y rules (G04/G02)**
  - **Descripción**: Alinear `COLLECTIONS`, Firestore Rules y contratos con `SPEC/entities.md` + ADR-02b (`residentes`, `tareas`, `usuarios`) o registrar ADR/spec delta antes de tocar US-05/US-06.
  - **Archivos probables**: `code/api/src/services/collections.ts`, `code/firestore.rules`, `DECISIONS/ADR-02b-backend-firestore.md` o spec delta.
  - **Esfuerzo**: S
  - **Criterios**: Existe una única convención documentada; ningún nombre de colección nuevo queda hardcodeado; Sprint-3 puede referenciar `COLLECTIONS` sin ambigüedad.
  - **Tests**: integration + firestore-rules
  - **Deps**: ninguna
  - **Branch**: `chore/sprint-3-collections-alignment`
  - **Commit**: `chore: align firestore collection names for sprint-3`

- [ ] **T0.2 — Registrar pantallas Stitch de US-05/US-06 en design-source (G10)**
  - **Descripción**: Añadir mapeo de `ResidenteView` y `IncidenceForm`/pantalla de alta a `OUTPUTS/technical-docs/design-source.md` antes de implementar vistas nuevas.
  - **Archivos probables**: `OUTPUTS/technical-docs/design-source.md`, `OUTPUTS/design/stitch-prompts/sprint-3/residente-view.md`, `OUTPUTS/design/stitch-prompts/sprint-3/incidence-form.md`.
  - **Esfuerzo**: XS
  - **Criterios**: Ambas vistas quedan trazadas a sus screens Stitch y exports; G10 satisfecho para PRs posteriores.
  - **Tests**: none
  - **Deps**: ninguna
  - **Branch**: `docs/sprint-3-design-traceability`
  - **Commit**: `docs: map sprint-3 resident and incident screens`

## US-05 — Consulta de ficha de residente

- [ ] **T5.1 — Modelar tipos/backend del residente detalle**
  - **Descripción**: Crear tipos/schemas de `Residente` y respuesta `GET /api/residentes/:id`, respetando nombres de `SPEC/entities.md` y acceso por rol/asignación.
  - **Archivos probables**: `code/api/src/types/residente.types.ts`, `code/api/src/types/express.d.ts`.
  - **Esfuerzo**: S
  - **Criterios**: Payload incluye nombre, apellidos, fechaNacimiento, foto, diagnosticos, alergias, medicacion, preferencias, habitacion; sin aliases.
  - **Tests**: unit
  - **Deps**: T0.1
  - **Branch**: `feat/us-05-residente-types`
  - **Commit**: `feat(US-05): add resident detail types`

- [ ] **T5.2 — Implementar servicio/controlador/ruta detalle residente**
  - **Descripción**: Exponer `GET /api/residentes/:id` con `verifyAuth`, validación de asignación (`gerocultoresAsignados` o equivalente canónico) y 401/403/404 según spec.
  - **Archivos probables**: `code/api/src/services/residentes.service.ts`, `code/api/src/controllers/residentes.controller.ts`, `code/api/src/routes/residentes.routes.ts`, `code/api/src/routes/index.ts`.
  - **Esfuerzo**: M
  - **Criterios**: Gerocultor asignado ve ficha; no asignado recibe 403; admin accede; datos sensibles nunca salen sin auth.
  - **Tests**: unit + integration
  - **Deps**: T5.1
  - **Branch**: `feat/us-05-resident-detail-api`
  - **Commit**: `feat(US-05): add resident detail endpoint`

- [ ] **T5.3 — Cubrir rules/emulador para lectura de residentes asignados**
  - **Descripción**: Ajustar rules para permitir lectura de `residentes` solo a admin o gerocultor asignado y negar invitados/no asignados.
  - **Archivos probables**: `code/firestore.rules`, `code/tests/firestore-rules/firestore.rules.test.js`.
  - **Esfuerzo**: M
  - **Criterios**: Pasa happy path asignado/admin y falla 401/403 del test plan US-05.
  - **Tests**: firestore-rules
  - **Deps**: T0.1
  - **Branch**: `test/us-05-resident-access-rules`
  - **Commit**: `test(US-05): cover resident access rules`

- [ ] **T5.4 — Crear módulo frontend de residente detalle**
  - **Descripción**: Añadir entidad/composable/API client/route names para cargar ficha y exponer estados `loading|loaded|error` sin importar stores directos en la vista.
  - **Archivos probables**: `code/frontend/src/business/residents/domain/entities/residente.types.ts`, `.../application/useResidentDetail.ts`, `.../infrastructure/residentes.api.ts`, `code/frontend/src/router/routes.ts`.
  - **Esfuerzo**: M
  - **Criterios**: Existe acceso typed al endpoint; manejo de 403/404; ruta protegida preparada.
  - **Tests**: unit + integration
  - **Deps**: T5.2
  - **Branch**: `feat/us-05-resident-detail-module`
  - **Commit**: `feat(US-05): add resident detail frontend module`

- [ ] **T5.5 — Implementar ResidenteView con trazabilidad Stitch**
  - **Descripción**: Construir la vista/tab layout `Datos/Salud/Incidencias`, lectura solo para gerocultor, CTA a historial y FAB a nueva incidencia.
  - **Archivos probables**: `code/frontend/src/business/residents/presentation/views/ResidenteView.vue`, componentes `ResidentHero`/`ResidentTabs`.
  - **Esfuerzo**: M
  - **Criterios**: Refleja screen “Resident Detail - Eleanor Vance”; muestra lock/RGPD; admin ve editar, gerocultor no.
  - **Tests**: component + integration
  - **Deps**: T0.2, T5.4
  - **Branch**: `feat/us-05-resident-detail-view`
  - **Commit**: `feat(US-05): add resident detail view`

- [ ] **T5.6 — Enlazar TaskCard → ficha residente**
  - **Descripción**: Añadir CTA/navegación desde agenda o detalle de tarea hacia la ficha del residente sin romper US-04.
  - **Archivos probables**: `code/frontend/src/components/TaskCard/TaskCard.vue`, `code/frontend/src/components/TaskCard/TaskCard.spec.ts`, composición de agenda.
  - **Esfuerzo**: S
  - **Criterios**: Desde una tarea se accede a la ficha correcta; sigue funcionando `openDetail`; accesible por teclado.
  - **Tests**: component
  - **Deps**: T5.5
  - **Branch**: `feat/us-05-taskcard-resident-link`
  - **Commit**: `feat(US-05): link task cards to resident detail`

## US-06 — Registro de incidencia

- [ ] **T6.1 — Modelar tipos y validación de incidencia**
  - **Descripción**: Crear tipos/schemas backend/frontend para `Incidencia` y payload create, excluyendo `foto` hasta que exista spec/ADR.
  - **Archivos probables**: `code/api/src/types/incidencia.types.ts`, `code/frontend/src/business/incidents/domain/entities/incidencia.types.ts`.
  - **Esfuerzo**: S
  - **Criterios**: Campos exactos: tipo, severidad, descripcion, residenteId, usuarioId, tareaId, registradaEn; foto no implementada.
  - **Tests**: unit
  - **Deps**: T0.1
  - **Branch**: `feat/us-06-incident-types`
  - **Commit**: `feat(US-06): add incident schemas and types`

- [ ] **T6.2 — Implementar POST /api/incidencias con metadatos de servidor**
  - **Descripción**: Crear servicio/controlador/ruta que persista incidencias con `usuarioId` del token y `registradaEn` de servidor; validar acceso al residente.
  - **Archivos probables**: `code/api/src/services/incidencias.service.ts`, `code/api/src/controllers/incidencias.controller.ts`, `code/api/src/routes/incidencias.routes.ts`, `code/api/src/routes/index.ts`.
  - **Esfuerzo**: M
  - **Criterios**: Ignora uid/timestamp manipulados del cliente; devuelve 201; crítica lista para disparar notificación.
  - **Tests**: unit + integration
  - **Deps**: T6.1, T5.2
  - **Branch**: `feat/us-06-create-incident-api`
  - **Commit**: `feat(US-06): add incident creation endpoint`

- [ ] **T6.3 — Blindar inmutabilidad y acceso de incidencias en rules**
  - **Descripción**: Adaptar rules/tests para create/read permitido solo con acceso al residente y denegar update/delete o payloads con `registradaEn`/`usuarioId` no válidos.
  - **Archivos probables**: `code/firestore.rules`, `code/tests/firestore-rules/firestore.rules.test.js`.
  - **Esfuerzo**: M
  - **Criterios**: Pasa casos US-06 happy path, manipulación de payload y lectura con auth; historial sigue inmutable.
  - **Tests**: firestore-rules
  - **Deps**: T6.2
  - **Branch**: `test/us-06-incident-rules`
  - **Commit**: `test(US-06): cover incident security rules`

- [ ] **T6.4 — Crear módulo frontend de alta de incidencia**
  - **Descripción**: Añadir API client/composable para crear incidencias, prefill desde residente/tarea y actualización inmediata del historial local.
  - **Archivos probables**: `code/frontend/src/business/incidents/infrastructure/incidencias.api.ts`, `.../application/useCreateIncidencia.ts`, `.../presentation/composables/useIncidenceForm.ts`.
  - **Esfuerzo**: M
  - **Criterios**: Exposición de submit, loading, validation errors y append optimista al historial tras 201.
  - **Tests**: unit + integration
  - **Deps**: T6.2
  - **Branch**: `feat/us-06-incident-form-module`
  - **Commit**: `feat(US-06): add incident creation module`

- [ ] **T6.5 — Implementar IncidenceForm ≤5 taps**
  - **Descripción**: Construir formulario según Stitch, con residente preseleccionado cuando exista contexto, sin foto real por ahora y con feedback de éxito.
  - **Archivos probables**: `code/frontend/src/business/incidents/presentation/views/IncidenceFormView.vue`, componentes de selector/tipo/severidad.
  - **Esfuerzo**: M
  - **Criterios**: Cumple CA-1, CA-6; campos obligatorios visibles; warning para `critica`; navega atrás con toast al guardar.
  - **Tests**: component + integration
  - **Deps**: T0.2, T6.4
  - **Branch**: `feat/us-06-incidence-form-view`
  - **Commit**: `feat(US-06): add fast incident reporting form`

- [ ] **T6.6 — Disparar notificación a admin en incidencias críticas**
  - **Descripción**: Implementar mecanismo backend/Firestore para crear `notificaciones` cuando `severidad = critica`; si exige arquitectura nueva, abrir ADR antes.
  - **Archivos probables**: `code/api/src/services/incidencias.service.ts`, `code/api/src/services/notifications.service.ts` o ADR nueva.
  - **Esfuerzo**: S
  - **Criterios**: Solo incidencias críticas generan notificación; referencia a incidencia incluida; no duplica en moderada/leve.
  - **Tests**: unit + integration
  - **Deps**: T6.2
  - **Branch**: `feat/us-06-critical-incident-alert`
  - **Commit**: `feat(US-06): notify admins about critical incidents`

## Verificación sprint

- [ ] **T9.1 — E2E mínimo residente → incidencia**
  - **Descripción**: Cubrir login, acceso a ficha asignada, apertura de formulario desde ficha/tarea y alta de incidencia visible en historial.
  - **Archivos probables**: `code/frontend/e2e/residents-incidents.spec.ts`, seeds/emulator fixtures necesarios.
  - **Esfuerzo**: L
  - **Criterios**: Reproduce flujo crítico de Sprint-3 y protege regresiones de US-05/US-06.
  - **Tests**: e2e
  - **Deps**: T5.6, T6.5, T6.6
  - **Branch**: `test/sprint-3-resident-incident-flow`
  - **Commit**: `test: cover sprint-3 resident incident journey`
