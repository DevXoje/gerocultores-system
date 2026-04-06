# 14. Recursos utilizados

> **Sección de la memoria académica DAW — gerocultores-system**  
> Autor: Jose Vilches Sánchez · CIPFP Batoi d'Alcoi · 2025-2026  
> ADRs de referencia: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05  
> Estado: BORRADOR — completar versiones exactas al finalizar el desarrollo

---

El stack tecnológico de gerocultores-system está formado íntegramente por herramientas de código abierto (licencias MIT o Apache 2.0) y servicios en la nube con plan gratuito suficiente para el alcance académico. El coste directo en herramientas y hosting es cero, lo que fue un requisito explícito en `SPEC/constraints.md`. La única excepción es Docker Desktop, que requiere licencia de pago para uso comercial pero es gratuito para uso educativo e individual.

Las versiones indicadas en la tabla corresponden a las versiones mínimas objetivo definidas en los ADRs. Las versiones exactas instaladas en el proyecto se actualizarán en esta sección cuando el scaffold esté completo (Sprint 0). Para las dependencias de Node.js, el fichero `package.json` del repositorio es la fuente de verdad de versiones exactas.

---

## Tabla de recursos

### Frontend

| Herramienta | Versión objetivo | Rol en el proyecto | Licencia | URL |
|-------------|-----------------|-------------------|----------|-----|
| Vue 3 | ^3.4 | Framework frontend SPA; Composition API con `<script setup>` | MIT | https://vuejs.org |
| Vite | ^5.0 | Bundler y servidor de desarrollo; módulos ES nativos, HMR instantáneo | MIT | https://vitejs.dev |
| Vue Router | ^4.0 | Enrutamiento SPA; rutas protegidas por autenticación | MIT | https://router.vuejs.org |
| Pinia | ^2.1 | Gestión de estado reactivo por dominio (`useAuthStore`, `useAgendaStore`, `useResidenteStore`) | MIT | https://pinia.vuejs.org |
| Axios | ^1.6 | Cliente HTTP; interceptor de token Firebase Auth en cabeceras Authorization | MIT | https://axios-http.com |
| Tailwind CSS | ^3.4 | Framework CSS de utilidades; diseño mobile-first y componentes accesibles | MIT | https://tailwindcss.com |
| TypeScript | ^5.0 | Tipado estático en frontend y backend; reduce errores de integración | Apache 2.0 | https://www.typescriptlang.org |

### Backend

| Herramienta | Versión objetivo | Rol en el proyecto | Licencia | URL |
|-------------|-----------------|-------------------|----------|-----|
| Node.js | ^20.x (LTS) | Entorno de ejecución del servidor Express | MIT | https://nodejs.org |
| Express.js | ^4.18 | Framework HTTP minimalista; API REST con middleware de autenticación | MIT | https://expressjs.com |
| Firebase Admin SDK | ^12.x | Acceso server-side a Firestore y Firebase Auth; verificación de ID tokens y custom claims | Apache 2.0 | https://firebase.google.com/docs/admin |
| @faker-js/faker | ^8.x | Generación de datos ficticios para desarrollo y tests; cumplimiento RGPD (nunca PII real) | MIT | https://fakerjs.dev |

### Servicios cloud (Firebase)

| Servicio | Plan | Rol en el proyecto | Región | URL |
|----------|------|-------------------|--------|-----|
| Firebase Authentication | Spark (gratuito) | Autenticación email/password; emisión de ID tokens JWT; custom claims de rol | Global | https://firebase.google.com/docs/auth |
| Cloud Firestore | Spark (gratuito) | Base de datos NoSQL; colecciones para las 7 entidades del dominio | europe-west1 / europe-west3 (EU) | https://firebase.google.com/docs/firestore |
| Firebase Hosting | Spark (gratuito) | Hosting SPA Vue compilada; CDN global + HTTPS automático; deploy con `firebase deploy` | Global (CDN) | https://firebase.google.com/docs/hosting |
| Firebase Local Emulator Suite | — (local) | Emulación local de Firestore + Auth para desarrollo y tests de Security Rules | Local | https://firebase.google.com/docs/emulator-suite |

