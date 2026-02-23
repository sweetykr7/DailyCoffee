import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      categoryId,
      search,
      sort,
      page = '1',
      limit = '10',
    } = req.query;

    const result = await productService.getProducts({
      categoryId: categoryId as string | undefined,
      search: search as string | undefined,
      sort: sort as 'latest' | 'price_asc' | 'price_desc' | 'popular' | undefined,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productService.getProductById(req.params.id);

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

export async function getFeaturedProducts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await productService.getFeaturedProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required.',
      });
      return;
    }

    const products = await productService.searchProducts(q);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}
