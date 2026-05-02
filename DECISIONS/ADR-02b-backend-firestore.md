# ADR-02b: Backend con Firestore + Express API Wrapper

- **Estado**: ACCEPTED
- **Fecha**: 2026-03-29
- **Fecha de aceptación**: 2026-04-01
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-02 (Supabase + PostgreSQL)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-01.**

## Contexto

El proyecto eligió inicialmente Supabase (PostgreSQL BaaS) como backend (ADR-02). Se propone pivotar a **Firestore** (Firebase) con un **Express API wrapper** por coherencia con el ecosistema Firebase (Auth, Firestore, Hosting) y para simplificar el stack a un solo proveedor. La capa Express encapsula la lógica de negocio que no puede expresarse solo con Firestore Rules.

## Opciones consideradas

### Opción A — Supabase (PostgreSQL BaaS, stack original)
- **Pro**: Modelo relacional puro, RLS integrado, SQL estándar, región EU explícita (Frankfurt).
- **Contra**: Requiere aprender Supabase SDK + RLS policies + Edge Functions. Dos proveedores si se usa Firebase Auth aparte.

### Opción B — Firestore + Express API Wrapper (propuesta)
- **Pro**: Un solo ecosistema (Firebase). Modelo de documentos flexible para el dominio. Express wrapper permite lógica de negocio server-side. Admin SDK para operaciones privilegiadas.
- **Contra**: NoSQL requiere desnormalización cuidadosa. Consultas complejas (joins) requieren colecciones duplicadas o queries compuestos. RGPD: requiere configurar explícitamente la región EU.

### Opción C — Express + PostgreSQL propio
- **Pro**: Control total, sin vendor lock-in, excelente demo DAW.
- **Contra**: ~10-15 días de setup, inviable con deadline 2026-05-18.

## Decisión

Se elige **Opción B: Firestore + Express API Wrapper**.

- **Base de datos**: Cloud Firestore en modo producción (región `europe-west1`).
- **API layer**: Express.js (Node.js) con Firebase Admin SDK.
- **Modelo de datos**: Colecciones Firestore mapeadas 1:1 a entidades de `SPEC/entities.md`.
- **Seguridad**: Doble capa — Firestore Rules (acceso directo si se necesita) + validación en Express middleware.
- **RGPD**: Proyecto Firebase configurado en región EU. Datos de prueba generados con Faker.js.

### Mapping de colecciones Firestore

| Entidad (SPEC/entities.md) | Colección Firestore | Tipo |
|---|---|---|
| `Usuario` | `usuarios` | Top-level |
| `Residente` | `residentes` | Top-level |
| `Tarea` | `tareas` | Top-level |
| `Incidencia` | `incidencias` | Top-level |
| `Turno` | `turnos` | Top-level |
| `Notificacion` | `notificaciones` | Top-level |
| `ResidenteAsignacion` | `residenteAsignaciones` | Top-level |

> **G04**: Los nombres de campo en cada documento DEBEN coincidir exactamente con `SPEC/entities.md`.

## Consecuencias

- **Positivas**: Un solo proveedor (Firebase), setup rápido, buen soporte para real-time listeners.
- **Negativas**: Vendor lock-in con Google. Las consultas complejas (multi-entity joins) requieren diseño cuidadoso. Sin SQL estándar para exportar datos.
- **Migración**: Si se necesita salir de Firestore, exportar como JSON y convertir a SQL. Complejidad media.
- **Académica**: La memoria debe justificar la elección NoSQL frente a PostgreSQL.

## Criterios de aceptación

- [ ] Proyecto Firebase creado con Firestore en región EU (`europe-west1`).
- [ ] Colecciones iniciales creadas con al menos un documento de test.
- [ ] Express API wrapper desplegado localmente con Firebase Admin SDK.
- [ ] Firestore Rules básicas habilitadas.
- [ ] Datos de test generados con Faker.js (no PII real).

## Notas de implementación

- El Express wrapper se estructura como: `api/{routes,controllers,middleware,services}`.
- Usar `firebase-admin` para acceso server-side (no el SDK cliente).
- El SDK cliente (`firebase/firestore`) se usa SOLO en el frontend para listeners en tiempo real (opcional).
- Usar Firebase Local Emulator Suite para desarrollo local.

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-01.  
> Fecha de creación: 2026-03-29  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-02 (superseded) — Stack original Supabase.
- SPEC/entities.md — Modelo canónico de datos.
- Propuesta: Engram `sdd/switch-stack-to-vue-firebase/proposal`.
