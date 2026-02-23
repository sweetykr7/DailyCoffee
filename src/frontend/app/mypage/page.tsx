'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function MyPage() {
  const { user, setUser } = useAuthStore();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put<typeof user>('/auth/me', data);
      if (res.success && res.data) {
        setUser(res.data);
        setSuccess('정보가 수정되었습니다.');
      } else {
        setError(res.error || '수정에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-coffee">내 정보</h2>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {/* User info summary */}
        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coffee text-2xl font-bold text-white">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-lg font-bold text-coffee">{user?.name}</p>
            <p className="text-sm text-sub">{user?.email}</p>
            <p className="text-xs text-sub">
              가입일: {user?.createdAt ? formatDate(user.createdAt) : '-'}
            </p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-coffee-light">이메일</label>
            <p className="rounded-md bg-gray-50 px-3 py-2.5 text-sm text-sub">{user?.email}</p>
          </div>

          <Input
            label="이름"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="전화번호"
            type="tel"
            placeholder="010-0000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {success && (
            <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting}>
            정보 수정
          </Button>
        </form>
      </div>
    </div>
  );
}
