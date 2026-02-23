'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Product, Category } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;

      const res = await api.get<Product[]>('/admin/products', params);
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.meta) setTotalPages(res.meta.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get<Category[]>('/admin/categories');
      if (res.success && res.data) setCategories(res.data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    const res = await api.del(`/admin/products/${id}`);
    if (res.success) fetchProducts();
  };

  const getPrimaryImage = (product: Product): string | null => {
    if (product.images && product.images.length > 0) return product.images[0].url;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="상품명 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search size={16} />
          </Button>
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 bg-cream-warm px-3 py-2 text-sm text-coffee"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus size={16} /> 상품 등록
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-sub">
                <th className="px-4 py-3 font-medium">이미지</th>
                <th className="px-4 py-3 font-medium">상품명</th>
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium">가격</th>
                <th className="px-4 py-3 font-medium">재고</th>
                <th className="px-4 py-3 font-medium">활성</th>
                <th className="px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-200 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    {getPrimaryImage(p) ? (
                      <img src={getPrimaryImage(p)!} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-sub">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-coffee">{p.name}</td>
                  <td className="px-4 py-3 text-sub">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3">
                    {p.discountPrice ? (
                      <div>
                        <span className="text-red-500 font-medium">{formatPrice(p.discountPrice)}</span>
                        <span className="ml-1 text-xs text-sub line-through">{formatPrice(p.price)}</span>
                      </div>
                    ) : (
                      <span className="text-coffee">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 10 ? 'text-red-500 font-medium' : 'text-coffee'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}`} className="rounded p-1 text-sub hover:bg-cream-warm hover:text-coffee transition-colors">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="rounded p-1 text-sub hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sub">
                    상품이 없습니다.
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
