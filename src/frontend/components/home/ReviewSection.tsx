'use client';

import { StarRating } from '@/components/ui/StarRating';
import type { Review } from '@/types';

interface ReviewSectionProps {
  reviews: Review[];
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream-warm py-12">
      <div className="container-custom">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-coffee">
          고객 리뷰
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-coffee">
                    {review.user?.name || '고객'}
                  </p>
                  {review.product && (
                    <p className="text-xs text-sub">{review.product.name}</p>
                  )}
                </div>
                <StarRating rating={review.rating} size={14} />
              </div>
              <p className="text-sm leading-relaxed text-coffee-light line-clamp-3">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
