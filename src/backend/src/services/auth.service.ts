import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

const SALT_ROUNDS = 10;

const userWithoutPassword = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const register = async (
  email: string,
  password: string,
  name: string,
  phone?: string,
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
    },
    select: userWithoutPassword,
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const { password: _, ...userWithoutPw } = user;
  return userWithoutPw;
};

export const findById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userWithoutPassword,
  });

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  return user;
};
