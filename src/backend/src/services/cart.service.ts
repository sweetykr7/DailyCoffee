import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' as const },
          },
        },
      },
    },
  },
};

const findOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
};

export const getCart = async (userId: string) => {
  return findOrCreateCart(userId);
};

export const addItem = async (
  userId: string,
  productId: string,
  quantity: number,
  selectedOptions?: Prisma.InputJsonValue,
) => {
  const cart = await findOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item) =>
      item.productId === productId &&
      JSON.stringify(item.selectedOptions) ===
        JSON.stringify(selectedOptions ?? null),
  );

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        selectedOptions: selectedOptions ?? Prisma.JsonNull,
      },
    });
  }

  return findOrCreateCart(userId);
};

export const updateItem = async (
  itemId: string,
  userId: string,
  quantity: number,
) => {
  const cart = await findOrCreateCart(userId);

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('장바구니에서 해당 상품을 찾을 수 없습니다.');
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return findOrCreateCart(userId);
};

export const removeItem = async (itemId: string, userId: string) => {
  const cart = await findOrCreateCart(userId);

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('장바구니에서 해당 상품을 찾을 수 없습니다.');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return findOrCreateCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return findOrCreateCart(userId);
};
