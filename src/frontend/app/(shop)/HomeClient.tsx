'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Product, Category, Review } from '@/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { ProductSection } from '@/components/home/ProductSection';
import { PromoBanners } from '@/components/home/PromoBanners';
import { ReviewSection } from '@/components/home/ReviewSection';
import { BrandSection } from '@/components/home/BrandSection';
import { InstagramGrid } from '@/components/home/InstagramGrid';
import { Spinner } from '@/components/ui/Spinner';

export function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, reviewsRes] = await Promise.all([
          api.get<Product[]>('/products/featured'),
          api.get<Category[]>('/categories'),
          api.get<{ data: Review[]; meta: unknown }>('/reviews', { limit: '6' }),
        ]);

        if (productsRes.success && productsRes.data) {
          setFeaturedProducts(productsRes.data);
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (reviewsRes.success && reviewsRes.data) {
          // reviews endpoint returns paginated - data might be nested
          const reviewData = Array.isArray(reviewsRes.data)
            ? reviewsRes.data
            : (reviewsRes.data as unknown as { data: Review[] }).data || [];
          setReviews(reviewData);
        }
      } catch {
        // API not available, show empty state
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
      {categories.length > 0 && <CategoryTabs categories={categories} />}
      <PromoBanners />
      <ProductSection
        title="인기 상품"
        subtitle="가장 사랑받는 데일리커피 베스트셀러"
        products={featuredProducts.slice(0, 8)}
        href="/products"
      />
      <BrandSection />
      {reviews.length > 0 && <ReviewSection reviews={reviews} />}
      <InstagramGrid />
    </>
  );
}
