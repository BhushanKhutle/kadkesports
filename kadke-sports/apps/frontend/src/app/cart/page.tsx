'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { inr, discountedPrice } from '@/lib/utils';
import { setCart, useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cart').then(({ data }) => dispatch(setCart(data))).catch(() => null).finally(() => setLoading(false));
  }, [dispatch]);

  const updateQty = async (id: string, q: number) => {
    if (q < 1) return;
    await api.patch(`/cart/items/${id}`, { quantity: q });
    const { data } = await api.get('/cart');
    dispatch(setCart(data));
  };

  const remove = async (id: string) => {
    await api.delete(`/cart/items/${id}`);
    const { data } = await api.get('/cart');
    dispatch(setCart(data));
    toast.success('Removed');
  };

  if (loading) return <div className="container-x py-20 text-center text-ink-500">Loading cart...</div>;
  if (cart.items.length === 0) return (
    <div className="container-x py-20 text-center">
      <h1 className="font-display text-4xl font-bold mb-3">Your cart is empty</h1>
      <p className="text-ink-500 mb-8">Time to gear up.</p>
      <Link href="/shop" className="btn-primary">Shop now</Link>
    </div>
  );

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-5xl font-bold mb-10">Cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-4">
          {cart.items.map((it) => {
            const final = discountedPrice(it.product.price, it.product.discount);
            return (
              <div key={it.id} className="card flex gap-4 p-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-900 flex-shrink-0">
                  {it.product.images?.[0] && <Image src={it.product.images[0]} alt={it.product.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <Link href={`/product/${it.product.slug}`} className="font-medium hover:text-accent">{it.product.name}</Link>
                  <div className="text-xs text-ink-500 mt-1">
                    {it.size && <>Size: {it.size} · </>}{it.color && <>Color: {it.color}</>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-ink-300 dark:border-ink-700 rounded-full">
                      <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-3 py-1">−</button>
                      <span className="px-3">{it.quantity}</span>
                      <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-3 py-1">+</button>
                    </div>
                    <div className="font-semibold">{inr(final * it.quantity)}</div>
                  </div>
                </div>
                <button onClick={() => remove(it.id)} className="self-start p-2 text-ink-400 hover:text-accent"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-bold mb-5">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(cart.subtotal)}</span></div>
            <div className="flex justify-between text-ink-500"><span>Shipping</span><span>{cart.subtotal > 1999 ? 'Free' : inr(99)}</span></div>
            <div className="flex justify-between text-ink-500"><span>Tax (18% GST)</span><span>calculated at checkout</span></div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-ink-200 dark:border-ink-800 mt-3">
              <span>Total</span><span>{inr(cart.subtotal + (cart.subtotal > 1999 ? 0 : 99))}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full mt-6">
            Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
