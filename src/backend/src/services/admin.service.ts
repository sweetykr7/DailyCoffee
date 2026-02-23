import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      options: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return prisma.product.create({
    data,
    include: {
      category: true,
      images: true,
      options: true,
    },
  });
};

export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput,
) => {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      images: true,
      options: true,
    },
  });
};

export const deleteProduct = async (id: string) => {
  await prisma.product.delete({ where: { id } });
};

export const getOrders = async () => {
  return prisma.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateOrderStatus = async (
  id: string,
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED',
) => {
  return prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
};

export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
