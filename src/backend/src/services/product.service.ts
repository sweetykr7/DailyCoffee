import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface GetProductsParams {
  categoryId?: string;
  search?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

export const getProducts = async (params: GetProductsParams) => {
  const {
    categoryId,
    search,
    sort = 'latest',
    page = 1,
    limit = 12,
  } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'popular':
      orderBy = { reviews: { _count: 'desc' } };
      break;
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      options: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.');
  }

  return product;
};

export const getFeaturedProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    take: 8,
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
};

export const searchProducts = async (query: string) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
};

export const createProduct = async (data: Prisma.ProductCreateInput) => {
  const product = await prisma.product.create({
    data,
    include: {
      category: true,
      images: true,
      options: true,
    },
  });

  return product;
};

export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
) => {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      images: true,
      options: true,
    },
  });

  return product;
};

export const deleteProduct = async (id: string) => {
  await prisma.product.delete({
    where: { id },
  });
};
