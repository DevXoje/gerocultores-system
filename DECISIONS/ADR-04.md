# ADR-04: Despliegue, Infraestructura y Cumplimiento RGPD

- **Estado**: PROPOSED
- **Fecha**: 2026-04-24
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-04b (Despliegue Firebase Hosting + RGPD)

## Contexto

El proyecto GeroCare ha pivotado a Firebase (ADR-01b, ADR-02b, ADR-03b). Se requiere documentar la estrategia de despliegue completa y el cumplimiento RGPD para el sistema. El proyecto es académico individual con deadline 2026-05-18 y presupuesto mínimo. Los datos gestionados incluyen datos de categoría especial RGPD (salud de residentes), por lo que la residencia de datos en la UE es obligatoria. El `seguridad-rgpd.md` ya documenta la base legal y medidas técnicas; este ADR cubre la infraestructura de despliegue y las obligaciones RGPD operativas.

## Opciones consideradas

### Opción A — AWS / Azure como cloud provider
- **Pro**: Amplia gama de servicios, gran capacidad de escalado.
- **Contra**: Ecosistema fragmentado, mayor complejidad de configuración, coste más alto, SDKs distintos a Firebase Auth ya elegido (ADR-03b).

### Opción B — Vercel (frontend) + Railway/Render (API Express) + Supabase (DB)
- **Pro**: Excelente experiencia de desarrollo para frontend, preview channels nativos.
- **Contra**: Tres proveedores distintos, pérdida de coherencia con Firebase Auth/Firestore ya adoptados. Mayor fricción operativa. Coste acumulado.

### Opción C — Firebase Hosting + Firebase Cloud Functions + Firestore EU (propuesta)
- **Pro**: Un solo ecosistema, coherencia total con Firebase Auth (ADR-03b) y Firestore (ADR-02b). Preview channels por PR nativos en Firebase Hosting. Firebase Emulator para desarrollo local. Plan Spark gratuito suficiente.
- **Contra**: Vendor lock-in con Google. Cloud Functions requiere plan Blaze si se necesita egress externo. Cold starts en Functions.

### Opción D — Despliegue on-premise
- **Pro**: Control total de datos, sin dependencia de cloud.
- **Contra**: Coste de servidor y mantenimiento, complejidad de red y backups, inviable para proyecto académico individual con presupuesto mínimo.

## Decisión

Se elige **Opción C: Firebase Hosting + Firebase Cloud Functions + Firestore EU (Alemania)**.

### 1. Región de datos

Firestore se configura en **`europe-west3` (Fráncfort, Alemania)**. Esta decisión es **definitiva** y supersede cualquier configuración regional anterior. Todo el tráfico de datos permanece en territorio de la Unión Europea, cumplimiento RGPD art. 44 y siguientes.

```
Firestore → europe-west3 (Frankfurt, Germany)
           └── No se usa ninguna otra región Firebase en este proyecto
```

### 2. Environments

| Entorno | Dominio | Propósito |
|---------|---------|-----------|
| `preview` | `https://{project}-{branch}.web.app` | Por PR — review automático |
| `staging` | `https://gerocultores-staging.web.app` | Pre-producción |
| `production` | `https://gerocultores.web.app` | Uso real del tribunal DAW |

### 3. Hosting — Firebase Hosting

- **Frontend SPA**: Vue 3 (build en `dist/`)
- **Preview channels**: activos por defecto en Firebase Hosting (1 por PR)
- **SSL**: automático por Firebase Hosting
- **CDN**: global, incluido EU
- **Deploy**: `firebase deploy --only hosting`

### 4. API — Firebase Cloud Functions (Express)

- **Runtime**: Node.js 20
- **Región**: `europe-west3` (misma región que Firestore)
- **Framework**: Express.js (API wrapper ya definido en ADR-02b)
- **Variables**: Firebase Secret Manager (no `.env` en repositorio)

### 5. Base de datos — Firestore EU

- **Región**: `europe-west3`
- **Modo**: Native Mode (NoSQL)
- **Cifrado**: en reposo automático (Google Cloud encryption)
- **Seguridad**: Firestore Rules con control por rol (ADR-03b)

### 6. CI/CD — GitHub Actions

