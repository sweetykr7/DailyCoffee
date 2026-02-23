'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Order } from '@/types';

const STATUS_MAP: Record<
  Order['status'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: { label: '결제 대기', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-5 w-5" /> },
  PAID: { label: '결제 완료', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-5 w-5" /> },
  PREPARING: { label: '상품 준비중', color: 'bg-blue-100 text-blue-700', icon: <Package className="h-5 w-5" /> },
  SHIPPED: { label: '배송중', color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="h-5 w-5" /> },
  DELIVERED: { label: '배송 완료', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-5 w-5" /> },
  CANCELLED: { label: '주문 취소', color: 'bg-red-100 text-red-700', icon: <Clock className="h-5 w-5" /> },
  REFUNDED: { label: '환불 완료', color: 'bg-gray-100 text-gray-700', icon: <Clock className="h-5 w-5" /> },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
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
  }, [isLoggedIn, params.id, router]);

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
      <div className="flex h-96 flex-col items-center justify-center text-sub">
        <p className="text-lg font-medium">주문을 찾을 수 없습니다</p>
        <Link href="/mypage/orders">
          <Button variant="outline" className="mt-4">
            주문 내역으로
          </Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[order.status];
  const SHIPPING_FEE = order.totalAmount >= 30000 ? 0 : 3000;

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-coffee">주문이 완료되었습니다</h1>
          <p className="mt-1 text-sm text-sub">주문번호: {order.id}</p>
        </div>

        {/* Order status */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${status.color}`}>
              {status.icon}
            </div>
            <div>
              <p className="font-semibold text-coffee">{status.label}</p>
              <p className="text-xs text-sub">주문일: {formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-coffee">주문 상품</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-warm">
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-coffee">{item.product?.name || '상품'}</p>
                  <p className="text-xs text-sub">수량: {item.quantity}</p>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <p className="text-xs text-sub">
                      {Object.entries(item.selectedOptions)
                        .map(([k, v]) => `${k === 'WEIGHT' ? '용량' : '분쇄도'}: ${v}`)
                        .join(' / ')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-coffee">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Shipping info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-coffee">배송 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-sub">받는 분</span>
                <span className="text-coffee">{order.shippingAddress.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sub">전화번호</span>
                <span className="text-coffee">{order.shippingAddress.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sub">주소</span>
                <span className="text-right text-coffee">
                  ({order.shippingAddress.zipCode}) {order.shippingAddress.address1}
                  {order.shippingAddress.address2 && ` ${order.shippingAddress.address2}`}
                </span>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-coffee">결제 정보</h2>
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
              <div className="flex justify-between">
                <span className="text-sub">배송비</span>
                <span className="text-coffee">
                  {SHIPPING_FEE === 0 ? '무료' : formatPrice(SHIPPING_FEE)}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-sub">결제 수단</span>
                  <span className="text-coffee">{order.paymentMethod}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-coffee">총 결제 금액</span>
                  <span className="text-lg font-bold text-accent">
                    {formatPrice(order.totalAmount - order.couponDiscount - order.pointDiscount + SHIPPING_FEE)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/mypage/orders">
            <Button variant="outline">주문 내역 보기</Button>
          </Link>
          <Link href="/products">
            <Button>쇼핑 계속하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
