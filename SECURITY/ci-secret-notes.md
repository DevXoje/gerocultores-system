# CI Secret Notes — gerocultores-system

> **Author**: Jose Vilches Sánchez — DAW project (tutor: ANDRES MARTOS GAZQUEZ)
> **Last updated**: 2026-03-29
> **Related**: `.github/workflows/`, `PLAN/backlog.md` (task T-CI-02)

---

## Overview

This file documents all secrets and environment variables required by the GitHub Actions CI workflows.

**IMPORTANT**: Never commit actual secret values to this repository. This file only describes _what_ secrets are needed and _how_ to set them.

---

## Required Secrets

### 1. `FIREBASE_TOKEN`

| Field | Value |
|-------|-------|
| **Used by** | `.github/workflows/firestore-rules-tests.yml` |
| **Purpose** | Authenticate the Firebase CLI (`firebase` command) in non-interactive CI environments |
| **Required when** | Running Firestore emulator in GitHub Actions (Sprint-1 onward) |
| **Blocking** | ❌ Not blocking — workflow degrades gracefully with a warning if missing |

#### How to generate

```bash
# Run locally (once):
firebase login:ci

# This outputs a token like:
# 1//0gABCDEF...  (keep this private!)
```

#### How to add to GitHub

1. Go to: `https://github.com/DevXoje/gerocultores-system/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `FIREBASE_TOKEN`
4. Value: paste the token from `firebase login:ci`
5. Click **Add secret**

---

## Optional Secrets (future)

| Secret name | Workflow | Purpose | Sprint |
|-------------|----------|---------|--------|
| `VITE_FIREBASE_API_KEY` | (future deploy workflow) | Firebase Web API key for build-time injection | Sprint-2+ |
| `VITE_FIREBASE_PROJECT_ID` | (future deploy workflow) | Firebase project ID | Sprint-2+ |
| `FIREBASE_SERVICE_ACCOUNT` | (future deploy workflow) | Service account JSON for `firebase deploy` in CI | Sprint-2+ |

> ⚠️ **NEVER** commit Firebase service account JSON files to the repository.
> Add them exclusively as GitHub Actions secrets.

---

## Workflow Status per Secret

| Workflow | Secret needed | Behavior without secret |
|----------|--------------|------------------------|
| `ci.yml` | None | Runs fully (safe fallback) |
| `firestore-rules-tests.yml` | `FIREBASE_TOKEN` | Logs warning, exits 0 (non-blocking) |

---

## Next Steps (Backlog)

- [ ] **T-CI-02**: Add `FIREBASE_TOKEN` to GitHub repository secrets (Sprint-1)
- [ ] **T-CI-03**: Add `test:rules` script to `package.json` + `@firebase/rules-unit-testing` (Sprint-1)
- [ ] **T-CI-04**: Add `firebase.json` and `firestore.rules` (Sprint-1 Firebase setup)
- [ ] **T-CI-05**: Add deployment workflow with `firebase deploy` using service account (Sprint-2+)

---

## References

- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
- [GitHub Actions Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [firebase/rules-unit-testing](https://www.npmjs.com/package/@firebase/rules-unit-testing)
