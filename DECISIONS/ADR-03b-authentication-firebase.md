# ADR-03b: Autenticación con Firebase Auth + Firestore Rules

- **Estado**: DRAFT
- **Fecha**: 2026-03-29
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-03 (Supabase Auth + RLS)

> ⚠️ **DRAFT — Pendiente aprobación por Jose Vilches Sánchez.**

## Contexto

El proyecto usaba Supabase Auth (ADR-03) integrado con PostgreSQL RLS. Al pivotar el backend a Firestore (ADR-02b), se necesita un sistema de autenticación coherente. Firebase Auth es la opción natural dentro del ecosistema Firebase.

## Opciones consideradas

### Opción A — Supabase Auth (stack original)
- **Pro**: Integración directa con PostgreSQL RLS, JWT automático.
- **Contra**: Incompatible si se abandona Supabase como backend. Dos proveedores de identidad sería confuso.

### Opción B — Firebase Auth + Firestore Rules + Express middleware (propuesta)
- **Pro**: Un solo ecosistema. Firebase Auth emite ID tokens verificables. Firestore Rules leen `request.auth.uid` y custom claims para control de acceso a nivel de documento. Express middleware verifica tokens con Admin SDK.
- **Contra**: Custom claims se gestionan solo vía Admin SDK (no desde el cliente).

### Opción C — JWT autogestionado con Express
- **Pro**: Control total, demo excelente para DAW.
- **Contra**: 3-5 días de desarrollo, alto riesgo de bugs de seguridad.

## Decisión

Se elige **Opción B: Firebase Auth + Firestore Rules + Express middleware**.

### Modelo de seguridad (3 capas)

| Capa | Mecanismo | Responsabilidad |
|------|-----------|-----------------|
| **1. Firebase Auth** | SDK cliente (`signInWithEmailAndPassword`) | Autenticación: verificar identidad del usuario |
| **2. Firestore Rules** | `request.auth.uid`, `request.auth.token.rol` | Autorización a nivel de documento (lectura/escritura) |
| **3. Express middleware** | `admin.auth().verifyIdToken(idToken)` | Autorización en endpoints API (lógica de negocio) |

### Roles y Custom Claims

| Rol | Custom Claim | Permisos |
|-----|-------------|----------|
| `gerocultor` | `{ rol: 'gerocultor' }` | CRUD sus tareas, read sus residentes asignados, create incidencias |
| `coordinador` | `{ rol: 'coordinador' }` | Read all, CRUD residentes, read todas las tareas/incidencias |
| `administrador` | `{ rol: 'administrador' }` | Full access, gestión de usuarios |

### Flujo de autenticación

```
[Cliente Vue]                    [Firebase Auth]              [Express API]
     │                                │                            │
     ├── signInWithEmailAndPassword ──►│                            │
     │◄── ID Token (JWT) ─────────────┤                            │
     │                                │                            │
     ├── GET /api/tareas ─────────────┼───── Authorization: ──────►│
     │   (Header: Bearer {idToken})   │      Bearer {idToken}      │
     │                                │                            ├── verifyIdToken()
     │                                │                            ├── Check custom claims
     │◄── 200 [tareas] ──────────────────────────────────────────── │
```

### Firestore Rules (ejemplo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios: solo lectura propia, admin gestiona
    match /usuarios/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth.token.rol == 'administrador';
    }
    // Tareas: gerocultor ve las suyas, coordinador ve todas
    match /tareas/{tareaId} {
      allow read: if request.auth != null && (
        resource.data.usuarioId == request.auth.uid ||
        request.auth.token.rol in ['coordinador', 'administrador']
      );
      allow update: if request.auth != null && (
        resource.data.usuarioId == request.auth.uid ||
        request.auth.token.rol in ['coordinador', 'administrador']
      );
    }
    // Residentes: acceso por asignación (via API) o coordinador
    match /residentes/{residenteId} {
      allow read: if request.auth != null && (
        request.auth.token.rol in ['coordinador', 'administrador']
      );
      // Gerocultores acceden via Express API (verifica asignación)
    }
    // Incidencias: inmutables post-creación
    match /incidencias/{incidenciaId} {
      allow create: if request.auth != null &&
        request.auth.token.rol in ['gerocultor', 'coordinador'];
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

> **Nota**: Las reglas completas se desarrollarán durante la implementación. El acceso de gerocultores a residentes asignados se valida principalmente en la Express API (requiere consultar `residenteAsignaciones`).

## Consecuencias

- **Positivas**: Seguridad multicapa, coherencia con Firebase, custom claims gestionados centralmente.
- **Negativas**: Custom claims requieren Admin SDK (solo backend), no se actualizan en el token del cliente hasta el refresh (~1h o forzado con `getIdToken(true)`).
- **Migración**: Salir de Firebase Auth requiere reimplementar auth completo. Riesgo medio.

## Criterios de aceptación

- [ ] Firebase Auth configurado con método email/password.
- [ ] Custom claims (`rol`) asignados vía Admin SDK desde Express.
- [ ] Firestore Rules desplegadas con restricciones por rol.
- [ ] Express middleware `verifyAuth` verificando ID tokens.
- [ ] Registro público bloqueado (solo admin crea cuentas).

## Nota de aprobación

> **PENDIENTE**: Este ADR requiere aprobación explícita de Jose Vilches Sánchez antes de marcar como ACCEPTED.  
> Fecha de creación: 2026-03-29  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-03 (superseded) — Supabase Auth.
- ADR-02b — Firestore como backend.
- SPEC/entities.md — Entidad `Usuario` con campo `rol`.
- SPEC/requirements.md — RF-01 (Autenticación), RF-02 (Roles y permisos).
