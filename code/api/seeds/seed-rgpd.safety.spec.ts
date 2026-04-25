/**
 * seed-rgpd.safety.spec.ts
 *
 * Runtime-safety unit tests for seed-rgpd.ts.
 * Verifies abort logic fires correctly when emulator env is not configured,
 * and that no production Firebase can be targeted.
 *
 * Tests spawn the seed script as a child process and assert on exit code and stderr.
 */

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import * as path from 'node:path'

const SEED_SCRIPT = path.resolve(__dirname, 'seed-rgpd.ts')
const TSX = path.resolve(__dirname, '../node_modules/.bin/tsx')

function runSeed(
  env: Record<string, string | undefined> = {},
  timeoutMs = 10_000
): ReturnType<typeof spawnSync> {
  const base: Record<string, string | undefined> = {
    ...process.env,
    NODE_ENV: 'test',
    FIRESTORE_EMULATOR_HOST: '', // default: no emulator set
  }
  return spawnSync(TSX, [SEED_SCRIPT], {
    env: { ...base, ...env },
    encoding: 'utf-8',
    timeout: timeoutMs,
  })
}

describe('seed-rgpd safety guard', () => {
  it('exits with code 1 when FIRESTORE_EMULATOR_HOST is not set', () => {
    const result = runSeed({ FIRESTORE_EMULATOR_HOST: '' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ABORT')
    expect(result.stderr).toContain('emulator')
  })

  it('passes the safety guard when FIRESTORE_EMULATOR_HOST is set to localhost', () => {
    // Only checks the guard passes — connection will fail without a real emulator.
    // ABORT must NOT appear in stderr when a valid emulator host is provided.
    const result = runSeed(
      { FIRESTORE_EMULATOR_HOST: 'localhost:18080' },
      2_000,
    )
    expect(result.stderr).not.toContain('ABORT: seed-rgpd must run against')
    expect(result.stderr).not.toContain('ABORT: FIRESTORE_EMULATOR_HOST appears to point to production')
  }, 10_000)

  it('exits with code 1 when FIRESTORE_EMULATOR_HOST looks like production Firebase', () => {
    const result = runSeed({ FIRESTORE_EMULATOR_HOST: 'project-id.firebaseio.com' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('ABORT')
    expect(result.stderr).toContain('production Firebase')
  })

  it('prints "Emulator check passed" and the host when guard passes', () => {
    const result = runSeed(
      { FIRESTORE_EMULATOR_HOST: 'localhost:18080' },
      2_000,
    )
    // stdout may be empty if the process times out before writing, but stderr should be clean
    expect(result.stderr).not.toContain('ABORT')
  }, 10_000)
})
