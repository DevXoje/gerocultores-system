# ADR-10: Workload Identity Federation para Deploy de Cloud Functions

- **Estado**: PROPOSED
- **Fecha**: 2026-05-02
- **Autor**: Jose Vilches Sánchez
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026

## Resumen ejecutivo

Este ADR propone la adopción de **Workload Identity Federation (WIF)** para autenticar los deploys de Cloud Functions tanto en entorno local como en GitHub Actions, eliminando la necesidad de almacenar Service Account Keys (archivos JSON con claves privadas) en variables de entorno o secretos.

## Problema

### Situación actual

El sistema actual de deployment presenta las siguientes limitaciones:

```
┌─────────────────────────────────────────────────────────────────┐
│  Deploy local (firebase deploy)                                 │
│    ├─ Usa firebase login (OAuth token del usuario)              │
│    └─ NO necesita service account keys ✓                        │
│                                                                  │
│  Deploy desde GitHub Actions                                     │
│    └─ Usa FIREBASE_TOKEN (generado via firebase login:ci)       │
│       - Token persistente (no expira)                            │
│       - Almacenado como secreto GitHub                          │
│       - Riesgos: exposición = compromiso permanente             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Código API (firebase-admin en Cloud Function desplegada)        │
│    ├─ Production: ADC automático (GCP provee credenciales) ✓     │
│    └─ Emuladores locales: GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY │
│       - Clave privada almacenada en .env                        │
│       - Riesgo: filtrada = compromiso                           │
└─────────────────────────────────────────────────────────────────┘
```

### Riesgos identificados

1. **Service Account Keys para emuladores**: Las credenciales de Service Account se almacenan en `.env.local` y `.env`, creando riesgo de filtración accidental.
2. **FIREBASE_TOKEN en GitHub Actions**: Token persistente sin expiración almacenado como secreto.
3. **Modelo de confianza**: Las credenciales no están vinculadas a la identidad del entorno (máquina local, GitHub Actions).

## Opciones consideradas

### Opción A — Mantener el status quo

**Descripción**: Continuar usando `firebase login` para local y `FIREBASE_TOKEN` para GitHub Actions.

**Pros**:
- Implementación inmediata
- Sin cambios en infraestructura GCP

**Contras**:
- Token persistente en GitHub (riesgo de compromiso)
- Service account keys en variables de entorno para emuladores
- No cumple con mejores prácticas de seguridad (NIST, SOC2)

### Opción B — Workload Identity Federation (propuesta)

**Descripción**: Implementar WIF para conectar las identidades de deployment (máquina local, GitHub Actions) con GCP IAM, usando tokens de corta duración y sin claves privadas.

**Arquitectura propuesta**:

```
┌─────────────────────────────────────────────────────────────────┐
│  DEPLOY LOCAL                                                   │
│                                                                  │
│  Workload Identity Pool (local)                                 │
│    └─绑定 tu Google Cloud project                                │
│    └─ Genera tokens cortos (STS)                                │
│                                                                  │
│  firebase deploy                                                │
│    └─ Recibe token temporal                                     │
│    └─ Impersona Service Account de deployment                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS                                                 │
│                                                                  │
│  GitHub OIDC Provider (configurado en GCP)                      │
│    └─ Cada workflow recibe token OIDC automáticamente           │
│    └─ Token intercambiado por GCP access token (STS)            │
│    └─ No secretos almacenados                                    │
│                                                                  │
│  firebase deploy                                                │
│    └─ Usa access token para autenticarse                        │
└─────────────────────────────────────────────────────────────────┘
```

**Pros**:
- Cero credenciales almacenadas (keys, tokens persistentes)
- Tokens de corta duración (minutos)
- Trazabilidad completa (quién deployó, desde qué pipeline)
- Cumplimiento normativo mejorado
- Revocación inmediata desde GCP IAM

**Contras**:
- Configuración inicial compleja
- Requiere permisos de administrador en GCP para configurar WIF
- Curva de aprendizaje

### Opción C — Token OAuth con Google WIF (Mixto)

**Descripción**: Mantener `firebase login:ci` para local pero usar WIF solo para GitHub Actions.

**Pros**:
- Simplifica la fase de transición
- Solo CI requiere configuración WIF

