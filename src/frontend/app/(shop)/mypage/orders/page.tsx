'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Order } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '결제 대기', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: '결제 완료', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: '상품 준비중', color: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: '배송중', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: '배송 완료', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '주문 취소', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: '환불 완료', color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await api.get<Order[]>('/orders', {
          page: String(page),
          limit: '10',
        });
        if (res.success && res.data) {
          setOrders(res.data);
          if (res.meta) {
            setTotalPages(res.meta.totalPages);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isLoggedIn, page, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-sub">
          <Link href="/mypage" className="hover:text-coffee transition-colors">
            마이페이지
          </Link>
          <span>/</span>
          <span className="text-coffee">주문 내역</span>
        </nav>

        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">주문 내역</h1>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" className="text-coffee" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-sub">
            <Package className="mb-4 h-16 w-16 opacity-30" />
            <p className="text-lg font-medium">주문 내역이 없습니다</p>
            <p className="mt-1 text-sm">첫 주문을 시작해보세요!</p>
            <Link href="/products">
              <Button variant="outline" className="mt-6">
                쇼핑하러 가기
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                const firstItem = order.items[0];
                const itemCount = order.items.length;

                return (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                        <span className="text-xs text-sub">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-sub" />
                    </div>

                    {/* Items preview */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-warm">
                        {firstItem?.product?.images?.[0] && (
                          <img
                            src={firstItem.product.images[0].url}
                            alt={firstItem.product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-coffee">
                          {firstItem?.product?.name || '상품'}
                          {itemCount > 1 && (
                            <span className="text-sub"> 외 {itemCount - 1}건</span>
                          )}
                        </p>
                        <p className="text-sm font-bold text-accent">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
