# AGENTS/guardrails.md — Non-Negotiable Guardrails

<!-- AGENT-ONLY (EN) — This file is for AI agent consumption. -->
<!-- Human-facing summary in Spanish lives in the root AGENTS.md. -->

> These guardrails apply to ALL agents without exception.
> GGA enforces them at every code review cycle.
> Last sync with root AGENTS.md: 2026-03-28

---

## G01 — No code without requirement

```
RULE: No agent may implement code that lacks a corresponding user story or
      requirement in SPEC/.
SCOPE: DEVELOPER agent
ACTION_ON_VIOLATION:
  1. Do NOT implement the code.
  2. Draft a user story entry for SPEC/user-stories.md.
  3. Notify the human developer and await explicit or implicit approval.
  4. Only then proceed with implementation.
CHECK: Does a US-XX or RF-XX entry exist in SPEC/ for this code?
SEVERITY: BLOCKED
```

## G02 — No technical decision without ADR

```
RULE: Every relevant technical decision must have a corresponding ADR in DECISIONS/.
      "Relevant" = any choice where the answer to "why X and not Y?" is non-obvious.
      Examples: framework selection, auth strategy, data model, offline strategy.
SCOPE: ARCHITECT, DEVELOPER agents
ACTION_ON_VIOLATION:
  1. Create ADR in PROPOSED state before continuing.
  2. Log in LOGS/CHANGELOG.md with tag [DECISION].
CHECK: Is there an ADR in DECISIONS/ that covers this choice?
SEVERITY: NEEDS_REVISION (PROPOSED ADR acceptable during active development)
```

## G03 — No feature without test plan

```
RULE: REVIEWER must NOT approve a feature unless a test plan document exists in
      OUTPUTS/test-plans/ describing how the feature will be tested.
SCOPE: REVIEWER, TESTER agents
ACTION_ON_VIOLATION:
  1. Block approval with status BLOCKED.
  2. Request TESTER to generate OUTPUTS/test-plans/test-plan-US-XX.md.
  3. Re-review only after test plan is present.
CHECK: Does OUTPUTS/test-plans/test-plan-US-XX.md exist for every feature in this PR?
SEVERITY: BLOCKED
```

## G04 — Entity consistency

```
RULE: Field names and types of all domain entities MUST be identical across:
        - SPEC/entities.md (canonical source)
        - SPEC/api-contracts.md
        - Source code (models, DTOs, DB schemas)
      No aliases, abbreviations, or renames are allowed between layers.
SCOPE: DEVELOPER, REVIEWER agents
ACTION_ON_VIOLATION:
  1. Flag as NEEDS_REVISION.
  2. List every field mismatch with exact location (file + line).
  3. Do not merge until all mismatches are resolved.
CHECK: Do all field names in code exactly match SPEC/entities.md?
SEVERITY: NEEDS_REVISION
```

## G05 — No hardcoded sensitive values

```
RULE: Environment variables, API keys, database IDs, connection strings,
      and production URLs MUST NOT appear in source code.
SCOPE: DEVELOPER, REVIEWER agents
ALLOWED: .env files (not committed), .env.example (committed, with placeholder values)
ACTION_ON_VIOLATION:
  1. Flag as BLOCKED immediately.
  2. Remove the hardcoded value from source.
  3. Replace with env var reference and document in .env.example.
CHECK: No secrets in source files. .env.example present for all required vars?
SEVERITY: BLOCKED
```

## G06 — Scope lock

```
RULE: DEVELOPER and PLANNER must NOT add features, endpoints, or entities that
      are not present in SPEC/ without explicit notification to the human developer.
SCOPE: DEVELOPER, PLANNER agents
ACTION_ON_VIOLATION:
  1. Do NOT implement the out-of-scope item.
  2. Log the detected scope creep in LOGS/ with tag [SCOPE_CREEP].
  3. Stop and notify the human developer.
  4. Resume only after explicit approval.
CHECK: Is every implemented feature traceable to a SPEC/ entry?
SEVERITY: BLOCKED
```

## G07 — No hidden technical debt

```
RULE: If DEVELOPER takes a technical shortcut due to time pressure or external
      constraint, it MUST be documented. Undocumented shortcuts = double debt.
SCOPE: DEVELOPER agent
ACCEPTABLE LOCATIONS: relevant ADR in DECISIONS/, or a LOGS/debt_*.md entry
ACTION_ON_VIOLATION:
  1. Flag the undocumented shortcut in the review report.
  2. Request DEVELOPER to add a log entry or ADR note.
  3. Status: NEEDS_REVISION until documented.
CHECK: Are all shortcuts documented with rationale and expected resolution?
SEVERITY: NEEDS_REVISION
```

## G08 — Commit traceability

```
RULE: Every feature commit MUST reference the corresponding user story.
FORMAT: feat(US-XX): short description
        [optional body]
        [optional footer: refs US-XX]
SCOPE: DEVELOPER agent, human developer
ACTION_ON_VIOLATION:
  1. Flag commit message as non-compliant in the review report.
  2. Request rewrite of the commit message to include US-XX reference.
CHECK: Does every feat commit follow the feat(US-XX): description pattern?
SEVERITY: NEEDS_REVISION (non-blocking for hotfixes and chore commits)
```

## G09 — Academic coverage

```
RULE: WRITER must verify that every required section of the DAW memoria
      has coverage in OUTPUTS/academic/ before marking the academic pipeline
      as complete.
SCOPE: WRITER agent
REFERENCE: OUTPUTS/academic/README.md (required sections checklist)
ACTION_ON_VIOLATION:
  1. Mark the academic pipeline as incomplete.
  2. List every missing section with its checklist item.
  3. Do not deliver final academic output until all items are ticked.
CHECK: Are all checklist items in OUTPUTS/academic/README.md ticked?
SEVERITY: INCOMPLETE (pipeline-level; does not block code reviews)
```

---

## Guardrail Severity Reference

| Severity | Meaning | Can merge? |
|----------|---------|-----------|
| `BLOCKED` | Hard stop. No further action until resolved. | No |
| `NEEDS_REVISION` | Changes required before approval. | No |
| `INCOMPLETE` | Pipeline-level flag; code review may proceed. | Yes (with flag) |

---

## Enforcement Notes

- GGA reads `AGENTS.md` at repository root (configured via `.gga: RULES_FILE="AGENTS.md"`).
- Root `AGENTS.md` contains machine-readable G01–G09 blocks that mirror this file.
- **If root AGENTS.md and this file diverge, this file (`AGENTS/guardrails.md`) wins.**
- Update protocol: update this file first, then sync the summary in root `AGENTS.md`.
