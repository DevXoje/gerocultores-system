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

| ID      | Título                                           | Estado   | Fecha      |
|---------|--------------------------------------------------|----------|------------|
| ADR-01b | Switch a Vue 3 + Vite + Tailwind + Pinia        | ACCEPTED | 2026-03-29 |
| ADR-02b | Backend con Express + Firebase Firestore         | ACCEPTED | 2026-03-29 |
| ADR-03b | Autenticación con Firebase Auth + Custom Claims  | ACCEPTED | 2026-03-29 |
| ADR-04b | Despliegue Firebase Hosting + RGPD              | ACCEPTED | 2026-03-29 |
| ADR-05  | Stitch como fuente de diseño y exports git       | ACCEPTED | 2026-03-28 |
| ADR-06  | CI Tooling (ESLint, Prettier, Playwright, Vitest)| ACCEPTED | 2026-04-12 |
| ADR-07  | Testing Strategy (Vitest, Playwright, Firestore Rules) | ACCEPTED | 2026-04-18 |
| ADR-08  | API Response Format (Zod, errorHandler)          | ACCEPTED | 2026-04-18 |
| ADR-09  | UI Architecture: components → ui + Atomic Design | ACCEPTED | 2026-05-01 |

> **Histórico**: ADR-01..04 (originales, React/Supabase) fueron eliminados el 2026-04-25 al piventar el stack a Vue/Firebase.

## Cómo crear un ADR

Usar el prompt: PROMPTS/development/generate_adr.md
O copiar la plantilla: DECISIONS/adr-template.md
