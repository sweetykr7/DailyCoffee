import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

// ---------------------------------------------------------------------------
// Product management
// ---------------------------------------------------------------------------

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await adminService.getProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await adminService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await adminService.updateProduct(req.params.id, req.body);

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await adminService.deleteProduct(req.params.id);

    res.json({
      success: true,
      data: { message: 'Product deleted successfully.' },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Order management
// ---------------------------------------------------------------------------

export async function getOrders(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await adminService.getOrders();

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(req.params.id, status);

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

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export async function getUsers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await adminService.getUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}
