'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bgClass: string;
  textClass: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: '2월 특별 이벤트',
    subtitle: '발렌타인데이 맞이\n커피 선물세트 최대 30% 할인',
    cta: '이벤트 보기',
    href: '/products?tag=event',
    bgClass: 'bg-cream-warm',
    textClass: 'text-coffee',
  },
  {
    id: 2,
    title: '신규 스페셜티 원두',
    subtitle: '에티오피아 예가체프 G1\n싱글 오리진의 깊은 풍미',
    cta: '상품 보기',
    href: '/products?tag=new',
    bgClass: 'bg-coffee-dark',
    textClass: 'text-cream',
  },
  {
    id: 3,
    title: '스틱커피 특가',
    subtitle: '바쁜 아침에도 간편하게\n프리미엄 스틱커피 1+1',
    cta: '바로가기',
    href: '/products?category=stick-coffee',
    bgClass: 'bg-[#e8ddd0]',
    textClass: 'text-coffee',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  const goTo = (index: number) => {
    stopAutoplay();
    setCurrent(index);
    startAutoplay();
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section className="relative overflow-hidden">
      <div
        className={cn(
          'flex min-h-[400px] items-center transition-colors duration-700 sm:min-h-[480px] lg:min-h-[560px]',
          slide.bgClass
        )}
      >
        <div className="container-custom relative z-10 py-16">
          <div className="max-w-lg">
            <p className="mb-2 font-display text-sm font-medium uppercase tracking-widest text-accent">
              DAILY COFFEE
            </p>
            <h2
              className={cn(
                'font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl',
                slide.textClass
              )}
            >
              {slide.title}
            </h2>
            <p
              className={cn(
                'mt-4 whitespace-pre-line text-base md:text-lg',
                slide.textClass === 'text-cream' ? 'text-cream/70' : 'text-sub'
              )}
            >
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-6 inline-block rounded-md bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-coffee shadow-md hover:bg-white transition-colors"
        aria-label="이전"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-coffee shadow-md hover:bg-white transition-colors"
        aria-label="다음"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              current === i ? 'w-6 bg-accent' : 'w-2 bg-coffee/30'
            )}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
