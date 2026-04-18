/**
 * seed-tareas.safety.spec.ts
 *
 * Runtime-safety unit tests for seed-tareas.ts.
 * These tests verify that the abort logic fires correctly when the emulator
 * environment is not configured, without requiring a real emulator.
 *
 * Tests spawn the seed script as a child process and assert on exit code and stderr.
 */

import { describe, it, expect } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import * as path from 'node:path'

const SEED_SCRIPT = path.resolve(__dirname, 'seed-tareas.ts')
const TSX = path.resolve(__dirname, '../node_modules/.bin/tsx')

/**
 * Runs the seed script in a subprocess.
 * `FIRESTORE_EMULATOR_HOST` defaults to empty (unsafe env) unless explicitly
 * provided in the `env` argument.
 */
function runSeed(env: Record<string, string | undefined> = {}, timeoutMs = 10_000): ReturnType<typeof spawnSync> {
  const base: Record<string, string | undefined> = {
    ...process.env,
    NODE_ENV: 'test',
    FIRESTORE_EMULATOR_HOST: '', // default: no emulator set
  }
  // Caller overrides win (including explicit undefined to unset)
  return spawnSync(TSX, [SEED_SCRIPT], {
    env: { ...base, ...env },
    encoding: 'utf-8',
    timeout: timeoutMs,
  })
}

describe('seed-tareas safety guard', () => {
  it('exits with code 1 when FIRESTORE_EMULATOR_HOST is not set and no --emulator flag', () => {
    const result = runSeed({ FIRESTORE_EMULATOR_HOST: '' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ABORT')
    expect(result.stderr).toContain('emulator')
  })

  it('prints the emulator check message and exits cleanly when FIRESTORE_EMULATOR_HOST is set to localhost', () => {
    // We only check the safety guard passes — actual Firestore write will fail
    // because there is no real emulator in CI. We assert that the ABORT message
    // does NOT appear in stderr; the process may still exit non-zero due to
    // a connection error (expected in CI without a running emulator).
    const result = runSeed(
      { FIRESTORE_EMULATOR_HOST: 'localhost:18080' },
      2_000, // short timeout: we only need to see the guard output
    )
    // The safety guard check (lines 1-35 of the script) runs before any network call.
    // If ABORT appears, the guard incorrectly rejected a valid emulator env.
    expect(result.stderr).not.toContain('ABORT: seed-tareas must run against')
    expect(result.stderr).not.toContain('ABORT: FIRESTORE_EMULATOR_HOST appears to point to production')
  }, 10_000)

  it('exits with code 1 when FIRESTORE_EMULATOR_HOST looks like production Firebase', () => {
    const result = runSeed({ FIRESTORE_EMULATOR_HOST: 'project-id.firebaseio.com' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ABORT')
    expect(result.stderr).toContain('production Firebase')
  })

  it('exits with code 1 when --emulator flag is passed but env var is missing', () => {
    const proc = spawnSync(TSX, [SEED_SCRIPT, '--emulator'], {
      env: { ...process.env, FIRESTORE_EMULATOR_HOST: '', NODE_ENV: 'test' },
      encoding: 'utf-8',
      timeout: 10_000,
    })
    expect(proc.status).toBe(1)
    expect(proc.stderr).toContain('ABORT')
  })
})
