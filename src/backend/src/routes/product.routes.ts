import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ── GET / ─ List products with optional query params ─────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      sort = 'latest',
      categoryId,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) where.categoryId = categoryId as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
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

// ── GET /featured ─ Featured / recommended products ──────────────────────────

router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// ── GET /search ─ Keyword search ─────────────────────────────────────────────

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q = '', page = '1', limit = '20' } = req.query;
    const keyword = (q as string).trim();

    if (!keyword) {
      res.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      isActive: true,
      OR: [
        { name: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
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

// ── GET /:id ─ Single product detail ─────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        options: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export default router;
