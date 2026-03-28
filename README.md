# Gerocultores System

> **Aplicación web para gerocultores**: agenda diaria, gestión de residentes y registro de incidencias.
> Diseñada para uso ágil en tablet y móvil, con historial por residente y alertas de incidencias críticas.
> Proyecto académico DAW — desarrollado de forma individual.

---

## Estado del proyecto

| Componente                | Estado                        |
|---------------------------|-------------------------------|
| Estructura y scaffolding  | ✅ Bootstrap completado        |
| Requisitos (SPEC/)        | 🔲 Pendiente — entrevista Fase 3 |
| Backlog y sprints (PLAN/) | 🔲 Pendiente — Fase 4          |
| Decisiones técnicas (ADRs)| 🔲 Pendiente — Fase 5          |
| Código de la aplicación   | 🔲 Pendiente — stack por definir |
| Tests y cobertura         | 🔲 Pendiente                   |
| Documentación académica   | 🔲 Pendiente                   |

**Fecha de inicio**: 2026-03-28
**Entrega académica (deadline)**: **2026-05-18**

> Día 0 completado: estructura de carpetas, guardrails de agentes, convenciones de commits y plantillas de ADR inicializados.

---

## Cómo empezar (desarrollador humano)

### Requisitos mínimos

- Git
- Node.js / Python / [stack por confirmar tras ADRs] — actualizar esta sección cuando se defina el stack en `DECISIONS/`
- Un editor con soporte Markdown (recomendado: VS Code)

### Preparar el entorno local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd gerocultores-system

# 2. Instalar dependencias (cuando existan)
# TODO: añadir comando tras definir el stack — p. ej.: npm install / pip install -r requirements.txt

# 3. Configurar variables de entorno
# TODO: copiar .env.example a .env y rellenar los valores
# cp .env.example .env
```

### Ejecutar tests y linter

```bash
# Tests (cuando estén disponibles)
# TODO: npm test / pytest / etc. — actualizar tras definir el stack

# Linter
# TODO: npm run lint / ruff check . / etc.
```

> **Nota**: Los comandos exactos se actualizarán en cuanto se defina el stack técnico a través de los ADRs en `DECISIONS/`.

---

## Flujo de trabajo y convenciones

### Conventional Commits

Todos los commits **deben** seguir el formato:

```
<tipo>(<scope>): <descripción corta>

[cuerpo opcional]

[pie de página opcional — referencia a US-XX]
```

| Tipo       | Cuándo usarlo                                     |
|------------|---------------------------------------------------|
| `feat`     | Nueva funcionalidad de la aplicación              |
| `fix`      | Corrección de bug                                 |
| `docs`     | Solo cambios de documentación                     |
| `chore`    | Tareas de mantenimiento (dependencias, config)    |
| `test`     | Añadir o modificar tests                          |
| `refactor` | Reestructuración sin cambio de comportamiento     |
| `style`    | Formato, espaciado (sin cambio de lógica)         |
| `perf`     | Mejoras de rendimiento                            |

**Ejemplos correctos:**

```bash
# Nueva funcionalidad con referencia a user story
git commit -m "feat(US-01): añadir agenda diaria para gerocultores"

# Corrección de bug
git commit -m "fix(US-03): corregir ordenación de incidencias por fecha"

# Documentación
git commit -m "docs: añadir instrucciones de entorno local en README"

