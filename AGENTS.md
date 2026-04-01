# AGENTS.md — gerocultores-system

<!-- AGENT-ONLY (EN) -->
<!-- This file is machine-readable. It is consumed by GGA at code review time    -->
<!-- and by AI agents at session start. Human-facing docs are separate.          -->
<!-- .gga: RULES_FILE="AGENTS.md" — this file is the primary rules source.      -->
<!-- All guardrails G01–G09 are present below in machine-readable form.          -->

---

## Agent Overview

This file is consumed by GGA at code review time and by AI agents at session start.
Full per-agent artifacts live in:

- `AGENTS/guardrails.md` — Non-negotiable guardrails (authoritative)
- `AGENTS/roles.md`      — Agent role definitions and scope boundaries
- `AGENTS/contracts.md`  — I/O contracts per agent

### Project Context

- **Project**: gerocultores-system
- **Type**: DAW academic project (individual, solo developer)
- **Description**: Web app for caregivers (gerocultores): daily scheduling,
  resident management, and incident reporting. Tablet and mobile first.
- **Deadline**: 2026-05-18
- **Stack**: TBD (to be resolved via ADR-01 through ADR-04 in `DECISIONS/`)

---

## Agent Roles (Summary)

> Full definitions in `AGENTS/roles.md`. This summary is for quick loading.

| Agent | Responsibility | Produces |
|-------|---------------|---------|
| COLLECTOR | Extract requirements via structured interview. Does not interpret or decide. | `LOGS/raw_requirements_*.md` |
| ARCHITECT | Convert technical decisions into formal ADRs. | `DECISIONS/ADR-*.md` |
| PLANNER | Convert SPEC/ into prioritized backlog and sprints. No scope additions. | `PLAN/backlog.md`, `PLAN/current-sprint.md` |
| DEVELOPER | Implement features following SPEC/, ADRs, and TECH_GUIDE.md. | Code + implementation notes |
| REVIEWER | Validate code against SPEC/, TECH_GUIDE.md, and guardrails. Decides APPROVED \| NEEDS_REVISION \| BLOCKED. | Review report in `LOGS/` |
| TESTER | Generate test plans and test cases from SPEC/ user stories. | `OUTPUTS/test-plans/test-plan-US-XX.md` |
| WRITER | Generate academic memory sections and technical docs from SPEC/ and DECISIONS/. | `OUTPUTS/academic/`, `OUTPUTS/technical-docs/` |

---

## Guardrails (Machine-Readable)

> Authoritative version lives in `AGENTS/guardrails.md`. If the two diverge, `AGENTS/guardrails.md` wins.
> GGA enforces these at every code review.

### G01 — No code without requirement
```
RULE: No agent may implement code that lacks a corresponding user story or
      requirement in SPEC/.
ACTION_ON_VIOLATION: Agent creates the user story first and awaits implicit
                     approval before implementing.
CHECK: Does a US-XX or RF-XX entry exist in SPEC/ for this code?
```

### G02 — No technical decision without ADR
```
RULE: Every relevant technical decision must have an ADR in DECISIONS/.
      "Relevant" = the answer to "why X?" is not immediately obvious.
ACTION_ON_VIOLATION: Create ADR in PROPOSED state before proceeding.
CHECK: Is there an ADR in DECISIONS/ covering this architectural choice?
```

### G03 — No feature without test plan
```
RULE: Reviewer MUST NOT approve a feature unless OUTPUTS/test-plans/ contains
      a document describing how it will be tested.
ACTION_ON_VIOLATION: Block approval; request Tester to generate test plan.
CHECK: Does OUTPUTS/test-plans/test-plan-US-XX.md exist?
```

### G04 — Entity consistency
```
RULE: Field names and types of domain entities MUST be identical in
      SPEC/entities.md, SPEC/api-contracts.md, and in code.
      No aliases or renames across layers.
ACTION_ON_VIOLATION: Flag as NEEDS_REVISION with exact field mismatch listed.
CHECK: Do field names in code match SPEC/entities.md exactly?
```

### G05 — No hardcoded sensitive values
```
RULE: Environment variables, API keys, database IDs, and production URLs
      MUST NOT appear directly in source code.
ACTION_ON_VIOLATION: Flag as BLOCKED; remove and replace with env var or config.
CHECK: No secrets in source files. .env.example present for all required vars.
```

### G06 — Scope lock
```
RULE: Developer and Planner MUST NOT add features not present in SPEC/
      without explicit notification to the human developer.
ACTION_ON_VIOLATION: Log scope creep in LOGS/ and stop implementation.
CHECK: Is every implemented feature traceable to a SPEC/ entry?
```

### G07 — No hidden technical debt
```
RULE: If Developer takes a technical shortcut due to time pressure, it MUST be
      documented in the relevant ADR or in LOGS/.
ACTION_ON_VIOLATION: Undocumented debt is treated as a guardrail violation.
CHECK: Are all shortcuts documented?
```

### G08 — Commit traceability
```
RULE: Every feature commit MUST reference the corresponding user story.
FORMAT: feat(US-XX): description
ACTION_ON_VIOLATION: Flag commit message as non-compliant.
CHECK: Does the commit message follow feat(US-XX) pattern?
```

### G09 — Academic coverage
```
RULE: Writer MUST verify that every section of the DAW memoria has coverage in
      OUTPUTS/academic/ before marking the academic pipeline as complete.
REFERENCE: OUTPUTS/academic/README.md (required sections checklist)
ACTION_ON_VIOLATION: Mark pipeline incomplete; list missing sections.
CHECK: Are all checklist items in OUTPUTS/academic/README.md ticked?
```

