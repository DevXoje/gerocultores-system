# Stitch Workflow — Agent Protocol

This document defines how agents interact with the Stitch design tool to comply with guardrail G10.

## Stitch Project

- **Project name**: Dashboard - Care Home Mgmt
- **Project ID**: `16168255182252500555`
- **Reference file**: `OUTPUTS/technical-docs/design-source.md` (Vista ↔ Stitch screen mapping)

## G10 Rule (summary)

No agent may implement a Vue view or UI component without first identifying the corresponding Stitch screen in `design-source.md`. If no screen exists, create it in Stitch first.

## Screen Generation — Important Behavior

`stitch_generate_screen_from_text` is **slow and may time out** (~2 min connection timeout), but the generation **continues in the background and usually succeeds**.

### Protocol when generating a new screen

1. **Check first** — always call `stitch_list_screens` before generating. If the screen already exists, skip generation.
2. **Generate** — call `stitch_generate_screen_from_text` with the prompt.
3. **If it times out** — do NOT retry immediately. Wait and call `stitch_list_screens` again to check if the screen was created in the background.
4. **Confirm** — once the screen appears in the list, call `stitch_get_screen` to get its ID and preview URL.
5. **Register** — update `OUTPUTS/technical-docs/design-source.md` with the new screen ID and URL.
6. **Only then implement** — the Vue view may be implemented or refactored referencing the confirmed Stitch screen.

### Avoid duplicates

- Never call `stitch_generate_screen_from_text` twice for the same screen without checking `stitch_list_screens` in between.
- If a screen was generated in a previous session, it will appear in the list — do not regenerate it.

## Screen Naming Convention

Use descriptive English names that match the Vue view name:

| Vue View | Stitch Screen Name |
|---|---|
| `LoginView.vue` | `Login` |
| `DashboardView.vue` | `Dashboard` |
| `AgendaView.vue` | `Agenda` |
| `IncidentView.vue` | `Incident Report` |

## design-source.md Update Protocol

After confirming a screen exists in Stitch, update `OUTPUTS/technical-docs/design-source.md`:
- Add a row to the Vista ↔ Pantalla Stitch table
- Include: Vue view name, Stitch screen name, screen ID, and preview URL

---

## Orchestrator Prompt Pattern

When launching any frontend sub-agent, the orchestrator MUST use the template at:
`PROMPTS/development/frontend-subagent-prompt-template.md`

### Rules

1. **Always inject the specialist FIRST** — the `<identity>` block with `frontend-specialist.md` must appear at the very top of the sub-agent prompt, before any task description or context.
2. **Fill all `{{VARIABLES}}`** — replace `{{US_ID}}`, `{{TASK_DESCRIPTION}}`, `{{STITCH_SCREEN_ID}}`, and `{{ADDITIONAL_FILES}}` before sending.
3. **Never bury the specialist reference** — do not mention `frontend-specialist.md` as a suggestion in the body of the prompt. It must be in the `<identity>` block with an explicit STOP instruction.

### Why (Anthropic Principle)

Per Anthropic's prompt engineering best practices:
- **Put context at the top** — role and identity must come before instructions or task descriptions.
- **Use XML structure for separation of concerns** — `<identity>`, `<pre_conditions>`, `<rules>`, `<task>`, and `<output_format>` tags make each section unambiguous.
- **Explicit pre-condition verification** — asking the agent to confirm "✅ loaded" before proceeding forces acknowledgment and reduces silent skipping.
- **Rules before task** — if rules appear after the task description, the agent may already have started reasoning about the task before internalizing the constraints.
