import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory that validates `req.body` against the provided Zod schema.
 * Returns 400 with structured Zod error details when validation fails.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = (result.error as ZodError).issues.map(
        (issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })
      );

      res.status(400).json({
        success: false,
        error: 'Validation failed.',
        details: formattedErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
