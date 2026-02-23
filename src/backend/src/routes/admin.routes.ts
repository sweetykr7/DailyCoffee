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
  name: z.string().min(1, '상품명은 필수입니다.'),
  description: z.string().optional(),
  price: z.number().positive('가격은 양수여야 합니다.'),
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1, '카테고리 ID는 필수입니다.'),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

const createCategorySchema = z.object({
  name: z.string().min(1, '카테고리명은 필수입니다.'),
  slug: z.string().min(1, '슬러그는 필수입니다.'),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

const createCouponSchema = z.object({
  code: z.string().min(1, '쿠폰 코드는 필수입니다.'),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive('할인값은 양수여야 합니다.'),
  minOrderAmount: z.number().int().min(0).nullable().optional(),
  maxDiscount: z.number().int().min(0).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  maxCount: z.number().int().min(1).nullable().optional(),
});

const updateCouponSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(['PERCENT', 'FIXED']).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().int().min(0).nullable().optional(),
  maxDiscount: z.number().int().min(0).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  maxCount: z.number().int().min(1).nullable().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalOrders,
      newUsersThisMonth,
      totalProducts,
      recentOrders,
      dailySalesRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        select: { createdAt: true, totalAmount: true },
      }),
    ]);

    // Aggregate daily sales
    const dailySalesMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailySalesMap.set(key, 0);
    }
    for (const order of dailySalesRaw) {
      const d = order.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dailySalesMap.has(key)) {
        dailySalesMap.set(key, (dailySalesMap.get(key) || 0) + order.totalAmount);
      }
    }
    const dailySales = Array.from(dailySalesMap.entries()).map(([date, amount]) => ({ date, amount }));

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders,
        newUsersThisMonth,
        totalProducts,
        dailySales,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search, categoryId } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (search && typeof search === 'string') {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
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

router.post(
  '/products',
  validate(createProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl, ...data } = req.body;
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);

      const product = await prisma.product.create({
        data: {
          ...data,
          slug,
          images: imageUrl
            ? { create: { url: imageUrl, isPrimary: true, order: 0 } }
            : undefined,
        },
        include: { category: true, images: true },
      });

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/products/:id',
  validate(updateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { imageUrl, ...data } = req.body;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다.' });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...data,
          images: imageUrl
            ? {
                deleteMany: {},
                create: { url: imageUrl, isPrimary: true, order: 0 },
              }
            : undefined,
        },
        include: { category: true, images: true },
      });

      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다.' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, data: { message: '상품이 삭제되었습니다.' } });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status && typeof status === 'string') where.status = status;
    if (search && typeof search === 'string') {
      where.user = { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
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

router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { include: { images: { take: 1, orderBy: { order: 'asc' } } } } } },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: '주문을 찾을 수 없습니다.' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/orders/:id/status',
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: '주문을 찾을 수 없습니다.' });
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

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
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

router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            items: { include: { product: { select: { id: true, name: true } } } },
          },
        },
        _count: { select: { orders: true, reviews: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/users/:id/role',
  validate(updateUserRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/categories',
  validate(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await prisma.category.create({
        data: req.body,
        include: { _count: { select: { products: true } } },
      });
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/categories/:id',
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: '카테고리를 찾을 수 없습니다.' });
        return;
      }

      const category = await prisma.category.update({
        where: { id },
        data: req.body,
        include: { _count: { select: { products: true } } },
      });
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      res.status(404).json({ success: false, error: '카테고리를 찾을 수 없습니다.' });
      return;
    }
    if (existing._count.products > 0) {
      res.status(400).json({ success: false, error: '상품이 있는 카테고리는 삭제할 수 없습니다.' });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ success: true, data: { message: '카테고리가 삭제되었습니다.' } });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/coupons', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/coupons',
  validate(createCouponSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expiresAt, ...rest } = req.body;
      const coupon = await prisma.coupon.create({
        data: {
          ...rest,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/coupons/:id',
  validate(updateCouponSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existing = await prisma.coupon.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: '쿠폰을 찾을 수 없습니다.' });
        return;
      }

      const { expiresAt, ...rest } = req.body;
      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          ...rest,
          ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        },
      });
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/coupons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: '쿠폰을 찾을 수 없습니다.' });
      return;
    }

    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, data: { message: '쿠폰이 삭제되었습니다.' } });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count(),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/reviews/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: '리뷰를 찾을 수 없습니다.' });
      return;
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true, data: { message: '리뷰가 삭제되었습니다.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
