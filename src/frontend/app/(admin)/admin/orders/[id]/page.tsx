'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  couponDiscount: number;
  pointDiscount: number;
  paymentMethod: string | null;
  shippingAddress: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2?: string;
  };
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images?: { url: string }[];
    };
  }[];
}

const statusOptions = [
  { value: 'PENDING', label: '대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CANCELLED', label: '취소' },
  { value: 'REFUNDED', label: '환불' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get<OrderDetail>(`/admin/orders/${id}`);
        if (res.success && res.data) setOrder(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || order.status === newStatus) return;
    setUpdating(true);
    try {
      const res = await api.put<OrderDetail>(`/admin/orders/${id}/status`, { status: newStatus });
      if (res.success && res.data) {
        setOrder((prev) => prev ? { ...prev, status: res.data!.status } : prev);
      }
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) return <p className="text-sub">주문을 찾을 수 없습니다.</p>;

  const addr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-sub hover:text-coffee">
        <ArrowLeft size={16} /> 뒤로가기
      </button>

      {/* Order info */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-coffee">주문 #{order.id.slice(0, 8)}</h2>
            <p className="text-sm text-sub">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
              {statusOptions.find((s) => s.value === order.status)?.label || order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="rounded-md border border-gray-300 bg-cream-warm px-3 py-1.5 text-sm text-coffee"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-coffee">주문자 정보</h3>
            <p className="text-sm text-coffee">{order.user.name}</p>
            <p className="text-sm text-sub">{order.user.email}</p>
            {order.user.phone && <p className="text-sm text-sub">{order.user.phone}</p>}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-coffee">배송지</h3>
            <p className="text-sm text-coffee">{addr.name} ({addr.phone})</p>
            <p className="text-sm text-sub">[{addr.zipCode}] {addr.address1}</p>
            {addr.address2 && <p className="text-sm text-sub">{addr.address2}</p>}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-coffee">주문 상품</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-100 p-3">
              {item.product.images && item.product.images.length > 0 ? (
                <img src={item.product.images[0].url} alt={item.product.name} className="h-14 w-14 rounded object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-xs text-sub">N/A</div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-coffee">{item.product.name}</p>
                <p className="text-xs text-sub">수량: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-coffee">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-sub">
              <span>쿠폰 할인</span>
              <span>-{formatPrice(order.couponDiscount)}</span>
            </div>
          )}
          {order.pointDiscount > 0 && (
            <div className="flex justify-between text-sub">
              <span>포인트 할인</span>
              <span>-{formatPrice(order.pointDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-coffee">
            <span>총 결제금액</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
