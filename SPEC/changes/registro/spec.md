# User Registration Specification

## Purpose

Gerocultors need a self-service way to register themselves in the system. Registration should allow email/password and Google OAuth, and upon completion, auto-assign the 'gerocultor' role to ensure correct access.

## User Story
**US-14** (Placeholder): Como gerocultor, quiero poder registrarme en la aplicación utilizando mi correo y contraseña o mi cuenta de Google, para poder acceder al sistema y gestionar la información de los residentes.

## Preconditions and Postconditions

**Preconditions**:
- User does not have an active account with the provided email.
- Firebase Auth and Google OAuth are configured and active.
- Firebase Functions are available to process custom claims.

**Postconditions**:
- A new Firebase Auth user is created.
- The user is assigned the custom claim `role: 'gerocultor'`.
- The user is authenticated and redirected to the dashboard.

## Requirements

### Requirement: Email/Password Registration
The system MUST allow users to register using a valid email address and a secure password.

#### Scenario: Successful Email/Password Registration (Happy Path)
- GIVEN the user is on the Register page
- WHEN the user submits a valid email and password
- THEN a new user account MUST be created
- AND the `setUserClaims` callable MUST be invoked to assign the 'gerocultor' role
- AND the user MUST be automatically logged in and redirected to the dashboard

#### Scenario: Email Already Exists (Alternative Path)
- GIVEN the user is on the Register page
- WHEN the user submits an email that is already registered
- THEN the system MUST display an error message indicating the email is in use
- AND the user MUST NOT be registered or logged in

### Requirement: Google OAuth Registration
The system MUST allow users to register using their Google account via an OAuth popup.

#### Scenario: Successful Google Registration (Happy Path)
- GIVEN the user is on the Register page
- WHEN the user selects Google registration and completes the OAuth flow successfully
- THEN a new user account MUST be created using their Google credentials
- AND the `setUserClaims` callable MUST be invoked to assign the 'gerocultor' role
- AND the user MUST be automatically logged in and redirected to the dashboard

#### Scenario: Google Account Already Exists with Different Provider (Edge Case)
- GIVEN the user is on the Register page
- WHEN the user selects Google registration but the email is already linked to an email/password account
- THEN Firebase Auth SHOULD merge the accounts or display a specific provider collision error based on Firebase configuration
- AND the user MUST NOT proceed without resolving the conflict

### Requirement: Role Assignment
The system MUST assign the 'gerocultor' role to all newly registered users via a backend callable function (`setUserClaims`). 

#### Scenario: Callable Function Fails (Error Handling)
- GIVEN a user has just been created in Firebase Auth
- WHEN the `setUserClaims` callable function fails (e.g., 500 error)
- THEN the system MUST display a critical error message
- AND the user SHOULD NOT be redirected to the dashboard (as they lack permissions)
- AND the user SHOULD be signed out to prevent unauthorized access

#### Scenario: Callable Function Timeout (Edge Case)
- GIVEN a user has just been created
- WHEN the `setUserClaims` callable function times out
- THEN the system MUST display a timeout error
- AND the user MUST be prompted to contact support or retry logging in later

## Security Considerations
- **Role Defaulting**: All self-service registrations MUST default to the `gerocultor` role. 
- **Admin Self-Registration Prohibition**: Under NO circumstances should a user be able to self-register as an `admin`.
- **Client-Side Restrictions**: The `setUserClaims` backend function MUST strictly hardcode or validate the assigned role to 'gerocultor', ignoring any role parameters passed from the client to prevent privilege escalation.