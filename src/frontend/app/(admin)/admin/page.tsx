'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailySale {
  date: string;
  amount: number;
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  newUsersThisMonth: number;
  totalProducts: number;
  dailySales: DailySale[];
  recentOrders: RecentOrder[];
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<StatsData>('/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return <p className="text-sub">통계를 불러올 수 없습니다.</p>;

  const cards = [
    { label: '총 매출', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: '총 주문수', value: `${stats.totalOrders}건`, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: '신규 회원 (이번달)', value: `${stats.newUsersThisMonth}명`, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: '상품수', value: `${stats.totalProducts}개`, icon: Package, color: 'text-accent bg-orange-50' },
  ];

  const chartData = stats.dailySales.map((s) => ({
    date: s.date.slice(5), // MM-DD
    매출: s.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sub">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-coffee">{card.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily sales chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-coffee">최근 7일 매출</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}만`} />
              <Tooltip
                formatter={(value) => [formatPrice(Number(value)), '매출']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="매출" fill="#c4924a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-coffee">최근 주문</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            전체보기
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-sub">
                <th className="px-4 py-3 font-medium">주문번호</th>
                <th className="px-4 py-3 font-medium">주문자</th>
                <th className="px-4 py-3 font-medium">금액</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">날짜</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-accent hover:underline">
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-coffee">{order.user.name}</td>
                  <td className="px-4 py-3 font-medium text-coffee">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sub">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sub">
                    주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
