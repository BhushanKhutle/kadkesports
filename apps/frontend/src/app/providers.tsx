'use client';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
