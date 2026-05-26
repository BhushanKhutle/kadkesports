'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string>('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin/coupons'); return; }
    load();
  }, [user, router]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(Array.isArray(data) ? data : (data.items ?? []));
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(id: string, code: string) {
    if (!confirm(`Deactivate "${code}"? Customers won't be able to use it.`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deactivated');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Delete failed');
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopied(''), 1500);
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading coupons...</div>;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold">Coupons</h1>
          <p className="text-ink-500 mt-1">{coupons.length} coupons · {coupons.filter(c => c.isActive).length} active</p>
        </div>
        <Link href="/admin/coupons/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New coupon
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900 text-ink-500 text-xs tracking-widest uppercase">
            <tr>
              <th className="text-left p-4">Code</th>
              <th className="text-left p-4">Type</th>
              <th className="text-right p-4">Value</th>
              <th className="text-right p-4">Min order</th>
              <th className="text-right p-4">Used / Limit</th>
              <th className="text-left p-4">Expires</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
              const exhausted = c.usageLimit && c.usedCount >= c.usageLimit;
              return (
                <tr key={c.id} className="border-t border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-900/50">
                  <td className="p-4">
                    <button onClick={() => copyCode(c.code)} className="font-mono font-bold tracking-widest text-accent inline-flex items-center gap-1 hover:underline">
                      {c.code}
                      {copied === c.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-50" />}
                    </button>
                  </td>
                  <td className="p-4 text-xs">
                    <span className="px-2 py-1 rounded-full bg-ink-100 dark:bg-ink-800">{c.type}</span>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {c.type === 'PERCENT' ? `${c.value}%` : inr(c.value)}
                    {c.maxDiscount && <div className="text-xs text-ink-500">cap {inr(c.maxDiscount)}</div>}
                  </td>
                  <td className="p-4 text-right">{Number(c.minOrder) > 0 ? inr(c.minOrder) : '—'}</td>
                  <td className="p-4 text-right">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}
                  </td>
                  <td className="p-4 text-ink-500 text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                  </td>
                  <td className="p-4 text-center">
                    {!c.isActive ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-ink-100 text-ink-500">DISABLED</span>
                    ) : expired ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700">EXPIRED</span>
                    ) : exhausted ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">USED UP</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">ACTIVE</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <Link href={`/admin/coupons/${c.id}`} className="inline-flex p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
                      <Edit className="w-4 h-4" />
                    </Link>
                    {c.isActive && (
                      <button onClick={() => deactivate(c.id, c.code)} className="inline-flex p-2 rounded-full hover:bg-accent hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-ink-500">No coupons. <Link href="/admin/coupons/new" className="text-accent">Create one →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
