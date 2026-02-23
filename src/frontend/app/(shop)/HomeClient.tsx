'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product, Review } from '@/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { ProductSection } from '@/components/home/ProductSection';
import { PromoBanners } from '@/components/home/PromoBanners';
import { ReviewSection } from '@/components/home/ReviewSection';
import { BrandSection } from '@/components/home/BrandSection';
import { InstagramGrid } from '@/components/home/InstagramGrid';
import { Spinner } from '@/components/ui/Spinner';

export function HomeClient() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [stickProducts, setStickProducts] = useState<Product[]>([]);
  const [baristaProducts, setBaristaProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [newRes, recommendedRes, stickRes, baristaRes, reviewsRes] = await Promise.allSettled([
          api.get<Product[]>('/products', { sort: 'newest', limit: '8' }),
          api.get<Product[]>('/products', { tag: 'recommended', limit: '4' }),
          api.get<Product[]>('/products', { category: 'stick-coffee', limit: '4' }),
          api.get<Product[]>('/products', { tag: 'barista-pick', limit: '4' }),
          api.get<Review[]>('/reviews', { limit: '3', sort: 'likes' }),
        ]);

        if (newRes.status === 'fulfilled' && newRes.value.success && newRes.value.data) {
          setNewProducts(Array.isArray(newRes.value.data) ? newRes.value.data : []);
        }
        if (recommendedRes.status === 'fulfilled' && recommendedRes.value.success && recommendedRes.value.data) {
          setRecommendedProducts(Array.isArray(recommendedRes.value.data) ? recommendedRes.value.data : []);
        }
        if (stickRes.status === 'fulfilled' && stickRes.value.success && stickRes.value.data) {
          setStickProducts(Array.isArray(stickRes.value.data) ? stickRes.value.data : []);
        }
        if (baristaRes.status === 'fulfilled' && baristaRes.value.success && baristaRes.value.data) {
          setBaristaProducts(Array.isArray(baristaRes.value.data) ? baristaRes.value.data : []);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.success && reviewsRes.value.data) {
          const reviewData = reviewsRes.value.data;
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        }
      } catch {
        // API not available — show empty state
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" className="text-coffee" />
      </div>
    );
  }

  return (
    <>
      <HeroSlider />
      <CategoryTabs />

      <ProductSection
        title="신상품"
        subtitle="새롭게 입고된 프리미엄 원두"
        products={newProducts}
        viewAllHref="/products?sort=newest"
      />

      <ProductSection
        title="이 커피 한 잔 어때요?"
        subtitle="에디터 추천 커피"
        products={recommendedProducts}
        viewAllHref="/products?tag=recommended"
        columns={2}
      />

      <PromoBanners />

      <ProductSection
        title="매일 1박세"
        subtitle="간편하게 즐기는 스틱커피"
        products={stickProducts}
        viewAllHref="/products?category=stick-coffee"
        columns={2}
      />

      <ProductSection
        title="바리스타 추천"
        subtitle="전문 바리스타가 엄선한 원두"
        products={baristaProducts}
        viewAllHref="/products?tag=barista-pick"
        columns={2}
      />

      <ReviewSection reviews={reviews} />
      <BrandSection />
      <InstagramGrid />
    </>
  );
}
