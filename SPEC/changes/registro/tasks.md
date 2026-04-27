# Tasks: Registro

## Phase 1: Backend Callable Function

- [x] 1.1 Create `code/api/src/functions/setUserClaims.ts` — Firebase callable with hardcoded `role: 'gerocultor'`, ignores client payload, validates `context.auth`
- [ ] 1.2 Modify `code/api/src/app.ts` — mount callable via `onCall` adapter at `/api`
- [x] 1.3 Write unit test `code/api/src/functions/setUserClaims.spec.ts` — covers unauthenticated call, successful claim set

## Phase 2: Firebase Service Export

- [x] 2.1 Modify `code/frontend/src/services/firebase.ts` — add `googleProvider` export (GoogleAuthProvider with email+profile scopes)

## Phase 3: Composable

- [x] 3.1 Create `code/frontend/src/business/auth/presentation/composables/useRegister.ts` — state machine (idle→creating→setting-claims→signing-in→done), form refs, error handling, `handleEmailPasswordSubmit`, `handleGoogleSubmit`
- [x] 3.2 Write unit test `code/frontend/src/business/auth/presentation/composables/useRegister.spec.ts` — covers state transitions, error mapping, form validation

## Phase 4: Routes and Route Names

- [x] 4.1 Modify `code/frontend/src/business/auth/route-names.ts` — add `REGISTER` entry to `AUTH_ROUTES`
- [x] 4.2 Modify `code/frontend/src/business/auth/routes.ts` — mount `RegisterPage` at `AUTH_ROUTES.REGISTER.path`

## Phase 5: RegisterPage View

- [x] 5.1 Create `code/frontend/src/business/auth/presentation/pages/RegisterPage.vue` — email/password form + Google OAuth button, inline error display, loading states, follows LoginPage pattern
- [x] 5.2 Write integration test `code/frontend/src/business/auth/presentation/pages/RegisterPage.spec.ts` — form rendering, button states, error display

## Phase 6: E2E Tests

- [ ] 6.1 Create `code/e2e/specs/registration.spec.ts` — full email/password registration + auto-redirect to dashboard
- [ ] 6.2 Create `code/e2e/specs/registration-google.spec.ts` — Google OAuth registration + auto-redirect (if Google OAuth provider is enabled in Firebase console)

## Phase 7: Rollout Checklist

- [ ] 7.1 Verify Google OAuth provider enabled in Firebase Console (Auth → Sign-in methods → Google)
- [ ] 7.2 Deploy `setUserClaims` to Firebase Functions staging
- [ ] 7.3 Smoke-test registration with a test account on staging
- [ ] 7.4 Merge and deploy to production