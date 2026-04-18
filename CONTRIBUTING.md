# Contributing to gerocultores-system

> **Authors**: Jose Vilches Sánchez (developer) / ANDRES MARTOS GAZQUEZ (tutor)  
> **Project**: DAW Final Project — Sistema de Gestión para Gerocultores  
> **Repository**: https://github.com/DevXoje/gerocultores-system

---

## Table of Contents

1. [Branch Policy — No Direct Pushes to `master`](#branch-policy)
2. [Commit Message Conventions](#commit-message-conventions)
3. [Pull Request Requirements](#pull-request-requirements)
4. [QA Gate — Pre-merge](#qa-gate--pre-merge)
5. [QA Gate — Post-merge](#qa-gate--post-merge)
6. [Mass-Deletion Guardrail](#mass-deletion-guardrail)
7. [Pre-commit Hook Setup](#pre-commit-hook-setup)
8. [Emergency Rollback Procedures](#emergency-rollback-procedures)
9. [Contact Points](#contact-points)

---

## Branch Policy

**Direct pushes to `master` are NOT allowed.** All changes must go through a Pull Request.

### Rules

| Rule | Details |
|------|---------|
| Branch protection | `master` requires at least 1 review before merge |
| Status checks | CI must pass before merge |
| No force-push | Never force-push to `master` |
| No delete | `master` cannot be deleted |
| Short-lived branches | Feature/fix branches should be merged within the sprint |

### Branch Naming Convention

```
feat/<short-description>       # new feature
fix/<short-description>        # bug fix
chore/<short-description>      # maintenance task
docs/<short-description>       # documentation only
refactor/<short-description>   # code restructuring without behavior change
guardrails/<short-description> # repository protection improvements
```

Examples:
- `feat/login-view`
- `fix/firestore-rules`
- `guardrails/patch-1`

---

## Commit Message Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Build process or tooling changes |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `ci` | Changes to CI/CD configuration |
| `style` | Code style changes (formatting, no logic change) |

### Examples

```
feat(auth): add Firebase email/password login
fix(firestore-rules): prevent unauthorized read on incidencias
chore(deps): upgrade Vue to 3.4.x
docs(readme): update local setup instructions
ci(workflows): add mass-deletion guard action
```

### Scope Reference

Scopes should match the area of the codebase:
- `auth`, `agenda`, `residentes`, `incidencias`, `turnos`, `notificaciones`
- `api`, `frontend`, `shared`
- `ci`, `workflows`, `guardrails`, `deps`, `config`

---

## Pull Request Requirements

All PRs must:

1. **Reference the SDD `topic_key`** if the change is part of a spec-driven change (e.g., `sdd/switch-stack-to-vue-firebase`).
2. **Fill the PR template** located at `.github/PULL_REQUEST_TEMPLATE.md`.
3. **Pass CI** — no merging with failing status checks.
4. **Receive 1 approving review** (self-review is not sufficient for production-critical paths).
5. **Not mass-delete files** — see [Mass-Deletion Guardrail](#mass-deletion-guardrail).

For guardrail and SDD artifact policy details, refer to `AGENTS/guardrails.md` (if present) or the SDD memory artifacts in Engram under project `gerocultores-system`.

---

## QA Gate — Pre-merge

Before merging any PR into `develop`, the reviewer MUST:

1. **Check all CI checks are green** — Lint, Type-check, Test, Build, E2E, GitGuardian, build_and_preview.
2. **Open the Firebase Hosting Preview Channel URL** — posted automatically by the `firebase-hosting-pull-request` action as a PR comment.
3. **Manually validate** the screens affected by the PR:
   - Navigate to each changed route/view
   - Verify the UI renders correctly
   - Test the happy path (valid input/action)
   - Test at least one error path (invalid input, unauthorized access, etc.)
4. **Only then approve and merge.**

---

## QA Gate — Post-merge

After merging into `develop`, the reviewer MUST:

1. Wait for the `deploy-staging` workflow to finish deploying to the `staging` Firebase Hosting channel.
2. Open the staging URL and repeat the same manual validation performed in the pre-merge gate.
3. If any regression is found, open a `fix:` PR immediately — do not leave regressions in `develop`.

---

## Mass-Deletion Guardrail

### Why This Exists

A prior incident resulted in destructive commits that deleted entire top-level directories (`DECISIONS/`, `SPEC/`, etc.). This policy prevents recurrence.

### Rules

- **Never delete more than 15 files in a single commit** without an explicit justification in the PR description.
- **Never delete top-level directories** (`AGENTS/`, `DECISIONS/`, `SPEC/`, `OUTPUTS/`, `PLAN/`) without an ADR and explicit approval.
- If you need to archive/reorganize large amounts of files, do it in a dedicated branch with a detailed PR.

### Pre-commit Hook

A pre-commit hook template is available at `TOOLS/pre-commit-template.sh` that will **abort the commit** if more than 15 files are being deleted at once.

To install it locally:

```bash
cp TOOLS/pre-commit-template.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**The hook is NOT installed automatically** to avoid blocking valid operations. It is the developer's responsibility to install it.

---

## Pre-commit Hook Setup

See `TOOLS/pre-commit-template.sh` for the full script. It:
1. Counts staged deletions.
2. Aborts the commit if `> 15` files would be deleted.
3. Also aborts if any file in `AGENTS/`, `DECISIONS/`, `SPEC/`, `OUTPUTS/`, or `PLAN/` is being deleted.
4. Provides a clear error message explaining how to proceed via a PR instead.

If you need to bypass the hook for a legitimate mass-deletion (e.g., removing a deprecated module with approval), use:

```bash
git commit --no-verify -m "chore: remove deprecated module (approved in PR #XX)"
```

Always document the reason in the commit message and link the PR.

---

## Emergency Rollback Procedures

### Scenario 1: Bad commit pushed to `master` (before CI runs)

```bash
# 1. Identify the last good commit
git log --oneline origin/master

# 2. Create a revert PR (NEVER force-push to master)
git checkout -b fix/revert-bad-commit
git revert <bad-commit-sha>
git push origin fix/revert-bad-commit

# 3. Open PR immediately and request emergency review
gh pr create --title "fix: revert <bad-commit-sha>" --base master
```

### Scenario 2: Files accidentally deleted — restore from last good commit

```bash
# Restore specific files/directories
git checkout <last-good-sha> -- DECISIONS/ SPEC/ OUTPUTS/ PLAN/

# Stage and commit the restore
git add .
git commit -m "fix: restore accidentally deleted directories from <last-good-sha>"
```

### Scenario 3: Mass-deletion detected by GitHub Actions

The `mass-deletion-guard.yml` workflow will:
1. Fail the CI check.
2. Automatically create a GitHub issue tagging `@DevXoje`.
3. Block the PR from being merged (if branch protection is enabled).

Respond to the issue and either close the PR or provide justification for the deletion.

---

## Contact Points

| Role | Name | GitHub |
|------|------|--------|
| Developer / Maintainer | Jose Vilches Sánchez | @DevXoje |
| Academic Tutor | ANDRES MARTOS GAZQUEZ | — |

For security-related issues, see `SECURITY/ci-secret-notes.md`.

For project planning and sprint details, see `PLAN/backlog.md`.

---

*Last updated: 2026-03-29*
