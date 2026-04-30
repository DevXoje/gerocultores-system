# Fuente de diseño: Stitch ↔ exports ↔ SPEC

> **Nota para agentes**: La generación de pantallas en Stitch puede tardar ~2 min y hacer timeout en la herramienta, pero la pantalla **sí se crea en segundo plano**. Antes de generar una pantalla nueva, consultar siempre `stitch_list_screens` para evitar duplicados. Ver protocolo completo en `AGENTS/stitch-workflow.md`.

> Índice de trazabilidad entre proyectos/pantallas en **Google Stitch**, archivos en `OUTPUTS/design-exports/` y requisitos en **SPEC/**.
> Normativa: [ADR-05](../../DECISIONS/ADR-05-stitch-design-source.md).

## Proyecto Stitch canónico (gerocultores)

| Campo | Valor |
|-------|--------|
| Título en Stitch | Dashboard - Care Home Mgmt |
| ID recurso | `projects/16168255182252500555` |

Exports generados el **2026-03-28** desde capturas (`screenshot.downloadUrl`) vía API Stitch (MCP `list_screens`).

## Cómo rellenar esta tabla

- **Proyecto Stitch**: nombre visible en Stitch; si usas IDs de recurso (p. ej. desde MCP), añádelos en una nota entre paréntesis.
- **Pantalla / label**: etiqueta de la pantalla o variante en Stitch (kebab-case recomendado en exports).
- **Archivo local**: ruta relativa al repo, p. ej. `OUTPUTS/design-exports/US-01-login__sign-in__20260328.webp`.
- **US / SPEC**: historia (`US-XX`) y, si aplica, sección de [SPEC/user-stories.md](../../SPEC/user-stories.md), [SPEC/flows.md](../../SPEC/flows.md) u otro documento.

Cuando añadas o cambies un export, actualiza la fila correspondiente o crea una nueva fila para la nueva revisión.

## Tabla

| Proyecto Stitch | Pantalla / label en Stitch | Archivo en `OUTPUTS/design-exports/` | US / referencia SPEC |
|-----------------|----------------------------|--------------------------------------|----------------------|
| Dashboard - Care Home Mgmt (`16168255182252500555`) | Dashboard - Care Home Mgmt | `OUTPUTS/design-exports/SPEC-app-layout__dashboard-care-home-mgmt__20260328.png` | SPEC / layout general; véase US-03 contexto |
| Dashboard - Care Home Mgmt | App Shell - Main Layout | `OUTPUTS/design-exports/SPEC-app-layout__app-shell-main-layout__20260328.png` | SPEC / shell navegación |
| Dashboard - Care Home Mgmt | Caregiver Dashboard | `OUTPUTS/design-exports/US-03-agenda-home__caregiver-dashboard__20260328.png` | [US-03](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Daily Agenda | `OUTPUTS/design-exports/US-03-daily-agenda__daily-agenda__20260328.png` | [US-03](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Daily Agenda - Care Management | `OUTPUTS/design-exports/US-03-daily-agenda__daily-agenda-care-management__20260328.png` | [US-03](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Daily Agenda - Refined v2 | `OUTPUTS/design-exports/US-03-daily-agenda__daily-agenda-refined-v2__20260328.png` | [US-03](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Task Detail - Medication Round | `OUTPUTS/design-exports/US-04-task-detail__task-detail-medication-round__20260328.png` | [US-04](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Resident Directory - Serenity Care | `OUTPUTS/design-exports/US-05-resident-list__resident-directory-serenity-care__20260328.png` | [US-05](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Resident Directory - Refined v2 | `OUTPUTS/design-exports/US-05-resident-list__resident-directory-refined-v2__20260328.png` | [US-05](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Resident Detail - Eleanor Vance | `OUTPUTS/design-exports/US-05-resident-detail__resident-detail-eleanor-vance__20260328.png` | [US-05](../../SPEC/user-stories.md) (datos ficticios en mockup) |
| Dashboard - Care Home Mgmt | Resident Records | `OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png` | [US-09](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Incident Reporting | `OUTPUTS/design-exports/US-06-incident__incident-reporting__20260328.png` | [US-06](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | New Incident Form - Serenity Care | `OUTPUTS/design-exports/US-06-incident__new-incident-form-serenity-care__20260328.png` | [US-06](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Incidents Log - Serenity Care | `OUTPUTS/design-exports/US-07-incidents-log__incidents-log-serenity-care__20260328.png` | [US-07](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Incidents Log - Refined v2 | `OUTPUTS/design-exports/US-07-incidents-log__incidents-log-refined-v2__20260328.png` | [US-07](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Critical Alerts - Serenity Care | `OUTPUTS/design-exports/US-08-alerts__critical-alerts-serenity-care__20260328.png` | [US-08](../../SPEC/user-stories.md) |
| Dashboard - Care Home Mgmt | Dashboard - Refined v2 | `OUTPUTS/design-exports/SPEC-app-layout__dashboard-refined-v2__20260328.png` | SPEC / layout home refinado |
| Dashboard - Care Home Mgmt | Task Creation Form (US-14) | — | [US-14](../../SPEC/changes/crear-tarea/spec.md) — Crear tarea |

## Notas

- Prioridad ante conflicto: **SPEC** define comportamiento y datos; el diseño en Stitch y estos exports son referencia visual.
- ADR-05 en estado **ACCEPTED** tras este lote de exports (2026-03-28).

## Vista ↔ Pantalla Stitch

> Este mapeo es la referencia canónica para el agente DEVELOPER.
> Antes de implementar cualquier vista, consulta esta tabla y abre el PNG correspondiente.
> Si la vista no aparece aquí, créala en Stitch primero (proyecto: Dashboard - Care Home Mgmt, id: 16168255182252500555).

| Vista Vue | Ruta componente | Pantalla Stitch | Export PNG |
|-----------|----------------|-----------------|------------|
| `LoginView.vue` | `src/views/LoginView.vue` | Login - Care & Serenity (`e5e3e7eea6e249929b0deef401bf083b`) | [preview](https://lh3.googleusercontent.com/aida/ADBb0ugiYoh_Ad7aV_MI_FWOSMnZLFnX4CpwuiO2juiNaLBw7UKGLuf01ouu4G2WCUl0OK3jiIkEEnVZ22NxIJCbl0LwHvuEplr5osSOt_huxaWEsLi2cMDdeFDuCI70yRLsBKxa15LgaVGLuQAzM9Djxmo-LYuo2kByRwztM0C6lxBBPN0Q1YP9Hl_NvOfIjxSuuh9BFqok51KdPNA3Zs4ur-oS53rcugUg07ApWpLFYYtFPNAqzGdYlusbAUQb) |
| `DashboardView.vue` | `src/views/DashboardView.vue` | Caregiver Dashboard | `OUTPUTS/design-exports/US-03-agenda-home__caregiver-dashboard__20260328.png` |
| `UsersView.vue` | `src/business/users/presentation/views/UsersView.vue` | Resident Records (`US-09-resident-records__resident-records__20260328.png`) | `OUTPUTS/design-exports/US-09-resident-records__resident-records__20260328.png` |
| `ResidenteView.vue` | `src/business/residents/presentation/views/ResidenteView.vue` | Resident Detail - Eleanor Vance | `OUTPUTS/design-exports/US-05-resident-detail__resident-detail-eleanor-vance__20260328.png` |
| `NotificationPanel.vue` | `src/business/notification/presentation/components/NotificationPanel.vue` | Notification Panel - Mobile (`9da813299be1474bb3293febda0c35fe`) | — |
| `TurnoView.vue` | `src/business/turno/presentation/views/TurnoView.vue` | Shift Management - Care & Serenity (`74dc49b5d18c44ea8ab1b6079320622f`) | — |
| `CreateTareaModal.vue` | `src/business/agenda/presentation/components/CreateTareaModal.vue` | Task Creation Form — US-14 | — |
