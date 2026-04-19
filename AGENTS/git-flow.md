# Git Flow — gerocultores-system

> **Authoritative source for branch naming, merge strategy, and sprint workflow.**
> All agents must follow these conventions. Violations are treated as G06 (scope lock) or G08 (commit traceability) guardrail violations.

---

## Branch Model

```
master          ← production. Receives code ONLY from develop via PR.
  └── develop   ← integration branch. Receives code ONLY from sprint/* via PR.
        └── sprint/S{N}   ← sprint integration branch. Created from develop at sprint start.
              ├── feat/US-XX-short-description
              ├── fix/short-description
              └── chore/short-description
```

### Branch Types and Naming

| Branch | Pattern | Created from | Merges into | Notes |
|--------|---------|-------------|-------------|-------|
| Production | `master` | — | — | Protected. No direct pushes. |
| Integration | `develop` | — | `master` (release) | Protected. No direct pushes. |
| Sprint | `sprint/S{N}` | `develop` | `develop` | One per sprint. Created at sprint start. |
| Feature | `feat/US-{XX}-{short}` | `sprint/S{N}` | `sprint/S{N}` | One per user story task. |
| Fix | `fix/{short}` | `sprint/S{N}` or `develop` | same source | Bug fixes. |
| Chore | `chore/{short}` | `sprint/S{N}` or `develop` | same source | Tooling, deps, CI. |
| Docs | `docs/{short}` | `develop` | `develop` | Academic docs, README updates. |
| Release | `release/vX.Y.Z` | `develop` | `master` + `develop` | Optional. For hotfix-style releases. |

### Naming Examples

```
sprint/S3
feat/US-05-ficha-residente
feat/US-06-registro-incidencias
fix/taskcard-date-format
chore/update-firebase-sdk
docs/sprint-3-close-report
```

---

## Merge Strategy

All merges use **squash commits** (enforced by GitHub rulesets).

| Target | Source | Method | CI Required |
|--------|--------|--------|-------------|
| `master` | `develop` | Squash via PR | ✅ All checks must pass + 1 approval |
| `develop` | `sprint/S{N}` | Squash via PR | ✅ All checks must pass |
| `sprint/S{N}` | `feat/*`, `fix/*`, `chore/*` | Squash via PR | — (recommended) |

> **Why squash?** Keeps `master` and `develop` history clean — one commit per sprint or feature. Full history lives in the feature branches.

---

## Sprint Lifecycle

### 1. Start a sprint

```bash
# From the repo root — or use scripts/create-sprint.sh
git checkout develop
git pull origin develop
git checkout -b sprint/S{N}
git push -u origin sprint/S{N}
```

### 2. Work on a task

```bash
git checkout sprint/S{N}
git pull origin sprint/S{N}
git checkout -b feat/US-XX-short-description
# ... develop ...
git push -u origin feat/US-XX-short-description
# Open PR: feat/US-XX → sprint/S{N}
```

### 3. Close a sprint

1. Ensure all task PRs are merged into `sprint/S{N}`
2. Open PR: `sprint/S{N}` → `develop`
3. PR title: `sprint(S{N}): close sprint S{N} — US-XX, US-XX, ...`
4. CI must pass on the PR
5. Write sprint close report: `OUTPUTS/reports/sprint-{N}-close-report.md`
6. Merge (squash)
7. Delete `sprint/S{N}` branch

### 4. Release to production

1. Open PR: `develop` → `master`
2. PR title: `release: vX.Y.Z — Sprint S{N}`
3. CI must pass + 1 approval required
4. Merge (squash)
5. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`

---

## GitHub Branch Protection Summary

### `master` — Protección Producción (ruleset ID: 14951374)

| Rule | Value |
|------|-------|
| No deletion | ✅ |
| No force push | ✅ |
| Require PR | ✅ |
| Required approvals | 1 |
| Dismiss stale reviews on push | ✅ |
| Resolve all threads before merge | ✅ |
| Allowed merge methods | Squash only |
| Required status checks | `CI / api-test`, `CI / frontend-test`, `CI / frontend-type-check`, `CI / frontend-format-check` |
| Strict status checks (branch up to date) | ✅ |

### `develop` — Protección Desarrollo (ruleset ID: 14951445)

| Rule | Value |
|------|-------|
| No deletion | ✅ |
| No force push | ✅ |
| Require PR | ✅ |
| Required approvals | 0 (solo developer) |
| Dismiss stale reviews on push | ✅ |
| Resolve all threads before merge | ✅ |
| Allowed merge methods | Squash only |
| Required status checks | `CI / api-test`, `CI / frontend-test`, `CI / frontend-type-check`, `CI / frontend-format-check` |
| Strict status checks | ❌ (lenient for sprint integration) |

---

## Commit Convention (recap)

All commits must follow Conventional Commits:

```
<type>(<scope>): <short description>
```

Where `<scope>` for `feat` commits **must** be `US-XX`:

```
feat(US-05): add resident profile view
fix(US-03): correct task date format in agenda
chore(deps): upgrade firebase-admin to 13.x
```

Sprint-level commits (squash result on `develop`):
```
sprint(S3): close sprint S3 — US-05, US-06, US-07
```

Release commits (squash result on `master`):
```
release: v1.3.0 — Sprint S3
```

---

## Agent Rules

- **DEVELOPER**: Always create task branches from the current `sprint/S{N}`. Never from `develop` directly (unless it's a `docs/` or `chore/` not tied to a sprint).
- **REVIEWER**: Verify PR target is `sprint/S{N}` for feature work, NOT `develop` directly.
- **PLANNER**: At sprint start, ensure `sprint/S{N}` exists before assigning tasks.
- **All agents**: Never push directly to `master` or `develop`. It is blocked by GitHub rulesets.
