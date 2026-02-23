import React from 'react';
import Link from 'next/link';

const BANNERS = [
  {
    id: 1,
    title: '신규회원 혜택',
    subtitle: '가입 즉시 3,000원 쿠폰 지급',
    bgClass: 'bg-accent/10',
    textClass: 'text-coffee',
    subClass: 'text-sub',
    href: '/register',
  },
  {
    id: 2,
    title: '무료배송',
    subtitle: '3만원 이상 구매시 무료배송',
    bgClass: 'bg-coffee-dark',
    textClass: 'text-cream',
    subClass: 'text-cream/70',
    href: '/products',
  },
  {
    id: 3,
    title: '오늘의 특가',
    subtitle: '매일 새로운 커피 할인',
    bgClass: 'bg-cream-warm',
    textClass: 'text-coffee',
    subClass: 'text-sub',
    href: '/products?tag=event',
  },
  {
    id: 4,
    title: '선물 추천',
    subtitle: '소중한 분께 커피 선물을',
    bgClass: 'bg-accent',
    textClass: 'text-white',
    subClass: 'text-white/70',
    href: '/products?category=gifts',
  },
];

export function PromoBanners() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`group rounded-xl p-6 transition-transform hover:scale-[1.02] md:p-8 ${banner.bgClass}`}
            >
              <h3 className={`text-base font-bold md:text-lg ${banner.textClass}`}>
                {banner.title}
              </h3>
              <p className={`mt-1 text-xs md:text-sm ${banner.subClass}`}>
                {banner.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
