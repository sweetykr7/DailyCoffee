'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<AdminCategory[]>('/admin/categories');
      if (res.success && res.data) setCategories(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
      };

      const res = editing
        ? await api.put<AdminCategory>(`/admin/categories/${editing.id}`, body)
        : await api.post<AdminCategory>('/admin/categories', body);

      if (res.success) {
        setModalOpen(false);
        fetchCategories();
      } else {
        setError(res.error || '저장에 실패했습니다.');
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (cat._count.products > 0) {
      alert('상품이 있는 카테고리는 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) return;

    const res = await api.del(`/admin/categories/${cat.id}`);
    if (res.success) fetchCategories();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> 카테고리 추가
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cream-warm p-2 text-accent">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-coffee">{cat.name}</h3>
                  <p className="text-xs text-sub">{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(cat)} className="rounded p-1 text-sub hover:bg-cream-warm hover:text-coffee transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(cat)} className="rounded p-1 text-sub hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {cat.description && (
              <p className="mt-2 text-sm text-sub">{cat.description}</p>
            )}
            <p className="mt-3 text-xs text-sub">상품 {cat._count.products}개</p>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon={FolderTree} title="아직 카테고리가 없습니다" description="카테고리를 추가해보세요" />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '카테고리 수정' : '카테고리 추가'} size="sm">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="카테고리명"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                slug: !editing ? generateSlug(name) : prev.slug,
              }));
            }}
            required
          />
          <Input
            label="슬러그"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Input
            label="설명 (선택)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button type="submit" isLoading={saving}>
              {editing ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
