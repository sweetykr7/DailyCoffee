'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, ChevronLeft, Heart, Share2, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Product, Review } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await api.get<Product>(`/products/${productId}`);
        if (res.success && res.data) {
          setProduct(res.data);
          // Set default options
          const defaults: Record<string, string> = {};
          res.data.options?.forEach((opt) => {
            if (!defaults[opt.type]) {
              defaults[opt.type] = opt.value;
            }
          });
          setSelectedOptions(defaults);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!product) return;

    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined);
      router.push('/cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" className="text-coffee" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-sub">
        <p className="text-lg font-medium">상품을 찾을 수 없습니다</p>
        <Link href="/products" className="mt-4 text-sm text-accent hover:underline">
          상품 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice! : product.price;
  const isOutOfStock = product.stock <= 0;
  const sortedImages = [...(product.images || [])].sort((a, b) => a.order - b.order);
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Calculate price with option modifiers
  const optionModifier = Object.entries(selectedOptions).reduce((sum, [type, value]) => {
    const option = product.options?.find((o) => o.type === type && o.value === value);
    return sum + (option?.priceModifier || 0);
  }, 0);
  const finalPrice = effectivePrice + optionModifier;

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-sub">
          <Link href="/" className="hover:text-coffee transition-colors">홈</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-coffee transition-colors">전체상품</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?categoryId=${product.categoryId}`}
                className="hover:text-coffee transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-coffee">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Image gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-warm">
              {sortedImages.length > 0 ? (
                <img
                  src={sortedImages[activeImage]?.url}
                  alt={sortedImages[activeImage]?.alt || product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sub">
                  <svg className="h-24 w-24 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-6a2 2 0 00-2-2zm-9 14c-2.79 0-5-2.24-5-5V5h12v7c0 2.79-2.24 5.01-5 5.01L9.5 17zM20 6h2v8h-2V6z" />
                  </svg>
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {isOutOfStock && <Badge variant="soldout">품절</Badge>}
                {hasDiscount && !isOutOfStock && (
                  <Badge variant="sale">-{getDiscountPercent(product.price, product.discountPrice!)}%</Badge>
                )}
                {product.tags?.includes('new') && <Badge variant="new">NEW</Badge>}
                {product.tags?.includes('best') && <Badge variant="best">BEST</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      idx === activeImage ? 'border-coffee' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.category && (
              <p className="mb-1 text-sm text-sub">{product.category.name}</p>
            )}
            <h1 className="text-2xl font-bold text-coffee lg:text-3xl">{product.name}</h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={avgRating} size={16} />
                <span className="text-sm text-sub">
                  {avgRating.toFixed(1)} ({reviews.length}개 리뷰)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-lg text-sub line-through">
                      {formatPrice(product.price + optionModifier)}
                    </span>
                    <Badge variant="sale">
                      -{getDiscountPercent(product.price, product.discountPrice!)}%
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-coffee">
                    {formatPrice(finalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="mt-6 space-y-4">
                {/* Group options by type */}
                {['WEIGHT', 'GRIND'].map((type) => {
                  const typeOptions = product.options!.filter((o) => o.type === type);
                  if (typeOptions.length === 0) return null;

                  return (
                    <div key={type}>
                      <label className="mb-2 block text-sm font-medium text-coffee">
                        {type === 'WEIGHT' ? '용량' : '분쇄도'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {typeOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setSelectedOptions((prev) => ({ ...prev, [type]: opt.value }))
                            }
                            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                              selectedOptions[type] === opt.value
                                ? 'border-coffee bg-coffee text-white'
                                : 'border-gray-300 text-coffee hover:border-coffee'
                            }`}
                          >
                            {opt.value}
                            {opt.priceModifier > 0 && (
                              <span className="ml-1 text-xs opacity-70">
                                (+{formatPrice(opt.priceModifier)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-coffee">수량</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-coffee hover:bg-cream-warm transition-colors rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-gray-300 text-sm font-medium text-coffee">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="flex h-10 w-10 items-center justify-center text-coffee hover:bg-cream-warm transition-colors rounded-r-lg"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-sub">
                  (재고: {product.stock}개)
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-lg bg-cream-warm p-4">
              <span className="text-sm font-medium text-coffee">총 상품 금액</span>
              <span className="text-2xl font-bold text-accent">
                {formatPrice(finalPrice * quantity)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                isLoading={addingToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {isOutOfStock ? '품절' : '장바구니 담기'}
              </Button>
            </div>

            {/* Shipping info */}
            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-coffee">
                <Truck className="h-4 w-4 text-accent" />
                <span>30,000원 이상 구매 시 무료배송</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-coffee">상품 상세</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-coffee-light">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-xl font-bold text-coffee">
              상품 리뷰 ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-warm text-xs font-bold text-coffee">
            {review.user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-coffee">{review.user?.name || '고객'}</p>
            <p className="text-xs text-sub">
              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-coffee-light">{review.content}</p>
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
  );
}
