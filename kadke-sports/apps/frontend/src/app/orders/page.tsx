'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { inr } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.items ?? []));
  }, []);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-5xl font-bold mb-10">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-500">No orders yet. <Link href="/shop" className="text-accent">Shop now</Link></p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.orderNumber}`} className="card p-5 flex justify-between items-center hover:border-accent transition">
              <div>
                <div className="font-mono text-sm">{o.orderNumber}</div>
                <div className="text-xs text-ink-500">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-xs mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-900">{o.status}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{inr(o.total)}</div>
                <div className="text-xs text-ink-500">{o.items?.length} items</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
