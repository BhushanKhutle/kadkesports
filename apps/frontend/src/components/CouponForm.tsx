'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface CouponFormProps {
  initial?: any;
  couponId?: string;
}

export function CouponForm({ initial, couponId }: CouponFormProps) {
  const router = useRouter();
  const isEdit = !!couponId;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: initial?.code ?? '',
    type: initial?.type ?? 'PERCENT',
    value: initial?.value ? Number(initial.value) : 10,
    minOrder: initial?.minOrder ? Number(initial.minOrder) : 0,
    maxDiscount: initial?.maxDiscount ? Number(initial.maxDiscount) : '',
    usageLimit: initial?.usageLimit ?? '',
    expiresAt: initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : '',
    isActive: initial?.isActive ?? true,
  });

  function generateCode() {
    const adjs = ['SUMMER', 'WINTER', 'FLASH', 'MEGA', 'SUPER', 'EXTRA', 'KADKE', 'TEAM', 'NEW'];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    setForm({ ...form, code: `${adj}${num}` });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (Number(form.value) <= 0) { toast.error('Value must be > 0'); return; }
    if (form.type === 'PERCENT' && Number(form.value) > 100) { toast.error('Percent max is 100'); return; }

    setSaving(true);
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        isActive: form.isActive,
      };
      if (form.maxDiscount !== '' && Number(form.maxDiscount) > 0) payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit !== '' && Number(form.usageLimit) > 0) payload.usageLimit = Number(form.usageLimit);
      if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

      if (isEdit) {
        await api.patch(`/coupons/${couponId}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      }
      router.push('/admin/coupons');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // Live preview
  const sampleSubtotal = 3000;
  let preview = 0;
  if (form.value > 0) {
    preview = form.type === 'PERCENT'
      ? (sampleSubtotal * Number(form.value)) / 100
      : Number(form.value);
    if (form.maxDiscount && Number(form.maxDiscount) > 0) {
      preview = Math.min(preview, Number(form.maxDiscount));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 max-w-3xl">
      {/* Code */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Coupon code</h2>
        <div className="flex gap-2">
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="input font-mono uppercase tracking-widest"
            placeholder="SUMMER25"
            maxLength={20}
          />
          {!isEdit && (
            <button type="button" onClick={generateCode} className="btn-outline !px-4" title="Generate random">
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-ink-500">Customer types this at checkout. ALL CAPS, no spaces.</p>
      </section>

      {/* Discount */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Discount</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs tracking-widest text-ink-500">TYPE *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input mt-1"
            >
              <option value="PERCENT">Percent off (%)</option>
              <option value="FLAT">Flat amount off (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-xs tracking-widest text-ink-500">
              VALUE * {form.type === 'PERCENT' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              required
              min="0"
              step={form.type === 'PERCENT' ? '1' : '1'}
              max={form.type === 'PERCENT' ? '100' : undefined}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="input mt-1"
            />
          </div>
        </div>

        {form.type === 'PERCENT' && (
          <div>
            <label className="text-xs tracking-widest text-ink-500">MAX DISCOUNT CAP (₹, optional)</label>
            <input
              type="number"
              min="0"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              className="input mt-1"
              placeholder="e.g. 500"
            />
            <p className="text-xs text-ink-500 mt-1">Caps the discount even if {form.value}% would exceed this.</p>
          </div>
        )}

        {/* Live preview */}
        <div className="rounded-2xl bg-accent/10 border border-accent/30 p-4 text-sm">
          <div className="text-xs tracking-widest text-ink-500 mb-1">PREVIEW</div>
          On a ₹{sampleSubtotal} order, customer saves <strong className="text-accent">₹{Math.round(preview)}</strong>
          {form.type === 'PERCENT' && form.maxDiscount && Number(form.maxDiscount) > 0 && preview === Number(form.maxDiscount) && (
            <span className="text-xs text-ink-500"> (capped)</span>
          )}
        </div>
      </section>

      {/* Conditions */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Conditions</h2>

        <div>
          <label className="text-xs tracking-widest text-ink-500">MIN ORDER AMOUNT (₹)</label>
          <input
            type="number"
            min="0"
            value={form.minOrder}
            onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
            className="input mt-1"
          />
          <p className="text-xs text-ink-500 mt-1">Cart subtotal must be at least this. 0 = no minimum.</p>
        </div>

        <div>
          <label className="text-xs tracking-widest text-ink-500">USAGE LIMIT (total)</label>
          <input
            type="number"
            min="0"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="input mt-1"
            placeholder="Unlimited if blank"
          />
        </div>

        <div>
          <label className="text-xs tracking-widest text-ink-500">EXPIRES ON</label>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="input mt-1"
          />
          <p className="text-xs text-ink-500 mt-1">Blank = never expires.</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <span className="text-sm">Active (customers can apply this)</span>
        </label>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pb-10">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Update coupon' : 'Create coupon'}
        </button>
        <button type="button" onClick={() => router.push('/admin/coupons')} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
