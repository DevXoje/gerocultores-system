# Design: Registro

## Technical Approach

Self-service user registration via Firebase Auth (email/password + Google OAuth), followed by a Firebase callable function (`setUserClaims`) that sets a `gerocultor` role custom claim on the newly created user. The frontend uses a state-machine composable (`useRegister`) that orchestrates the multi-step flow and auto-redirects to the dashboard on success. Follows the existing DDD structure and BEM + `@apply` styling conventions from the auth module.

## Architecture Decisions

### Decision: State machine in composable, not store

**Choice**: Registration state lives in `useRegister.ts` (presentation/composable), not in `useAuthStore`.
**Alternatives considered**: Add `registerStatus` state to `useAuthStore`.
**Rationale**: Registration is a finite, linear flow (create → set claims → sign in → done). The store is for persistent global auth state. Mixing registration flow state into the store would blur the single-responsibility boundary established in frontend-specialist.md.

### Decision: Callable function over REST endpoint for claims

**Choice**: Deploy `setUserClaims` as a Firebase callable function (`onCall`) invoked via `httpsCallable` from the frontend.
**Alternatives considered**: REST endpoint at `POST /api/register/set-claims` with verifyAuth middleware.
**Rationale**: Callable functions automatically receive the authenticated user's Firebase token in the context — no need to manually pass or validate a Bearer token on the client. This eliminates the risk of token leakage in the registration payload and simplifies the security model.

### Decision: Role hardcoded to 'gerocultor' in the callable

**Choice**: `setUserClaims` always assigns `role: 'gerocultor'` regardless of what the frontend passes.
**Alternatives considered**: Accept `{ uid, role }` where role is configurable.
**Rationale**: Per proposal scope, only gerocultor self-registration is in scope. The callable receives the uid (from the authenticated context) and always assigns the single allowed role. This is a defense-in-depth measure: even if a malicious caller bypasses the frontend, the callable ignores any role payload and only sets 'gerocultor'. Admin role assignment requires a separate admin-only flow (US-10).

### Decision: Google OAuth via `signInWithPopup`

**Choice**: Use `signInWithPopup(auth, GoogleAuthProvider)` from Firebase JS SDK.
**Alternatives considered**: OAuth redirect mode (`signInWithRedirect`).
**Rationale**: Popup preserves the SPA context without a full-page navigation, matching the UX pattern of the login page. Emulator support is identical for both modes.

## Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│ RegisterPage│────▶│  useRegister     │────▶│ Firebase Auth        │────▶│ setUserClaims│
│  (View)     │     │ (composable)     │     │ createUser/popup     │     │ (callable)   │
└─────────────┘     └──────────────────┘     └──────────────────────┘     └──────────────┘
                           │
                           ▼ (on success)
                    ┌──────────────┐     ┌──────────────────┐
                    │ useAuthStore │────▶│  DashboardView   │
                    │ signIn →     │     │  (redirect)      │
                    └──────────────┘     └──────────────────┘
```

## State Flow Diagram

```
idle
  │ email/password submit OR Google OAuth click
  ▼
creating ──► error (auth/already-exists)
  │ Firebase: createUserWithEmailAndPassword OR signInWithPopup
  ▼
setting-claims ──► error (callable failed)
  │ httpsCallable(setUserClaims) → adminAuth.setCustomUserClaims(uid, { role: 'gerocultor' })
  ▼
signing-in ──► error (re-auth failed)
  │ store.signIn(email) via Firebase re-auth (or reload user for Google)
  ▼
done
  │ router.push(DASHBOARD_ROUTES)
  ▼
[DashboardView]
```

**Error states**: each error sets `errorMessage` on the composable; the view renders it inline. No error state machine transitions — composable stays in the error state until the user retries.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `code/frontend/src/business/auth/presentation/pages/RegisterPage.vue` | Create | Registration view with email/password + Google OAuth buttons |
| `code/frontend/src/business/auth/presentation/composables/useRegister.ts` | Create | Registration composable: form state, state machine, submit logic |
| `code/frontend/src/business/auth/route-names.ts` | Modify | Add `REGISTER` entry to `AUTH_ROUTES` |
| `code/frontend/src/business/auth/routes.ts` | Modify | Mount `RegisterPage` at `AUTH_ROUTES.REGISTER.path` |
| `code/frontend/src/services/firebase.ts` | Modify | Export `googleProvider` (GoogleAuthProvider instance) |
| `code/api/src/functions/setUserClaims.ts` | Create | Firebase callable function: sets `role: 'gerocultor'` custom claim |
| `code/api/src/app.ts` | Modify | Mount callable functions at `/api` via `onCall` (Firebase Functions Express adapter) |

## Callable Function Signature

**Location**: `code/api/src/functions/setUserClaims.ts`

```typescript
import * as functions from 'firebase-functions'
import { adminAuth } from '../services/firebase'

export const setUserClaims = functions.https.onCall(async (data, context) => {
  // context.auth.uid is the authenticated user's UID from the Firebase token
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Token requerido')
  }

  const uid = context.auth.uid

  // Always assign gerocultor — role from data payload is ignored (security hardening)
  await adminAuth.setCustomUserClaims(uid, { role: 'gerocultor' })

  return { success: true, uid, role: 'gerocultor' }
})
```

**Frontend call**:

```typescript
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'

const setUserClaimsFn = httpsCallable(functions, 'setUserClaims')
await setUserClaimsFn({}) // uid comes from context.auth.uid, not from data
```

## Interface Contracts

### useRegister composable (public API)

```typescript
interface UseRegister {
  // Form fields
  email: Ref<string>
  passwordInput: Ref<string>
  confirmPasswordInput: Ref<string>
  showPassword: Ref<boolean>

  // UI state
  errorMessage: Ref<string | null>
  isLoading: Ref<boolean>

  // Actions
  handleEmailPasswordSubmit(): Promise<void>
  handleGoogleSubmit(): Promise<void>
  togglePassword(): void

  // State machine (for debug/testing)
  state: 'idle' | 'creating' | 'setting-claims' | 'signing-in' | 'done' | 'error'
}
```

### Google provider export

```typescript
// code/frontend/src/services/firebase.ts
import { GoogleAuthProvider } from 'firebase/auth'
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (`useRegister.spec.ts`) | State transitions, error mapping, form validation | Vitest + composable unit test |
| Integration (`RegisterPage.spec.ts`) | Form rendering, button states, error display | @vue/test-utils + Vitest |
| E2E | Full registration + auto-redirect | Playwright spec (`registration.spec.ts`) |

## Migration / Rollout

No migration required. This is a net-new feature with no schema or data changes.

**Rollout order**:
1. Deploy `setUserClaims` callable to Firebase Functions (staging first)
2. Enable Google OAuth provider in Firebase Console (Auth → Sign-in methods → Google)
3. Add `RegisterPage.vue` + `useRegister.ts` + route changes
4. Smoke-test registration with a test account
5. Merge and deploy

## Open Questions

- [ ] Does the Firebase project already have Google OAuth provider enabled in the console? If not, it must be enabled before the feature works.
- [ ] Should `setUserClaims` write a Firestore document to `users/{uid}` on first registration for profile completeness? Proposal is silent on this; current scope is only claims. Can be addressed in a follow-up US.