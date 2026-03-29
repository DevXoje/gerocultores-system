# DECISIONS — Architecture Decision Records

> Registro de todas las decisiones técnicas relevantes del proyecto.
> Formato: ADR (Architecture Decision Record).

## Por qué documentar decisiones

Una decisión técnica no documentada se convierte en deuda de conocimiento.
Cuando el contexto cambia (o cuando el Developer es una IA), sin el ADR es imposible
saber si la decisión sigue siendo válida o si fue un compromiso temporal.

## Estados de un ADR

- **PROPOSED**: pendiente de revisión o de más información.
- **ACCEPTED**: decisión tomada y activa.
- **SUPERSEDED**: reemplazada por un ADR posterior (referencia cruzada).
- **DEPRECATED**: ya no aplica (por cambio de contexto o scope).

## Índice de ADRs

| ID     | Título                                      | Estado   | Fecha      |
|--------|---------------------------------------------|----------|------------|
| ADR-01 | Framework Frontend                          | PROPOSED | 2026-03-28 |
| ADR-02 | Backend y Base de Datos                     | PROPOSED | 2026-03-28 |
| ADR-03 | Autenticación y Autorización                | PROPOSED | 2026-03-28 |
| ADR-04 | Despliegue, Infraestructura y RGPD          | PROPOSED | 2026-03-28 |
| ADR-05 | Stitch como fuente de diseño y exports git  | ACCEPTED | 2026-03-28 |

## Cómo crear un ADR

Usar el prompt: PROMPTS/development/generate_adr.md
O copiar la plantilla: DECISIONS/adr-template.md
