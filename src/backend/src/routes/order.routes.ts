import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createOrderSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(1, 'Recipient name is required.'),
    phone: z.string().min(1, 'Phone number is required.'),
    zipCode: z.string().min(1, 'Zip code is required.'),
    address1: z.string().min(1, 'Address line 1 is required.'),
    address2: z.string().optional(),
  }),
  paymentMethod: z.string().min(1, 'Payment method is required.'),
});

// ── POST / ─ Create order from current cart ──────────────────────────────────

router.post(
  '/',
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { shippingAddress, paymentMethod } = req.body;

      // Fetch the user's cart with items
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        res.status(400).json({ success: false, error: 'Cart is empty.' });
        return;
      }

      // Calculate total
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      // Create order with items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            totalAmount,
            shippingAddress,
            paymentMethod,
            status: 'PENDING',
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                selectedOptions: item.selectedOptions ?? {},
              })),
            },
          },
          include: { items: { include: { product: true } } },
        });

        // Clear the cart after placing the order
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return newOrder;
      });

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET / ─ List current user's orders ───────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: orders,
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

// ── GET /:id ─ Single order detail ───────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export default router;
