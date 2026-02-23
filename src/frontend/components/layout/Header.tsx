'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MobileMenu } from './MobileMenu';

const NAV_LINKS = [
  { href: '/products', label: '전체상품' },
  { href: '/products?category=coffee-beans', label: '원두커피' },
  { href: '/products?category=stick-coffee', label: '스틱커피' },
  { href: '/products?category=capsule', label: '캡슐커피' },
  { href: '/products?category=gift', label: '선물하기' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, user } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-cream'
        )}
      >
        {/* Top bar */}
        <div className="border-b border-gray-100">
          <div className="container-custom flex items-center justify-end gap-4 py-2 text-xs text-coffee-light">
            {isLoggedIn ? (
              <>
                <span className="hidden sm:inline">{user?.name}님 환영합니다</span>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="rounded bg-coffee px-2 py-0.5 text-white hover:bg-coffee/80 transition-colors font-medium"
                  >
                    관리자
                  </Link>
                )}
                <Link href="/mypage" className="hover:text-coffee transition-colors">마이페이지</Link>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="hover:text-coffee transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-coffee transition-colors">로그인</Link>
                <Link href="/register" className="hover:text-coffee transition-colors">회원가입</Link>
              </>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center rounded-md p-2 text-coffee lg:hidden hover:bg-cream-warm transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="font-display text-xl font-bold tracking-wider text-coffee lg:text-2xl">
                DAILY COFFEE
              </h1>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="hidden rounded-md p-2 text-coffee hover:text-accent transition-colors sm:flex"
              >
                <Search size={20} />
              </Link>

              <Link
                href={isLoggedIn ? '/mypage' : '/login'}
                className="hidden rounded-md p-2 text-coffee hover:text-accent transition-colors sm:flex"
              >
                <User size={20} />
              </Link>

              <Link
                href="/cart"
                className="relative rounded-md p-2 text-coffee hover:text-accent transition-colors"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden border-t border-gray-100 lg:block">
          <div className="container-custom">
            <ul className="flex items-center justify-center gap-8 py-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-coffee hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
