import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.createOrder(req.user!.userId, {
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await orderService.getOrders(req.user!.userId);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user!.userId
    );

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
