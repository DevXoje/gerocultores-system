# SPEC — Fuente de verdad de requisitos

> Todo lo que existe en este directorio es verificable y acordado.
> Ningún agente puede generar código o documentación sin base en SPEC/.
> Equivalente a DATA/ en personal-brand-system.

## Reglas de este directorio

1. Solo requisitos acordados con el desarrollador humano.
2. Campos sin valor van como TODO: [descripción]. Nunca vacíos.
3. Las entidades de dominio son la única fuente canónica de nombres y tipos.
4. Toda modificación se registra en LOGS/CHANGELOG.md.

## Archivos

| Archivo          | Contenido                                      | Estado              |
|------------------|------------------------------------------------|---------------------|
| requirements.md  | Requisitos funcionales y no funcionales        | 🔲 Pendiente Fase 2 |
| user-stories.md  | Historias de usuario validadas con criterios   | 🔲 Pendiente Fase 3 |
| entities.md      | Entidades del dominio con campos y tipos       | 🔲 Pendiente Fase 2 |
| flows.md         | Flujos de usuario y de sistema                 | 🔲 Pendiente Fase 3 |
| api-contracts.md | Contratos de endpoints y schemas de respuesta  | 🔲 Pendiente Fase 5 |
| constraints.md   | Restricciones técnicas, académicas y negocio   | ✅ Inicializado     |