### Testing

| Herramienta | Versión objetivo | Rol en el proyecto | Licencia | URL |
|-------------|-----------------|-------------------|----------|-----|
| Vitest | ^1.x | Tests unitarios de componentes Vue y lógica de stores Pinia | MIT | https://vitest.dev |
| Playwright | ^1.40 | Tests E2E de flujos completos (login, agenda, incidencias) en Chromium/Firefox | Apache 2.0 | https://playwright.dev |
| Firebase Emulator Suite | — | Tests de Firestore Security Rules con datos ficticios | Apache 2.0 | https://firebase.google.com/docs/emulator-suite |

### Tooling y DevOps

| Herramienta | Versión | Rol en el proyecto | Licencia | URL |
|-------------|---------|-------------------|----------|-----|
| Git | ^2.40 | Control de versiones; ramas por feature, commits con convención `feat(US-XX):` | GPL-2.0 | https://git-scm.com |
| GitHub | — | Repositorio del proyecto: **[URL_REPOSITORIO_GITHUB]** — GitHub Actions para CI/CD (lint + build + test + deploy) | Propietario (gratuito) | https://github.com |
| GitHub Actions | — | Pipeline CI/CD: lint, type-check, build, test y `firebase deploy` en cada PR a `main` | Propietario (gratuito en repos públicos) | https://github.com/features/actions |
| Docker Desktop | ^4.x | Entorno de desarrollo reproducible; contenedor Node.js para el backend Express | Gratuito (uso educativo) | https://www.docker.com/products/docker-desktop |
| ESLint | ^8.x | Linting de código TypeScript/Vue; reglas compartidas frontend + backend | MIT | https://eslint.org |
| Prettier | ^3.x | Formateo automático de código; integrado en el pipeline CI | MIT | https://prettier.io |
| VS Code | ^1.85 | IDE principal; extensiones Vue - Official, ESLint, Tailwind IntelliSense, Firebase | MIT (código) | https://code.visualstudio.com |
| pandoc | ^3.x | Conversión de Markdown a PDF/DOCX para entregables de la memoria académica | GPL-2.0 | https://pandoc.org |

### Diseño y prototipado

| Herramienta | Versión / Plan | Rol en el proyecto | Licencia | URL |
|-------------|---------------|-------------------|----------|-----|
| Google Stitch | — (web, gratuito) | Herramienta de prototipado UI asistida por IA; fuente autorizada de diseño visual (ADR-05); exports versionados en `OUTPUTS/design-exports/` | Propietario (gratuito) | https://stitch.withgoogle.com |

### Agentes de IA y metodología

| Herramienta | Versión | Rol en el proyecto | URL |
|-------------|---------|-------------------|-----|
| GGA (Gentleman Guardian Agent) | — | Revisor automático de código; valida guardrails G01-G09 en cada PR; detecta violaciones de convención de commits, entidades inconsistentes y secretos en código | — |
| SDD (Spec-Driven Development) | — | Metodología de trabajo con agentes IA; artefactos en `SPEC/`, `DECISIONS/`, `PLAN/`, `OUTPUTS/` | — |

---

## Repositorio del proyecto

El código fuente completo del proyecto está disponible en el siguiente repositorio de control de versiones:

**GitHub**: [URL_REPOSITORIO_GITHUB]

> ⚠️ **Pendiente del autor**: Sustituir `[URL_REPOSITORIO_GITHUB]` por la URL real del repositorio (p. ej. `https://github.com/jvilches/gerocultores-system`) antes de la entrega. La norma del CIPFP Batoi d'Alcoi exige que el código fuente se entregue mediante enlace a un repositorio de control de versiones.

---

*Borrador generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*ADRs fuente: ADR-01b, ADR-02b, ADR-03b, ADR-04b, ADR-05*  
*Extensión aproximada: 380 palabras (sin contar tablas)*  
*⚠️ Completar: versiones exactas desde `package.json` al finalizar Sprint 0*
