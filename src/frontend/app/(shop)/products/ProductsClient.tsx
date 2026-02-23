'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type SortOption = 'latest' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
];

export function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read params
  const page = Number(searchParams.get('page')) || 1;
  const categoryId = searchParams.get('categoryId') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'latest';
  const search = searchParams.get('search') || '';

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change
      if (!updates.page) params.set('page', '1');
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    async function fetchCategories() {
      const res = await api.get<Category[]>('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: '12',
          sort,
        };
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;

        const res = await api.get<Product[]>('/products', params);
        if (res.success && res.data) {
          setProducts(res.data);
          if (res.meta) {
            setTotalPages(res.meta.totalPages);
            setTotal(res.meta.total);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page, categoryId, sort, search]);

  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: '1' });
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-coffee">
            {search ? `'${search}' 검색 결과` : '전체 상품'}
          </h1>
          <p className="mt-1 text-sm text-sub">총 {total}개의 상품</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="상품 검색..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-coffee placeholder:text-sub focus:border-coffee focus:outline-none focus:ring-1 focus:ring-coffee"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); updateParams({ search: '' }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-coffee"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28">
              <h3 className="mb-3 text-sm font-semibold text-coffee">카테고리</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParams({ categoryId: '' })}
                    className={cn(
                      'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                      !categoryId
                        ? 'bg-coffee text-white font-medium'
                        : 'text-coffee-light hover:bg-cream-warm'
                    )}
                  >
                    전체
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParams({ categoryId: cat.id })}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                        categoryId === cat.id
                          ? 'bg-coffee text-white font-medium'
                          : 'text-coffee-light hover:bg-cream-warm'
                      )}
                    >
                      {cat.name}
                      {cat._count && (
                        <span className="ml-1 text-xs opacity-60">({cat._count.products})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-coffee lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터
              </button>

              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateParams({ sort: option.value })}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      sort === option.value
                        ? 'bg-coffee text-white'
                        : 'text-coffee-light hover:bg-cream-warm'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile filters */}
            {filtersOpen && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 lg:hidden">
                <h3 className="mb-3 text-sm font-semibold text-coffee">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { updateParams({ categoryId: '' }); setFiltersOpen(false); }}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      !categoryId ? 'bg-coffee text-white' : 'bg-cream-warm text-coffee'
                    )}
                  >
                    전체
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { updateParams({ categoryId: cat.id }); setFiltersOpen(false); }}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        categoryId === cat.id ? 'bg-coffee text-white' : 'bg-cream-warm text-coffee'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product grid */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" className="text-coffee" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-sub">
                <p className="text-lg font-medium">상품이 없습니다</p>
                <p className="mt-1 text-sm">다른 검색어나 카테고리를 시도해보세요.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: String(p) })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
