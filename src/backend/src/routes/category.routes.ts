import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ── GET / ─ List all categories ──────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
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

// ── GET /:slug/products ─ Products belonging to a category ───────────────────

router.get('/:slug/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page = '1', limit = '20', sort = 'latest' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const category = await prisma.category.findUnique({ where: { slug } });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found.' });
      return;
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id, isActive: true },
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      }),
      prisma.product.count({ where: { categoryId: category.id, isActive: true } }),
    ]);

    res.json({
      success: true,
      data: products,
      meta: {
        category,
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

export default router;
