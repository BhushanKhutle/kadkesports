'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { inr } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get(`/orders/${orderNumber}`).then(({ data }) => setOrder(data));
  }, [orderNumber]);

  if (!order) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;

  return (
    <div className="container-x py-10 max-w-3xl">
      <div className="text-center mb-10">
        <CheckCircle2 className="w-14 h-14 text-kadke-green mx-auto mb-3" />
        <h1 className="font-display text-4xl font-bold">Thank you!</h1>
        <p className="text-ink-500 mt-2">Order <span className="font-mono">{order.orderNumber}</span> · {order.status}</p>
      </div>
      <div className="card p-6 space-y-4">
        {order.items?.map((it: any) => (
          <div key={it.id} className="flex justify-between gap-4 text-sm">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-ink-500 text-xs">Qty {it.quantity}{it.size ? ` · Size ${it.size}` : ''}</div>
            </div>
            <div className="font-medium">{inr(Number(it.price) * it.quantity)}</div>
          </div>
        ))}
        <div className="border-t border-ink-200 dark:border-ink-800 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-{inr(order.discount)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{inr(order.shipping)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{inr(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>{inr(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
