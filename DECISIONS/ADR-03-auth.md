# ADR 03: Autenticación y Autorización

## Status
PROPOSED

## Context
El sistema de gerocultores maneja datos de salud (residentes, incidentes, turnos de medicamentos) que exigen control de acceso. Se necesita un sistema de autenticación de usuarios que gestione diferentes roles: Gerocultores y Administradores/Enfermeros de la residencia. 

## Decision
Se decide utilizar **Supabase Auth** como solución de identidad, aprovechando la integración directa con PostgreSQL y sus políticas de Row-Level Security (RLS) decididas en el ADR-02.

## Alternatives considered
* **JWT autogestionado con Express (Backend propio)**:
  * *Pros*: Máximo control, sin dependencia de terceros, los datos nunca salen de la infraestructura propia. Excelente para demostrar competencias en el proyecto DAW.
  * *Cons*: ~3-5 días exclusivos para crear un login/logout, tokens, roles y middlewares seguros. Riesgo alto de bugs de seguridad. Incompatible si usamos Supabase como BaaS.
* **Auth0 / Clerk (IdP externo)**:
  * *Pros*: Proveedores de identidad dedicados, MFA, roles desde un dashboard, integraciones sociales.
  * *Cons*: Mayor complejidad al tener que sincronizar usuarios del IdP con las tablas de residentes/turnos de Supabase. Clerk por defecto guarda datos en EE.UU. (riesgo RGPD para datos de salud).

## Rationale
El uso combinado de Supabase DB (ADR-02) + Supabase Auth proporciona la mayor eficiencia para cumplir el deadline de ~6-7 semanas sin comprometer la seguridad.
1. La autenticación genera un JWT que las consultas a la base de datos utilizan automáticamente para aplicar políticas RLS, restringiendo qué registros ve cada gerocultor según su ID.
2. Todo está centralizado en un único servicio.
3. El coste es $0 (Free Tier) y se implementa en cuestión de horas (ahorrando hasta 5 días de desarrollo).

## Consequences and migration notes
* **Consecuencias**: El usuario queda fuertemente ligado a la plataforma de Supabase para toda la gestión de estado de sesión. 
* **Migración**: Mover a un sistema propio implicaría reescribir tanto el middleware de frontend (rutas privadas) como las políticas RLS en la DB para depender de tokens generados por otra API.

## Acceptance criteria
- [ ] Login funcional en el frontend usando `@supabase/auth-helpers`.
- [ ] Los tokens JWT se adjuntan a las peticiones automáticamente.
- [ ] Existen roles básicos (`admin`, `gerocultor`) asignados en `app_metadata` y protegidos mediante RLS.

## Implementation notes
* Configurar autenticación solo por email/password (sin SSO/Social para gerocultores).
* Bloquear registro público (solo el administrador puede crear cuentas para cuidadores).
* Tiempo estimado: ~1 día.

## References
* Exploración de Stack: Engram `sdd/stack-decision/explore`
