import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}

export function ProductSection({ title, subtitle, products, href }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-coffee">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-sub">{subtitle}</p>
            )}
          </div>
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 text-sm font-medium text-coffee-light hover:text-accent transition-colors"
            >
              전체보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