# Mantenimiento
git commit -m "chore: inicializar estructura de proyecto DAW"
```

> **Regla G08**: Todo commit de tipo `feat` **debe** incluir la referencia `US-XX` en el scope.
> Consulta el checklist completo machine-readable en [`AGENTS.md`](AGENTS.md) (en inglés, para agentes).

---

### Branching

| Tipo de rama       | Formato              | Ejemplo                      |
|--------------------|----------------------|------------------------------|
| Nueva funcionalidad| `feature/US-XX`      | `feature/US-01-agenda-diaria`|
| Corrección de bug  | `fix/US-XX`          | `fix/US-03-incidencias`      |
| Documentación      | `docs/<descripcion>` | `docs/readme-humano`         |
| Mantenimiento      | `chore/<descripcion>`| `chore/setup-entorno`        |

**Reglas:**
- `main` es la rama de entrega. No se hace push directo a `main`.
- Toda funcionalidad nueva parte de `main` y se integra vía Pull Request.
- Los nombres de rama deben incluir el número de user story cuando aplique.

---

### Proceso de Pull Request (PR)

1. Crea una rama con el nombre adecuado desde `main`.
2. Implementa los cambios siguiendo las convenciones de `TECH_GUIDE.md`.
3. Asegúrate de que todos los commits referencian la US correspondiente.
4. Abre un PR hacia `main` con título descriptivo.
5. El PR **debe** pasar el checklist de revisión:

**Checklist resumido (humano):**

- [ ] El título o algún commit referencia una `US-XX` válida de `SPEC/user-stories.md`
- [ ] Existe un plan de tests en `OUTPUTS/test-plans/test-plan-US-XX.md`
- [ ] No hay credenciales, API keys ni datos sensibles en el código
- [ ] Los nombres de campo en el código coinciden con los de `SPEC/entities.md`
- [ ] Toda nueva funcionalidad es trazable a una entrada en `SPEC/`
- [ ] Si se tomó una decisión técnica, existe un ADR en `DECISIONS/`

> El checklist completo y machine-readable (para GGA/agentes) está en [`AGENTS.md`](AGENTS.md).

---

## Roles y agentes

Este proyecto usa un sistema de agentes de IA con responsabilidades separadas para ayudar al desarrollador. A modo de resumen:

| Agente      | Qué hace                                           |
|-------------|----------------------------------------------------|
| COLLECTOR   | Extrae requisitos mediante entrevista estructurada |
| ARCHITECT   | Documenta decisiones técnicas como ADRs            |
| PLANNER     | Organiza el backlog y los sprints desde SPEC/      |
| DEVELOPER   | Implementa funcionalidades siguiendo SPEC/ y ADRs  |
| REVIEWER    | Valida el código contra SPEC/ y las guardrails     |
| TESTER      | Genera planes de test desde las user stories       |
| WRITER      | Genera la memoria académica y docs técnicos        |

> La definición completa de cada rol (en inglés, para agentes) está en [`AGENTS/roles.md`](AGENTS/roles.md).
> El archivo [`AGENTS.md`](AGENTS.md) es **exclusivamente para consumo de agentes** y está en inglés.

---

## Seguridad y privacidad

> **Importante**: Esta aplicación maneja datos personales de residentes (PII).

- **Nunca** almacenar datos de residentes en `localStorage` o `sessionStorage`.
- Toda PII debe pasar por la capa de autenticación.
- No hardcodear credenciales, API keys ni URLs de producción en el código fuente.
- Se deben usar variables de entorno para todos los valores sensibles (ver `.env.example`).
- Las políticas de autenticación, cifrado y cumplimiento RGPD se definirán mediante **ADRs** en `DECISIONS/` — **es obligatorio seguir los ADRs aprobados en producción**.

> Los ADRs de seguridad están **pendientes de creación** (Fase 5). Hasta entonces, aplicar las reglas básicas del `TECH_GUIDE.md`.

---

## Cómo contribuir

1. Haz fork del repositorio (si es externo) o crea una rama desde `main`.
2. Asegúrate de que la funcionalidad que quieres añadir tiene una **user story** en `SPEC/user-stories.md`. Si no existe, créala primero.
3. Implementa siguiendo las convenciones de `TECH_GUIDE.md` y los ADRs vigentes.
4. Haz commits con el formato Conventional Commits (ver sección anterior).
5. Abre un Pull Request y completa el checklist de revisión.

**¿Tienes una idea o encontraste un bug?**
- Abre una issue en el repositorio.
- Si es una nueva funcionalidad, añade la user story en `SPEC/user-stories.md` con el formato de la plantilla.
- Si es una decisión técnica, el ARCHITECT creará un ADR en `DECISIONS/`.

---

## Estructura del proyecto

```
gerocultores-system/
├── README.md               ← este archivo (para humanos, en español)
├── AGENTS.md               ← instrucciones para agentes IA (en inglés, no editar)
├── PROJECT_BRIEF.md        ← visión, alcance y posicionamiento del producto
├── TECH_GUIDE.md           ← convenciones técnicas y de código
├── SPEC/                   ← fuente de verdad de requisitos
│   ├── user-stories.md     ← historias de usuario (US-XX)
│   ├── entities.md         ← entidades del dominio y sus campos
│   ├── requirements.md     ← requisitos funcionales y no funcionales
│   └── constraints.md      ← restricciones del proyecto
├── DECISIONS/              ← ADRs y decisiones técnicas
├── PLAN/                   ← backlog y sprints
│   ├── backlog.md
│   └── current-sprint.md
├── OUTPUTS/                ← artefactos generados
│   ├── test-plans/         ← planes de test por US
│   └── academic/           ← secciones de la memoria DAW
├── PROMPTS/                ← prompts reutilizables por agente
├── AGENTS/                 ← definición detallada del modelo agéntico
│   ├── roles.md
│   ├── guardrails.md
│   └── contracts.md
├── WORKFLOWS/              ← pipelines de ejecución de agentes
└── LOGS/                   ← trazabilidad de decisiones y cambios
```

---

## Comandos útiles y plantillas

### Plantillas de commit message

```bash
# Bootstrap / inicialización
git commit -m "chore: inicializar estructura de proyecto DAW gerocultores-system"

