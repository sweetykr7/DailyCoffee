'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: '커피원두', href: '/products?category=coffee-beans' },
  { label: '스틱커피', href: '/products?category=stick-coffee' },
  { label: '홈카페', href: '/products?category=home-cafe' },
  { label: '에스프레소', href: '/products?category=espresso' },
  { label: '선물하기', href: '/products?category=gift' },
  { label: '원산지정보', href: '/products?category=origin-info' },
];

export function Header() {
  const { isLoggedIn, user } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white transition-shadow duration-200',
        scrolled && 'shadow-md'
      )}
    >
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="container-custom flex items-center justify-end gap-4 py-2 text-xs text-coffee-light">
          {isLoggedIn ? (
            <>
              <span className="hidden sm:inline">{user?.name}님 환영합니다</span>
              <Link href="/mypage" className="hover:text-coffee transition-colors">
                마이페이지
              </Link>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="hover:text-coffee transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-coffee transition-colors">
                로그인
              </Link>
              <Link href="/register" className="hover:text-coffee transition-colors">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom flex items-center justify-between py-4">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="font-display text-2xl font-bold tracking-wider text-coffee">
            DAILY COFFEE
          </h1>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link href="/products" className="p-2 text-coffee hover:text-accent transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/cart" className="relative p-2 text-coffee hover:text-accent transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <Link
            href={isLoggedIn ? '/mypage' : '/login'}
            className="hidden sm:block p-2 text-coffee hover:text-accent transition-colors"
          >
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="container-custom">
          <ul className="flex items-center justify-center gap-8 py-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-coffee hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-100 bg-white">
          <ul className="container-custom divide-y divide-gray-50">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3 text-sm font-medium text-coffee hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
