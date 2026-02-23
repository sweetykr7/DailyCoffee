'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Order } from '@/types';

export default function OrderCompletePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    async function fetchOrder() {
      try {
        const res = await api.get<Order>(`/orders/${params.id}`);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id, isLoggedIn, router]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" className="text-coffee" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-coffee">주문을 찾을 수 없습니다</p>
        <Link href="/mypage/orders">
          <Button variant="outline" className="mt-4">
            주문 내역 보기
          </Button>
        </Link>
      </div>
    );
  }

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: '결제 대기', color: 'text-yellow-600' },
    PAID: { label: '결제 완료', color: 'text-green-600' },
    PREPARING: { label: '상품 준비중', color: 'text-blue-600' },
    SHIPPED: { label: '배송중', color: 'text-blue-600' },
    DELIVERED: { label: '배송 완료', color: 'text-green-600' },
    CANCELLED: { label: '주문 취소', color: 'text-red-600' },
    REFUNDED: { label: '환불 완료', color: 'text-gray-600' },
  };

  const status = STATUS_MAP[order.status] || { label: order.status, color: 'text-sub' };

  return (
    <div className="py-12">
      <div className="container-custom max-w-2xl">
        {/* Success header */}
        <div className="mb-8 text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h1 className="font-display text-3xl font-bold text-coffee">주문이 완료되었습니다!</h1>
          <p className="mt-2 text-sub">주문해주셔서 감사합니다.</p>
        </div>

        {/* Order info */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-sub">주문번호</p>
              <p className="font-mono text-sm font-medium text-coffee">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-sub">주문일시</p>
              <p className="text-sm text-coffee">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-cream-warm p-4">
            <Package size={20} className="text-accent" />
            <div>
              <p className="text-sm text-sub">주문 상태</p>
              <p className={`font-semibold ${status.color}`}>{status.label}</p>
            </div>
          </div>

          {/* Items */}
          <h3 className="mb-3 text-sm font-semibold text-coffee">주문 상품</h3>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-warm">
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-coffee">
                    {item.product?.name || '상품'}
                  </p>
                  <p className="text-xs text-sub">수량: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-coffee">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-coffee">
              <Truck size={16} className="text-accent" />
              배송지
            </h3>
            <div className="text-sm text-coffee-light">
              <p>{order.shippingAddress.name} / {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address1} {order.shippingAddress.address2 || ''}</p>
              <p>({order.shippingAddress.zipCode})</p>
            </div>
          </div>

          {/* Payment summary */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-sub">상품 금액</span>
                <span className="text-coffee">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sub">쿠폰 할인</span>
                  <span className="text-red-500">-{formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              {order.pointDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sub">포인트 사용</span>
                  <span className="text-red-500">-{formatPrice(order.pointDiscount)}</span>
                </div>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-coffee">총 결제 금액</span>
                <span className="font-bold text-accent">
                  {formatPrice(order.totalAmount - order.couponDiscount - order.pointDiscount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Link href="/mypage/orders" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              주문 내역 보기
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
