import prisma from '../lib/prisma';

export const createReview = async (
  userId: string,
  productId: string,
  rating: number,
  content: string,
  images?: string[],
  orderId?: string,
) => {
  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      content,
      images: images ?? [],
      orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return review;
};

export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const likeReview = async (reviewId: string) => {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      likes: { increment: 1 },
    },
  });

  return review;
};
