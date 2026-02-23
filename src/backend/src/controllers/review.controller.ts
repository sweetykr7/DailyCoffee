import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId, rating, content, images, orderId } = req.body;
    const review = await reviewService.createReview(req.user!.userId, productId, rating, content, images, orderId);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Query parameter "productId" is required.',
      });
      return;
    }

    const reviews = await reviewService.getProductReviews(productId);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

export async function likeReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const review = await reviewService.likeReview(req.params.id);

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
}