```yaml
# Trigger: push a main (staging/production) o PR (preview)
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm run test
      # Solo en push a main:
      - if: github.ref == 'refs/heads/main'
        run: firebase deploy --only hosting,functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 7. Variables de entorno y secretos

| Variable | Uso | Gestión |
|----------|-----|---------|
| `VITE_FIREBASE_API_KEY` | Cliente Vue | Firebase config ( pública ) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Cliente Vue | Firebase config ( pública ) |
| `VITE_FIREBASE_PROJECT_ID` | Cliente Vue | Firebase config ( pública ) |
| `VITE_FIREBASE_REGION` | Cliente Vue (europe-west3) | Firebase config ( pública ) |
| `FIREBASE_TOKEN` | CI/CD deploy | GitHub Secrets |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK | GitHub Secrets |

> **G05**: Ninguna API key, token ni credential en código fuente. `.env.example` documenta todas las variables necesarias.

### 8. Firebase Emulator (desarrollo local)

```bash
# startup
npm run emulators
# endpoints
# - Frontend: http://localhost:4000
# - Firestore: localhost:4001
# - Functions: localhost:4001 (same port as Firestore in emulator)
# - Auth: localhost:4002
```

El emulator replica el entorno producción en local, incluyendo Firestore, Auth, y Functions. Datos ficticios con `@faker-js/faker`.

### 9. RGPD — Cumplimiento integral

#### 9.1 Base legal del tratamiento

| Tipo de dato | Base legal RGPD | Fundamento |
|---|---|---|
| Datos de salud (residentes) | Art. 9.2.h | Prestación de asistencia sanitaria y social |
| Datos operativos (tareas, incidencias) | Art. 6.1.c | Cumplimiento de obligación legal (trazabilidad) |
| Datos de gerocultores (credenciales) | Art. 6.1.b | Ejecución de contrato |

#### 9.2 Datos de categoría especial

Las incidencias de salud (`Incidencia` entity) y los campos de salud del residente (`diagnosticos`, `alergias`, `medicacion`, `preferencias`) son **datos de categoría especial** (art. 9 RGPD). Requieren:

- Consentimiento explícito del residente o su representante legal (documentado)
- Acceso restringido a rol `gerocultor` y `admin` exclusivamente
- No transferencia fuera de la UE bajo ninguna circunstancia

#### 9.3 Derechos de los interesados

| Derecho | Implementación en GeroCare |
|---|---|
| **Acceso** (art. 15) | El admin puede exportar datos de cualquier residente via Firestore console o API |
| **Rectificación** (art. 16) | Admin edita la ficha del residente en `residentes` collection |
| **Supresión / Derecho al olvido** (art. 17) | El admin puede eliminar documentos de residente. Las incidencias son inmutables ( reglas Firestore ). Datos anonimizados tras 2 años |
| **Portabilidad** (art. 20) | Exportación JSON de todos los datos de un residente via API endpoint dedicada |
| **Limitación del tratamiento** (art. 18) | En proceso de小龙 implementation [PENDIENTE] |

#### 9.4 Política de retención de datos

| Tipo de dato | Retención | Justificación |
|---|---|---|
| Datos de residente (ficha clínica) | 2 años tras última interacción | Periodo razonable para seguimiento asistencial |
| Incidencias (logs de salud) | 5 años | Obligación legal de registro sanitario |
| Logs de acceso/auditoría | 5 años | Trazabilidad ante inspección |
| Datos de gerocultor (cuenta) | Durante vigencia + 1 año | Gestión de cuenta y resolución de incidentes |

> Pasado el periodo de retención, los datos se anonimizan o eliminan. En Firestore, un Cloud Function periódica (trigger pub/sub + scheduler) ejecuta la limpieza.

#### 9.5 Notificación de brechas de seguridad (art. 33)

Si se detecta una brecha de datos:

1. **0-24h**: Identificar alcance y datos afectados. Notificar a tutor del proyecto.
2. **24-72h**: Si la brecha implica datos de categoría especial, notificar a la autoridad de protección de datos (AEPD en España) y a los afectados.
3. **Documentación**: Registro de la brecha en `LOGS/incidentes-seguridad.md` con causa raíz, impacto y medidas correctivas.

#### 9.6 Evaluación de impacto (DPIA)

**No se requiere DPIA** para este proyecto. Justificación:

- Tratamiento de datos de salud bajo art. 9.2.h (finalidades asistenciales)
- Sistema no usa puntuación automatizada ni perfilado
- Menos de 5.000 interesados ( scope limitado a una residencia )
- Riesgo bajo para los derechos de los interesados

#### 9.7 Seguridad técnica

| Medida | Implementación |
|---|---|
| Cifrado en tránsito | HTTPS obligatorio en todos los entornos (Firebase Hosting) |
| Cifrado en reposo | Firestore encryption at rest (Google Cloud) |
| Control de acceso | Firestore Rules + Express middleware `verifyAuth` (ADR-03b) |
| RBAC | Dos roles: `gerocultor`, `admin` con custom claims (ADR-03b) |
| Tokens | Firebase Auth JWT con expiración 1h, refresh automático |
| Auditaría | Registro de operaciones con `usuarioId` + `timestamp` en cada documento |
| Almacenamiento cliente | Sin datos sensibles en `localStorage` (tokens en memoria solo) |

### 10. Alternativas rechazadas

| Alternativa | Razón de rechazo |
|---|---|
| AWS / Azure | Dos proveedores distintos al ecosistema Firebase ya elegido. Mayor coste y complejidad. |
| US regions (us-east1, us-central1) | Infringe RGPD art. 44 — transferencia de datos de salud fuera de EEA no permitida sin mecanismo adequacy. |
| On-premise | Coste de servidor, mantenimiento, backups inviable para proyecto académico individual. |
| Supabase como backend | Ya descartado en ADR-02b. Firebase es el provider coherente con Auth y Hosting. |
| Vercel/Netlify + Firebase | Dos proveedores para un mismo sistema. Sin integración nativa Firebase Auth. |

## Consecuencias

### Positivas
- **Un solo ecosistema**: Firebase Hosting + Functions + Firestore + Auth = una consola, un deploy, una factura.
- **Preview channels automáticos**: cada PR obtiene una URL de revisión sin configuración adicional.
- **Cumplimiento RGPD demostrable**: región EU documentada, base legal واضحة, derechos implementados.
- **CI/CD simple**: `firebase deploy` en un paso desde GitHub Actions.
- **Desarrollo local completo**: Firebase Emulator Suite replica todo el stack en local.

### Negativas
- **Vendor lock-in**: migración fuera de Firebase requiere reexportar datos (JSON desde Firestore) y reimplementar Auth.
- **Cloud Functions cold starts**: ~1-2s en primera invocación tras inactividad. Aceptable para el scope.
- **Plan Blaze requerido** si se necesitan outbound connections desde Functions a servicios externos (no previsto).

### Obligaciones ongoing
- Todo nuevo feature debe usar Firestore `europe-west3` exclusivamente.
- Ningún dato puede fluir a regiones Firebase en US.
- Nuevos campos de datos deben cumplir principio de minimización (art. 5.1.c RGPD).
- Cualquier cambio en el modelo de datos que implique nuevos campos de salud debe actualizarse en este ADR.

## Criterios de aceptación

- [ ] Firestore configurado en `europe-west3` (verificado en Firebase console).
- [ ] Firebase Hosting desplegado al menos una vez (`firebase deploy --only hosting`).
- [ ] GitHub Actions CI/CD configurado: lint + typecheck + build + test en PR a main.
- [ ] Deploy automático a producción tras merge a main.
- [ ] Preview channel activo para al menos un PR de prueba.
- [ ] `.env.example` documenta todas las variables Firebase necesarias.
- [ ] Firebase Emulator arrancable con `npm run emulators`.
- [ ] Policy de retención documentada en `LOGS/rention-policy.md`.
- [ ] Procedimiento de breach notification en `LOGS/incidentes-seguridad.md`.
- [ ] Export endpoint (`GET /api/admin/residentes/:id/export`) implementado para portabilidad.
- [ ] Cloud Function de limpieza (anonimización/eliminación post-retention) diseñada [pendiente implementación].

## Nota

> **PROPOSED**: Documentado el 2026-04-24 por Orchestrator (IA).  
> Pendiente revisión y aceptación por Jose Vilches Sánchez.  
> Este ADR supersede ADR-04b (Firebase Hosting + RGPD parcial). La configuración de región `europe-west3` es la decisión más importante de este documento y no admite excepciones.

## Referencias

- ADR-01b — Vue 3 + Vite (frontend).
- ADR-02b — Firestore como backend.
- ADR-03b — Firebase Auth + Firestore Rules.
- ADR-04b (superseded) — Firebase Hosting como plataforma de hosting.
- SPEC/constraints.md § 2.3 — Restricciones de despliegue.
- SPEC/constraints.md § 3 — Restricciones RGPD.
- SPEC/requirements.md — RNF-03 (Seguridad RGPD), RNF-07 (Trazabilidad), RNF-09 (Firestore Rules).
- OUTPUTS/academic/seguridad-rgpd.md — Sección de memoria académica DAW (borrador).
- RGPD: Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo.