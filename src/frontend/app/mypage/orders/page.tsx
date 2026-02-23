'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { Order } from '@/types';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'new' | 'best' | 'sale' | 'soldout' }> = {
  PENDING: { label: '결제 대기', variant: 'default' },
  PAID: { label: '결제 완료', variant: 'new' },
  PREPARING: { label: '상품 준비중', variant: 'best' },
  SHIPPED: { label: '배송중', variant: 'best' },
  DELIVERED: { label: '배송 완료', variant: 'new' },
  CANCELLED: { label: '주문 취소', variant: 'sale' },
  REFUNDED: { label: '환불 완료', variant: 'soldout' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<Order[]>('/orders');
        if (res.success && res.data) {
          setOrders(Array.isArray(res.data) ? res.data : []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-coffee" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-coffee">주문 내역</h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <Package size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-coffee">주문 내역이 없습니다</p>
          <p className="mt-1 text-sm text-sub">첫 주문을 해보세요!</p>
          <Link
            href="/products"
            className="mt-4 text-sm font-medium text-accent hover:underline"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, variant: 'default' as const };
            const firstItem = order.items[0];
            const itemCount = order.items.length;

            return (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-sub">{order.id.slice(0, 8)}...</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-coffee">
                      {firstItem?.product?.name || '상품'}
                      {itemCount > 1 && ` 외 ${itemCount - 1}건`}
                    </p>
                    <p className="mt-1 text-xs text-sub">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-accent">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <ChevronRight size={16} className="text-sub" />
                  </div>
                </div>

                {/* Item thumbnails */}
                {order.items.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-warm"
                      >
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream-warm text-xs text-sub">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
