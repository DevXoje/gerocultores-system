# Git Hooks — Husky Setup

This project uses **Husky** to enforce code quality before commits and pushes.

## Hooks installed

| Hook | What it does |
|------|-------------|
| `pre-commit` | Runs `lint-staged` — lints staged frontend files with ESLint |
| `commit-msg` | Validates commit messages with `commitlint` (Conventional Commits) |
| `pre-push` | Runs the full test suite (`npm test`) before pushing to remote |

## How to install hooks locally

After cloning the repository, run:

```bash
npm install        # installs devDependencies (husky, lint-staged, commitlint)
npm run prepare    # initialises husky and registers hooks in .git/hooks
```

Both commands are safe to run multiple times.

## Commit message format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[scope]: <description>

Examples:
  feat(US-03): add daily schedule view
  fix(US-01): handle expired token on login
  chore(ci): update husky hooks
```

Allowed types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`, `perf`.

> **G08**: every `feat` commit MUST include the `US-XX` scope.

## Bypassing hooks (use with caution)

You can skip hooks for emergency commits:

```bash
git commit --no-verify -m "your message"
git push --no-verify
```

⚠️ Bypassing hooks should be a last resort. CI will still run all checks — any skipped
validation will be caught there and will block the PR merge.
