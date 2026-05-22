'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { api } from '@/lib/api';
import { clearCart, useAppDispatch, useAppSelector } from '@/store';
import { inr } from '@/lib/utils';
import toast from 'react-hot-toast';

declare global { interface Window { Razorpay: any; } }

interface Address { id: string; fullName: string; line1: string; city: string; pincode: string; isDefault: boolean; }

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    if (!user) { router.push('/login?next=/checkout'); return; }
    api.get<Address[]>('/users/me/addresses').then(({ data }) => {
      setAddresses(data);
      const def = data.find(a => a.isDefault) ?? data[0];
      if (def) setAddressId(def.id);
    });
  }, [user, router]);

  const subtotal = cart.subtotal;
  const shipping = subtotal > 1999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + tax;

  const applyCoupon = async () => {
    try {
      const { data } = await api.post('/coupons/apply', { code: coupon, subtotal });
      setDiscount(data.discount); toast.success(`Coupon applied: ₹${data.discount} off`);
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Invalid coupon'); }
  };

  const saveNewAddress = async () => {
    const { data } = await api.post('/users/me/addresses', newAddr);
    setAddresses((a) => [data, ...a]); setAddressId(data.id);
    toast.success('Address saved');
  };

  const placeOrder = async () => {
    if (!addressId) { toast.error('Add a delivery address'); return; }
    setLoading(true);
    try {
      const { data: order } = await api.post('/orders', { addressId, paymentMethod: method, couponCode: coupon || undefined });

      if (method === 'COD') {
        dispatch(clearCart());
        toast.success('Order placed!');
        router.push(`/orders/${order.orderNumber}`);
        return;
      }

      // Razorpay flow
      const { data: rzp } = await api.post('/payments/rzp/order', { orderId: order.id });
      const opts = {
        key: rzp.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzp.amount, currency: rzp.currency,
        name: 'Kadke Sports', description: order.orderNumber,
        order_id: rzp.rzpOrderId,
        handler: async (resp: any) => {
          await api.post('/payments/rzp/verify', {
            orderId: order.id,
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          });
          dispatch(clearCart());
          router.push(`/orders/${order.orderNumber}`);
        },
        prefill: { email: user?.email, name: user?.name },
        theme: { color: '#ff4d00' },
      };
      new window.Razorpay(opts).open();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container-x py-10">
        <h1 className="font-display text-5xl font-bold mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-8">
            {/* Address */}
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">Delivery</h2>
              {addresses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map(a => (
                    <label key={a.id} className={`card p-4 cursor-pointer ${addressId === a.id ? 'border-accent' : ''}`}>
                      <input type="radio" className="hidden" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                      <div className="font-medium">{a.fullName}</div>
                      <div className="text-sm text-ink-500">{a.line1}, {a.city} - {a.pincode}</div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="card p-5 grid sm:grid-cols-2 gap-3">
                  {(['fullName', 'phone', 'line1', 'city', 'state', 'pincode'] as const).map((k) => (
                    <input key={k} placeholder={k} className="input"
                      value={(newAddr as any)[k]} onChange={(e) => setNewAddr({ ...newAddr, [k]: e.target.value })} />
                  ))}
                  <button onClick={saveNewAddress} className="btn-primary sm:col-span-2">Save address</button>
                </div>
              )}
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">Payment</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(['RAZORPAY', 'COD'] as const).map(m => (
                  <label key={m} className={`card p-4 cursor-pointer ${method === m ? 'border-accent' : ''}`}>
                    <input type="radio" className="hidden" checked={method === m} onChange={() => setMethod(m)} />
                    <div className="font-medium">{m === 'RAZORPAY' ? 'UPI / Card / Netbanking' : 'Cash on Delivery'}</div>
                    <div className="text-xs text-ink-500 mt-1">{m === 'RAZORPAY' ? 'Razorpay secure checkout' : 'Pay when you receive'}</div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="card p-6 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-bold mb-5">Order</h2>
            <div className="flex gap-2 mb-4">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="input" />
              <button onClick={applyCoupon} className="btn-outline !px-4">Apply</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-kadke-green"><span>Discount</span><span>-{inr(discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{shipping ? inr(shipping) : 'Free'}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{inr(tax)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-ink-200 dark:border-ink-800 mt-3">
                <span>Total</span><span>{inr(total)}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={loading} className="btn-primary w-full mt-6">
              {loading ? 'Processing...' : `Place order — ${inr(total)}`}
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}
