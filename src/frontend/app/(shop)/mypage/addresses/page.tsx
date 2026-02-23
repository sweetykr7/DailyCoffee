'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, MapPin, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Address } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const addressSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요.'),
  phone: z.string().min(10, '연락처를 입력해주세요.'),
  zipCode: z.string().min(5, '우편번호를 입력해주세요.'),
  address1: z.string().min(1, '주소를 입력해주세요.'),
  address2: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [isLoggedIn, router]);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const res = await api.get<Address[]>('/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: AddressForm) => {
    const res = await api.post<Address>('/addresses', data);
    if (res.success) {
      reset();
      setShowForm(false);
      fetchAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await api.del(`/addresses/${id}`);
    if (res.success) {
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await api.put(`/addresses/${id}/default`);
    if (res.success) {
      fetchAddresses();
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <nav className="mb-4 flex items-center gap-2 text-sm text-sub">
          <Link href="/mypage" className="hover:text-coffee transition-colors">
            마이페이지
          </Link>
          <span>/</span>
          <span className="text-coffee">배송지 관리</span>
        </nav>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-coffee">배송지 관리</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" />
            새 배송지
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-coffee">새 배송지 추가</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="이름" error={errors.name?.message} {...register('name')} />
                <Input label="연락처" type="tel" error={errors.phone?.message} {...register('phone')} />
                <Input label="우편번호" error={errors.zipCode?.message} {...register('zipCode')} />
                <div className="sm:col-span-2">
                  <Input label="주소" error={errors.address1?.message} {...register('address1')} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="상세주소 (선택)" error={errors.address2?.message} {...register('address2')} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-coffee">
                <input type="checkbox" {...register('isDefault')} className="rounded" />
                기본 배송지로 설정
              </label>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={isSubmitting}>저장</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setShowForm(false); }}>취소</Button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="text-coffee" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sub">
            <MapPin className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">저장된 배송지가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={cn(
                  'rounded-xl border bg-white p-5',
                  addr.isDefault ? 'border-accent' : 'border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-coffee">{addr.name}</p>
                      {addr.isDefault && (
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          기본
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-sub">{addr.phone}</p>
                    <p className="mt-1 text-sm text-coffee-light">
                      ({addr.zipCode}) {addr.address1}
                      {addr.address2 && ` ${addr.address2}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="rounded-md p-1.5 text-sub hover:text-accent transition-colors"
                        title="기본 배송지로 설정"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="rounded-md p-1.5 text-sub hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
