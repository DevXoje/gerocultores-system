# AGENTS/contracts.md — I/O Contracts per Agent

<!-- AGENT-ONLY (EN) — This file is for AI agent consumption. -->

> Each agent has a bounded set of required inputs and guaranteed outputs.
> Last updated: 2026-03-28

---

## COLLECTOR

**Required input**: Active session context (project description, constraints); interview prompt script.
**Guaranteed output**: Raw notes in `LOGS/raw_requirements_YYYY-MM-DD.md`; list of identified gaps (fields marked TODO).

---

## ARCHITECT

**Required input**: Technical decision to document (context, options, evaluation criteria).
**Optional input**: `SPEC/constraints.md`; existing ADRs in `DECISIONS/` for consistency.
**Guaranteed output**: ADR in `DECISIONS/` with status `PROPOSED | ACCEPTED | SUPERSEDED`.

---

## PLANNER

**Required input**: Populated `SPEC/requirements.md` or `SPEC/user-stories.md`.
**Optional input**: Estimated velocity; time constraints.
**Guaranteed output**: Updated `PLAN/backlog.md`; generated `PLAN/current-sprint.md`.

---

## DEVELOPER

**Required input**: User story from `SPEC/user-stories.md`; relevant ADRs; `TECH_GUIDE.md`.
**Optional input**: Existing code context; sprint decisions and priorities.
**Guaranteed output**: Implemented code in the project repository; implementation notes for REVIEWER (decisions made, debt detected, TODOs).
**Conditional output**: Proposed ADR draft if a non-obvious technical decision was made during implementation.

---

## REVIEWER

**Required input**: Code to review; associated user story from `SPEC/user-stories.md`; `AGENTS/guardrails.md`.
**Optional input**: Relevant ADRs; prior review history from `LOGS/`.
**Guaranteed output**: Decision (`APPROVED | NEEDS_REVISION | BLOCKED`) with list of issues (if any); review report in `LOGS/`.

---

## TESTER

**Required input**: User story or requirement from `SPEC/`.
**Guaranteed output**: Test plan in `OUTPUTS/test-plans/test-plan-US-XX.md` with happy path cases and minimum 3 edge cases.

---

## WRITER

**Required input**: Section to draft; source material from `SPEC/`, `DECISIONS/`, or code.
**Guaranteed output**: Draft in `OUTPUTS/academic/` (for DAW memoria sections) OR `OUTPUTS/technical-docs/` (for technical documentation).
