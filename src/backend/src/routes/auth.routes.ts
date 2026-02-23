import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as authService from '../services/auth.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';

const router = Router();

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Valid email is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  name: z.string().min(1, 'Name is required.'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /register
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, phone } = req.body;
      const user = await authService.register(email, password, name, phone);

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

      res.status(201).json({
        success: true,
        data: { user, accessToken, refreshToken },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

      res.json({
        success: true,
        data: { user, accessToken, refreshToken },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /refresh
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyRefreshToken(refreshToken);

      const accessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role });
      const newRefreshToken = generateRefreshToken({ userId: decoded.userId, role: decoded.role });

      res.json({
        success: true,
        data: { accessToken, refreshToken: newRefreshToken },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /logout
router.post(
  '/logout',
  authenticate,
  (_req: Request, res: Response) => {
    // With JWT-based auth the client simply discards the token.
    // A server-side token blacklist can be added here if needed.
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  },
);

// GET /me
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.findById(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