**Contras**:
- No unifica la autenticación
- Mantiene tokens persistentes para uso local

## Decisión

Se elige **Opción B: Workload Identity Federation** como estrategia a largo plazo.

### Estrategia de implementación en dos fases

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: Deployment local funcional (mínimo viable)            │
│  ─────────────────────────────────────────────────────────────  │
│  Objetivo: Verificar que firebase deploy funciona correctamente  │
│  desde máquina local sin errores de credenciales                │
│                                                                  │
│  Paso 1.1: Limpiar vars de entorno obsoletas                   │
│  Paso 1.2: Verificar autenticación firebase login               │
│  Paso 1.3: Ejecutar deploy y confirmar function en Firebase   │
│  Paso 1.4: Documentar proceso de deployment local              │
│                                                                  │
│  Responsable: Jose (desarrollo)                                 │
│  Entregable: Función desplegada y accesible en Firebase Console  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: Migración GitHub Actions a WIF                         │
│  ─────────────────────────────────────────────────────────────  │
│  Objetivo: Eliminar FIREBASE_TOKEN y usar WIF para CI/CD        │
│                                                                  │
│  Paso 2.1: Configurar GitHub OIDC Provider en GCP               │
│  Paso 2.2: Crear Workload Identity Pool                         │
│  Paso 2.3: Configurar Workload Identity Provider para GitHub    │
│  Paso 2.4: Vincular provider al Service Account de deployment   │
│  Paso 2.5: Actualizar GitHub Actions workflow con WIF           │
│  Paso 2.6: Eliminar secreto FIREBASE_TOKEN                     │
│  Paso 2.7: Validar deploy desde CI/CD                           │
│                                                                  │
│  Responsable: Jose (desarrollo)                                 │
│  Entregable: Pipeline CI/CD con WIF funcionando                 │
└─────────────────────────────────────────────────────────────────┘
```

## Especificación técnica (Fase 1 — Deploy local)

### Objetivo inmediato

Verificar que `firebase deploy --only functions` desde máquina local:

1. Autentica correctamente via `firebase login`
2. Despliega la función `api` a Cloud Functions
3. La función aparece en Firebase Console
4. La función responde correctamente

### Pasos de verificación

```bash
# 1. Verificar que firebase está autenticado
firebase projects:list

# 2. Verificar proyecto actual
firebase projects:current

# 3. Limpiar variables de entorno que puedan interferir
# En code/api/.env.local, eliminar o comentar:
# GOOGLE_CLIENT_EMAIL=
# GOOGLE_PRIVATE_KEY=
# GOOGLE_FIRESTORE_EMULATOR_HOST=
# GOOGLE_AUTH_EMULATOR_HOST=
# USE_EMULATORS=false

# 4. Ejecutar deployment
cd code
firebase deploy --only functions --project gero-care

# 5. Verificar en Firebase Console:
# - Cloud Functions → La función "api" aparece
# - Revisar logs de la función
# - Probar endpoint: https://europe-west1-gero-care.cloudfunctions.net/api/
```

### Variables de entorno para producción (Cloud Functions desplegadas)

Una vez desplegada la función, **NO** necesitan variables de entorno de Service Account. GCP provee ADC automáticamente.

### Variables de entorno para desarrollo local con emuladores

Solo para testing local con emuladores:

```
# code/api/.env.local (NUNCA hacer commit de este archivo)
USE_EMULATORS=true
GOOGLE_FIRESTORE_EMULATOR_HOST=localhost:8080
GOOGLE_AUTH_EMULATOR_HOST=localhost:9099
GOOGLE_PROJECT_ID=gero-care
```

> **Nota**: Para emuladores, NO se necesita `GOOGLE_CLIENT_EMAIL` ni `GOOGLE_PRIVATE_KEY`. El emulador se configura via variables de entorno de host/port únicamente.

## Especificación técnica (Fase 2 — WIF para GitHub Actions)

### Configuración GCP

```bash
# 1. Habilitar APIs necesarias
gcloud services enable \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  cloudbuild.googleapis.com

# 2. Crear Workload Identity Pool
gcloud iam workload-identity-pools create "gerocultores-deploy" \
  --project="gero-care" \
  --location="global" \
  --display-name="GeroCare Deploy Pool"

