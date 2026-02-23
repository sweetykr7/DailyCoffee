import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';

const router = Router();

// All address routes require authentication
router.use(authenticate);

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createAddressSchema = z.object({
  name: z.string().min(1, 'Recipient name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  zipCode: z.string().min(1, 'Zip code is required.'),
  address1: z.string().min(1, 'Address line 1 is required.'),
  address2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ── GET / ─ List current user's addresses ────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
});

// ── POST / ─ Create a new address ────────────────────────────────────────────

router.post(
  '/',
  validate(createAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, phone, zipCode, address1, address2, isDefault } = req.body;

      // If this address is marked as default, unset current default
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: { userId, name, phone, zipCode, address1, address2, isDefault: isDefault ?? false },
      });

      res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },
);

// ── PUT /:id ─ Update an address ─────────────────────────────────────────────

router.put(
  '/:id',
  validate(updateAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const existing = await prisma.address.findFirst({ where: { id, userId } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Address not found.' });
        return;
      }

      // If setting as default, unset current default first
      if (req.body.isDefault) {
        await prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.update({
        where: { id },
        data: req.body,
      });

      res.json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  },
);

// ── DELETE /:id ─ Remove an address ──────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Address not found.' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Address deleted.' } });
  } catch (err) {
    next(err);
  }
});

// ── PUT /:id/default ─ Set an address as default ─────────────────────────────

router.put('/:id/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Address not found.' });
      return;
    }

    // Unset all defaults, then set the chosen one
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
});

export default router;
