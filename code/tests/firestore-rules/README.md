# Firestore Rules Unit Tests

Unit tests for the Firestore security rules (`code/firestore.rules`) using `@firebase/rules-unit-testing` v2.

## Prerequisites

1. **Firebase CLI** installed (`npm install -g firebase-tools`)
2. **Java** installed (required by the Firestore emulator)
3. **Node.js** ≥ 18

## Running the Tests

### 1. Start the Firestore Emulator

From the `code/` directory:

```bash
# Start only the Firestore emulator (fast)
npx firebase emulators:start --only firestore --project gerocultores-test
```

Or start all emulators using the docker-compose setup:

```bash
cd code
./start_emulators.sh
```

### 2. Install Test Dependencies

```bash
cd code/tests/firestore-rules
npm install
```

### 3. Run the Tests

```bash
# From code/tests/firestore-rules/
npm test

# Or set a custom emulator host (default: 127.0.0.1:8080)
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm test
```

## What Is Tested

| Test | Expected |
|------|----------|
| gerocultor reads own tarea | ✅ allowed |
| gerocultor reads other user's tarea | ❌ denied |
| gerocultor updates own tarea | ✅ allowed |
| gerocultor updates other user's tarea | ❌ denied |
| gerocultor creates tarea | ✅ allowed |
| gerocultor reads assigned residente | ✅ allowed |
| gerocultor reads non-assigned residente | ❌ denied |
| gerocultor writes to residente | ❌ denied |
| administrador reads any tarea | ✅ allowed |
| administrador updates any tarea | ✅ allowed |
| administrador creates tarea | ✅ allowed |
| administrador reads any residente | ✅ allowed |
| administrador writes to residente | ✅ allowed |
| unauthenticated reads tareas | ❌ denied |
| unauthenticated reads residentes | ❌ denied |
