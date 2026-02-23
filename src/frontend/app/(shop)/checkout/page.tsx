'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Address, Order } from '@/types';

const shippingSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요.'),
  zipCode: z.string().min(5, '우편번호를 입력해주세요.'),
  address1: z.string().min(1, '주소를 입력해주세요.'),
  address2: z.string().optional(),
});

type ShippingForm = z.infer<typeof shippingSchema>;

const PAYMENT_METHODS = [
  { value: 'card', label: '신용/체크카드' },
  { value: 'bank', label: '무통장입금' },
  { value: 'kakao', label: '카카오페이' },
  { value: 'naver', label: '네이버페이' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalAmount, fetchCart } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchCart();

    // Fetch saved addresses
    async function fetchAddresses() {
      const res = await api.get<Address[]>('/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
        // Prefill with default address
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setValue('name', defaultAddr.name);
          setValue('phone', defaultAddr.phone);
          setValue('zipCode', defaultAddr.zipCode);
          setValue('address1', defaultAddr.address1);
          setValue('address2', defaultAddr.address2 || '');
        }
      }
    }
    fetchAddresses();
  }, [isLoggedIn, router, fetchCart, setValue]);

  if (!isLoggedIn) return null;

  const items = cart?.items || [];
  const SHIPPING_THRESHOLD = 30000;
  const SHIPPING_FEE = totalAmount >= SHIPPING_THRESHOLD ? 0 : 3000;
  const grandTotal = totalAmount + SHIPPING_FEE;

  if (items.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-sub">
        <p className="text-lg font-medium">장바구니가 비어있습니다</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
          쇼핑하러 가기
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ShippingForm) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post<Order>('/orders', {
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          zipCode: data.zipCode,
          address1: data.address1,
          address2: data.address2 || undefined,
        },
        paymentMethod,
      });

      if (res.success && res.data) {
        router.push(`/order/${res.data.id}`);
      } else {
        setError(res.error || '주문에 실패했습니다.');
      }
    } catch {
      setError('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectAddress = (addr: Address) => {
    setValue('name', addr.name);
    setValue('phone', addr.phone);
    setValue('zipCode', addr.zipCode);
    setValue('address1', addr.address1);
    setValue('address2', addr.address2 || '');
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">주문/결제</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Shipping + Payment */}
            <div className="space-y-8 lg:col-span-2">
              {/* Shipping address */}
              <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-coffee">배송 정보</h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-sub">저장된 배송지</p>
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => selectAddress(addr)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-coffee hover:border-coffee transition-colors"
                        >
                          {addr.name} ({addr.address1})
                          {addr.isDefault && (
                            <span className="ml-1 text-accent">기본</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="받는 분"
                    placeholder="이름"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="연락처"
                    type="tel"
                    placeholder="010-0000-0000"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="우편번호"
                    placeholder="12345"
                    error={errors.zipCode?.message}
                    {...register('zipCode')}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="주소"
                      placeholder="기본 주소"
                      error={errors.address1?.message}
                      {...register('address1')}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="상세 주소 (선택)"
                      placeholder="상세 주소"
                      error={errors.address2?.message}
                      {...register('address2')}
                    />
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-coffee">결제 수단</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                        paymentMethod === method.value
                          ? 'border-coffee bg-coffee text-white'
                          : 'border-gray-300 text-coffee hover:border-coffee'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Order items */}
              <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-coffee">주문 상품</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const effectivePrice =
                      item.product.discountPrice && item.product.discountPrice < item.product.price
                        ? item.product.discountPrice
                        : item.product.price;

                    return (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-cream-warm">
                            {item.product.images?.[0] && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-coffee">{item.product.name}</p>
                            <p className="text-xs text-sub">수량: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-coffee">
                          {formatPrice(effectivePrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-coffee">결제 금액</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sub">상품 금액</span>
                    <span className="text-coffee">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sub">배송비</span>
                    <span className="text-coffee">
                      {SHIPPING_FEE === 0 ? '무료' : formatPrice(SHIPPING_FEE)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-coffee">총 결제 금액</span>
                      <span className="text-xl font-bold text-accent">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  isLoading={submitting}
                >
                  {formatPrice(grandTotal)} 결제하기
                </Button>

                <p className="mt-3 text-center text-xs text-sub">
                  주문 내용을 확인하였으며, 결제에 동의합니다.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