# 3. Crear Workload Identity Provider (GitHub)
gcloud iam workload-identity-pools providers create-oidc "github-actions" \
  --project="gero-care" \
  --location="global" \
  --workload-identity-pool="gerocultores-deploy" \
  --display-name="GitHub Actions OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='xojevilches/gerocultores-system'"

# 4. Crear Service Account para deployment
gcloud iam service-accounts create "github-deploy" \
  --project="gero-care" \
  --display-name="GitHub Actions Deploy SA"

# 5. Vincular Service Account al Workload Identity Pool
gcloud iam service-accounts add-iam-policy-binding \
  "github-deploy@gero-care.iam.gserviceaccount.com" \
  --project="gero-care" \
  --role="roles/cloudfunctions.developer" \
  --workload-identity-pool="gerocultores-deploy" \
  --workload-identity-provider="github-actions"

# 6. Generar credential configuration para GitHub
gcloud iam workload-identity-pools create-cred-config \
  "projects/gero-care/locations/global/workloadIdentityPools/gerocultores-deploy/providers/github-actions" \
  --service-account="github-deploy@gero-care.iam.gserviceaccount.com" \
  --output-file=".github/workflows/github-actions-oidc-config.json" \
  --Credential-source-type="json"
```

### GitHub Actions Workflow (actualizado)

```yaml
name: Deploy Firebase Functions

on:
  push:
    branches: [main]
    paths: ['code/api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Necesario para OIDC
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/gero-care/locations/global/workloadIdentityPools/gerocultores-deploy/providers/github-actions'
          service_account: 'github-deploy@gero-care.iam.gserviceaccount.com'

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'code/api/package-lock.json'

      - name: Install dependencies
        run: npm ci
        working-directory: code/api

      - name: Lint
        run: npm run lint
        working-directory: code/api

      - name: Build
        run: npm run build
        working-directory: code/api

      - name: Deploy to Firebase
        run: firebase deploy --only functions --project gero-care
        working-directory: code
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}  # Temporal, eliminar al validar WIF
```

> **Nota**: Una vez validado que WIF funciona, eliminar la línea `FIREBASE_TOKEN`.

## Consecuencias

### Positivas

- **Seguridad mejorada**: Sin claves privadas almacenadas, sin tokens persistentes
- **Trazabilidad**: Cada deploy tiene identidad verificable (máquina local o pipeline de CI)
- **Cumplimiento**: Mejora alineación con controles de seguridad NIST e ISO 27001
- **Mantenimiento reducido**: No hay keys que rotar o revocar

### Negativas

- **Complejidad inicial**: Configuración de WIF requiere permisos elevados en GCP
- **Dependencia de GCP**: La solución es específica de Google Cloud
- **Curva de aprendizaje**: Requiere entender OIDC, STS, y Workload Identity

### Impacto en codebase

- Ningún cambio en código de API (`src/`)
- Cambio en GitHub Actions workflow (migración de secrets a WIF)
- Cambio en documentación de deployment

## Criterios de aceptación

### Fase 1 (Deploy local)

- [ ] `firebase login` autenticado correctamente
- [ ] `firebase deploy --only functions` completa sin errores
- [ ] Función `api` visible en Firebase Console
- [ ] Función responde a requests HTTP
- [ ] Logs de la función accesibles

### Fase 2 (WIF para GitHub Actions)

- [ ] WIF Pool y Provider configurados en GCP
- [ ] Service Account vinculado con permisos de Cloud Functions
- [ ] GitHub Actions usa autenticación OIDC (sin `FIREBASE_TOKEN`)
- [ ] Deploy desde CI/CD funciona correctamente
- [ ] Secrets de GitHub no contienen tokens de Firebase

## Referencias

- [Workload Identity Federation — Google Cloud IAM](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Federating with GitHub Actions — Google Cloud](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [firebase deploy — Firebase CLI](https://firebase.google.com/docs/cli/auth#deploy-command)
- [GitHub Actions OIDC — google-github-actions/auth](https://github.com/google-github-actions/auth)

## Notas

- ADR creado como parte del proceso de mejora de seguridad y preparación para CI/CD.
- Fase 1 es prerequisite para validar que el deployment funciona antes de abordar la complejidad de WIF.
- Este ADR no reemplaza ningún ADR anterior; es aditivo al sistema de arquitectura.