# ADR 02: Backend y Base de Datos

## Status
PROPOSED

## Context
El proyecto "gerocultores-system" (GeroCare) necesita un backend para almacenar datos de residentes, turnos, e incidencias. Es un proyecto académico con 1 desarrollador y un deadline corto de ~6-7 semanas. Además, los datos de los residentes (historiales médicos, medicinas, observaciones) son datos sensibles sometidos al RGPD, por lo que la residencia de los datos en la UE es crítica.

## Decision
Se decide utilizar **Supabase (Backend-as-a-Service)** como backend y base de datos relacional (PostgreSQL). Supabase se configurará en la región EU (ej. Frankfurt) para cumplir requisitos de residencia de datos, utilizando **Row-Level Security (RLS)** para control estricto de accesos por roles.

## Alternatives considered
* **Express.js + PostgreSQL (Backend propio)**:
  * *Pros*: Control total de la arquitectura, demostración técnica excelente para la memoria DAW, hosting europeo garantizado.
  * *Cons*: Tiempo de implementación de ~10-15 días. Riesgo alto de no llegar al deadline con 1 solo dev asumiendo la carga de API, DB, middleware y auth.
* **Django + PostgreSQL**:
  * *Pros*: Panel de administración (Django Admin) out-of-the-box muy potente.
  * *Cons*: Fricción de stack (Python vs JS/TS frontend), mayor tiempo de setup.
* **Firebase/Firestore**:
  * *Pros*: Realtime y offline out-of-the-box.
  * *Cons*: RGPD muy complejo al ser Google US-default (requiere planes de pago para EU region) y es un modelo NoSQL, menos adecuado para datos altamente relacionados (residentes + turnos + alertas).

## Rationale
1. **Velocidad al MVP**: Supabase proporciona una base de datos PostgreSQL completa con una API REST/GraphQL autogenerada. Esto reduce el tiempo de setup del backend a ~2-3 días.
2. **Modelo relacional**: Perfecto para el dominio (Residentes -> Historial Médico -> Incidencias).
3. **RGPD y Seguridad**: RLS asegura que cada gerocultor vea solo los datos de su turno/residencia. Eligiendo un plan que soporte la región EU o auto-alojando en Docker, se cumple el RGPD. Como mínimo, se anonimizarán o seudonimizarán todos los datos en entorno de desarrollo/pruebas.

## Consequences and migration notes
* **Consecuencias**: Existe dependencia técnica (vendor lock-in parcial) con el servicio en la nube, aunque Supabase es open-source y puede migrarse a un VPS propio mediante Docker en caso extremo.
* **Migración**: Si se requiere un backend 100% custom por exigencia del tribunal DAW, el código frontend usando el SDK de Supabase tendría que ser reescrito para apuntar a un cliente REST genérico y una API propia.

## Acceptance criteria
- [ ] Proyecto Supabase creado en región EU.
- [ ] Tablas iniciales creadas y migradas.
- [ ] Políticas RLS (Row-Level Security) habilitadas en tablas críticas (residentes, turnos).

## Implementation notes
* Generar los tipos TypeScript de las tablas de Supabase y sincronizarlos con el frontend.
* Usar `@supabase/supabase-js` en el cliente web.
* No almacenar datos reales de salud durante el desarrollo (solo Faker.js data).

## References
* Exploración de Stack: Engram `sdd/stack-decision/explore`
