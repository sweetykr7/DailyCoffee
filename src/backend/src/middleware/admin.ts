import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that restricts access to users with the ADMIN role.
 * Must be used after the `authenticate` middleware so that `req.user` is populated.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Admin access required.',
    });
    return;
  }

  next();
}
