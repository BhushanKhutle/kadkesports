'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { setUser, useAppDispatch } from '@/store';

function CallbackInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const a = sp.get('accessToken');
    const r = sp.get('refreshToken');
    if (a && r) {
      localStorage.setItem('accessToken', a);
      localStorage.setItem('refreshToken', r);
      api.get('/auth/me').then(({ data }) => {
        dispatch(setUser(data));
        router.push('/');
      });
    } else {
      router.push('/login');
    }
  }, [sp, router, dispatch]);

  return <div className="container-x py-20 text-center text-ink-500">Signing you in...</div>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="container-x py-20 text-center text-ink-500">Loading...</div>}>
      <CallbackInner />
    </Suspense>
  );
}
