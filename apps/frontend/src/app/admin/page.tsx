'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import { Package, ShoppingCart, Users, IndianRupee } from 'lucide-react';

export default function AdminPage() {
  const user = useAppSelector(s => s.user.user);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin'); return; }
    api.get('/admin/dashboard').then(({ data }) => setData(data));
  }, [user, router]);

  if (!data) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;

  const tiles = [
    { icon: IndianRupee, label: '30d Revenue', value: inr(data.revenue30d) },
    { icon: ShoppingCart, label: 'Total Orders', value: data.counts.totalOrders },
    { icon: Users, label: 'Users', value: data.counts.totalUsers },
    { icon: Package, label: 'Products', value: data.counts.totalProducts },
  ];

  return (
    <div className="container-x py-10">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h1 className="font-display text-5xl font-bold">Dashboard</h1>
        <a href="/admin/products" className="btn-primary">Manage products →</a>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {tiles.map((t, i) => (
          <div key={i} className="card p-6">
            <t.icon className="w-6 h-6 text-accent mb-3" />
            <div className="text-2xl font-bold">{t.value}</div>
            <div className="text-xs text-ink-500 tracking-widest uppercase mt-1">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-2xl font-bold mb-4">Recent orders</h2>
          <div className="space-y-3 text-sm">
            {data.recentOrders.map((o: any) => (
              <div key={o.id} className="flex justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                <div><div className="font-mono text-xs">{o.orderNumber}</div><div className="text-ink-500">{o.user?.name}</div></div>
                <div className="text-right"><div className="font-medium">{inr(o.total)}</div><div className="text-xs text-ink-500">{o.status}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-2xl font-bold mb-4">Low stock</h2>
          <div className="space-y-3 text-sm">
            {data.lowStock.map((l: any) => (
              <div key={l.id} className="flex justify-between border-b border-ink-100 dark:border-ink-800 pb-2">
                <div><div className="font-medium">{l.product.name}</div><div className="text-ink-500 text-xs">{l.product.sku}</div></div>
                <div className="text-right text-accent font-bold">{l.stock}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
