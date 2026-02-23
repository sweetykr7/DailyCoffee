'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const registerSchema = z
  .object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
    email: z.string().email('올바른 이메일을 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser(data.email, data.password, data.name, data.phone);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-center text-xl font-bold text-coffee">회원가입</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="이름"
          placeholder="홍길동"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="8자 이상"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력해주세요"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Input
          label="전화번호 (선택)"
          type="tel"
          placeholder="010-0000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          회원가입
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-sub">
        이미 회원이신가요?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          로그인
        </Link>
      </div>
    </div>
  );
}