---

## PR Validation Checklist (Agent-Readable)

```yaml
# pr-checklist.yaml — used by REVIEWER and GGA
required:
  - id: US_REFERENCE
    description: PR title or commit references a valid US-XX from SPEC/user-stories.md
    blocking: true

  - id: TEST_PLAN
    description: OUTPUTS/test-plans/test-plan-US-XX.md exists for every featured US
    blocking: true

  - id: NO_HARDCODED_SECRETS
    description: No API keys, passwords, or DB credentials in source files
    blocking: true

  - id: ENTITY_CONSISTENCY
    description: All domain entity field names match SPEC/entities.md exactly
    blocking: true

  - id: ADR_COVERAGE
    description: New technical decisions have a corresponding ADR in DECISIONS/
    blocking: false
    note: "blocking=false allows PROPOSED ADR state during active development"

  - id: SCOPE_IN_SPEC
    description: All new features/endpoints are traceable to a SPEC/ entry
    blocking: true

  - id: COMMIT_FORMAT
    description: "All commits follow: <type>(US-XX): description"
    blocking: false

  - id: ACADEMIC_COVERAGE
    description: If feature touches a DAW memoria section, OUTPUTS/academic/ is updated
    blocking: false
```

---

## Commit Convention (Agent-Enforced)

All commits must follow **Conventional Commits** format:

```
<type>[scope]: <short description>

[optional body]

[optional footer — US-XX references]
```

**Allowed types:**

| Type | When to use |
|------|------------|
| `feat` | New application feature |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `chore` | Maintenance tasks (deps, config) |
| `test` | Adding or modifying tests |
| `refactor` | Restructuring without behavior change |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvements |

> **G08**: every `feat` commit MUST include the `US-XX` scope.

---

## Automated Agent Workflows

Agents invoke these workflows via prompt templates in `PROMPTS/`.

### Auto-invoke Rules

| Action | Agent to invoke |
|--------|----------------|
| Starting a new feature | DEVELOPER reads `PROMPTS/development/generate_feature.md` |
| Technical decision needed | ARCHITECT reads `PROMPTS/development/generate_adr.md` |
| Feature done, needs review | REVIEWER reads `PROMPTS/development/review_feature.md` |
| Creating test plan | TESTER reads `PROMPTS/testing/generate_tests.md` |
| Writing academic section | WRITER reads `PROMPTS/academic/write_memory_section.md` |
| Starting a new sprint | PLANNER reads `PROMPTS/setup/plan_initial_backlog.md` |
| New requirements needed | COLLECTOR reads `PROMPTS/setup/interview_requirements.md` |

### Workflow Dependency Graph

```
[Interview]       → LOGS/raw_requirements_*.md
       ↓
[Structurer]      → SPEC/ (requirements, entities, user-stories)
       ↓
[Architect]       → DECISIONS/ (ADRs + TECH_GUIDE.md update)
       ↓
[Planner]         → PLAN/ (backlog + sprint)
       ↓
[Developer]       → code + implementation notes
       ↓
[Reviewer + GGA]  → APPROVED | NEEDS_REVISION | BLOCKED
       ↓
[Tester]          → OUTPUTS/test-plans/
       ↓
[Writer]          → OUTPUTS/academic/ + OUTPUTS/technical-docs/
```

---

## Memory and Persistence (Engram)

When using engram-based memory across sessions:

```
mem_save rules:
  - Save after: bug fixes, ADR decisions, architectural discoveries, config changes
  - project: "gerocultores-system"
  - topic_key format: "sdd/{change-name}/{artifact-type}"
  - Always use mem_get_observation(id) after mem_search — previews are truncated

mem_context: call at session start to recover prior context
mem_session_summary: call before ending any session (mandatory)
```

> **Canonical topic_key list and anti-patterns**: `AGENTS/engram-conventions.md`
> All agents MUST follow the keys defined there. Do NOT invent variants.

---

## Duplication Policy

This file intentionally duplicates a subset of the content in `AGENTS/guardrails.md`
and `AGENTS/roles.md` to satisfy `.gga`'s `RULES_FILE=AGENTS.md` requirement.

**Mitigation**: The root `AGENTS.md` contains **machine-readable summaries** only.
The authoritative full text lives in `AGENTS/`. If the two diverge, `AGENTS/` wins.

**Update protocol**: When updating guardrails, update `AGENTS/guardrails.md` first,
then sync the summary table and G01–G09 blocks in this file.

---

## Decisions and Tradeoffs

| Decision | Chosen approach | Rationale |
|----------|----------------|-----------|
| **Agent-only root file** | All content in English, agent-only | User rule: root AGENTS.md is exclusively for agent consumption; human docs are separate |
| **Root AGENTS.md vs AGENTS/ directory** | Both — root has summaries, `AGENTS/` has full content | `.gga` requires `RULES_FILE=AGENTS.md` at root; full content in directory avoids bloating the root file |
| **Guardrails duplication** | Accepted and documented | Necessary evil to satisfy GGA tooling; mitigated by clear "AGENTS/ wins" policy |
| **PR checklist as YAML block** | Inline YAML in Markdown | Machine-parseable by GGA without requiring a separate file; human-readable too |
| **Auto-invoke table** | Lightweight (no skill URLs) | This project doesn't use Prowler's skill URL system; prompt templates live in `PROMPTS/` |
| **Prowler-inspired structure** | Adapted, not copied | Prowler is a large monorepo; this is a solo DAW project — skill tables and component docs don't apply |
