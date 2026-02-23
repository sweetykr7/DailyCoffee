'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SLIDES = [
  {
    id: 1,
    title: '매일 신선한 원두',
    subtitle: '산지에서 직접 로스팅한 프리미엄 커피',
    cta: '원두 보러가기',
    href: '/products?category=coffee-beans',
    bg: 'from-coffee-dark to-coffee',
  },
  {
    id: 2,
    title: '간편한 스틱커피',
    subtitle: '언제 어디서나 프리미엄 커피 한 잔',
    cta: '스틱커피 보기',
    href: '/products?category=stick-coffee',
    bg: 'from-coffee to-coffee-light',
  },
  {
    id: 3,
    title: '홈카페 시작하기',
    subtitle: '집에서 즐기는 바리스타 커피',
    cta: '홈카페 용품',
    href: '/products?category=home-cafe',
    bg: 'from-accent-dark to-accent',
  },
];

export function HeroSlider() {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-[400px] sm:h-[480px] lg:h-[560px]"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`flex h-full w-full items-center bg-gradient-to-r ${slide.bg}`}
            >
              <div className="container-custom">
                <div className="max-w-lg text-white">
                  <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/70">
                    DAILY COFFEE
                  </p>
                  <h2 className="mb-4 font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="mb-8 text-lg text-white/80">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.href}
                    className="inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-coffee transition-colors hover:bg-cream-warm"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
