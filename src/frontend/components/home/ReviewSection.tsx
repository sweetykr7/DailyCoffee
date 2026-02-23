'use client';

import React from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewSectionProps {
  reviews: Review[];
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream-warm py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-coffee md:text-3xl">리얼리뷰</h2>
          <p className="mt-1 text-sm text-sub">실제 구매 고객님들의 솔직한 리뷰</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} size={14} />
                <span className="text-xs text-sub">{formatDate(review.createdAt)}</span>
              </div>

              {review.product && (
                <p className="mt-2 text-xs font-medium text-accent">{review.product.name}</p>
              )}

              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-coffee">
                {review.content}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="h-16 w-16 overflow-hidden rounded-md bg-cream"
                    >
                      <img
                        src={img}
                        alt={`리뷰 이미지 ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-sub">
                <span>{review.user?.name || '고객'}</span>
                <span>좋아요 {review.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
