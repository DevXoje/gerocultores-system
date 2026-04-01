# ADR-04b: Despliegue, Infraestructura y RGPD (Firebase Stack)

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

El proyecto Firebase DEBE configurarse con la localización de Firestore en **`europe-west1` (Bélgica)** o **`europe-west3` (Frankfurt)** para cumplir RGPD. Esta decisión es **definitiva** independientemente del hosting.

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
- Plan Spark (gratuito) suficiente para proyecto académico.
- La Express API se ejecuta localmente o vía Firebase Local Emulator Suite en desarrollo; en producción puede desplegarse como Cloud Function si se necesita (fuera del scope académico inicial).

## Opciones consideradas (hosting)

### Opción A — Firebase Hosting ✅ (elegida)
- **Pro**: Mismo ecosistema, deploy en un comando, CDN, SSL automático, plan gratuito Spark. Integración nativa con Firebase Auth/Firestore. Sin coste adicional.
- **Contra**: Limitado a assets estáticos + Cloud Functions si se necesita SSR o API serverless. Para este proyecto (SPA + Express local/emulador), es suficiente.

### Opción B — Google Cloud Run
- **Pro**: Contenedor Docker, Express API y SPA juntos, escalado automático, región EU.
- **Contra**: Requiere Dockerfile, mayor complejidad de CI/CD. Coste por invocación. Excesivo para proyecto académico individual.

### Opción C — Firebase Hosting (frontend) + Cloud Functions (API Express)
- **Pro**: Frontend estático en CDN + API serverless, misma consola Firebase.
- **Contra**: Cloud Functions tiene cold starts, plan Blaze requerido para egress. Mayor complejidad que necesaria para el scope académico.

### Opción D — Vercel/Netlify (frontend) + otro servicio (API)
- **Pro**: Deploy frontend excelente, previews por PR.
- **Contra**: Dos proveedores distintos de Firebase. Sin integración nativa con Firebase Auth/Firestore. Mayor fricción operativa.

## Consecuencias

- **Positivas**: Deploy en un comando (`firebase deploy`), CDN global, HTTPS automático, integración nativa con Firebase Auth y Firestore, dominio personalizable, plan gratuito Spark suficiente para proyecto académico.
- **Negativas**: Vendor lock-in con Google/Firebase. Si se necesita SSR o endpoints API en producción real, requeriría Cloud Functions (plan Blaze) o separar el deploy.
- **RGPD**: Cumplido mediante región EU + datos ficticios + HTTPS automático + cifrado en reposo de Firestore.
- **Académica**: La memoria debe documentar la justificación de Firebase Hosting frente a alternativas y la estrategia de RGPD con datos ficticios.

## Criterios de aceptación

- [ ] Proyecto Firebase creado en región EU (`europe-west1` o `europe-west3`).
- [ ] Firebase Hosting configurado en `firebase.json` con el directorio de build correcto.
- [ ] `firebase deploy` ejecutado con éxito al menos una vez.
- [ ] CI/CD configurado con GitHub Actions (lint + build + test + deploy).
- [ ] No hay PII real en ningún entorno.
- [ ] HTTPS en todos los entornos (automático con Firebase Hosting).
- [ ] `.env.example` documentado con todas las variables requeridas.

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-01. Hosting decidido: Firebase Hosting.  
> Fecha de creación: 2026-03-29  
> Actualizado: 2026-04-01 — Hosting resuelto a Firebase Hosting; DRAFT → ACCEPTED.  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-04 (superseded) — Supabase + Vercel.
- ADR-01b — Vue 3 + Vite (frontend a desplegar).
- ADR-02b — Firestore en EU (misma consola Firebase).
- ADR-03b — Firebase Auth (misma consola Firebase).
- SPEC/constraints.md § 3 — RGPD.
