'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  { href: '/mypage', label: '내 정보', icon: User },
  { href: '/mypage/orders', label: '주문 내역', icon: Package },
];

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container-custom">
          <h1 className="mb-8 font-display text-3xl font-bold text-coffee">마이페이지</h1>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <nav className="space-y-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-coffee text-white'
                          : 'text-coffee hover:bg-cream-warm'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sub hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
