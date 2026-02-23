'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Order } from '@/types';

const SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE = 3000;

const shippingSchema = z.object({
  name: z.string().min(2, '수령인 이름을 입력해주세요.'),
  phone: z.string().min(10, '연락처를 입력해주세요.'),
  zipCode: z.string().min(5, '우편번호를 입력해주세요.'),
  address1: z.string().min(1, '주소를 입력해주세요.'),
  address2: z.string().optional(),
});

type ShippingForm = z.infer<typeof shippingSchema>;

type PaymentMethod = 'card' | 'bank' | 'kakao';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'card', label: '신용/체크카드', icon: <CreditCard size={18} /> },
  { value: 'bank', label: '무통장입금', icon: <ShieldCheck size={18} /> },
  { value: 'kakao', label: '카카오페이', icon: <CreditCard size={18} /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { cart, totalAmount, fetchCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isLoggedIn, fetchCart, router]);

  if (!isLoggedIn) return null;

  const items = cart?.items || [];
  const shipping = totalAmount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = totalAmount + shipping;

  if (items.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-coffee">장바구니가 비어있습니다</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
          쇼핑하러 가기
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ShippingForm) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<Order>('/orders', {
        shippingAddress: data,
        paymentMethod,
      });

      if (res.success && res.data) {
        router.push(`/order/${res.data.id}`);
      } else {
        setError(res.error || '주문 처리에 실패했습니다.');
      }
    } catch {
      setError('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">주문/결제</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left - Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Shipping address */}
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-coffee">
                  <Truck size={20} className="text-accent" />
                  배송 정보
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="수령인"
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
                      placeholder="서울시 중구..."
                      error={errors.address1?.message}
                      {...register('address1')}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="상세주소 (선택)"
                      placeholder="아파트, 동/호수"
                      error={errors.address2?.message}
                      {...register('address2')}
                    />
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-coffee">
                  <CreditCard size={20} className="text-accent" />
                  결제 수단
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                        paymentMethod === method.value
                          ? 'border-coffee bg-coffee/5 text-coffee'
                          : 'border-gray-200 text-sub hover:border-gray-300'
                      )}
                    >
                      {method.icon}
                      {method.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-4 rounded-lg bg-cream-warm p-4 text-sm text-coffee-light">
                    <p className="font-medium text-coffee">입금 계좌 안내</p>
                    <p className="mt-1">국민은행 123-456-789012 (주)데일리커피</p>
                    <p className="mt-1 text-xs text-sub">주문 후 24시간 내 입금해주세요.</p>
                  </div>
                )}
              </section>

              {/* Order items preview */}
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-coffee">주문 상품</h2>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div key={item.id} className="flex items-center gap-4 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-warm">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-coffee line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-sub">수량: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-coffee">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-coffee">결제 금액</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sub">상품 금액</span>
                    <span className="text-coffee">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sub">배송비</span>
                    <span className="text-coffee">
                      {shipping === 0 ? '무료' : formatPrice(shipping)}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-coffee">총 결제 금액</span>
                    <span className="text-xl font-bold text-accent">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

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
