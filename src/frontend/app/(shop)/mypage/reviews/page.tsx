'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner } from '@/components/ui/Spinner';

export default function ReviewsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    async function fetchReviews() {
      try {
        const res = await api.get<Review[]>('/reviews', { limit: '50' });
        if (res.success && res.data) {
          setReviews(Array.isArray(res.data) ? res.data : []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <nav className="mb-4 flex items-center gap-2 text-sm text-sub">
          <Link href="/mypage" className="hover:text-coffee transition-colors">
            마이페이지
          </Link>
          <span>/</span>
          <span className="text-coffee">내 리뷰</span>
        </nav>

        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">내 리뷰</h1>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner className="text-coffee" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sub">
            <Star className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">작성한 리뷰가 없습니다</p>
            <p className="mt-1 text-sm">구매한 상품에 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    {review.product && (
                      <Link
                        href={`/products/${review.productId}`}
                        className="text-sm font-medium text-coffee hover:text-accent transition-colors"
                      >
                        {review.product.name}
                      </Link>
                    )}
                    <p className="text-xs text-sub">{formatDate(review.createdAt)}</p>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-coffee-light">
                  {review.content}
                </p>
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="h-16 w-16 overflow-hidden rounded-lg">
                        <img src={img} alt={`리뷰 이미지 ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
