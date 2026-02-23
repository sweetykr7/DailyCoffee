import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-coffee-dark text-cream/80">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1 lg:col-span-2">
            <h2 className="font-display text-xl font-bold tracking-wider text-white">
              DAILY COFFEE
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              매일 신선한 커피를 만나보세요.
              <br />
              프리미엄 원두커피, 스틱커피, 드립백, 홈카페용품 전문 온라인몰
            </p>
            <div className="mt-4 space-y-1 text-xs text-cream/50">
              <p>상호: 데일리커피 | 대표: 홍길동</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 제2024-서울강남-0001호</p>
              <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">고객센터</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <span className="text-lg font-bold text-white">02-1234-5678</span>
              </div>
              <p className="text-cream/60">
                평일 09:00 ~ 18:00
                <br />
                토/일/공휴일 휴무
              </p>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <span>hello@dailycoffee.kr</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-accent" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">쇼핑 안내</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  전체상품
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-accent transition-colors">
                  장바구니
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="hover:text-accent transition-colors">
                  마이페이지
                </Link>
              </li>
              <li>
                <Link href="/mypage/orders" className="hover:text-accent transition-colors">
                  주문조회
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          <p>&copy; 2024 데일리커피 DAILY COFFEE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
