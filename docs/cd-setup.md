# CD Setup Guide — GeroCare Firebase Hosting

This guide explains how to configure the GitHub Actions CD pipelines for the GeroCare project.

---

## Overview

Two workflows handle automated deploys to Firebase Hosting:

| Workflow | Trigger | Target | File |
|----------|---------|--------|------|
| Staging | Push to `develop` | Preview channel `staging` | `.github/workflows/deploy-staging.yml` |
| Production | Push to `master` | Live channel (public URL) | `.github/workflows/deploy-production.yml` |

---

## 1. Required GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**.

### `GCP_SERVICE_ACCOUNT_KEY`

A Google Cloud Service Account key with Firebase Hosting deploy permissions.

**How to get it:**

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select project `gero-care`.
2. Go to **IAM & Admin → Service Accounts**.
3. Create a new service account (or use an existing one) — give it the role **Firebase Hosting Admin** (`roles/firebasehosting.admin`).
4. Click the service account → **Keys** tab → **Add Key → Create new key → JSON**.
5. Download the `.json` file.
6. Paste the **entire JSON content** as the secret value (the action accepts raw JSON directly).

> **Security**: Never commit this file. The secret is consumed only by GitHub Actions at runtime.

---

### `VITE_FIREBASE_API_KEY`

**Where to find it:**

1. Open [Firebase Console](https://console.firebase.google.com/) → project `gero-care`.
2. Click the **gear icon → Project settings**.
3. Under **Your apps**, select the web app (or create one if needed).
4. Copy the value of `apiKey` from the Firebase SDK config snippet.

---

### `VITE_FIREBASE_AUTH_DOMAIN`

Same location as above — copy the value of `authDomain`.

Example value: `gero-care.firebaseapp.com`

---

### `VITE_FIREBASE_PROJECT_ID`

Copy the value of `projectId` from the Firebase SDK config snippet.

Value for this project: `gero-care`

---

### `VITE_FIREBASE_APP_ID`

Copy the value of `appId` from the Firebase SDK config snippet.

Example format: `1:123456789:web:abcdef1234567890`

---

## 2. How the Workflows Behave

### Staging (`develop` → preview channel)

- Runs on every push to `develop`.
- Deploys to a Firebase Hosting **preview channel** named `staging`.
- The preview URL is posted automatically as a comment on any associated pull request (via `GITHUB_TOKEN`).
- Preview channels expire after 7 days by default (Firebase default) — you can configure this in the action.
- Does **not** affect the live public URL.

### Production (`master` → live channel)

- Runs on every push to `master`.
- Deploys to the Firebase Hosting **live channel** — the public URL at `https://gero-care.web.app`.
- No PR comment is posted (direct push to master).
- Replaces the currently live version immediately.

---

## 3. How to Verify a Staging Deploy

1. Push a commit to `develop` (or merge a PR into it).
2. Go to GitHub → **Actions** tab → find the running workflow `Deploy to Firebase Hosting — Staging`.
3. Wait for it to complete (typically 1–2 minutes).
4. **Option A — GitHub PR comment**: If a PR targets `develop`, the action posts a comment with the preview URL automatically.
5. **Option B — Firebase Console**: Go to [Firebase Console](https://console.firebase.google.com/) → `gero-care` → **Hosting** → **Channels**. Find the `staging` channel and click the URL.
6. Verify the deployed app looks correct in the browser.

---

## 4. Local `.firebaserc` Reference

The `code/.firebaserc` file maps the alias to the Firebase project:

```json
{
  "projects": {
    "default": "gero-care"
  }
}
```

The `entryPoint: ./code` parameter in both workflows points to this directory so that Firebase CLI picks up `firebase.json` and `.firebaserc` from the correct location.

---

## 5. Build Output

The frontend is built into `code/frontend/dist/` by `npm run build`. Firebase Hosting's `public` field in `firebase.json` points to `frontend/dist` (relative to `code/`), so the build output is served correctly.

---

## 6. Secrets Summary

| Secret | Required by | Description |
|--------|-------------|-------------|
| `GCP_SERVICE_ACCOUNT_KEY` | Both workflows | Service Account JSON for Firebase deploy auth |
| `VITE_FIREBASE_API_KEY` | Both workflows | Firebase Web API key (injected at build time) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Both workflows | Firebase Auth domain (injected at build time) |
| `VITE_FIREBASE_PROJECT_ID` | Both workflows | Firebase project ID (injected at build time) |
| `VITE_FIREBASE_APP_ID` | Both workflows | Firebase App ID (injected at build time) |
| `GITHUB_TOKEN` | Both workflows | Auto-provided by GitHub — no setup needed |
