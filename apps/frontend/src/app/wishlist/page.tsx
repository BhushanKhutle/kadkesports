'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { setWishlist, useAppDispatch } from '@/store';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => {
      setItems(data);
      dispatch(setWishlist(data.map((d: any) => d.productId)));
    });
  }, [dispatch]);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-5xl font-bold mb-10">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-ink-500">No items saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {items.map((w, i) => <ProductCard key={w.id} product={w.product} index={i} />)}
        </div>
      )}
    </div>
  );
}
