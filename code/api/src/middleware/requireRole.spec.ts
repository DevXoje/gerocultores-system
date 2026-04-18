/**
 * requireRole.spec.ts — Unit tests for the requireRole middleware factory.
 *
 * No Firebase emulator needed — req.user is mocked directly.
 * Coverage target: 100% for this middleware (backend-specialist.md §9.6).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { requireRole } from './requireRole'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(userRole?: string | undefined): Partial<Request> {
  if (userRole === undefined) {
    return {}
  }
  return {
    user: { role: userRole } as unknown as Request['user'],
  }
}

function makeRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  return { status, json }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('requireRole middleware factory', () => {
  let next: ReturnType<typeof vi.fn>

  beforeEach(() => {
    next = vi.fn()
  })

  // ── Passing cases ──────────────────────────────────────────────────────────

  it('calls next() when requireRole("admin") and user.role === "admin"', () => {
    const req = makeReq('admin')
    const { status } = makeRes()

    requireRole('admin')(req as Request, { status } as unknown as Response, next as NextFunction)

    expect(next).toHaveBeenCalledOnce()
    expect(status).not.toHaveBeenCalled()
  })

  it('calls next() when requireRole("gerocultor") and user.role === "gerocultor"', () => {
    const req = makeReq('gerocultor')
    const { status } = makeRes()

    requireRole('gerocultor')(
      req as Request,
      { status } as unknown as Response,
      next as NextFunction,
    )

    expect(next).toHaveBeenCalledOnce()
    expect(status).not.toHaveBeenCalled()
  })

  it('calls next() when requireRole accepts multiple roles and user has one of them', () => {
    const req = makeReq('gerocultor')
    const { status } = makeRes()

    requireRole('admin', 'gerocultor')(
      req as Request,
      { status } as unknown as Response,
      next as NextFunction,
    )

    expect(next).toHaveBeenCalledOnce()
    expect(status).not.toHaveBeenCalled()
  })

  // ── Failing cases — 403 ────────────────────────────────────────────────────

  it('returns 403 when requireRole("admin") and user.role === "gerocultor"', () => {
    const req = makeReq('gerocultor')
    const { status, json } = makeRes()

    requireRole('admin')(req as Request, { status } as unknown as Response, next as NextFunction)

    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String), code: 'FORBIDDEN' }),
    )
  })

  it('returns 403 when requireRole("admin") and req.user is undefined', () => {
    const req = makeReq(undefined) // no user property at all
    const { status, json } = makeRes()

    requireRole('admin')(req as Request, { status } as unknown as Response, next as NextFunction)

    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String), code: 'FORBIDDEN' }),
    )
  })

  it('returns 403 when requireRole("admin") and user.role is an unknown value', () => {
    const req = makeReq('superuser') // not a valid UserRole
    const { status, json } = makeRes()

    requireRole('admin')(req as Request, { status } as unknown as Response, next as NextFunction)

    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String), code: 'FORBIDDEN' }),
    )
  })

  it('does NOT call next() when 403 is returned', () => {
    const req = makeReq('gerocultor')
    const { status } = makeRes()

    requireRole('admin')(req as Request, { status } as unknown as Response, next as NextFunction)

    expect(next).not.toHaveBeenCalled()
  })
})
