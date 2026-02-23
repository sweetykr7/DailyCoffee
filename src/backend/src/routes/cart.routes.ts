import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';

const router = Router();

router.use(authenticate);

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
  selectedOptions: z.record(z.string()).optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
});

// ── Helper ───────────────────────────────────────────────────────────────────

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { order: 'asc' }, take: 1 } },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { order: 'asc' }, take: 1 } },
            },
          },
        },
      },
    });
  }

  return cart;
}

// ── GET / ─ Get current user's cart ──────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getOrCreateCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// ── POST / ─ Add item to cart ────────────────────────────────────────────────

router.post(
  '/',
  validate(addItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity, selectedOptions } = req.body;
      const cart = await getOrCreateCart(req.user!.userId);

      const existingItem = cart.items.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            selectedOptions: selectedOptions ?? {},
          },
        });
      }

      const updatedCart = await getOrCreateCart(req.user!.userId);
      res.status(201).json({ success: true, data: updatedCart });
    } catch (err) {
      next(err);
    }
  },
);

// ── PUT /:itemId ─ Update cart item quantity ─────────────────────────────────

router.put(
  '/:itemId',
  validate(updateItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await getOrCreateCart(req.user!.userId);
      const item = cart.items.find((i) => i.id === itemId);

      if (!item) {
        res.status(404).json({ success: false, error: 'Cart item not found.' });
        return;
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      const updatedCart = await getOrCreateCart(req.user!.userId);
      res.json({ success: true, data: updatedCart });
    } catch (err) {
      next(err);
    }
  },
);

// ── DELETE /:itemId ─ Remove single item from cart ───────────────────────────

router.delete('/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;

    const cart = await getOrCreateCart(req.user!.userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      res.status(404).json({ success: false, error: 'Cart item not found.' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await getOrCreateCart(req.user!.userId);
    res.json({ success: true, data: updatedCart });
  } catch (err) {
    next(err);
  }
});

// ── DELETE / ─ Clear entire cart ─────────────────────────────────────────────

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getOrCreateCart(req.user!.userId);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await getOrCreateCart(req.user!.userId);
    res.json({ success: true, data: updatedCart });
  } catch (err) {
    next(err);
  }
});

export default router;
