# PROJECT BRIEF

> Visión, alcance y contexto del proyecto. Fuente de referencia para todos los agentes.
> Equivalente a GOALS.md en personal-brand-system.

## Descripción del software

**GeroCare** — App para gerocultores: agenda diaria, gestión de residentes e incidencias. Uso ágil en tablet y móvil. Historial por residente y alertas de incidencias críticas.

## Contexto académico

- **Ciclo**: DAW
- **Entrega**: 2026-05-18
- **Modalidad**: Proyecto individual

## Usuarios objetivo

| Rol | Descripción | Necesidades principales |
|-----|-------------|------------------------|
| **Gerocultor** | Personal de atención directa en la residencia. Trabaja en turno de mañana, tarde o noche. | Ver su agenda del día, actualizar estado de tareas, registrar incidencias y consultar fichas de residentes asignados. |
| **Coordinador** | Responsable de planta o de turno. Supervisa al equipo de gerocultores. | Acceso completo a agendas y residentes, gestión de fichas, consulta del historial de incidencias y supervisión del traspaso de turno. |
| **Administrador** | Gestor del sistema (puede ser director de la residencia o responsable de TI). | Alta y baja de usuarios, asignación de residentes a gerocultores y configuración general del sistema. |

**Perfil tecnológico**: Usuarios con nivel digital básico-medio. El diseño prioriza flujos táctiles simples (≤ 5 taps para cualquier acción crítica) sobre tablet Android/iOS de residencia o móvil personal.

## Problema que resuelve

En muchas residencias geriátricas, el seguimiento de tareas y la comunicación entre turnos se gestiona con papel o mensajes informales, lo que provoca pérdida de información crítica en el traspaso de turno, retrasos en la atención y dificultades para rastrear incidencias de salud. Este sistema centraliza la agenda personal de cada gerocultor, el registro inmediato de incidencias y el historial clínico-asistencial por residente en una única app optimizada para tablet, eliminando el papel y garantizando trazabilidad completa con cumplimiento RGPD.

## Alcance del TFG (MVP académico)

Funcionalidades incluidas en la entrega mínima viable (prioridad **Must** de MoSCoW, US-01 a US-07):

- **Autenticación y roles** (US-01, US-02): inicio/cierre de sesión con Firebase Auth, control de acceso por rol (gerocultor / coordinador / administrador) mediante custom claims y Firestore Rules.
- **Agenda diaria** (US-03, US-04): vista de tareas del día ordenadas por hora con estados (pendiente / en curso / completada / con incidencia); actualización de estado y notas libres con registro de auditoría.
- **Ficha de residente** (US-05): datos identificativos, diagnósticos, alergias, medicación y preferencias de cuidado. Solo lectura para gerocultor; editable por coordinador.
- **Registro de incidencias** (US-06): formulario rápido (≤ 5 taps) con tipo, severidad y timestamp de servidor; incidencias inmutables post-creación.
- **Historial de incidencias** (US-07): listado paginado por residente, filtrable por fecha y tipo.

Funcionalidades **Should** incluidas si el calendario lo permite (US-08 a US-11):

- Notificaciones in-app de alertas críticas (US-08).
- Alta y gestión de residentes por coordinador (US-09).
- Gestión de cuentas de usuarios por administrador (US-10).
- Resumen y traspaso de turno (US-11).

Fuera de alcance (ver `PLAN/backlog.md § Won't Have`): PWA offline, push nativas de SO, app nativa, multi-tenancy, chat, portal de familiares.

## Alcance de producto real (si aplica)

Si este sistema evolucionara a producto comercial, incorporaría:

- **Multi-tenancy**: soporte para múltiples residencias desde una misma plataforma SaaS, con aislamiento de datos por organización.
- **App móvil nativa** (React Native / Flutter): experiencia optimizada para móvil con notificaciones push nativas del SO.
- **PWA completa con modo offline**: caché de agenda y cola de incidencias para entornos con conectividad intermitente.
- **Portal para familiares**: acceso de solo lectura al estado del residente y notificaciones de incidencias relevantes.
- **Integración con HIS/EHR**: conexión con sistemas de historial clínico hospitalarios (HL7 FHIR).
- **IA para detección de patrones**: análisis de incidencias recurrentes y alertas predictivas de deterioro del residente.
- **Módulo de planificación de turnos**: asignación automática de gerocultores a residentes según disponibilidad y carga de trabajo.
- **Auditoría avanzada y exportación RGPD**: panel de cumplimiento con solicitudes de portabilidad y eliminación de datos por residente.

## Stack técnico

Tecnologías confirmadas tras los ADRs de stack (ADR-01b a ADR-04b):

| Capa | Tecnología | ADR |
|------|-----------|-----|
| **Frontend** | Vue 3 + Composition API (`<script setup>`) + Vite 5 + TypeScript | ADR-01b |
| **Estilos** | Tailwind CSS v3, Atomic Design simplificado (atoms → molecules → organisms → pages) | ADR-01b |
| **Estado cliente** | Pinia (stores por dominio: `auth`, `agenda`, `residente`, `incidencia`, `turno`, `notificacion`) | ADR-01b |
| **Routing** | Vue Router 4 | ADR-01b |
| **HTTP client** | Axios con interceptores para token Firebase Auth | ADR-01b |
| **Testing frontend** | Vitest (unitarios) + Playwright (E2E) | ADR-01b |
| **Backend** | Express.js (Node.js) + Firebase Admin SDK (Cloud Run) | ADR-02b |
| **Base de datos** | Cloud Firestore (región `europe-west1` / `europe-west3`, EU) | ADR-02b |
| **Autenticación** | Firebase Auth (email/password) + Custom Claims de rol | ADR-03b |
| **Seguridad datos** | Firestore Security Rules + middleware Express `verifyIdToken` | ADR-03b |
| **Hosting** | Firebase Hosting (frontend SPA Vue 3) | ADR-04b |
| **API** | Cloud Run — Express.js con Firebase Admin SDK (contenedor Docker, región EU) | ADR-04b |
| **Functions** | Cloud Functions callable (2nd gen) — alertas críticas, triggers | ADR-04b |
| **CI/CD** | GitHub Actions (lint + type-check + build + tests) | ADR-04b |
| **Dev local** | Firebase Local Emulator Suite (Auth + Firestore) | ADR-02b |
| **Linting** | ESLint + Prettier + Husky | — |
| **Datos de prueba** | `@faker-js/faker` (sin PII real, cumple RGPD) | ADR-04b |

## Restricciones

- Entrega: 2026-05-18
- Equipo: solo
- Restricciones técnicas: consultar SPEC/constraints.md

*Última actualización: 2026-04-01*
