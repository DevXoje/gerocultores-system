# ADR-04b: Despliegue, Infraestructura y RGPD (Firebase Stack)

- **Estado**: DRAFT
- **Fecha**: 2026-03-29
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-04 (Supabase Frankfurt + Vercel)

> ⚠️ **DRAFT — Pendiente aprobación por Jose Vilches Sánchez.**

## Contexto

Al pivotar el stack a Firebase (ADR-01b, ADR-02b, ADR-03b), las decisiones de despliegue deben actualizarse. La plataforma de hosting específica queda **POR DEFINIR** — Jose debe decidir entre Firebase Hosting, Cloud Run, u otra opción antes de las tareas de deploy de Sprint-1.

## Decisiones tomadas

### 1. Región de datos: EU

El proyecto Firebase DEBE configurarse con la localización de Firestore en **`europe-west1` (Bélgica)** o **`europe-west3` (Frankfurt)** para cumplir RGPD. Esta decisión es **definitiva** independientemente del hosting.

### 2. RGPD — Datos ficticios

Por tratarse de un proyecto académico DAW, la base de datos NUNCA contendrá PII real. Todos los datos de prueba se generan con `@faker-js/faker` (nombres, DNIs, patologías ficticias). Esto cumple íntegramente con el RGPD al trabajar con datos seudonimizados.

### 3. Cifrado

- **En tránsito**: HTTPS obligatorio (provisto por Firebase/GCP por defecto).
- **En reposo**: Firestore cifra datos en reposo automáticamente (Google Cloud encryption at rest).

### 4. CI/CD

- **GitHub Actions**: lint + type-check + build + test en cada PR a `main`.
- **Deploy**: Se definirá cuando se elija la plataforma de hosting.

### 5. Hosting — POR DEFINIR

> **TODO**: Jose Vilches Sánchez debe elegir la plataforma de hosting antes de Sprint-1 deploy tasks.
>
> **Opciones a evaluar**:
> - **Firebase Hosting**: Deploy simple (`firebase deploy`), CDN global, integración nativa con Firebase Auth/Firestore. Gratis (Spark plan) para SPAs estáticas.
> - **Google Cloud Run**: Contenedor Docker, más flexible, permite Express API + SPA en un mismo servicio. Coste por uso.
> - **Vercel/Netlify (solo frontend)**: CDN edge, deploy automático desde GitHub. Requiere deploy separado para Express API.
>
> **Criterios de decisión**: coste ($0 ideal), complejidad de setup, coherencia con el ecosistema Firebase, demostración académica.
>
> **Backlog reference**: Tarea T-XX (por crear) en PLAN/backlog.md — Sprint-0 o Sprint-1.
> **Blocker**: Las tareas de deploy de Sprint-1 NO pueden comenzar sin esta decisión.

## Opciones consideradas (hosting)

### Opción A — Firebase Hosting
- **Pro**: Mismo ecosistema, deploy en un comando, CDN, SSL automático, plan gratuito Spark.
- **Contra**: Limitado a assets estáticos + Cloud Functions (si se necesita server-side rendering).

### Opción B — Google Cloud Run
- **Pro**: Contenedor Docker, Express API y SPA juntos, escalado automático, región EU.
- **Contra**: Requiere Dockerfile, mayor complejidad de CI/CD. Coste por invocación.

### Opción C — Firebase Hosting (frontend) + Cloud Functions (API Express)
- **Pro**: Frontend estático en CDN + API serverless, misma consola Firebase.
- **Contra**: Cloud Functions tiene cold starts, plan Blaze requerido para egress.

### Opción D — Vercel/Netlify (frontend) + otro servicio (API)
- **Pro**: Deploy frontend excelente, previews por PR.
- **Contra**: Dos proveedores, más complejidad.

> **La decisión entre estas opciones queda PENDIENTE.** No se elige hosting en este ADR.

## Consecuencias

- **RGPD**: Cumplido mediante región EU + datos ficticios + cifrado por defecto.
- **Blocker**: Hosting sin decidir → tareas de deploy de Sprint-1 bloqueadas.
- **Académica**: La memoria debe documentar la justificación de la plataforma final elegida.

## Criterios de aceptación

- [ ] Proyecto Firebase creado en región EU (`europe-west1` o `europe-west3`).
- [ ] Hosting elegido y documentado (actualizar este ADR a ACCEPTED).
- [ ] CI/CD configurado con GitHub Actions (lint + build + test).
- [ ] No hay PII real en ningún entorno.
- [ ] HTTPS en todos los entornos.
- [ ] `.env.example` documentado con todas las variables requeridas.

## Nota de aprobación

> **PENDIENTE**: Este ADR requiere:
> 1. Jose elige hosting → actualizar sección 5.
> 2. Aprobación explícita antes de marcar como ACCEPTED.
>
> Fecha de creación: 2026-03-29  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-04 (superseded) — Supabase + Vercel.
- ADR-02b — Firestore en EU.
- ADR-03b — Firebase Auth.
- SPEC/constraints.md § 3 — RGPD.
