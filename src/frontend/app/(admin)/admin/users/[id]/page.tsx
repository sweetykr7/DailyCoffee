'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft } from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: { orders: number; reviews: number };
  orders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: { id: string; quantity: number; product: { id: string; name: string } }[];
  }[];
}

const statusLabels: Record<string, string> = {
  PENDING: '대기',
  PAID: '결제완료',
  PREPARING: '준비중',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
  REFUNDED: '환불',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<UserDetail>(`/admin/users/${id}`);
        if (res.success && res.data) setUser(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <p className="text-sub">사용자를 찾을 수 없습니다.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-sub hover:text-coffee">
        <ArrowLeft size={16} /> 뒤로가기
      </button>

      {/* User info */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-coffee">사용자 정보</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-sub">이름:</span>{' '}
            <span className="text-coffee font-medium">{user.name}</span>
          </div>
          <div>
            <span className="text-sub">이메일:</span>{' '}
            <span className="text-coffee">{user.email}</span>
          </div>
          <div>
            <span className="text-sub">전화번호:</span>{' '}
            <span className="text-coffee">{user.phone || '-'}</span>
          </div>
          <div>
            <span className="text-sub">역할:</span>{' '}
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {user.role}
            </span>
          </div>
          <div>
            <span className="text-sub">가입일:</span>{' '}
            <span className="text-coffee">{formatDate(user.createdAt)}</span>
          </div>
          <div>
            <span className="text-sub">총 주문:</span>{' '}
            <span className="text-coffee">{user._count.orders}건</span>
            <span className="ml-3 text-sub">리뷰:</span>{' '}
            <span className="text-coffee">{user._count.reviews}건</span>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-coffee">주문 내역</h3>
        {user.orders.length === 0 ? (
          <p className="text-sm text-sub">주문 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-sub">
                  <th className="px-4 py-3 font-medium">주문번호</th>
                  <th className="px-4 py-3 font-medium">상품</th>
                  <th className="px-4 py-3 font-medium">금액</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">날짜</th>
                </tr>
              </thead>
              <tbody>
                {user.orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-accent hover:underline">
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-coffee">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                    </td>
                    <td className="px-4 py-3 font-medium text-coffee">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sub">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
