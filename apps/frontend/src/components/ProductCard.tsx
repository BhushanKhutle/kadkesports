'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector, toggleWishlist } from '@/store';
import { api } from '@/lib/api';
import { inr, discountedPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((s) => s.wishlist.productIds);
  const user = useAppSelector((s) => s.user.user);
  const inWish = wishlist.includes(product.id);
  const final = discountedPrice(product.price, product.discount);
  const hasDiscount = Number(product.discount) > 0;

  const onWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    dispatch(toggleWishlist(product.id));
    try {
      if (inWish) await api.delete(`/wishlist/${product.id}`);
      else await api.post('/wishlist', { productId: product.id });
    } catch { /* revert silently */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ink-100 dark:bg-ink-900">
          {product.images?.[0] && (
            <Image
              src={product.images[0]} alt={product.name} fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full">
              -{Number(product.discount)}%
            </span>
          )}
          <button
            onClick={onWishlist}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-ink-950/80 rounded-full hover:scale-110 transition"
            aria-label="wishlist"
          >
            <Heart className={cn('w-4 h-4', inWish && 'fill-accent stroke-accent')} />
          </button>
        </div>
        <div className="pt-3 space-y-1">
          <div className="text-[11px] tracking-widest text-ink-400 uppercase">{product.category?.name} · {product.brand}</div>
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-semibold">{inr(final)}</span>
            {hasDiscount && (
              <span className="text-xs line-through text-ink-400">{inr(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
