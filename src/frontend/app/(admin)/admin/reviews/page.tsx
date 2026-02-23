'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Trash2, Star, MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface AdminReview {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminReview[]>('/admin/reviews', {
        page: String(page),
        limit: '20',
      });
      if (res.success && res.data) {
        setReviews(res.data);
        if (res.meta) setTotalPages(res.meta.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;
    const res = await api.del(`/admin/reviews/${id}`);
    if (res.success) fetchReviews();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-sub">
                <th className="px-4 py-3 font-medium">상품명</th>
                <th className="px-4 py-3 font-medium">작성자</th>
                <th className="px-4 py-3 font-medium">별점</th>
                <th className="px-4 py-3 font-medium">내용</th>
                <th className="px-4 py-3 font-medium">날짜</th>
                <th className="px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-200 hover:bg-cream/50">
                  <td className="px-4 py-3 font-medium text-coffee">{review.product.name}</td>
                  <td className="px-4 py-3 text-sub">{review.user.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-coffee">
                    <p className="line-clamp-2">{review.content}</p>
                  </td>
                  <td className="px-4 py-3 text-sub whitespace-nowrap">{formatDate(review.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="rounded p-1 text-sub hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={MessageSquare} title="아직 리뷰가 없습니다" description="고객 리뷰가 작성되면 여기에 표시됩니다" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
