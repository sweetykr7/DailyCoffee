'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { href: '/products', label: '전체상품' },
  { href: '/products?category=beans-200', label: '원두 200g' },
  { href: '/products?category=beans-400', label: '원두 400g' },
  { href: '/products?category=beans-1kg', label: '원두 1kg' },
  { href: '/products?category=ground', label: '분쇄원두' },
  { href: '/products?category=capsule', label: '캡슐커피' },
  { href: '/products?category=stick-coffee', label: '스틱커피' },
  { href: '/products?category=package', label: '패키지' },
  { href: '/products?category=gifts', label: '선물하기' },
  { href: '/products?category=goods', label: '굿즈' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isLoggedIn, user, logout } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-cream-warm px-4">
          <span className="font-display text-lg font-semibold text-coffee">DAILY COFFEE</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-sub hover:bg-cream-warm transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {/* Auth section */}
          <div className="mb-4 border-b border-cream-warm pb-4">
            {isLoggedIn ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-coffee">{user?.name}님 환영합니다</p>
                <div className="flex gap-2">
                  <Link
                    href="/mypage"
                    onClick={onClose}
                    className="text-xs text-sub hover:text-accent"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="text-xs text-sub hover:text-accent"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex-1 rounded-md bg-coffee py-2 text-center text-sm font-medium text-white"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-coffee py-2 text-center text-sm font-medium text-coffee"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {MENU_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-coffee hover:bg-cream-warm transition-colors"
              >
                {link.label}
                <ChevronRight size={16} className="text-sub" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
