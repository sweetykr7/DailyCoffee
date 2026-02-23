import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cart = await cartService.getCart(req.user!.userId);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function addItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId, quantity, selectedOptions } = req.body;
    const cart = await cartService.addItem(req.user!.userId, {
      productId,
      quantity,
      selectedOptions,
    });

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(
      req.user!.userId,
      req.params.itemId,
      { quantity }
    );

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cart = await cartService.removeItem(
      req.user!.userId,
      req.params.itemId
    );

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await cartService.clearCart(req.user!.userId);

    res.json({
      success: true,
      data: { message: 'Cart cleared successfully.' },
    });
  } catch (error) {
    next(error);
  }
}
