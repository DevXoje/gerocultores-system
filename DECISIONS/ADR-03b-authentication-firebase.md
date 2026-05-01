# ADR-03b: Autenticación con Firebase Auth + Firestore Rules

- **Estado**: ACCEPTED
- **Fecha**: 2026-03-29
- **Fecha de aceptación**: 2026-04-01
- **Autor**: Jose Vilches Sánchez
- **Tutor**: ANDRES MARTOS GAZQUEZ
- **Centro**: CIPFP Batoi d'Alcoi
- **Curso**: 2025-2026
- **Supersede**: ADR-03 (Supabase Auth + RLS)

> ✅ **ACCEPTED — Aprobado por Jose Vilches Sánchez el 2026-04-01.**

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
| `gerocultor` | `{ rol: 'gerocultor' }` | Solo puede crear, leer, actualizar y eliminar sus propios recursos (tareas, incidencias, residentes que ha creado). No puede ver recursos de otros usuarios. |

> **Modelo de seguridad**: Descentralizado por ownership. Cada recurso (Tarea, Incidencia, Residente) tiene un campo `usuarioId` que identifica al gerocultor que lo creó. Firestore Rules y Express middleware verifican `request.auth.uid == resource.data.usuarioId` para toda operación de escritura. No existe administrador global.

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
    // Usuarios: solo el propio usuario puede leer/escribir su documento
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Tareas: solo el gerocultor que la creó puede leer/escribir
    match /tareas/{tareaId} {
      allow read, write: if request.auth != null &&
        resource.data.usuarioId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.usuarioId == request.auth.uid;
    }
    // Residentes: solo el gerocultor que lo creó puede leer/escribir
    match /residentes/{residenteId} {
      allow read, write: if request.auth != null &&
        resource.data.usuarioId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.usuarioId == request.auth.uid;
    }
    // Incidencias: solo el gerocultor que la creó puede leer; creación abierta para cualquier gerocultor autenticado
    match /incidencias/{incidenciaId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null &&
        resource.data.usuarioId == request.auth.uid;
      allow update, delete: if false;
    }
    // Notificaciones: solo el destinatario puede leer
    match /notificaciones/{notificacionId} {
      allow read: if request.auth != null &&
        resource.data.usuarioId == request.auth.uid;
      allow update: if request.auth != null &&
        resource.data.usuarioId == request.auth.uid;
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
- [ ] Custom claims (`rol`) asignados a `'gerocultor'` por defecto via Admin SDK desde Express.
- [ ] Firestore Rules desplegadas con aislamiento por `usuarioId` (ownership).
- [ ] Express middleware `verifyAuth` verificando ID tokens y validando que el usuario solo acceda a sus propios recursos.
- [ ] Registro abierto (cualquiera puede registrarse, no se requiere invitación de admin).

## Nota de aprobación

> **ACCEPTED**: Aprobado por Jose Vilches Sánchez el 2026-04-01.  
> Fecha de creación: 2026-03-29  
> Creado por: SDD Design Agent (IA)

## Referencias

- ADR-03 (superseded) — Supabase Auth.
- ADR-02b — Firestore como backend.
- SPEC/entities.md — Entidad `Usuario` con campo `rol`.
- SPEC/requirements.md — RF-01 (Autenticación), RF-02 (Roles y permisos).
