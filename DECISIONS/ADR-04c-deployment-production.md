# ADR-04c: Despliegue en Producción — Firebase Hosting + Cloud Run + Cloud Functions

- **Estado**: ACCEPTED
- **Fecha**: 2026-04-25
- **Fecha de aceptación**: 2026-04-25
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-04b (Firebase Hosting solo para frontend; Express API solo local/emulador)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-25.**

## Contexto

ADR-04b (2026-04-01) definió Firebase Hosting para el frontend, dejando la Express API como servicio **solo local** o a través del emulador. A medida que avanzó la implementación, quedó claro que la API Express necesita un entorno de producción accesible desde el frontend desplegado. La arquitectura de 3 capas (Firebase Auth + Firestore + Express) requiere que la Express API sea un servicio desplegado independientemente, no solo local.

Adicionalmente, la implementación de notificaciones push y triggers de Firestore requiere Cloud Functions, no contempladas en ADR-04b.

## Decisiones tomadas

### 1. Región de datos: EU (sin cambio)

El proyecto Firebase se configura con Firestore en **`europe-west1` (Bélgica)** o **`europe-west3` (Frankfurt)** para cumplir RGPD. Confirmado desde ADR-04b.

### 2. RGPD — Datos ficticios (sin cambio)

Todos los datos de prueba se generan con `@faker-js/faker`. No existe PII real en ningún entorno.

### 3. Cifrado (sin cambio)

- **En tránsito**: HTTPS automático en Firebase Hosting y Cloud Run.
- **En reposo**: Firestore cifra en reposo automáticamente.

### 4. CI/CD — Dos deploys separados

- **GitHub Actions**: lint + type-check + build + test en cada PR a `main`.
- **Deploy frontend**: `firebase deploy --only hosting` → Firebase Hosting.
- **Deploy API**: `docker build + gcloud run deploy` → Cloud Run (`europe-west1`).
- **Deploy Functions**: `firebase deploy --only functions` → Cloud Functions 2nd gen.

### 5. Frontend — Firebase Hosting ✅

- Deploy con `firebase deploy --only hosting`.
- CDN global con HTTPS automático.
- Dominio: subdominio `.web.app` gratuito (o dominio propio).
- Integración nativa con Firebase Auth y Firestore.
- Plan Spark (gratuito) suficiente para el volumen académico.

### 6. API Express — Google Cloud Run ✅

- Contenedor Docker (`code/api/Dockerfile`).
- Región EU (`europe-west1` o `europe-west3`).
- Escalado automático a cero (sin coste cuando no hay tráfico).
- Verificación de tokens Firebase Auth mediante Firebase Admin SDK en `middleware/verifyAuth`.
- Plan Spark gratuito: 380.000 vCPU-segundos/mes + 180.000 solicitudes/mes — suficiente para el volumen académico.
- Variable de entorno `API_BASE_URL` en el frontend apunta al endpoint Cloud Run.

### 7. Notificaciones y Triggers — Cloud Functions (2nd gen) ✅

- Uso previsto: notificaciones push, triggers de Firestore para alertas críticas (US-08).
- Desplegadas en región EU.
- Plan Spark gratuito: 2.000.000 invocaciones/mes, 400.000 GB-segundos.
- Callable desde el frontend Vue con `firebase/functions` SDK.

## Opciones consideradas

### Opción A — Firebase Hosting + Cloud Run + Cloud Functions ✅ (elegida)
- **Pro**: Stack unificado Firebase/Google Cloud, región EU, plan gratuito Spark suficiente para el volumen académico, escalado automático a cero en Cloud Run, CI/CD con GitHub Actions.
- **Contra**: Vendor lock-in con Google. Requiere Dockerfile para Cloud Run. CI/CD más complejo (tres deploys separados: Hosting, Cloud Run, Functions).

### Opción B — Firebase Hosting + Cloud Functions (sin Cloud Run, API como Function HTTP)
- **Pro**: Todo dentro del ecosistema Firebase, sin Dockerfile.
- **Contra**: Cloud Functions tiene cold starts más pronunciados para APIs Express grandes. El plan Blaze (pago) puede ser necesario para egress elevado. Cloud Run es más flexible y económico para una API Express.

### Opción C — Vercel (frontend) + Cloud Run (API)
- **Pro**: Deploy frontend excelente con previews por PR, integración GitHub.
- **Contra**: Dos proveedores distintos. Sin integración nativa con Firebase Auth/Firestore en Vercel. Mayor fricción operativa y complejidad de CI/CD.

## Consecuencias

- **Positivas**: Stack unificado Google Cloud/Firebase. Deploys independientes (frontend desacoplado de API). CDN global para el frontend. Escalado automático en Cloud Run. Plan gratuito Spark suficiente para el volumen académico. Región EU asegurada (RGPD).
- **Negativas**: Vendor lock-in con Google/Firebase. Requiere mantener `Dockerfile` en `code/api/`. CI/CD más complejo (tres workflows de deploy separados).
- **RGPD**: Cumplido mediante región EU + datos ficticios + HTTPS automático + cifrado en reposo de Firestore.
- **Académica**: La memoria DAW debe documentar la arquitectura de tres servicios (Hosting, Cloud Run, Functions), la justificación frente a alternativas y la estrategia RGPD con datos ficticios.

## Criterios de aceptación

- [ ] Proyecto Firebase creado en región EU (`europe-west1` o `europe-west3`).
- [ ] Firebase Hosting configurado con directorio de build correcto (`dist/`).
- [ ] `Dockerfile` en `code/api/` para Cloud Run, `docker build` exitoso.
- [ ] Cloud Run desplegado y accesible con `GET /health`.
- [ ] Cloud Functions callable desplegadas para alertas críticas (US-08).
- [ ] CI/CD configurado con GitHub Actions (lint + build + test + deploy frontend + deploy API).
- [ ] No hay PII real en ningún entorno.
- [ ] HTTPS en todos los entornos (automático con Firebase Hosting y Cloud Run).
- [ ] `.env.example` documentado con todas las variables requeridas (frontend + API).
- [ ] Variable `API_BASE_URL` en el frontend apunta al endpoint Cloud Run en producción.

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-25.
> Supersede ADR-04b (Firebase Hosting solo para frontend; Express API solo local/emulador).
> Creado por: SDD Apply Agent (IA) — T-72 ADR review + rewrite.

## Referencias

- ADR-04b (superseded) — Firebase Hosting solo para frontend.
- ADR-04 (superseded) — Supabase + Vercel.
- ADR-01b — Vue 3 + Vite (frontend a desplegar en Firebase Hosting).
- ADR-02b — Firestore en EU (misma consola Firebase).
- ADR-03b — Firebase Auth (misma consola Firebase, middleware verifyAuth en Express).
- SPEC/constraints.md § 3 — RGPD.
- SPEC/user-stories.md — US-08 (notificaciones alertas críticas vía Cloud Functions).
