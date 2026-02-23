'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, itemCount, totalAmount, fetchCart, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isLoggedIn, fetchCart, router]);

  if (!isLoggedIn) return null;

  if (isLoading && !cart) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" className="text-coffee" />
      </div>
    );
  }

  const items = cart?.items || [];
  const SHIPPING_THRESHOLD = 30000;
  const SHIPPING_FEE = totalAmount >= SHIPPING_THRESHOLD ? 0 : 3000;
  const grandTotal = totalAmount + SHIPPING_FEE;

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="mb-8 font-display text-3xl font-bold text-coffee">장바구니</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-sub">
            <ShoppingCart className="mb-4 h-16 w-16 opacity-30" />
            <p className="text-lg font-medium">장바구니가 비어있습니다</p>
            <p className="mt-1 text-sm">마음에 드는 상품을 담아보세요.</p>
            <Link href="/products">
              <Button variant="outline" className="mt-6">
                쇼핑 계속하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-sub">총 {itemCount}개 상품</p>
                <button
                  onClick={() => clearCart()}
                  className="text-sm text-sub hover:text-red-500 transition-colors"
                >
                  전체 삭제
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const effectivePrice =
                    item.product.discountPrice && item.product.discountPrice < item.product.price
                      ? item.product.discountPrice
                      : item.product.price;
                  const primaryImage =
                    item.product.images?.find((img) => img.isPrimary) || item.product.images?.[0];

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-cream-warm"
                      >
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.alt || item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sub/30">
                            <ShoppingCart className="h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm font-medium text-coffee hover:text-accent transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <p className="mt-0.5 text-xs text-sub">
                              {Object.entries(item.selectedOptions)
                                .map(([key, val]) => `${key === 'WEIGHT' ? '용량' : '분쇄도'}: ${val}`)
                                .join(' / ')}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center rounded-md border border-gray-300">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="flex h-8 w-8 items-center justify-center text-coffee hover:bg-cream-warm transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-8 w-10 items-center justify-center border-x border-gray-300 text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-coffee hover:bg-cream-warm transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-coffee">
                              {formatPrice(effectivePrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-sub hover:text-red-500 transition-colors"
                              aria-label="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-coffee">주문 요약</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sub">상품 금액</span>
                    <span className="text-coffee">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sub">배송비</span>
                    <span className="text-coffee">
                      {SHIPPING_FEE === 0 ? '무료' : formatPrice(SHIPPING_FEE)}
                    </span>
                  </div>
                  {SHIPPING_FEE > 0 && (
                    <p className="text-xs text-accent">
                      {formatPrice(SHIPPING_THRESHOLD - totalAmount)} 더 구매 시 무료배송!
                    </p>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-coffee">총 결제 금액</span>
                      <span className="text-xl font-bold text-accent">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/checkout')}
                  size="lg"
                  className="mt-6 w-full"
                >
                  주문하기
                </Button>

                <Link href="/products">
                  <Button variant="ghost" size="lg" className="mt-2 w-full">
                    쇼핑 계속하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
