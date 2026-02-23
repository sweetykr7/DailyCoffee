import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number.'),
  categoryId: z.string().min(1, 'Category ID is required.'),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  options: z.record(z.array(z.string())).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  options: z.record(z.array(z.string())).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.string().min(1, 'Status is required.'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /products ─ List all products (admin view)
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count(),
    ]);

    res.json({
      success: true,
      data: products,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// POST /products ─ Create a new product
router.post(
  '/products',
  validate(createProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.create({
        data: req.body,
        include: { category: true },
      });

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /products/:id ─ Update a product
router.put(
  '/products/:id',
  validate(updateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Product not found.' });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: req.body,
        include: { category: true },
      });

      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /products/:id ─ Delete a product
router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    await prisma.product.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Product deleted.' } });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /orders ─ List all orders (admin view)
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status) where.status = status as string;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /orders/:id/status ─ Update order status
router.put(
  '/orders/:id/status',
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
      });

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /users ─ List all users
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
