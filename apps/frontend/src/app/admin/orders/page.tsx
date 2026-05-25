'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PAID:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SHIPPED:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  DELIVERED:  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  CANCELLED:  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  REFUNDED:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function AdminOrdersPage() {
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin/orders'); return; }
    load();
  }, [user, router, status]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('limit', '100');
      const { data } = await api.get(`/orders?${params}`);
      let items = Array.isArray(data) ? data : (data.items ?? []);
      if (q) {
        const ql = q.toLowerCase();
        items = items.filter((o: any) =>
          o.orderNumber.toLowerCase().includes(ql) ||
          o.user?.email?.toLowerCase().includes(ql) ||
          o.user?.name?.toLowerCase().includes(ql)
        );
      }
      setOrders(items);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading orders...</div>;

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold">Orders</h1>
          <p className="text-ink-500 mt-1">{orders.length} orders {status ? `with status ${status}` : 'total'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center bg-ink-100 dark:bg-ink-900 rounded-full px-4 py-2 max-w-md flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search order #, email, name..."
            className="bg-transparent ml-2 text-sm w-full outline-none"
          />
          <button onClick={load} className="text-xs text-accent ml-2 font-semibold">Search</button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-ink-100 dark:bg-ink-900 rounded-full px-4 py-2 text-sm outline-none"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900 text-ink-500 text-xs tracking-widest uppercase">
            <tr>
              <th className="text-left p-4">Order #</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Items</th>
              <th className="text-right p-4">Total</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Payment</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-ink-100 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-900/50">
                <td className="p-4 font-mono text-xs font-bold">{o.orderNumber}</td>
                <td className="p-4">
                  <div className="font-medium">{o.user?.name ?? '—'}</div>
                  <div className="text-xs text-ink-500">{o.user?.email}</div>
                </td>
                <td className="p-4 text-ink-500">
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4 text-ink-500">{o.items?.length ?? 0}</td>
                <td className="p-4 text-right font-semibold">{inr(o.total)}</td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? 'bg-ink-100 text-ink-700'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4 text-center text-xs text-ink-500">
                  {o.paymentStatus ?? '—'}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/orders/${o.orderNumber}`} className="inline-flex p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-ink-500">
                  No orders found{status ? ` with status ${status}` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
