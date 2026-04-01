# Engram Memory Conventions — gerocultores-system

> This file defines canonical `topic_key` values for Engram persistent memory in this project.
> All agents MUST follow these conventions to prevent duplicate observations and ensure
> cross-session retrievability.

---

## topic_key Format

```
<category>/<subtopic>
```

- **Lowercase only** — no uppercase, no spaces
- **Slashes** as separators — no underscores or dots in keys
- **Stable** — once a key is used and saved, do not rename it

---

## Canonical Keys (use these EXACTLY — do not invent variants)

| topic_key | Qué guarda | Tipo recomendado |
|-----------|-----------|-----------------|
| `architecture/stack` | Decisiones de stack tecnológico (Vue, Firebase, Express…) | `architecture` |
| `architecture/adr-{N}` | Contenido específico de un ADR (ej: `architecture/adr-01`) | `architecture` |
| `architecture/auth-model` | Modelo de autenticación (Firebase Auth, custom claims, RBAC…) | `architecture` |
| `architecture/data-model` | Modelo de datos Firestore (colecciones, subcollections, esquemas…) | `architecture` |
| `architecture/sprint-plan` | Estado y planificación de sprints | `architecture` |
| `bugfix/{feature}` | Bug fixes en una feature concreta (ej: `bugfix/auth`, `bugfix/agenda`) | `bugfix` |
| `decision/{topic}` | Decisiones puntuales no formalizadas como ADR | `decision` |
| `sdd-init/gerocultores-system` | Contexto de inicialización SDD del proyecto | `architecture` |
| `sdd/{change-name}/explore` | Exploración SDD de un cambio | `architecture` |
| `sdd/{change-name}/proposal` | Propuesta SDD de un cambio | `architecture` |
| `sdd/{change-name}/spec` | Especificación SDD de un cambio | `architecture` |
| `sdd/{change-name}/design` | Diseño técnico SDD de un cambio | `architecture` |
| `sdd/{change-name}/tasks` | Lista de tareas SDD de un cambio | `architecture` |
| `sdd/{change-name}/apply-progress` | Progreso de implementación SDD | `architecture` |
| `sdd/{change-name}/verify-report` | Reporte de verificación SDD | `architecture` |
| `sdd/{change-name}/archive-report` | Reporte de archivado SDD | `architecture` |
| `sdd/{change-name}/state` | Estado DAG del cambio | `architecture` |
| `session/{YYYY-MM-DD}` | Resumen de sesión (ej: `session/2026-04-01`) | `architecture` |
| `pattern/{name}` | Patrones de código establecidos (ej: `pattern/pinia-store`, `pattern/api-middleware`) | `pattern` |
| `config/{tool}` | Configuración de herramientas (ej: `config/firebase`, `config/vite`, `config/eslint`) | `config` |

---

## Rules

1. **ALWAYS use `topic_key`** when saving to Engram — prevents duplicate observations
2. **Do NOT create variants** — use the canonical key:
   - "stack técnico", "tech stack", "tecnologías" → use `architecture/stack`
   - "auth", "autenticación", "login model" → use `architecture/auth-model`
   - "sprint", "sprint plan", "planificación sprint" → use `architecture/sprint-plan`
3. **Call `mem_suggest_topic_key`** if unsure about the right key before saving
4. **Use `mem_update`** (not a new `mem_save`) when updating an existing observation — pass the observation ID
5. **Use `mem_get_observation(id)`** after any `mem_search` — search previews are truncated to 300 chars
6. **SDD change names** use kebab-case (e.g., `switch-stack-to-vue-firebase`)
7. For ADR keys, use zero-padded numbers: `architecture/adr-01`, `architecture/adr-02`, NOT `adr-1`

---

## Anti-patterns (NEVER do these)

| Wrong | Correct |
|-------|---------|
| `stack técnico` | `architecture/stack` |
| `tech stack` | `architecture/stack` |
| `auth model` | `architecture/auth-model` |
| `sprint 0 plan` | `architecture/sprint-plan` |
| `bugfix_auth` | `bugfix/auth` |
| `ADR-01` | `architecture/adr-01` |
| `SDD/propose/change` | `sdd/change-name/proposal` |

---

## Retrieval Pattern (mandatory for all agents)

```
# Step 1 — search (returns IDs + 300-char previews, NOT full content)
mem_search(query: "{topic_key}", project: "gerocultores-system")

# Step 2 — retrieve full content (REQUIRED — never use previews as source material)
mem_get_observation(id: {id_from_step_1})
```

Do NOT skip Step 2. Previews are truncated and will produce incorrect results.

---

## Save Pattern (mandatory for all agents)

```
mem_save(
  title: "{short descriptive title}",
  topic_key: "{canonical-key}",
  type: "{architecture|bugfix|decision|pattern|config|discovery}",
  project: "gerocultores-system",
  content: "**What**: ...\n**Why**: ...\n**Where**: ...\n**Learned**: ..."
)
```

---

*Last updated: 2026-04-01*
