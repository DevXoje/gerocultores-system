# CI / CD Secret Management Notes

> **Project**: gerocultores-system — DAW Final Project  
> **Author**: Jose Vilches Sánchez  
> **Tutor**: ANDRES MARTOS GAZQUEZ  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Curso**: 2025-2026  
>
> ⚠️ **This file documents required secrets. It does NOT contain any secret values.**  
> All actual secret values must be stored in GitHub repository settings under  
> **Settings → Secrets and variables → Actions**.

---

## Required Secrets and Environment Variables

### GitHub Actions Secrets

The following secrets must be configured in the GitHub repository before running CI/CD workflows.
Navigate to: `https://github.com/DevXoje/gerocultores-system/settings/secrets/actions`

| Secret Name | Purpose | Required By | How to Get It |
|-------------|---------|-------------|---------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions — no setup needed | All workflows | Automatically injected by GitHub |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK authentication for CI deployments | (future) `deploy.yml` | Firebase Console → Project Settings → Service accounts → Generate new private key |
| `FIREBASE_APP_ID` | Firebase app identifier | (future) frontend build | Firebase Console → Project Settings → General → Your apps |

> **Note**: `GITHUB_TOKEN` is automatically available in all GitHub Actions workflows.
> You do **not** need to create it manually.

### Firebase (future — when stack is decided via ADR-01)

When the stack decision (Firebase vs alternatives) is resolved in `DECISIONS/ADR-01-stack.md`,
add the required secrets for the chosen platform. Until then, no Firebase secrets are needed.

---

## How to Add Secrets in GitHub

1. Go to your repository: `https://github.com/DevXoje/gerocultores-system`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name (e.g., `FIREBASE_SERVICE_ACCOUNT`) and paste the value
5. Click **Add secret**

---

## Current Workflow Requirements

### `mass-deletion-guard.yml`

- **Requires**: `GITHUB_TOKEN` (auto-injected — no setup needed)
- **Uses**: `permissions: issues: write` to create GitHub issues when mass-deletions are detected
- **No additional secrets needed**

---

## Security Policy

### Rules

1. **Never commit secret values** to the repository — not in source code, not in `.env` files, not in documentation.
2. **Use `.env.example`** to document required environment variable names (without values). Create it when the stack is implemented.
3. **Rotate secrets** if they are ever accidentally exposed. Report immediately to @DevXoje.
4. **Minimum access scope**: Request only the permissions a secret actually needs (e.g., don't use an admin key where a read-only key suffices).

### What to Do If a Secret Is Exposed

1. **Immediately revoke** the compromised secret in the issuing platform (Firebase Console, GitHub Settings, etc.)
2. **Generate a new secret** and add it to GitHub Secrets
3. **Create an incident issue** in the repository with label `security` (do NOT include the secret value in the issue)
4. **Notify** Jose Vilches Sánchez (@DevXoje) immediately

---

## .env.example (placeholder — update when stack is confirmed)

When the frontend/backend stack is decided, create `.env.example` at the repository root:

```
# Firebase (example — values are placeholders, not real)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:000000000000000000
```

Add `.env` and `.env.local` to `.gitignore` to prevent accidental secret commits.

---

*Last updated: 2026-03-29 | Maintained by @DevXoje*
