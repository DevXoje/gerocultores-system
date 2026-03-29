# ADR 04: Despliegue, Infraestructura y RGPD

## Status
PROPOSED

## Context
El desarrollo "gerocultores-system" almacenará información relativa a turnos, medicamentos, e incidentes de salud de personas mayores. Según el Reglamento General de Protección de Datos (RGPD) en Europa, estos son datos personales de categoría especial (datos relativos a la salud), requiriendo medidas estrictas de confidencialidad e integridad (Art. 32 RGPD) e idealmente alojamiento dentro de la Unión Europea para simplificar el cumplimiento normativo.

## Decision
Se decide un modelo de **hosting en la Unión Europea (EU Region)** tanto para el frontend (Vercel/Netlify EU edge functions) como para la base de datos y autenticación (Supabase Frankfurt). Se implementará un **Plan CI/CD minimalista** con cifrado en reposo y tránsito, junto con anonimización estricta para datos de prueba.

## Alternatives considered
* **Firebase (Spark/Free) o Supabase US-default**:
  * *Pros*: Despliegue inmediato a coste $0.
  * *Cons*: Datos en EE.UU., requiere revisar DPAs y aplicar SCCs (Standard Contractual Clauses), lo que puede complicar un proyecto académico o un MVP comercial real para residencias españolas/europeas.
* **VPS propio (Hetzner/OVH) + Docker**:
  * *Pros*: Control absoluto de datos en Alemania/Francia. Coste mensual bajo (<$10). Demostración académica potente (SysAdmin + DevOps).
  * *Cons*: Complejidad alta de operaciones, configuración de HTTPS, backups, contenedores y CI/CD manual. Un desarrollador con 6 semanas no puede permitirse mantener la infraestructura mientras programa el sistema.

## Rationale
El uso de BaaS (ADR-02, ADR-03) mitigará la carga de infraestructura si se eligen regiones EU en la creación de los proyectos. 
1. **Frontend**: Vercel o Netlify (Github Actions -> despliegue automático de la SPA/PWA a la red edge).
2. **Backend**: Supabase project configurado explícitamente en Europa (Frankfurt). Supabase cifra los datos en reposo y exige TLS (HTTPS/WSS) en tránsito.
3. **Anonimización**: Debido a que se trata de un TFG/DAW académico, la base de datos NUNCA contendrá PII (Personally Identifiable Information) real de residentes. Todo será generado por `Faker.js` (nombres falsos, DNI falsos, patologías falsas). Esto cumple íntegramente el RGPD al trabajar con datos seudonimizados de prueba.
4. **CI/CD**: Linting + Testing (Vitest/Playwright) automatizado en GitHub Actions antes del despliegue en Vercel.

## Consequences and migration notes
* **Consecuencias**: Si se supera la capa gratuita de Supabase EU (requiere plan Pro), podría ser necesario migrar a un VPS o DB dedicada (Neon/Railway) si no hay presupuesto.
* **Migración**: El frontend es una PWA agnóstica; si Vercel cambia precios, se puede subir a Netlify o Cloudflare Pages en minutos. La base de datos puede exportarse como dump SQL estándar desde Supabase a cualquier PostgreSQL en EU.

## Acceptance criteria
- [ ] Base de datos alojada en un datacenter EU.
- [ ] Frontend desplegado con CI/CD automático ante cada push en `main`.
- [ ] No hay PII real (solo datos fake generados aleatoriamente).
- [ ] Tráfico forzado mediante HTTPS (cifrado en tránsito).

## Implementation notes
* Configurar Github Actions (Linting, Tests).
* Crear el script generador de datos (seeders) usando `faker-js/faker`.
* Configurar dominios y SSL en Vercel.
* Revisar opciones de backup programado semanal (PG_DUMP) si el producto se torna real.

## References
* Exploración de Stack: Engram `sdd/stack-decision/explore`
