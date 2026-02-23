import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await categoryService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await categoryService.getCategoryProducts(req.params.slug);

    if (!products) {
      res.status(404).json({
        success: false,
        error: 'Category not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}
