'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { label: '전체', slug: '' },
  { label: '원두 200g', slug: 'beans-200' },
  { label: '원두 400g', slug: 'beans-400' },
  { label: '원두 1kg', slug: 'beans-1kg' },
  { label: '분쇄원두', slug: 'ground' },
  { label: '캡슐커피', slug: 'capsule' },
  { label: '스틱커피', slug: 'stick-coffee' },
  { label: '패키지', slug: 'package' },
  { label: '선물하기', slug: 'gifts' },
  { label: '굿즈', slug: 'goods' },
];

export function CategoryTabs() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  };

  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="container-custom relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1 shadow-md text-coffee hover:bg-cream-warm transition-colors lg:hidden"
          aria-label="스크롤 왼쪽"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide lg:justify-center lg:gap-2"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug || 'all'}
              href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-coffee transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1 shadow-md text-coffee hover:bg-cream-warm transition-colors lg:hidden"
          aria-label="스크롤 오른쪽"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
