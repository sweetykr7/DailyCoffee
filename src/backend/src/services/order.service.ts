import prisma from '../lib/prisma';

const FREE_SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE = 3000;

export const createOrder = async (
  userId: string,
  shippingAddress: Record<string, unknown>,
  paymentMethod: string,
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('장바구니가 비어 있습니다.');
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;

  const order = await prisma.order.create({
    data: {
      userId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountPrice ?? item.product.price,
          selectedOptions: item.selectedOptions ?? undefined,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return order;
};

export const getOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const getOrderById = async (id: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('주문을 찾을 수 없습니다.');
  }

  return order;
};

export const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const updateOrderStatus = async (
  id: string,
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED',
) => {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return order;
};
