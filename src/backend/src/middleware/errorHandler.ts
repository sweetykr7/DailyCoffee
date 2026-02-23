import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

/**
 * Global Express error-handling middleware.
 * Must be registered after all routes.
 *
 * Handles:
 *  - Prisma P2002 (unique constraint violation) -> 409
 *  - Prisma P2025 (record not found)            -> 404
 *  - All other errors                           -> 500
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) ?? [];
      res.status(409).json({
        success: false,
        error: `Unique constraint violation on: ${target.join(', ')}`,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'The requested record was not found.',
      });
      return;
    }
  }

  // Fallback for all other errors
  const statusCode = (err as any).statusCode ?? 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