# Primera funcionalidad
git commit -m "feat(US-01): implementar agenda diaria de gerocultores"

# ADR añadido
git commit -m "docs(ADR-01): registrar decisión de stack frontend"

# Corrección
git commit -m "fix(US-02): corregir carga de historial de residente"
```

### Comando de commit sugerido para el bootstrap

Si alguien necesita replicar el estado inicial del proyecto:

```bash
git commit -m "chore: inicializar estructura de proyecto DAW gerocultores-system

Bootstrap completado: SPEC/, DECISIONS/, PLAN/, AGENTS/, OUTPUTS/, PROMPTS/, WORKFLOWS/, LOGS/.
Guardrails G01-G09 definidos. Convenciones de commits y plantillas de ADR inicializadas.
Stack técnico pendiente de ADRs."
```

---

## FAQ

**¿Dónde están los ADRs (decisiones de arquitectura)?**
En `DECISIONS/`. Todavía están pendientes de creación (Fase 5). Consulta `DECISIONS/README.md` para el índice.

**¿Dónde están las tareas y el backlog?**
En `PLAN/backlog.md` y `PLAN/current-sprint.md`. Se poblarán en la Fase 4 tras definir las user stories en `SPEC/`.

**¿Dónde están las user stories?**
En `SPEC/user-stories.md`. Pendientes de la entrevista de requisitos (Fase 3).

**¿Cómo ejecuto los agentes de IA?**
Los agentes se invocan mediante los prompts en `PROMPTS/`. Consulta `AGENTS.md` (en inglés) para ver qué agente usar en cada situación y `WORKFLOWS/` para los pipelines completos.

**¿Qué es AGENTS.md?**
Es un archivo exclusivamente para consumo de agentes IA (en inglés). Define los guardrails, roles y contratos del sistema agéntico. Los humanos pueden leerlo, pero no deben editarlo salvo que modifiquen las reglas del sistema.

**¿Cómo sé que mi código sigue las convenciones?**
Lee `TECH_GUIDE.md` antes de implementar. Cuando el stack esté definido, habrá un linter configurado. Mientras tanto, sigue las convenciones de nomenclatura y los anti-patrones prohibidos del `TECH_GUIDE.md`.

**¿Puedo añadir funcionalidades que no están en SPEC/?**
No directamente. Primero añade la user story en `SPEC/user-stories.md`, luego implementa. Guardrail G01 y G06 lo impiden.

**¿Dónde reporto una incidencia o propongo mejora?**
Abre una issue en el repositorio o añade directamente la user story en `SPEC/user-stories.md` si ya tienes el contexto suficiente.

---

## Licencia y contacto

**Autor**: MacXoje — [dawxoje@gmail.com](mailto:dawxoje@gmail.com)
**Tipo**: Proyecto académico individual (DAW)
**Licencia**: Por definir — pendiente de ADR de licencia

---

*Última actualización: 2026-03-28*
