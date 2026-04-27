# Proposal: Registro

## Intent
Gerocultors need a self-service way to register themselves in the system. 
Currently, only login is supported via Firebase. Registration should allow email/password and Google OAuth, and upon completion, auto-assign the 'gerocultor' role to ensure correct access.

## Scope

### In Scope
- `RegisterPage.vue` view with email/password and Google OAuth options.
- `useRegister` composable mimicking `useLogin` behavior.
- Add `REGISTER` route in `route-names.ts` and `routes.ts`.
- Callable Firebase Cloud Function `setUserClaims` to set the `role` claim.
- Auto-sign-in and redirect to the dashboard post-registration.

### Out of Scope
- Registration or modification of administrative (admin) accounts.
- Changes to existing login flow, dashboard, or other views.
- Backend verification of the gerocultor credentials (automatic approval).

## Capabilities

### New Capabilities
- `user-registration`: Self-service user creation with role assignment.

### Modified Capabilities
- None

## Approach
Implement standard Firebase authentication using `firebase/auth` for email/password (`createUserWithEmailAndPassword`) and Google OAuth (`signInWithPopup(GoogleAuthProvider)`). On successful user creation, invoke a newly deployed Firebase callable function (`httpsCallable`) named `setUserClaims` from the frontend to set the custom `role` claim. After claims are successfully verified, direct the user automatically to the dashboard. Use BEM + Tailwind + `@apply` for the `RegisterPage.vue` styles to match the existing login page pattern.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `code/app/src/views/auth/RegisterPage.vue` | New | Registration view |
| `code/app/src/composables/useRegister.ts` | New | Auth logic for registration |
| `code/app/src/router/route-names.ts` | Modified | Add `REGISTER` |
| `code/app/src/router/routes.ts` | Modified | Add registration route |
| `code/api/src/index.ts` | Modified | Add `setUserClaims` callable function |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cloud Function deployment | Medium | Document deployment steps for the new callable function |
| Race condition on claims | Low | Await the callable function resolution before auto-redirecting |

## Rollback Plan
Remove `RegisterPage.vue` and `useRegister.ts`. Revert routing entries in `route-names.ts` and `routes.ts`. Delete the `setUserClaims` function from the backend environment.

## Dependencies
- Firebase Auth (requires Google OAuth to be enabled in Firebase Console)
- Firebase Functions / Express (for callable custom claims assignment)

## Success Criteria
- [ ] Users can register using an email and password.
- [ ] Users can register using a Google Account.
- [ ] New users receive the `role` claim via custom claims immediately post-registration.
- [ ] Successful registration automatically logs the user in and redirects to the dashboard.