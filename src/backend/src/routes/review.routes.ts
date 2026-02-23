import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';

const router = Router();

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1, 'Review content is required.'),
  images: z.array(z.string()).optional(),
  orderId: z.string().optional(),
});

// ── POST / ─ Create a review (authenticated) ────────────────────────────────

router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { productId, rating, content, images, orderId } = req.body;

      const existing = await prisma.review.findFirst({
        where: { userId, productId },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          error: '이미 이 상품에 리뷰를 작성하셨습니다.',
        });
        return;
      }

      const review = await prisma.review.create({
        data: { userId, productId, rating, content, images: images || [], orderId },
        include: { user: { select: { id: true, name: true } } },
      });

      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET / ─ List reviews (public, filtered by productId) ────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId as string;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /:id/like ─ Increment likes on a review (authenticated) ─────────────

router.put(
  '/:id/like',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({ where: { id } });

      if (!review) {
        res.status(404).json({ success: false, error: 'Review not found.' });
        return;
      }

      const updated = await prisma.review.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      res.json({ success: true, data: { likes: updated.likes } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
