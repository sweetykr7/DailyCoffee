'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  MapPin,
  User,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Heart,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';

const MENU_ITEMS = [
  {
    href: '/mypage/orders',
    icon: Package,
    label: '주문 내역',
    description: '주문 및 배송 상태 확인',
  },
  {
    href: '/mypage/addresses',
    icon: MapPin,
    label: '배송지 관리',
    description: '배송지 추가 및 관리',
  },
  {
    href: '/mypage/reviews',
    icon: Star,
    label: '내 리뷰',
    description: '작성한 리뷰 관리',
  },
];

export default function MyPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchMe();
  }, [isLoggedIn, router, fetchMe]);

  if (!isLoggedIn || !user) return null;

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">마이페이지</h1>

        {/* User info card */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-coffee to-coffee-light p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user.name}님</h2>
              <p className="text-sm text-white/70">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-white/70">{user.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Link
            href="/mypage/orders"
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <ShoppingBag className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium text-coffee">주문내역</span>
          </Link>
          <Link
            href="/cart"
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Heart className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium text-coffee">장바구니</span>
          </Link>
          <Link
            href="/mypage/reviews"
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Star className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium text-coffee">리뷰관리</span>
          </Link>
        </div>

        {/* Menu items */}
        <div className="space-y-3">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-warm">
                  <item.icon className="h-5 w-5 text-coffee" />
                </div>
                <div>
                  <p className="text-sm font-medium text-coffee">{item.label}</p>
                  <p className="text-xs text-sub">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-sub" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full text-sub hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
