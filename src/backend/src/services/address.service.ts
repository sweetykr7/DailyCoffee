import prisma from '../lib/prisma';

interface AddressData {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
}

export const getAddresses = async (userId: string) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });

  return addresses;
};

export const createAddress = async (userId: string, data: AddressData) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      name: data.name,
      phone: data.phone,
      zipCode: data.zipCode,
      address1: data.address1,
      address2: data.address2,
      isDefault: data.isDefault ?? false,
    },
  });

  return address;
};

export const updateAddress = async (
  id: string,
  userId: string,
  data: Partial<AddressData>,
) => {
  const existing = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('배송지를 찾을 수 없습니다.');
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data,
  });

  return address;
};

export const deleteAddress = async (id: string, userId: string) => {
  const existing = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('배송지를 찾을 수 없습니다.');
  }

  await prisma.address.delete({ where: { id } });
};

export const setDefault = async (id: string, userId: string) => {
  const existing = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('배송지를 찾을 수 없습니다.');
  }

  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  const address = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  return address;
};
