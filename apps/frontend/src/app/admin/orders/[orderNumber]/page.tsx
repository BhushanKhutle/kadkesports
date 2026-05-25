'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Phone, Mail, Package, Truck, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  PAID:       'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-teal-100 text-teal-700',
  CANCELLED:  'bg-rose-100 text-rose-700',
  REFUNDED:   'bg-purple-100 text-purple-700',
};

export default function AdminOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const user = useAppSelector(s => s.user.user);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/login?next=/admin/orders'); return; }
    load();
  }, [user, router, orderNumber]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderNumber}`);
      setOrder(data);
      setTrackingNumber(data.trackingNumber ?? '');
    } catch (e: any) {
      if (e.response?.status === 404) {
        toast.error('Order not found');
        router.push('/admin/orders');
      } else {
        toast.error(e.response?.data?.message ?? 'Failed to load');
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${order.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });
      toast.success(`Status updated to ${newStatus}`);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  async function saveTracking() {
    if (!trackingNumber.trim()) { toast.error('Enter a tracking number'); return; }
    setUpdating(true);
    try {
      await api.post(`/orders/${order.id}/status`, {
        status: order.status,
        trackingNumber: trackingNumber.trim(),
      });
      toast.success('Tracking number saved');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setUpdating(false);
    }
  }

  async function saveNotes() {
    setUpdating(true);
    try {
      await api.post(`/orders/${order.id}/notes`, { notes });
      toast.success('Notes saved');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Save failed');
    } finally {
      setUpdating(false);
    }
  }

    if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading...</div>;
  if (!order) return <div className="container-x py-20 text-center">Not found</div>;

  const addr = order.shippingAddress ?? {};

  return (
    <div className="container-x py-10">
      <Link href="/admin/orders" className="text-sm text-ink-500 hover:text-accent inline-flex items-center mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-5xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-ink-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${STATUS_COLORS[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items + totals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Items ({order.items?.length ?? 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((it: any) => (
                <div key={it.id} className="flex gap-4 pb-4 border-b border-ink-100 dark:border-ink-800 last:border-0 last:pb-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-900 shrink-0">
                    {it.product?.images?.[0] && (
                      <Image src={it.product.images[0]} alt={it.name} fill className="object-cover" sizes="80px" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-ink-500 mt-1">
                      SKU: {it.product?.sku ?? '—'}
                      {it.size && ` · Size: ${it.size}`}
                      {it.color && ` · Color: ${it.color}`}
                    </div>
                    <div className="text-sm text-ink-500 mt-1">
                      Qty: <span className="font-semibold">{it.quantity}</span> × {inr(it.price)}
                    </div>
                  </div>
                  <div className="font-bold text-right">{inr(Number(it.price) * it.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4">Totals</h2>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={inr(order.subtotal)} />
              <Row label="GST (18%)" value={inr(order.gst ?? 0)} />
              <Row label="Shipping" value={Number(order.shipping ?? 0) > 0 ? inr(order.shipping) : 'Free'} />
              {Number(order.discount ?? 0) > 0 && (
                <Row label="Discount" value={`-${inr(order.discount)}`} className="text-accent" />
              )}
              <div className="border-t border-ink-100 dark:border-ink-800 my-2"></div>
              <Row label="Total" value={inr(order.total)} className="text-lg font-bold" />
            </div>
          </div>
        </div>

        {/* Right: Customer + Actions */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4">Customer</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold">{order.user?.name}</div>
                <a href={`mailto:${order.user?.email}`} className="text-ink-500 inline-flex items-center gap-1 hover:text-accent">
                  <Mail className="w-3 h-3" /> {order.user?.email}
                </a>
              </div>
              {addr.phone && (
                <a href={`tel:${addr.phone}`} className="text-ink-500 inline-flex items-center gap-1 hover:text-accent">
                  <Phone className="w-3 h-3" /> {addr.phone}
                </a>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Ship to
            </h2>
            <div className="text-sm space-y-1">
              <div className="font-semibold">{addr.name}</div>
              <div>{addr.line1}</div>
              {addr.line2 && <div>{addr.line2}</div>}
              <div>{addr.city}, {addr.state} {addr.pincode}</div>
              <div>{addr.country}</div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4">Payment</h2>
            <div className="text-sm space-y-2">
              <Row label="Method" value={order.paymentMethod ?? '—'} />
              <Row label="Status" value={order.paymentStatus ?? '—'} />
              {order.razorpayOrderId && <Row label="Razorpay ID" value={<span className="font-mono text-xs">{order.razorpayOrderId}</span>} />}
            </div>
          </div>

          {/* Tracking */}
          {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Tracking
              </h2>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="input mb-3"
                placeholder="AWB / Tracking #"
              />
              <button onClick={saveTracking} disabled={updating} className="btn-outline w-full !py-2 text-sm">
                Save tracking
              </button>
            </div>
          )}

          {/* Admin notes */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-3">Admin notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input mb-3 min-h-[80px]"
              placeholder="Internal notes (visible to ops team only)..."
            />
            <button onClick={saveNotes} disabled={updating} className="btn-outline w-full !py-2 text-sm">
              Save notes
            </button>
          </div>

          {/* Status actions */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-3">Update status</h2>
            <p className="text-xs text-ink-500 mb-4">Current: <span className="font-semibold">{order.status}</span></p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.filter(s => s !== order.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating}
                  className="btn-outline !py-2 text-xs"
                >
                  {s === 'PAID' && <Check className="w-3 h-3" />}
                  {s === 'SHIPPED' && <Truck className="w-3 h-3" />}
                  {s === 'DELIVERED' && <Package className="w-3 h-3" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, className = '' }: { label: string; value: any; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className="text-ink-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
