'use client';

import Link from 'next/link';
import { Coffee, Package, Gift, Droplets, Home } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'coffee-beans': <Coffee className="h-6 w-6" />,
  'stick-coffee': <Droplets className="h-6 w-6" />,
  'drip-bag': <Package className="h-6 w-6" />,
  'home-cafe': <Home className="h-6 w-6" />,
  'gift': <Gift className="h-6 w-6" />,
};

export function CategoryTabs({ categories }: CategoryTabsProps) {
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="group flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-warm text-coffee-light transition-colors group-hover:bg-accent group-hover:text-white">
                {CATEGORY_ICONS[cat.slug] || <Coffee className="h-6 w-6" />}
              </div>
              <span className="text-sm font-medium text-coffee">{cat.name}</span>
              {cat._count && (
                <span className="text-xs text-sub">{cat._count.products}개 상품</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
