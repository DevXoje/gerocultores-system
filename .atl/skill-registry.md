# Skill Registry — gerocultores-system

> Generated: 2026-04-29 | Updated: memory-cleanup skill added
> Project-level skills win over user-level. Deduplicated by name.

## SDD Skills (from user-level ~/.claude/skills/)

| Skill | Path | Trigger |
|-------|------|---------|
| sdd-init | ~/.claude/skills/sdd-init/SKILL.md | Initialize SDD context |
| sdd-explore | ~/.claude/skills/sdd-explore/SKILL.md | Investigate ideas before committing |
| sdd-propose | ~/.claude/skills/sdd-propose/SKILL.md | Create change proposals |
| sdd-spec | ~/.claude/skills/sdd-spec/SKILL.md | Write specifications |
| sdd-design | ~/.claude/skills/sdd-design/SKILL.md | Create technical designs |
| sdd-tasks | ~/.claude/skills/sdd-tasks/SKILL.md | Break down into tasks |
| sdd-apply | ~/.claude/skills/sdd-apply/SKILL.md | Implement code |
| sdd-verify | ~/.claude/skills/sdd-verify/SKILL.md | Validate implementation |
| sdd-archive | ~/.claude/skills/sdd-archive/SKILL.md | Sync delta specs and archive |
| sdd-onboard | ~/.claude/skills/sdd-onboard/SKILL.md | End-to-end SDD walkthrough |

## Utility Skills

| Skill | Path | Trigger |
|-------|------|---------|
| git-commit | ~/.claude/skills/git-commit/SKILL.md | Create commits with conventional messages |
| branch-pr | ~/.claude/skills/branch-pr/SKILL.md | PR creation workflow |
| judgment-day | ~/.claude/skills/judgment-day/SKILL.md | Adversarial dual review |
| skill-registry | ~/.claude/skills/skill-registry/SKILL.md | Scan and update skill registry |
| find-skills | ~/.claude/skills/find-skills/SKILL.md | Discover installable skills |
| obsidian-markdown | ~/.claude/skills/obsidian-markdown/SKILL.md | Obsidian Flavored Markdown |
| obsidian-cli | ~/.claude/skills/obsidian-cli/SKILL.md | Obsidian vault CLI operations |
| json-canvas | ~/.claude/skills/json-canvas/SKILL.md | JSON Canvas files |
| defuddle | ~/.claude/skills/defuddle/SKILL.md | Extract clean markdown from web pages |
| go-testing | ~/.claude/skills/go-testing/SKILL.md | Go testing patterns |

## Project Conventions (AGENTS/)

| File | Purpose |
|------|---------|
| AGENTS.md | Root rules file (`.gga: RULES_FILE="AGENTS.md"`) |
| AGENTS/guardrails.md | Non-negotiable guardrails (G01-G10) |
| AGENTS/roles.md | Agent role definitions |
| AGENTS/contracts.md | I/O contracts per agent |
| AGENTS/frontend-specialist.md | Frontend architecture (Vue 3, Pinia, Tailwind, BEM) |
| AGENTS/backend-specialist.md | Backend architecture (Express, Firebase Admin) |
| AGENTS/engram-conventions.md | Topic key naming conventions |

## Project-Level Skills (.agents/skills/)

| Skill | Path | Trigger |
|-------|------|---------|
| memory-cleanup | .agents/skills/memory-cleanup/SKILL.md | Limpiar memoria académica para entrega |

## Notes
- sdd-* skills: use when working on SDD phases (propose, spec, design, tasks, apply, verify, archive)
- branch-pr: use when creating GitHub PRs
- judgment-day: use when user asks for adversarial review
- memory-cleanup: use when user says "cleanup", "generar entregable", "memoria limpia", or needs to run the cleanup pipeline