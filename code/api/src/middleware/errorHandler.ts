import type { Request, Response, NextFunction } from 'express'

// Express error handlers MUST accept 4 arguments (err, req, res, next).
// The next parameter is never called in this handler — it exists only to
// satisfy Express's error handler signature.
 
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  res.status(500).json({ error: 'Internal server error' })
}
