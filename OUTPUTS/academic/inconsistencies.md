# Inconsistencias detectadas — Pipeline Académico

> Generado: 2026-03-29 — sdd-init agent  
> Fuente: sincronización mapping-spec-to-memory.md con stack Vue/Firebase y calibraciones

---

## INC-01 — ADRs referenciados como "no creados" en mapping original

**Detectado en**: `mapping-spec-to-memory.md` (versión 2026-03-28)  
**Descripción**: El mapping original marcaba ADR-01..04 como "🔲 Pendiente (no creado)". Sin embargo, al 2026-03-29 existen:
- `DECISIONS/ADR-01b-switch-to-vue-firestore.md` — estado DRAFT
- `DECISIONS/ADR-02b-backend-firestore.md` — estado DRAFT  
- `DECISIONS/ADR-03b-authentication-firebase.md` — estado DRAFT
- `DECISIONS/ADR-04b-deployment-rgpd.md` — hosting sin decidir

**Impacto**: Medio. El mapping actualizado (2026-03-29) ya refleja el estado DRAFT correcto.  
**Acción**: ✅ Corregido en `mapping-spec-to-memory.md` (2026-03-29).  
**Pendiente**: ADRs deben pasar de DRAFT → ACCEPTED para desbloquear las secciones 2 y 5 de la memoria.

---

## INC-02 — PROJECT_BRIEF.md con secciones TODO sin completar

**Detectado en**: `PROJECT_BRIEF.md`  
**Descripción**: Las siguientes secciones del PROJECT_BRIEF.md tienen marcadores TODO sin contenido:
- "Usuarios objetivo" → TODO: describir los usuarios reales
- "Problema que resuelve" → TODO: en 2-3 frases, el dolor concreto
- "Alcance del TFG (MVP académico)" → TODO: lista de funcionalidades MVP
- "Stack técnico" → TODO: tecnologías confirmadas tras la Fase 5

**Impacto**: Alto. La sección 3 de la memoria (Contexto) y parte de la sección 1 (Introducción) dependen de PROJECT_BRIEF.md para tener información sobre el problema concreto y los usuarios. Los borradores generados infieren esta información de `SPEC/requirements.md` y `SPEC/user-stories.md`, pero la memoria final necesita que PROJECT_BRIEF.md esté completo para ser la fuente canónica.

**Acción recomendada**: Completar PROJECT_BRIEF.md antes de redactar la versión final de las secciones 1 y 3 de la memoria.  
**Responsable**: Jose Vilches Sánchez (contenido personal/contextual).  
**Urgencia**: Alta (bloquea secciones ya desbloqueadas técnicamente).

---

## INC-03 — US-08 CA-4 vs RNF-10 (PWA excluido)

**Detectado en**: `SPEC/user-stories.md` US-08 y `SPEC/requirements.md` RNF-10  
**Descripción**: 
- US-08 CA-4 original dice: "Si la app está en segundo plano o cerrada (PWA), la notificación aparece como notificación del sistema operativo (push)."
- RNF-10 excluye explícitamente las capacidades PWA y Service Workers del alcance.
- El delta `sdd/switch-stack-to-vue-firebase` añade una nota que modifica CA-4 para limitarlo a notificaciones in-app, pero el CA-4 original NO ha sido eliminado del documento.

**Impacto**: Medio. Genera ambigüedad: el tribunal podría preguntar por qué CA-4 menciona PWA si RNF-10 lo excluye. En la memoria, si se incluye US-08 en el análisis de requisitos, puede parecer una incoherencia.

**Acción recomendada**: 
1. Editar `SPEC/user-stories.md` US-08 CA-4 para reemplazar el contenido original por la versión del delta (solo in-app).
2. Mantener el delta como referencia de la decisión de cambio.
3. En la memoria (sección 4), mencionar explícitamente que las notificaciones push nativas quedan fuera del alcance (referencia a RNF-10) y que solo se implementan notificaciones in-app cuando la app está en primer plano.

**Responsable**: DEVELOPER / Jose  
**Urgencia**: Media (afecta a la coherencia de la sección 4 de la memoria).

---

## INC-04 — TECH_GUIDE.md desactualizado (stack original React)

**Detectado en**: `TECH_GUIDE.md`  
**Descripción**: TECH_GUIDE.md fue generado con el stack original (React + Supabase/PostgreSQL). El cambio a Vue 3 + Firebase documentado en ADR-01b..03b aún no se ha reflejado en TECH_GUIDE.md.  
**Impacto**: Bajo-Medio. TECH_GUIDE.md es una fuente para la sección 14 (Recursos utilizados) y parcialmente para la sección 2 (Fundamentos teóricos). Si no se actualiza, el mapping puede generar inconsistencias cuando el Writer Agent genere esas secciones.  
**Acción recomendada**: Actualizar TECH_GUIDE.md una vez los ADRs estén ACCEPTED.  
**Urgencia**: Baja (puede hacerse una vez los ADRs estén aprobados).

---

*Generado: 2026-03-29 — sdd-init agent — gerocultores-system*
