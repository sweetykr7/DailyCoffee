'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  columns?: 2 | 4;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  columns = 4,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-coffee md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-sub">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
            >
              더보기 <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div
          className={
            columns === 4
              ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6'
              : 'grid grid-cols-2 gap-4 lg:gap-6'
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
