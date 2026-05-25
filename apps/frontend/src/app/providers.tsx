'use client';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store, setUser, setCart, setWishlist } from '@/store';
import { api } from '@/lib/api';

function Bootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Theme
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }

    // Rehydrate user from token (if logged in)
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    api.get('/auth/me')
      .then(({ data }) => {
        store.dispatch(setUser(data));
        return Promise.all([
          api.get('/cart').catch(() => null),
          api.get('/wishlist').catch(() => null),
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [cart, wishlist] = results;
        if (cart) store.dispatch(setCart(cart.data));
        if (wishlist) store.dispatch(setWishlist(wishlist.data.map((w: any) => w.productId)));
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Bootstrap>{children}</Bootstrap>
    </Provider>
  );
}
