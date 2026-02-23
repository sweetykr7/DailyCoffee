'use client';

import React from 'react';
import Link from 'next/link';
import { cn, formatPrice, getDiscountPercent } from '@/lib/utils';
import { Badge } from './Badge';
import { StarRating } from './StarRating';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOutOfStock = product.stock <= 0;
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn('group block', className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-warm">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sub">
            <svg className="h-16 w-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-6a2 2 0 00-2-2zm-9 14c-2.79 0-5-2.24-5-5V5h12v7c0 2.79-2.24 5.01-5 5.01L9.5 17zM20 6h2v8h-2V6z" />
            </svg>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOutOfStock && <Badge variant="soldout">품절</Badge>}
          {!isOutOfStock && hasDiscount && (
            <Badge variant="sale">-{getDiscountPercent(product.price, product.discountPrice!)}%</Badge>
          )}
          {product.tags?.includes('new') && <Badge variant="new">NEW</Badge>}
          {product.tags?.includes('best') && <Badge variant="best">BEST</Badge>}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {product.category && (
          <p className="text-xs text-sub">{product.category.name}</p>
        )}
        <h3 className="text-sm font-medium text-coffee line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-accent">
                {formatPrice(product.discountPrice!)}
              </span>
              <span className="text-xs text-sub line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-coffee">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {avgRating > 0 && product.reviews && (
          <div className="flex items-center gap-1">
            <StarRating rating={avgRating} size={12} />
            <span className="text-xs text-sub">({product.reviews.length})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
