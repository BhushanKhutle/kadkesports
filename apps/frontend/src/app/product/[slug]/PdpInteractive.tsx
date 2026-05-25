'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { setCart, useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

export function PdpInteractive({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes?.[0]);
  const [color, setColor] = useState(product.colors?.[0]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  const router = useRouter();

  const ensureLogin = () => {
    if (!user) { toast.error('Please login first'); router.push('/login'); return false; }
    return true;
  };

  const addToCart = async (buyNow = false) => {
    if (!ensureLogin()) return;
    setLoading(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity: qty, size, color });
      const { data } = await api.get('/cart');
      dispatch(setCart(data));
      toast.success('Added to cart');
      if (buyNow) router.push('/checkout');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {product.sizes?.length > 0 && (
        <div>
          <div className="text-xs font-semibold tracking-widest text-ink-500 mb-2">SIZE</div>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={cn(
                  'px-4 py-2 rounded-full border text-sm transition',
                  size === s
                    ? 'border-accent bg-accent text-white'
                    : 'border-ink-300 dark:border-ink-700 hover:border-accent',
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors?.length > 0 && (
        <div>
          <div className="text-xs font-semibold tracking-widest text-ink-500 mb-2">COLOR</div>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={cn(
                  'px-4 py-2 rounded-full border text-sm transition',
                  color === c ? 'border-accent text-accent' : 'border-ink-300 dark:border-ink-700',
                )}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="text-xs font-semibold tracking-widest text-ink-500">QTY</div>
        <div className="flex items-center border border-ink-300 dark:border-ink-700 rounded-full">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2">−</button>
          <span className="px-3 font-medium">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-2">+</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => addToCart(false)} disabled={loading} className="btn-outline flex-1">
          {loading ? '...' : 'Add to cart'}
        </button>
        <button onClick={() => addToCart(true)} disabled={loading} className="btn-primary flex-1">
          Buy now
        </button>
      </div>
    </div>
  );
}
