'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { Category, Product } from '@/types';

export default function AdminProductNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '100',
    categoryId: '',
    imageUrl: '',
    tags: [] as string[],
    isFeatured: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>('/admin/categories');
        if (res.success && res.data) setCategories(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl || undefined,
        tags: form.tags,
        isFeatured: form.isFeatured,
      };

      const res = await api.post<Product>('/admin/products', body);
      if (res.success) {
        router.push('/admin/products');
      } else {
        setError(res.error || '상품 등록에 실패했습니다.');
      }
    } catch {
      setError('상품 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-coffee">새 상품 등록</h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="상품명"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-coffee-light">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-cream-warm px-3 py-2.5 text-sm text-coffee placeholder:text-coffee-light/50 focus:border-coffee focus:outline-none focus:ring-1 focus:ring-coffee"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="가격 (원)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min={0}
            />
            <Input
              label="할인가 (원)"
              type="number"
              value={form.discountPrice}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              min={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="재고"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              min={0}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-coffee-light">카테고리</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full rounded-md border border-gray-300 bg-cream-warm px-3 py-2.5 text-sm text-coffee focus:border-coffee focus:outline-none focus:ring-1 focus:ring-coffee"
              >
                <option value="">카테고리 선택</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="이미지 URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />

          {form.imageUrl && (
            <div className="mt-2">
              <img src={form.imageUrl} alt="미리보기" className="h-32 w-32 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-coffee-light">태그</label>
            <div className="flex gap-3">
              {['BEST', 'NEW', 'SALE'].map((tag) => (
                <label key={tag} className="flex items-center gap-1.5 text-sm text-coffee">
                  <input
                    type="checkbox"
                    checked={form.tags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    className="rounded border-gray-300"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-coffee">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="rounded border-gray-300"
            />
            추천 상품
          </label>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={saving}>
              등록하기
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
