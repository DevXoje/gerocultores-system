# LOGS/session-context — Memoria entre sesiones

> Cuando trabajas con un agente de IA, este no recuerda sesiones anteriores.
> Usa este directorio para guardar el estado relevante entre sesiones.

## Cómo usarlo

Al cerrar una sesión de trabajo con un agente, guardar aquí un archivo
session-YYYY-MM-DD.md con:

- Qué features están en progreso
- Decisiones tomadas en esa sesión no formalizadas aún en DECISIONS/
- Próximos pasos concretos
- Contexto que el agente necesitará al retomar

## Prompt de cierre de sesión

Al terminar una sesión, pega esto al agente:

  "Resume esta sesión de trabajo en formato session-context. Incluye:
   features en progreso, decisiones tomadas, próximos pasos,
   y cualquier contexto técnico relevante para retomar el trabajo.
   Guarda el resultado en LOGS/session-context/session-[HOY].md"
