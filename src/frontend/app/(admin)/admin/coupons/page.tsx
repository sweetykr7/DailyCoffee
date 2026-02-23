'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  expiresAt: string | null;
  usedCount: number;
  maxCount: number | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiresAt: '',
    maxCount: '',
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.get<Coupon[]>('/admin/coupons');
      if (res.success && res.data) setCoupons(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', type: 'PERCENT', value: '', minOrderAmount: '', maxDiscount: '', expiresAt: '', maxCount: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      maxCount: coupon.maxCount ? String(coupon.maxCount) : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        expiresAt: form.expiresAt || null,
        maxCount: form.maxCount ? Number(form.maxCount) : null,
      };

      const res = editing
        ? await api.put<Coupon>(`/admin/coupons/${editing.id}`, body)
        : await api.post<Coupon>('/admin/coupons', body);

      if (res.success) {
        setModalOpen(false);
        fetchCoupons();
      } else {
        setError(res.error || '저장에 실패했습니다.');
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`"${coupon.code}" 쿠폰을 삭제하시겠습니까?`)) return;
    const res = await api.del(`/admin/coupons/${coupon.id}`);
    if (res.success) fetchCoupons();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
          <Plus size={16} /> 쿠폰 생성
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-sub">
              <th className="px-4 py-3 font-medium">코드</th>
              <th className="px-4 py-3 font-medium">할인</th>
              <th className="px-4 py-3 font-medium">최소 주문금액</th>
              <th className="px-4 py-3 font-medium">만료일</th>
              <th className="px-4 py-3 font-medium">사용</th>
              <th className="px-4 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-gray-200 hover:bg-cream/50">
                <td className="px-4 py-3">
                  <span className="rounded bg-cream-warm px-2 py-0.5 font-mono text-xs font-bold text-coffee">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-coffee">
                  {coupon.type === 'PERCENT' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  {coupon.maxDiscount && (
                    <span className="ml-1 text-xs text-sub">(최대 {formatPrice(coupon.maxDiscount)})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sub">
                  {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '-'}
                </td>
                <td className="px-4 py-3">
                  {coupon.expiresAt ? (
                    <span className={isExpired(coupon.expiresAt) ? 'text-red-500' : 'text-sub'}>
                      {formatDate(coupon.expiresAt)}
                      {isExpired(coupon.expiresAt) && ' (만료)'}
                    </span>
                  ) : (
                    <span className="text-sub">무제한</span>
                  )}
                </td>
                <td className="px-4 py-3 text-coffee">
                  {coupon.usedCount}{coupon.maxCount ? `/${coupon.maxCount}` : ''}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(coupon)} className="rounded p-1 text-sub hover:bg-cream-warm hover:text-coffee transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(coupon)} className="rounded p-1 text-sub hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={Ticket} title="아직 쿠폰이 없습니다" description="새 쿠폰을 생성해보세요" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '쿠폰 수정' : '쿠폰 생성'}>
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="쿠폰 코드"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
            placeholder="WELCOME2024"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-coffee-light">할인 유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'PERCENT' | 'FIXED' })}
                className="w-full rounded-md border border-gray-300 bg-cream-warm px-3 py-2.5 text-sm text-coffee focus:border-coffee focus:outline-none focus:ring-1 focus:ring-coffee"
              >
                <option value="PERCENT">퍼센트 (%)</option>
                <option value="FIXED">정액 (원)</option>
              </select>
            </div>
            <Input
              label={form.type === 'PERCENT' ? '할인율 (%)' : '할인 금액 (원)'}
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
              min={1}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="최소 주문금액 (원)"
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              min={0}
            />
            <Input
              label="최대 할인 금액 (원)"
              type="number"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="만료일"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <Input
              label="최대 사용 횟수"
              type="number"
              value={form.maxCount}
              onChange={(e) => setForm({ ...form, maxCount: e.target.value })}
              min={1}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              취소
            </Button>
            <Button type="submit" isLoading={saving}>
              {editing ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
