# ADR-04b: Despliegue, Infraestructura y RGPD (Firebase Hosting + Cloud Run)

- **Estado**: ACCEPTED
- **Fecha**: 2026-03-29
- **Fecha de aceptación**: 2026-04-01
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-04 (Supabase Frankfurt + Vercel)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-01.**

## Contexto

Al pivotar el stack a Firebase (ADR-01b, ADR-02b, ADR-03b), las decisiones de despliegue deben actualizarse. Proyecto académico DAW individual con deadline 2026-05-18. Se necesita hosting simple, compatible con Firebase Auth y Firestore ya elegidos, que cumpla RGPD con región EU, sin presupuesto para infraestructura compleja. Firebase Auth y Firestore ya están en el ecosistema Firebase, por lo que Firebase Hosting es la opción con menor fricción operativa y máxima coherencia de stack.

## Decisiones tomadas

### 1. Región de datos: EU

El proyecto Firebase DEBE configurarse con la localización de Firestore en **`europe-west1`** para cumplir RGPD. Esta decisión es **definitiva** independientemente del hosting.

### 2. RGPD — Datos ficticios

Por tratarse de un proyecto académico DAW, la base de datos NUNCA contendrá PII real. Todos los datos de prueba se generan con `@faker-js/faker` (nombres, DNIs, patologías ficticias). Esto cumple íntegramente con el RGPD al trabajar con datos seudonimizados.

### 3. Cifrado

- **En tránsito**: HTTPS obligatorio (provisto por Firebase Hosting por defecto).
- **En reposo**: Firestore cifra datos en reposo automáticamente (Google Cloud encryption at rest).

### 4. CI/CD

- **GitHub Actions**: lint + type-check + build + test en cada PR a `main`.
- **Deploy**: `firebase deploy` — despliega frontend (Firebase Hosting) y reglas Firestore en un único comando.

### 5. Hosting — Firebase Hosting ✅

Se elige **Firebase Hosting** como plataforma de hosting para el frontend (SPA Vue 3).

- Deploy con `firebase deploy` (un único comando).
- CDN global con HTTPS automático.
- Dominio personalizable (subdominio `.web.app` gratuito o dominio propio).
- Integración nativa con Firebase Auth y Firestore (mismo proyecto, misma consola).
- Plan Spark (gratuito) suficiente para el frontend.

### 6. API — Cloud Run ✅

Se elige **Google Cloud Run** para desplegar la API Express en producción.

- Contenedor Docker (Dockerfile en `code/api/`).
- Región EU (`europe-west1`).
- Escalado automático a cero (solo consume cuando hay tráfico).
- Integración con Firebase Auth mediante Firebase Admin SDK validando tokens en el middleware.
- Plan Spark gratuito de Firebase incluye uso de Cloud Run (380.000 vCPU-segundos, 180.000 solicitudes/mes).

### 7. Functions — Cloud Functions (callable) ✅

Se usa **Cloud Functions (2nd gen)** para funciones callable desde el frontend.

- Uso previsto: notificaciones push, triggers de Firestore para alertas críticas.
- Desplegadas en región EU.
- Plan Spark gratuito: 2.000.000 invocaciones/mes, 400.000 GB-segundos.

## Opciones consideradas (hosting)

### Opción A — Firebase Hosting + Cloud Run + Cloud Functions ✅ (elegida)
- **Pro**: Stack unificado Firebase/Google Cloud, región EU, plan gratuito Spark suficiente, escalado automático, CI/CD con GitHub Actions.
- **Contra**: Vendor lock-in con Google. Requiere Dockerfile para Cloud Run.

### Opción B — Vercel/Netlify (frontend) + Cloud Run (API)
- **Pro**: Deploy frontend excelente con previews por PR.
- **Contra**: Dos proveedores distintos, sin integración nativa con Firebase Auth/Firestore. Mayor fricción operativa y complejidad de CI/CD.

### Opción C — Solo Firebase Hosting + Cloud Functions (sin Cloud Run)
- **Pro**: Todo dentro del ecosistema Firebase.
- **Contra**: Cloud Functions tiene cold starts y el plan Blaze es de pago por egress. Cloud Run es más flexible y económico para una API Express.

## Consecuencias

- **Positivas**: Stack unificado Google Cloud/Firebase, deploys separados (frontend + API), CDN global para frontend, escalado automático en Cloud Run, plan gratuito Spark suficiente para el volumen académico, región EU asegurada.
- **Negativas**: Vendor lock-in con Google/Firebase. Requiere mantener Dockerfile para Cloud Run. CI/CD más complejo (dos despliegues distintos).
- **RGPD**: Cumplido mediante región EU + datos ficticios + HTTPS automático + cifrado en reposo de Firestore.
- **Académica**: La memoria debe documentar la justificación del stack Firebase/Cloud Run frente a alternativas y la estrategia de RGPD con datos ficticios.

## Criterios de aceptación

- [ ] Proyecto Firebase creado en región EU (`europe-west1`).
- [ ] Firebase Hosting configurado con directorio de build correcto (`dist/`).
- [ ] Dockerfile en `code/api/` para Cloud Run, builds erfolgreich.
- [ ] Cloud Run desplegado y accesible con `GET /health`.
- [ ] Cloud Functions callable desplegadas para alertas críticas.
- [ ] CI/CD configurado con GitHub Actions (lint + build + test + deploy frontend + deploy API).
- [ ] No hay PII real en ningún entorno.
- [ ] HTTPS en todos los entornos (automático con Firebase Hosting y Cloud Run).
- [ ] `.env.example` documentado con todas las variables requeridas (frontend + API).

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-01.
> **Actualizado**: 2026-04-25 — Cloud Run para API + Cloud Functions callable añadidos.
> Fecha de creación: 2026-03-29
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-04 (superseded) — Supabase + Vercel.
- ADR-01b — Vue 3 + Vite (frontend a desplegar).
- ADR-02b — Firestore en EU (misma consola Firebase).
- ADR-03b — Firebase Auth (misma consola Firebase).
- SPEC/constraints.md § 3 — RGPD.
